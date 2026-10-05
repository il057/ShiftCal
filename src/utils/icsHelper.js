/**
 * RFC 5545 iCalendar (.ics) 生成与 iOS 适配工具
 */

// 格式化日期时间为 iCalendar 格式 (如 20261005T090000)
export function formatIcsDateTime(dateStr, timeStr) {
  // dateStr: "2026-10-05", timeStr: "09:00"
  const cleanDate = dateStr.replace(/-/g, '');
  const cleanTime = timeStr.replace(/:/g, '') + '00';
  return `${cleanDate}T${cleanTime}`;
}

// 格式化全天日期 (如 20261005)
export function formatIcsDate(dateStr) {
  return dateStr.replace(/-/g, '');
}

// 计算全天事件的次日 (iCalendar 全天事件 DTEND 为不闭合区间)
export function getNextDateStr(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

// RFC 5545 行折叠（每行不超过 75 字符）
export function foldIcsLine(line) {
  if (line.length <= 75) return line;
  let folded = '';
  let remaining = line;
  while (remaining.length > 75) {
    folded += remaining.slice(0, 75) + '\r\n ';
    remaining = remaining.slice(75);
  }
  folded += remaining;
  return folded;
}

// 生成符合 RFC 5545 的完整 VCALENDAR 字符串
export function generateIcsContent(shiftsOrStaffSchedules, options = {}) {
  const {
    calendarTitle = '工作排班表',
    staffName = '',
    exportScope = 'single', // 'single' | 'all'
    staffSchedules = [],
    myStaffName = '',
    alarmScope = 'my_only', // 'my_only' | 'all' | 'none'
    exportOffDays = false,
    alarmMinutes = 60, // 提前提醒分钟数，默认提前 60 分钟
    timezone = 'Asia/Shanghai'
  } = options;

  const nowStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const isMultiStaff = exportScope === 'all' && Array.isArray(staffSchedules) && staffSchedules.length > 0;

  const titleSuffix = isMultiStaff 
    ? ' (全员排班)' 
    : (staffName ? ` - ${staffName}` : '');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ShiftCal//Handwritten Shift Schedule PWA//CN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${calendarTitle}${titleSuffix}`,
    `X-WR-TIMEZONE:${timezone}`,
  ];

  // 整理待导出的班次条目
  const itemsToExport = [];
  if (isMultiStaff) {
    for (const st of staffSchedules) {
      const sName = (st.staffName || '员工').trim();
      for (const sh of (st.shifts || [])) {
        itemsToExport.push({ shift: sh, staff: sName });
      }
    }
  } else {
    const sName = (staffName || '员工').trim();
    const rawList = Array.isArray(shiftsOrStaffSchedules) ? shiftsOrStaffSchedules : [];
    for (const sh of rawList) {
      itemsToExport.push({ shift: sh, staff: sName });
    }
  }

  const norm = (s) => (s || '').trim().toLowerCase();

  for (const { shift, staff } of itemsToExport) {
    if (!shift.date) continue;

    const isMyShift = Boolean(myStaffName && norm(staff) === norm(myStaffName));

    // 如果是休假
    if (shift.is_off) {
      if (!exportOffDays) continue; // 用户未开启导出休假则跳过

      const safeStaff = encodeURIComponent(staff);
      const uid = `off-${shift.date}-${safeStaff}@shiftcal.local`;
      const dtStart = formatIcsDate(shift.date);
      const dtEnd = getNextDateStr(shift.date);
      const summary = isMultiStaff ? `[${isMyShift ? '我·' : ''}${staff}] 休假 (OFF)` : '休假 (OFF)';

      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${uid}`);
      lines.push(`DTSTAMP:${nowStamp}`);
      lines.push(`SUMMARY:${summary}`);
      lines.push(`DTSTART;VALUE=DATE:${dtStart}`);
      lines.push(`DTEND;VALUE=DATE:${dtEnd}`);
      lines.push(`DESCRIPTION:员工: ${staff}\\n手写排班表识别结果\\n标记: ${shift.raw_text || 'X'}`);
      lines.push('STATUS:CONFIRMED');
      lines.push('TRANSP:TRANSPARENT'); // 休假不占用忙碌时间
      lines.push('END:VEVENT');
      continue;
    }

    // 正常工作班次
    if (!shift.start_time || !shift.end_time) continue;

    const safeStaff = encodeURIComponent(staff);
    const uid = `shift-${shift.date}-${shift.start_time.replace(':', '')}-${safeStaff}@shiftcal.local`;
    const dtStart = formatIcsDateTime(shift.date, shift.start_time);
    const dtEnd = formatIcsDateTime(shift.date, shift.end_time);

    const summary = isMultiStaff 
      ? `[${isMyShift ? '我·' : ''}${staff}] 排班: ${shift.start_time} - ${shift.end_time}`
      : `排班: ${shift.start_time} - ${shift.end_time}`;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${nowStamp}`);
    lines.push(`SUMMARY:${summary}`);
    lines.push(`DTSTART;TZID=${timezone}:${dtStart}`);
    lines.push(`DTEND;TZID=${timezone}:${dtEnd}`);
    
    const descParts = [
      `员工: ${staff}${isMyShift ? ' (本人)' : ''}`,
      `排班时段: ${shift.start_time} 至 ${shift.end_time}`,
      shift.raw_text ? `手写原标: ${shift.raw_text}` : '',
      shift.confidence ? `AI识别置信度: ${(shift.confidence * 100).toFixed(0)}%` : '',
      shift.note ? `备注: ${shift.note}` : '',
      '来源: ShiftCal PWA 本地排班助手'
    ].filter(Boolean);

    lines.push(`DESCRIPTION:${descParts.join('\\n')}`);
    lines.push('STATUS:CONFIRMED');

    // 智能闹钟判断：
    // 若为单人导出：正常根据 alarmMinutes 添加闹钟；
    // 若为全员导出：
    // - alarmScope === 'my_only': 仅且仅当 isMyShift 为 true 时添加闹钟提醒！同事班次静默无闹钟；
    // - alarmScope === 'all': 全员班次均添加闹钟；
    // - alarmScope === 'none': 全员均不加闹钟。
    let shouldAddAlarm = false;
    if (alarmMinutes > 0) {
      if (!isMultiStaff) {
        shouldAddAlarm = true;
      } else {
        if (alarmScope === 'all') {
          shouldAddAlarm = true;
        } else if (alarmScope === 'my_only') {
          shouldAddAlarm = isMyShift;
        }
      }
    }

    if (shouldAddAlarm) {
      lines.push('BEGIN:VALARM');
      lines.push(`TRIGGER:-PT${alarmMinutes}M`);
      lines.push('ACTION:DISPLAY');
      lines.push(`DESCRIPTION:即将上班提醒: [${staff}] ${shift.start_time} - ${shift.end_time}`);
      lines.push('END:VALARM');
    }

    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');

  return lines.map(foldIcsLine).join('\r\n');
}

// 检测设备是否为 iOS (iPhone, iPad, iPod)
export function isIOS() {
  const ua = window.navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

// 触发下载或在 iOS 上打开日历
export function downloadIcsFile(icsString, filename = 'schedule.ics') {
  const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' });
  
  // 现代通用下载支持
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }, 2000);
}
