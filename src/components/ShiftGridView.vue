<template>
  <div class="space-y-4 sm:space-y-5">
    <!-- Master Telemetry Console: Integrated Molded Industrial Chassis (一体成型工业外壳底座) -->
    <div class="relative rounded-3xl zzz-chassis p-4 sm:p-5 overflow-hidden">
      <!-- Side Ticket Notches (硬件票券撕裂咬合凹槽) -->
      <div class="hidden sm:block absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-7 rounded-r-full bg-[#111215] border-2 border-l-0 border-black z-20"></div>
      <div class="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-7 rounded-l-full bg-[#111215] border-2 border-r-0 border-black z-20"></div>

      <!-- Top Hardware Flange & Film Strip Notch Bar -->
      <div class="flex items-center justify-between pb-3 mb-3 border-b-2 border-black/90">
        <div class="flex items-center gap-2">
          <!-- Flashing Status LED -->
          <div class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black border border-white/10 text-[9px] font-tech text-[#E8F624]">
            <span class="w-1.5 h-1.5 rounded-full bg-[#E8F624] animate-pulse"></span>
            <span>CHASSIS TELEMETRY // 实时工控读数仪</span>
          </div>
          <span class="hidden md:inline-block text-[10px] font-tech text-[#717682] uppercase tracking-wider">
            TACTILE CASSETTE HARDWARE
          </span>
        </div>

        <!-- Film Strip Perforated Marks -->
        <div class="flex items-center gap-1.5 opacity-60">
          <div v-for="i in 6" :key="i" class="w-2.5 h-1.5 rounded-xs bg-black border border-white/20"></div>
        </div>
      </div>

      <!-- Embedded Stamped Grooves (冲压凹槽轨道仪表) -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        <!-- Bay 1: Total Schedule -->
        <div class="relative p-3.5 rounded-2xl zzz-stamped-groove flex flex-col justify-between overflow-hidden">
          <div class="flex items-center justify-between">
            <span class="text-[9px] sm:text-[10px] font-tech text-[#7A818E] uppercase tracking-wider font-bold">TOTAL SCHEDULE</span>
            <span class="w-2 h-2 rounded-full bg-[#E8F624] shadow-[0_0_8px_#E8F624]"></span>
          </div>
          <!-- Compact "大号数字 / 小号刻度" format -->
          <div class="my-2 flex items-baseline gap-1.5">
            <div class="text-2xl sm:text-3xl font-tech font-bold text-white tracking-tight leading-none">
              {{ shifts.length < 10 ? '0' + shifts.length : shifts.length }}
            </div>
            <span class="text-[10px] sm:text-[11px] font-tech text-[#7A818E] font-bold">/ {{ shifts.length }} DAYS</span>
          </div>
          <!-- Recessed Plastic Track with Acid Yellow Capsule Slider -->
          <div class="w-full h-2.5 rounded-full zzz-gauge-track p-0.5 overflow-hidden">
            <div class="h-full rounded-full bg-[#E8F624] w-full shadow-[0_0_6px_rgba(232,246,36,0.8)]"></div>
          </div>
        </div>

        <!-- Bay 2: Duty Shifts -->
        <div class="relative p-3.5 rounded-2xl zzz-stamped-groove flex flex-col justify-between overflow-hidden">
          <div class="flex items-center justify-between">
            <span class="text-[9px] sm:text-[10px] font-tech text-[#7A818E] uppercase tracking-wider font-bold">DUTY SHIFTS</span>
            <span class="w-2 h-2 rounded-full bg-[#36E4DA] shadow-[0_0_8px_#36E4DA]"></span>
          </div>
          <div class="my-2 flex items-baseline gap-1.5">
            <div class="text-2xl sm:text-3xl font-tech font-bold text-white tracking-tight leading-none">
              {{ workDaysCount < 10 ? '0' + workDaysCount : workDaysCount }}
            </div>
            <span class="text-[10px] sm:text-[11px] font-tech text-[#7A818E] font-bold">/ {{ shifts.length || 0 }} WORK</span>
          </div>
          <!-- Recessed Plastic Track with Cyan Capsule Slider -->
          <div class="w-full h-2.5 rounded-full zzz-gauge-track p-0.5 overflow-hidden">
            <div 
              class="h-full rounded-full bg-[#36E4DA] transition-all duration-300 shadow-[0_0_6px_rgba(54,228,218,0.8)]"
              :style="{ width: `${shifts.length ? (workDaysCount / shifts.length) * 100 : 0}%` }"
            ></div>
          </div>
        </div>

        <!-- Bay 3: Rest / Leave -->
        <div class="relative p-3.5 rounded-2xl zzz-stamped-groove flex flex-col justify-between overflow-hidden">
          <div class="flex items-center justify-between">
            <span class="text-[9px] sm:text-[10px] font-tech text-[#7A818E] uppercase tracking-wider font-bold">REST / LEAVE</span>
            <span class="w-2 h-2 rounded-full bg-[#9CA3AF]"></span>
          </div>
          <div class="my-2 flex items-baseline gap-1.5">
            <div class="text-2xl sm:text-3xl font-tech font-bold text-white tracking-tight leading-none">
              {{ offDaysCount < 10 ? '0' + offDaysCount : offDaysCount }}
            </div>
            <span class="text-[10px] sm:text-[11px] font-tech text-[#7A818E] font-bold">/ {{ shifts.length || 0 }} OFF</span>
          </div>
          <!-- Recessed Track with Dark Muted Capsule Slider -->
          <div class="w-full h-2.5 rounded-full zzz-gauge-track p-0.5 overflow-hidden">
            <div 
              class="h-full rounded-full bg-[#9CA3AF] transition-all duration-300"
              :style="{ width: `${shifts.length ? (offDaysCount / shifts.length) * 100 : 0}%` }"
            ></div>
          </div>
        </div>

        <!-- Bay 4: Anomalies / Pending Review -->
        <div 
          class="relative p-3.5 rounded-2xl zzz-stamped-groove flex flex-col justify-between overflow-hidden transition-all"
          :class="anomalyCount > 0 ? 'border-[#E03030] ring-1 ring-[#E03030]/50' : ''"
        >
          <div class="flex items-center justify-between">
            <span class="text-[9px] sm:text-[10px] font-tech uppercase tracking-wider font-bold" :class="anomalyCount > 0 ? 'text-[#E03030]' : 'text-[#7A818E]'">
              ANOMALIES // 待复核
            </span>
            <span 
              class="w-2 h-2 rounded-full" 
              :class="anomalyCount > 0 ? 'bg-[#E03030] animate-ping' : 'bg-[#9CA3AF]'"
            ></span>
          </div>
          <div class="my-2 flex items-baseline gap-1.5">
            <div 
              class="text-2xl sm:text-3xl font-tech font-bold tracking-tight leading-none"
              :class="anomalyCount > 0 ? 'text-[#E03030]' : 'text-white'"
            >
              {{ anomalyCount < 10 ? '0' + anomalyCount : anomalyCount }}
            </div>
            <span class="text-[10px] sm:text-[11px] font-tech text-[#7A818E] font-bold">/ {{ shifts.length || 0 }} RECHECK</span>
          </div>
          <!-- Recessed Track with Red Alert Capsule Slider -->
          <div class="w-full h-2.5 rounded-full zzz-gauge-track p-0.5 overflow-hidden">
            <div 
              class="h-full rounded-full transition-all duration-300"
              :class="anomalyCount > 0 ? 'bg-[#E03030] shadow-[0_0_8px_rgba(224,48,48,0.9)]' : 'bg-[#9CA3AF]'"
              :style="{ width: `${shifts.length ? (anomalyCount / shifts.length) * 100 : 0}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter & View Mode Controls (Gamepad / Hardware Console Pill Bar) -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-2xl zzz-panel">
      <!-- Gamepad Capsule Filter Buttons: 4-Column Full-Width Grid on Mobile (完全无需左右滑动) -->
      <div class="p-1 rounded-full bg-[#111215] border-2 border-black grid grid-cols-4 gap-1 w-full sm:w-auto shadow-inner">
        <button
          v-for="filter in filterOptions"
          :key="filter.id"
          type="button"
          @click="activeFilter = filter.id"
          :class="[
            'py-1.5 px-1 sm:px-3 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap',
            activeFilter === filter.id
              ? 'bg-[#E8F624] text-black shadow-[0_2px_0_#000000]'
              : 'text-[#9CA3AF] hover:text-white'
          ]"
        >
          <!-- Short label on mobile screens, full label on sm+ screens -->
          <span class="hidden xs:inline">{{ filter.label }}</span>
          <span class="xs:hidden">{{ filter.shortLabel }}</span>
          <span 
            v-if="filter.count !== undefined" 
            :class="[
              'px-1.5 py-0.2 rounded-full font-tech text-[9px] sm:text-[10px] font-bold shrink-0',
              activeFilter === filter.id ? 'bg-black text-[#E8F624]' : 'bg-[#181A1E] text-[#9CA3AF]'
            ]"
          >
            {{ filter.count }}
          </span>
        </button>
      </div>

      <!-- Right Controls: View Switch & Add Day -->
      <div class="flex items-center justify-end gap-2 sm:gap-2.5 w-full sm:w-auto">
        <button
          type="button"
          @click="addNewDay"
          class="flex-1 sm:flex-initial px-3 sm:px-3.5 py-1.5 rounded-xl zzz-btn-dark text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <Plus class="w-3.5 h-3.5 text-[#E8F624] stroke-[2.5]" />
          <span>添加班次</span>
        </button>

        <!-- Hardware View Switch Dual Key -->
        <div class="p-0.5 sm:p-1 rounded-xl bg-[#111215] border-2 border-black flex items-center shadow-inner shrink-0">
          <button
            type="button"
            @click="viewMode = 'grid'"
            :class="[
              'p-1.5 rounded-lg text-xs transition cursor-pointer',
              viewMode === 'grid' ? 'bg-[#E8F624] text-black shadow-[0_1px_0_#000]' : 'text-[#9CA3AF] hover:text-white'
            ]"
            title="网格视图"
          >
            <LayoutGrid class="w-4 h-4 stroke-[2.2]" />
          </button>
          <button
            type="button"
            @click="viewMode = 'list'"
            :class="[
              'p-1.5 rounded-lg text-xs transition cursor-pointer',
              viewMode === 'list' ? 'bg-[#E8F624] text-black shadow-[0_1px_0_#000]' : 'text-[#9CA3AF] hover:text-white'
            ]"
            title="列表视图"
          >
            <List class="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredShifts.length === 0" class="p-10 text-center rounded-3xl zzz-slot select-none">
      <CalendarIcon class="w-12 h-12 text-[#4B5563] mx-auto mb-3" />
      <div class="text-white font-bold text-sm uppercase tracking-wide">NO SHIFTS FOUND // 当前筛选无记录</div>
      <p class="text-xs text-[#9CA3AF] font-tech mt-1">切换上方筛选状态或点击右上角添加排班班次</p>
    </div>

    <!-- Grid View: Ticket Stub Cards -->
    <div 
      v-else-if="viewMode === 'grid'"
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4"
    >
      <div
        v-for="shift in filteredShifts"
        :key="shift.id"
        @click="openEditor(shift)"
        :class="[
          'relative p-4 rounded-2xl border-[2.5px] transition-all cursor-pointer group flex flex-col justify-between active:scale-[0.97]',
          (shift.confidence < 0.8 || (!shift.is_off && (!shift.start_time || !shift.end_time)))
            ? 'bg-[#1E2024] border-[#E03030] shadow-[0_4px_0_#000000]'
            : 'zzz-card hover:bg-[#2C3038]'
        ]"
      >
        <!-- Card Top Bar: Progress & Status Pill -->
        <div class="flex items-center justify-between mb-2 pb-2 border-b-2 border-black/80">
          <div class="flex items-center gap-1.5 text-[10px] font-tech text-[#7A818E]">
            <span class="w-1.5 h-1.5 rounded-full bg-[#E8F624]"></span>
            <span>进度: {{ (!shift.is_off && (!shift.start_time || !shift.end_time)) ? '0/1' : '1/1' }}</span>
          </div>

          <!-- Pure Color Reversal Status Pill Badges -->
          <div>
            <span 
              v-if="!shift.is_off && (!shift.start_time || !shift.end_time)"
              class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E03030] text-white border border-black flex items-center gap-1 shadow-[0_1px_0_#000]"
            >
              <AlertCircle class="w-3 h-3 stroke-[2.2]" />
              MISSING
            </span>
            <span 
              v-else-if="shift.confidence < 0.8"
              class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F624] text-black border border-black flex items-center gap-1 shadow-[0_1px_0_#000]"
            >
              <AlertTriangle class="w-3 h-3 stroke-[2.2]" />
              {{ (shift.confidence * 100).toFixed(0) }}%
            </span>
            <span
              v-else-if="shift.is_off"
              class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#36E4DA] text-black border border-black shadow-[0_1px_0_#000]"
            >
              休假
            </span>
            <span
              v-else
              class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F624] text-black border border-black shadow-[0_1px_0_#000]"
            >
              出勤
            </span>
          </div>
        </div>

        <!-- Date Header & Raw OCR Text Pill -->
        <div class="flex items-baseline justify-between gap-1 mb-2">
          <div class="text-xs sm:text-sm font-tech font-bold text-white flex items-center gap-1.5">
            <span>{{ formatDisplayDate(shift.date) }}</span>
            <span class="text-[10px] text-[#7A818E]">({{ getWeekdayName(shift.date) }})</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="text-[8px] font-tech text-[#7A818E]">RAW</span>
            <span class="px-1.5 py-0.2 rounded font-tech text-[10px] font-bold bg-[#141619] text-[#E8F624] border border-black shadow-inner">
              {{ shift.raw_text || '-' }}
            </span>
          </div>
        </div>

        <!-- Shift Main Display: Sunken Cavity Groove -->
        <div class="my-1.5 py-2 px-3 rounded-xl zzz-slot flex items-center justify-between">
          <div v-if="shift.is_off" class="text-[#36E4DA] font-bold text-xs flex items-center gap-2">
            <Coffee class="w-4 h-4 text-[#36E4DA]" />
            <span class="font-tech tracking-wide">全天休假 // OFF</span>
          </div>
          <div v-else class="flex items-center gap-2">
            <Clock class="w-4 h-4 text-[#E8F624] shrink-0" />
            <div class="font-tech text-xs sm:text-sm font-bold text-white tracking-wide">
              {{ shift.start_time || '??:??' }} <span class="text-[#9CA3AF]">/</span> {{ shift.end_time || '??:??' }}
            </div>
          </div>
          
          <ChevronRight class="w-4 h-4 text-[#9CA3AF] group-hover:text-[#E8F624] group-hover:translate-x-0.5 transition" />
        </div>

        <!-- ZZZ Mission Card Bottom Bar: Micro Runic Barcode & Action Pill (对齐绝区零任务卡片底部) -->
        <div class="mt-2.5 pt-2 border-t border-black/80 flex items-center justify-between">
          <!-- Digital Runic Barcode Stamp -->
          <div class="flex flex-col">
            <div class="text-[11px] font-tech font-bold text-white flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="13" height="13" class="text-[#E8F624] shrink-0 fill-current">
                <path fill="currentColor" d="M194.82 496a18.36 18.36 0 0 1-18.1-21.53v-.11L204.83 320H96a16 16 0 0 1-12.44-26.06L302.73 23a18.45 18.45 0 0 1 32.8 13.71c0 .3-.08.59-.13.89L307.19 192H416a16 16 0 0 1 12.44 26.06L209.24 489a18.45 18.45 0 0 1-14.42 7"/>
              </svg>
              <span>{{ shift.is_off ? '00' : '100' }}</span>
            </div>
            <div class="zzz-runic-code select-none mt-0.5">
              ■■■■■■■■
            </div>
          </div>

          <!-- Tactile Action Pill Button -->
          <div class="flex items-center">
            <button 
              type="button"
              class="px-2.5 py-1 rounded-full zzz-btn-dark text-[10px] font-bold text-white group-hover:bg-[#E8F624] group-hover:text-black group-hover:border-black transition-all cursor-pointer shadow-[0_2px_0_#000]"
            >
              微调 // EDIT
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- List View: Perforated Industrial Strips -->
    <div v-else class="space-y-2.5">
      <div
        v-for="shift in filteredShifts"
        :key="shift.id"
        @click="openEditor(shift)"
        :class="[
          'p-3 sm:px-5 rounded-2xl border-[2.5px] transition-all cursor-pointer flex items-center justify-between group active:scale-[0.98]',
          (shift.confidence < 0.8 || (!shift.is_off && (!shift.start_time || !shift.end_time)))
            ? 'bg-[#1E2024] border-[#E03030] shadow-[0_3px_0_#000000]'
            : 'zzz-card hover:bg-[#2C3038]'
        ]"
      >
        <div class="flex items-center gap-2 sm:gap-6 min-w-0">
          <div class="w-16 sm:w-24 shrink-0">
            <div class="text-[11px] sm:text-xs font-tech font-bold text-white leading-tight">{{ formatDisplayDate(shift.date) }}</div>
            <div class="text-[9px] sm:text-[10px] text-[#9CA3AF]">({{ getWeekdayName(shift.date) }})</div>
          </div>

          <div class="shrink-0 text-center">
            <span class="text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-tech font-bold bg-[#181A1E] text-[#E8F624] border border-black">
              {{ shift.raw_text || '-' }}
            </span>
          </div>

          <div class="flex items-center gap-1.5 min-w-0">
            <div v-if="shift.is_off" class="text-[#36E4DA] text-[11px] sm:text-xs font-bold flex items-center gap-1 font-tech whitespace-nowrap">
              <Coffee class="w-3.5 h-3.5 shrink-0" />
              <span>全天休假 // OFF</span>
            </div>
            <div v-else class="font-tech text-[11px] sm:text-xs font-bold text-white flex items-center gap-1 whitespace-nowrap">
              <Clock class="w-3.5 h-3.5 text-[#E8F624] shrink-0" />
              <span>{{ shift.start_time || '??:??' }}<span class="text-[#9CA3AF] mx-0.5">/</span>{{ shift.end_time || '??:??' }}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0 ml-2">
          <!-- Desktop Badge (Hidden on mobile to keep clean red-border highlight without wrapping) -->
          <span 
            v-if="shift.confidence < 0.8 || (!shift.is_off && (!shift.start_time || !shift.end_time))"
            class="hidden sm:inline-flex text-[10px] px-2 py-0.5 rounded-full bg-[#E03030] text-white font-bold items-center gap-1 border border-black shadow-[0_1px_0_#000] whitespace-nowrap"
          >
            <AlertTriangle class="w-3 h-3 stroke-[2.2]" />
            待复核
          </span>
          <!-- Mobile Red Anomaly Warning Dot / Mini Icon -->
          <AlertTriangle 
            v-if="shift.confidence < 0.8 || (!shift.is_off && (!shift.start_time || !shift.end_time))"
            class="sm:hidden w-3.5 h-3.5 text-[#E03030] shrink-0"
          />
          <Edit3 class="w-3.5 h-3.5 text-[#9CA3AF] group-hover:text-[#E8F624] transition shrink-0" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { 
  CalendarDays, Briefcase, Coffee, AlertTriangle, AlertCircle, 
  Clock, Plus, LayoutGrid, List, ChevronRight, Edit3, Calendar as CalendarIcon 
} from 'lucide-vue-next';

const props = defineProps({
  shifts: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['edit-shift', 'add-shift']);

const viewMode = ref('grid');
const activeFilter = ref('all');

const workDaysCount = computed(() => {
  return props.shifts.filter(s => !s.is_off && s.start_time && s.end_time).length;
});

const offDaysCount = computed(() => {
  return props.shifts.filter(s => s.is_off).length;
});

const anomalyCount = computed(() => {
  return props.shifts.filter(s => {
    const isMissingTime = !s.is_off && (!s.start_time || !s.end_time);
    const isLowConfidence = s.confidence < 0.8;
    return isMissingTime || isLowConfidence;
  }).length;
});

const filterOptions = computed(() => [
  { id: 'all', label: '全部班次', shortLabel: '全部', count: props.shifts.length },
  { id: 'anomalies', label: '待复核', shortLabel: '待核', count: anomalyCount.value },
  { id: 'work', label: '出勤工作', shortLabel: '出勤', count: workDaysCount.value },
  { id: 'off', label: '休假', shortLabel: '休假', count: offDaysCount.value },
]);

const filteredShifts = computed(() => {
  if (activeFilter.value === 'anomalies') {
    return props.shifts.filter(s => {
      const isMissingTime = !s.is_off && (!s.start_time || !s.end_time);
      const isLowConfidence = s.confidence < 0.8;
      return isMissingTime || isLowConfidence;
    });
  }
  if (activeFilter.value === 'work') {
    return props.shifts.filter(s => !s.is_off);
  }
  if (activeFilter.value === 'off') {
    return props.shifts.filter(s => s.is_off);
  }
  return props.shifts;
});

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[1]}月${parts[2]}日`;
  }
  return dateStr;
}

function getWeekdayName(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    const day = d.getDay();
    const map = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return map[day] || '';
  } catch (e) {
    return '';
  }
}

function openEditor(shift) {
  emit('edit-shift', shift);
}

function addNewDay() {
  emit('add-shift');
}
</script>
