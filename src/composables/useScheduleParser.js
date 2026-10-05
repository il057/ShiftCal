import { ref } from 'vue';
import { useConfig, PROVIDER_TYPES } from './useConfig';
import { getSystemParsePrompt } from '../utils/presets';

export function useScheduleParser() {
  const { config, getEffectiveModel } = useConfig();
  const isParsing = ref(false);
  const parseProgressText = ref('');
  const parseError = ref(null);

  // 清洗 Base64 字符串
  function cleanBase64(base64Str) {
    const parts = base64Str.split(';base64,');
    if (parts.length === 2) {
      const mime = parts[0].replace('data:', '');
      return { mimeType: mime, data: parts[1] };
    }
    return { mimeType: 'image/jpeg', data: base64Str };
  }

  // 组装用户端提示词（利用 Date.now() 注入真实当前基准日期）
  function buildUserPrompt(parseOptions = {}) {
    const opts = typeof parseOptions === 'string'
      ? { extractMode: 'single', targetPerson: parseOptions }
      : { extractMode: 'single', targetPerson: '', myName: '', ...parseOptions };

    const now = new Date(Date.now());
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentDateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const nextYear = currentYear + 1;

    let p = `请对这张手写排班表进行视觉解析并输出 JSON 数据。严格遵循班次对应表（X/叉号/Vacay 为休假，2-11 为 14:00-23:00，1330 为 13:30-22:30，9-6 为 09:00-18:00，10-7 为 10:00-19:00 等）。\n`;
    
    p += `【关键时间基准】：当前客户端真实运行时间为 ${currentDateStr}（当前为 ${currentYear} 年 ${currentMonth} 月）。\n`;
    p += `跨年月份判定规则：\n`;
    p += `1. 若表头月份数值 >= 当前月份 ${currentMonth}（例如当前是 10 月，表头是 Oct/10月、Nov/11月 或 Dec/12月），则排班年份取当年 ${currentYear} 年；\n`;
    p += `2. 若表头月份数值 < 当前月份 ${currentMonth}（例如当前是 12 月或 11 月，而表头是 Jan/1月 或 Feb/2月），则该排班表属于跨年的新年排班，年份必须自动递增为下一年：【${nextYear} 年】，严禁标记为过去的年份！\n`;
    p += `3. 若表头有清晰手写的 4 位数年份（如 2026、2027），以手写年份为最高优先级。\n\n`;

    if (opts.extractMode === 'all') {
      p += `【关键提取模式：提取全部员工排班】\n`;
      p += `表格中若有多个员工行，请完整提取图片中出现的【每一位员工】的所有日期排班数据！\n`;
      p += `请在 staff_schedules 数组中输出每位员工的对象（含 staff_name 与完整的每日排班列表 shifts）；并在 available_staff_names 中列出全部员工姓名。\n`;
      if (opts.myName && opts.myName.trim()) {
        p += `用户本人姓名是【${opts.myName.trim()}】，请特别注意精准识别该员工行。\n`;
      }
    } else {
      p += `【关键提取模式：提取指定/单人排班】\n`;
      if (opts.targetPerson && opts.targetPerson.trim()) {
        p += `特别指定：当前仅需提取员工【${opts.targetPerson.trim()}】所在行的每日排班数据。\n`;
      } else {
        p += `提示：表格中若有多个员工行，请在 available_staff_names 中列出全部员工姓名；并在 shifts / staff_schedules 中提取第一位员工的完整排班。\n`;
      }
    }
    p += `请确保输出严格合法的纯 JSON 字符串。`;
    return p;
  }

  // 测试 API 连通性
  async function testConnection(testCfg = config) {
    const provider = testCfg.provider;
    const apiKey = testCfg.apiKey?.trim();
    let baseUrl = testCfg.baseUrl?.trim() || '';
    const model = testCfg.model?.trim();

    if (!apiKey) {
      throw new Error('请输入 API Key');
    }
    if (!model) {
      throw new Error('请先选择或拉取模型');
    }

    if (provider === PROVIDER_TYPES.GEMINI) {
      baseUrl = baseUrl.replace(/\/+$/, '');
      const url = `${baseUrl}/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Respond with: "PONG"' }] }]
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `HTTP ${res.status}: ${res.statusText}`);
      }
      return true;
    } else {
      baseUrl = baseUrl.replace(/\/+$/, '');
      const url = `${baseUrl}/chat/completions`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: 'Respond with: "PONG"' }],
          max_tokens: 10
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `HTTP ${res.status}: ${res.statusText}`);
      }
      return true;
    }
  }

  // 调用多模态 API 进行排班图片解析
  async function parseScheduleImage(imageBase64, parseOptions = {}) {
    const opts = typeof parseOptions === 'string'
      ? { extractMode: 'single', targetPerson: parseOptions }
      : { extractMode: 'single', targetPerson: '', myName: '', ...parseOptions };

    isParsing.value = true;
    parseError.value = null;
    parseProgressText.value = '正在识别中...';

    try {
      const apiKey = config.apiKey?.trim();
      let baseUrl = config.baseUrl?.trim();
      const model = getEffectiveModel();
      const { mimeType, data } = cleanBase64(imageBase64);
      const userPrompt = buildUserPrompt(opts);
      // 每次解析动态生成注入了 Date.now() 真实基准时间的系统 Prompt
      const dynamicSystemPrompt = getSystemParsePrompt();

      if (!apiKey) {
        throw new Error('请先在设置中填写您的 API Key');
      }
      if (!model) {
        throw new Error('请先在设置中选择识别模型');
      }

      parseProgressText.value = '正在识别中...';

      let rawResponseText = '';

      if (config.provider === PROVIDER_TYPES.GEMINI) {
        baseUrl = baseUrl.replace(/\/+$/, '');
        const endpoint = `${baseUrl}/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const payload = {
          system_instruction: {
            parts: [{ text: dynamicSystemPrompt }]
          },
          contents: [
            {
              role: 'user',
              parts: [
                { text: userPrompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: data
                  }
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1
          }
        };

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `Gemini 请求失败 (HTTP ${response.status})`);
        }

        const resJson = await response.json();
        rawResponseText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawResponseText) {
          throw new Error('未能从模型返回中获取到文本数据');
        }
      } else {
        // OpenAI 兼容协议
        baseUrl = baseUrl.replace(/\/+$/, '');
        const endpoint = `${baseUrl}/chat/completions`;

        const payload = {
          model: model,
          messages: [
            {
              role: 'system',
              content: dynamicSystemPrompt
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: userPrompt },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${mimeType};base64,${data}`
                  }
                }
              ]
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1
        };

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `请求失败 (HTTP ${response.status})`);
        }

        const resJson = await response.json();
        rawResponseText = resJson?.choices?.[0]?.message?.content;
        if (!rawResponseText) {
          throw new Error('未能从模型返回中获取到回答');
        }
      }

      parseProgressText.value = '正在校验与结构化排班数据...';

      // 提取与清洗 JSON 内容
      const cleanJsonStr = extractJsonString(rawResponseText);
      const parsedData = JSON.parse(cleanJsonStr);

      // 数据标准化与完整性保障
      const sanitized = sanitizeScheduleData(parsedData, opts);
      return sanitized;
    } catch (err) {
      console.error('Schedule parse error:', err);
      parseError.value = err.message || '识别排班表发生未知错误';
      throw err;
    } finally {
      isParsing.value = false;
      parseProgressText.value = '';
    }
  }

  // 从可能包含 Markdown 标记的文本中提取合法 JSON
  function extractJsonString(text) {
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    return cleaned;
  }

  // 单个班次条目清洗与置信度校验
  function cleanShiftItem(item, idx, staff = '') {
    const isOff = Boolean(item.is_off);
    const startTime = item.start_time || null;
    const endTime = item.end_time || null;
    const confidence = typeof item.confidence === 'number' ? item.confidence : 0.85;

    const isLowConfidence = confidence < 0.8;
    const isMissingTime = !isOff && (!startTime || !endTime);
    const isAnomaly = isLowConfidence || isMissingTime;

    return {
      id: `shift_${Date.now()}_${Math.random().toString(36).slice(2, 6)}_${idx}`,
      staffName: staff,
      date: item.date || '',
      raw_text: item.raw_text || (isOff ? 'X' : ''),
      is_off: isOff,
      start_time: startTime,
      end_time: endTime,
      confidence: Number(confidence.toFixed(2)),
      note: item.note || '',
      isAnomaly: isAnomaly,
      anomalyReason: isMissingTime ? '缺少班次时间' : (isLowConfidence ? '置信度低，建议人工核验' : '')
    };
  }

  // 标准化清洗与置信度校验（兼容单人与全员 staff_schedules）
  function sanitizeScheduleData(data, opts = {}) {
    const monthInfo = data.month_info || '';
    let availableStaffNames = Array.isArray(data.available_staff_names) ? [...data.available_staff_names] : [];

    let staffSchedules = [];

    // 1. 若模型返回了 staff_schedules
    if (Array.isArray(data.staff_schedules) && data.staff_schedules.length > 0) {
      staffSchedules = data.staff_schedules.map((st, sIdx) => {
        const name = (st.staff_name || `员工${sIdx + 1}`).trim();
        if (!availableStaffNames.includes(name)) {
          availableStaffNames.push(name);
        }
        const rawShifts = Array.isArray(st.shifts) ? st.shifts : [];
        const cleanShifts = rawShifts.map((shift, idx) => cleanShiftItem(shift, idx, name));
        cleanShifts.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
        return {
          staffName: name,
          shifts: cleanShifts
        };
      });
    }

    // 2. 若未能从 staff_schedules 获取，或者属于单人格式 data.shifts
    if (staffSchedules.length === 0) {
      const singleName = (data.staff_name || opts.targetPerson || opts.myName || '员工').trim();
      if (!availableStaffNames.includes(singleName)) {
        availableStaffNames.push(singleName);
      }
      const rawShifts = Array.isArray(data.shifts) ? data.shifts : [];
      const cleanShifts = rawShifts.map((shift, idx) => cleanShiftItem(shift, idx, singleName));
      cleanShifts.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
      staffSchedules.push({
        staffName: singleName,
        shifts: cleanShifts
      });
    }

    // 3. 决定主展示员工（优先匹配本人的姓名，其次为目标员工，其次为第一位员工）
    let primaryStaffName = staffSchedules[0]?.staffName || '员工';
    const norm = (s) => (s || '').trim().toLowerCase();

    if (opts.myName && staffSchedules.some(s => norm(s.staffName) === norm(opts.myName))) {
      primaryStaffName = staffSchedules.find(s => norm(s.staffName) === norm(opts.myName)).staffName;
    } else if (opts.targetPerson && staffSchedules.some(s => norm(s.staffName) === norm(opts.targetPerson))) {
      primaryStaffName = staffSchedules.find(s => norm(s.staffName) === norm(opts.targetPerson)).staffName;
    }

    const primarySchedule = staffSchedules.find(s => s.staffName === primaryStaffName) || staffSchedules[0];

    return {
      staffName: primaryStaffName,
      monthInfo,
      availableStaffNames,
      staffSchedules,
      shifts: primarySchedule ? primarySchedule.shifts : []
    };
  }

  return {
    isParsing,
    parseProgressText,
    parseError,
    testConnection,
    parseScheduleImage
  };
}
