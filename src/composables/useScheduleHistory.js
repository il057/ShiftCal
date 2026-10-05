import { ref, watch } from 'vue';

const STORAGE_KEY = 'shiftcal_saved_schedules_v1';

function loadStoredHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[ShiftCal] Failed to read schedule history:', e);
  }
  return [];
}

// Global reactive singleton for history
const historyRecords = ref(loadStoredHistory());

watch(
  historyRecords,
  (newVal) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal));
    } catch (e) {
      console.error('[ShiftCal] Failed to save schedule history to localStorage:', e);
    }
  },
  { deep: true }
);

export function useScheduleHistory() {
  /**
   * Save or update a schedule record
   */
  function saveScheduleRecord({ id, staffName, monthInfo, shifts, staffSchedules = [], extractMode = 'single', myStaffName = '' }) {
    if (!shifts || !Array.isArray(shifts) || shifts.length === 0) return null;

    const workDays = shifts.filter(s => !s.is_off).length;
    const offDays = shifts.length - workDays;
    const now = new Date();
    const formattedDate = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Compute date range
    const sortedDates = [...shifts].map(s => s.date).filter(Boolean).sort();
    const dateRange = sortedDates.length > 0
      ? `${sortedDates[0]} ~ ${sortedDates[sortedDates.length - 1]}`
      : monthInfo || '排班表';

    const record = {
      id: id || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      staffName: staffName || '员工',
      monthInfo: monthInfo || '',
      dateRange,
      totalDays: shifts.length,
      workDays,
      offDays,
      savedAt: formattedDate,
      extractMode,
      myStaffName,
      staffSchedules: Array.isArray(staffSchedules) ? JSON.parse(JSON.stringify(staffSchedules)) : [],
      shifts: JSON.parse(JSON.stringify(shifts)) // deep copy
    };

    // If existing record with same ID, update it
    const existingIndex = historyRecords.value.findIndex(r => r.id === record.id);
    if (existingIndex !== -1) {
      historyRecords.value[existingIndex] = record;
    } else {
      // Add to front of history (keep up to 30 records)
      historyRecords.value.unshift(record);
      if (historyRecords.value.length > 30) {
        historyRecords.value.pop();
      }
    }

    return record;
  }

  function deleteScheduleRecord(id) {
    historyRecords.value = historyRecords.value.filter(r => r.id !== id);
  }

  function clearAllHistory() {
    historyRecords.value = [];
  }

  return {
    historyRecords,
    saveScheduleRecord,
    deleteScheduleRecord,
    clearAllHistory
  };
}
