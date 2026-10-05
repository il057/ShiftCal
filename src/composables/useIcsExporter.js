import { ref } from 'vue';
import confetti from 'canvas-confetti';
import { generateIcsContent, downloadIcsFile, isIOS } from '../utils/icsHelper';

export function useIcsExporter() {
  const isExporting = ref(false);
  const isIosDevice = ref(isIOS());

  function exportScheduleToIcs(shifts, options = {}) {
    if (!shifts || shifts.length === 0) {
      throw new Error('没有可导出的排班数据');
    }

    isExporting.value = true;
    try {
      const icsString = generateIcsContent(shifts, options);
      
      const nowStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const staffPrefix = options.staffName ? `${options.staffName}-` : '';
      const filename = `排班-${staffPrefix}${nowStr}.ics`;

      downloadIcsFile(icsString, filename);

      // 触发庆祝撒花效果
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore confetti errors in unsupported environments
      }

      return {
        success: true,
        filename,
        icsString
      };
    } finally {
      isExporting.value = false;
    }
  }

  return {
    isExporting,
    isIosDevice,
    exportScheduleToIcs,
  };
}
