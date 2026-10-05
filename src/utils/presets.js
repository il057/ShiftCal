/**
 * 班次预设定义与通用转换工具
 */

export const SHIFT_PRESETS = [
  {
    id: 'off',
    label: '休假 (X)',
    tag: 'OFF',
    color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    is_off: true,
    start_time: null,
    end_time: null,
    description: '休假 / Vacay / Compl(t)'
  },
  {
    id: '9-6',
    label: '09:00 - 18:00 (9-6)',
    tag: '早班',
    color: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    is_off: false,
    start_time: '09:00',
    end_time: '18:00',
    description: '早班标准班次'
  },
  {
    id: '10-7',
    label: '10:00 - 19:00 (10-7)',
    tag: '常规',
    color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    is_off: false,
    start_time: '10:00',
    end_time: '19:00',
    description: '常规白班'
  },
  {
    id: '11-8',
    label: '11:00 - 20:00 (11-8)',
    tag: '中班1',
    color: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    is_off: false,
    start_time: '11:00',
    end_time: '20:00',
    description: '中班'
  },
  {
    id: '12-9',
    label: '12:00 - 21:00 (12-9)',
    tag: '中班2',
    color: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    is_off: false,
    start_time: '12:00',
    end_time: '21:00',
    description: '午后中班'
  },
  {
    id: '1330',
    label: '13:30 - 22:30 (13:30)',
    tag: '晚中班',
    color: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    is_off: false,
    start_time: '13:30',
    end_time: '22:30',
    description: '下午至打烊前'
  },
  {
    id: '2-11',
    label: '14:00 - 23:00 (2-11)',
    tag: '晚班/打烊',
    color: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    is_off: false,
    start_time: '14:00',
    end_time: '23:00',
    description: '晚班打烊班次'
  },
  {
    id: '8-5',
    label: '08:00 - 17:00 (8-5)',
    tag: '早开班',
    color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    is_off: false,
    start_time: '08:00',
    end_time: '17:00',
    description: '清晨开店班次'
  },
  {
    id: '7-4',
    label: '07:00 - 16:00 (7-4)',
    tag: '清晨班',
    color: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    is_off: false,
    start_time: '07:00',
    end_time: '16:00',
    description: '极早班'
  }
];

// 根据真实客户端当前时间动态组装排班识别系统 Prompt
export function getSystemParsePrompt() {
  const now = new Date(Date.now());
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1 ~ 12
  const currentDateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const nextYear = currentYear + 1;

  return `
你是一位专门负责【手写零售/餐饮排班表结构化】的顶级 AI 视觉专家。
请仔细分析图片中的排班表格，精准识别手写字符并完成标准化映射。

【当前基准时间与动态跨年推导规则】：
- 当前真实系统日期为：${currentDateStr}（基准年份：${currentYear} 年，基准月份：${currentMonth} 月）。
- 排班表头通常写有月份简写（如 Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec 或 中文月份）：
  1. 若排班表中明确手写了 4 位数年份（如 2026 或 2027），以手写年份为准；
  2. 若未标注四位数年份，必须基于当前月份【${currentMonth} 月】进行跨年推算：
     - 若表头月份数值 >= 当前月份（例如当前是 10 月，表头是 Oct、Nov 或 Dec），年份推导为当年：${currentYear} 年；
     - 若表头月份数值 < 当前月份（例如当前是 12 月或 11 月底，而排班表头是 Jan 或 Feb 即下月/下季度排班），则该排班表属于跨年的新年，年份必须顺延为下一年：${nextYear} 年，绝对不能标记为过去的年份！

【核心班次映射逻辑】：
1. "X"、"x"、叉号、对折线斜杠：休假 (is_off: true, start_time: null, end_time: null)
2. "Vacay"、"Vacation"、"Compl(t)"、"Comp"、"Off"：请假/休假 (is_off: true, start_time: null, end_time: null)
3. "2-11"：14:00 - 23:00 (晚班/打烊)
4. "1330" 或 "13:30"：13:30 - 22:30 (下午班)
5. "9-6"：09:00 - 18:00 (标准早班)
6. "10-7"：10:00 - 19:00
7. "11-8"：11:00 - 20:00
8. "12-9"：12:00 - 21:00
9. "8-5"：08:00 - 17:00
10. "7-4"：07:00 - 16:00
11. 其它手写时间区间（如 "1-10" 代表 13:00 - 22:00 等）：转换为 24 小时制 HH:mm 格式。

【输出与格式规则】：
- 如果表头为星期几 (SUN, MON, TUE, WED, THU, FRI, SAT) 且有日期数字 (例如 1, 2, ... 31)，请准确拼装每项的完整日期 date (YYYY-MM-DD)。
- 员工排班提取规则：
  * 若用户指示提取【全部员工】，请在 staff_schedules 数组中列出识别到的每一位员工（staff_name）及其各自的完整排班 shifts 列表；并在 available_staff_names 中列出全部员工姓名。
  * 若用户指示提取【指定员工】，仅在 staff_schedules 包含该员工（或输出该员工的 shifts），并在 staff_name 中标明该员工。
- 置信度 confidence 规范：
  * 清晰确定的项给出 0.90 ~ 1.0；
  * 若字迹模糊、有涂改划线、推测字符或单元格无法 100% 确定，置信度 confidence 必须低于 0.7 (例如 0.4~0.65)。

【严格要求】：
必须且仅输出合法的纯 JSON 字符串（无需 markdown 代码块包裹，或允许标准 json block），符合以下结构：
{
  "staff_name": "示例员工",
  "month_info": "Oct",
  "available_staff_names": ["员工A", "员工B", "员工C"],
  "staff_schedules": [
    {
      "staff_name": "员工A",
      "shifts": [
        {
          "date": "${currentYear}-10-04",
          "raw_text": "X",
          "is_off": true,
          "start_time": null,
          "end_time": null,
          "confidence": 0.95,
          "note": "休假"
        },
        {
          "date": "${currentYear}-10-05",
          "raw_text": "2-11",
          "is_off": false,
          "start_time": "14:00",
          "end_time": "23:00",
          "confidence": 0.92,
          "note": "打烊班"
        }
      ]
    }
  ],
  "shifts": []
}
`.trim();
}
