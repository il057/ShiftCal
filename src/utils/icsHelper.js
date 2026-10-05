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
export function generateIcsContent(shifts, options = {}) {
  const {
    calendarTitle = '工作排班表',
    staffName = '',
    exportOffDays = false,
    alarmMinutes = 60, // 提前提醒分钟数，默认提前 60 分钟
    timezone = 'Asia/Shanghai'
  } = options;

  const nowStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ShiftCal//Handwritten Shift Schedule PWA//CN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${calendarTitle}${staffName ? ` - ${staffName}` : ''}`,
    `X-WR-TIMEZONE:${timezone}`,
  ];

  for (const shift of shifts) {
    if (!shift.date) continue;

    // 如果是休假
    if (shift.is_off) {
      if (!exportOffDays) continue; // 用户未开启导出休假则跳过

      const uid = `off-${shift.date}-${staffName || 'user'}@shiftcal.local`;
      const dtStart = formatIcsDate(shift.date);
      const dtEnd = getNextDateStr(shift.date);

      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${uid}`);
      lines.push(`DTSTAMP:${nowStamp}`);
      lines.push(`SUMMARY:休假 (OFF)`);
      lines.push(`DTSTART;VALUE=DATE:${dtStart}`);
      lines.push(`DTEND;VALUE=DATE:${dtEnd}`);
      lines.push(`DESCRIPTION:手写排班表识别结果\\n标记: ${shift.raw_text || 'X'}`);
      lines.push('STATUS:CONFIRMED');
      lines.push('TRANSP:TRANSPARENT'); // 休假不占用忙碌时间
      lines.push('END:VEVENT');
      continue;
    }

    // 正常工作班次
    if (!shift.start_time || !shift.end_time) continue;

    const uid = `shift-${shift.date}-${shift.start_time.replace(':', '')}-${staffName || 'user'}@shiftcal.local`;
    const dtStart = formatIcsDateTime(shift.date, shift.start_time);
    const dtEnd = formatIcsDateTime(shift.date, shift.end_time);

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${nowStamp}`);
    lines.push(`SUMMARY:排班: ${shift.start_time} - ${shift.end_time}`);
    lines.push(`DTSTART;TZID=${timezone}:${dtStart}`);
    lines.push(`DTEND;TZID=${timezone}:${dtEnd}`);
    
    const descParts = [
      staffName ? `员工: ${staffName}` : '',
      `排班时段: ${shift.start_time} 至 ${shift.end_time}`,
      shift.raw_text ? `手写原标: ${shift.raw_text}` : '',
      shift.confidence ? `AI识别置信度: ${(shift.confidence * 100).toFixed(0)}%` : '',
      shift.note ? `备注: ${shift.note}` : '',
      '来源: ShiftCal PWA 本地排班助手'
    ].filter(Boolean);

    lines.push(`DESCRIPTION:${descParts.join('\\n')}`);
    lines.push('STATUS:CONFIRMED');

    // 添加上班闹钟/提醒
    if (alarmMinutes > 0) {
      lines.push('BEGIN:VALARM');
      lines.push(`TRIGGER:-PT${alarmMinutes}M`);
      lines.push('ACTION:DISPLAY');
      lines.push(`DESCRIPTION:即将上班提醒: ${shift.start_time} - ${shift.end_time}`);
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
