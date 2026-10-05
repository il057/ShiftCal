<template>
  <div class="space-y-4">
    <!-- Header Summary Stats Bar -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <!-- Total Days -->
      <div class="p-4 rounded-2xl glass-panel-subtle flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold shrink-0">
          <CalendarDays class="w-5 h-5" />
        </div>
        <div>
          <div class="text-xs text-slate-400">总排班天数</div>
          <div class="text-lg font-bold text-white">{{ shifts.length }} <span class="text-xs font-normal text-slate-400">天</span></div>
        </div>
      </div>

      <!-- Working Days -->
      <div class="p-4 rounded-2xl glass-panel-subtle flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold shrink-0">
          <Briefcase class="w-5 h-5" />
        </div>
        <div>
          <div class="text-xs text-slate-400">出勤工作天数</div>
          <div class="text-lg font-bold text-white">{{ workDaysCount }} <span class="text-xs font-normal text-slate-400">天</span></div>
        </div>
      </div>

      <!-- Off Days -->
      <div class="p-4 rounded-2xl glass-panel-subtle flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
          <Coffee class="w-5 h-5" />
        </div>
        <div>
          <div class="text-xs text-slate-400">休假天数</div>
          <div class="text-lg font-bold text-white">{{ offDaysCount }} <span class="text-xs font-normal text-slate-400">天</span></div>
        </div>
      </div>

      <!-- Anomalies / Low confidence -->
      <div 
        :class="[
          'p-4 rounded-2xl border transition flex items-center gap-3',
          anomalyCount > 0 
            ? 'bg-amber-500/10 border-amber-500/30' 
            : 'glass-panel-subtle border-white/5'
        ]"
      >
        <div 
          :class="[
            'w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0',
            anomalyCount > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
          ]"
        >
          <AlertTriangle class="w-5 h-5" />
        </div>
        <div>
          <div class="text-xs text-slate-400">待复核项</div>
          <div class="text-lg font-bold" :class="anomalyCount > 0 ? 'text-amber-300' : 'text-slate-300'">
            {{ anomalyCount }} <span class="text-xs font-normal text-slate-400">项</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter & View Mode Controls -->
    <div class="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl glass-panel-subtle">
      <!-- Filter Tabs -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
        <button
          v-for="filter in filterOptions"
          :key="filter.id"
          type="button"
          @click="activeFilter = filter.id"
          :class="[
            'px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 shrink-0',
            activeFilter === filter.id
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          ]"
        >
          <span>{{ filter.label }}</span>
          <span 
            v-if="filter.count !== undefined" 
            :class="[
              'px-1.5 py-0.2 rounded-full text-[10px]',
              activeFilter === filter.id ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
            ]"
          >
            {{ filter.count }}
          </span>
        </button>
      </div>

      <!-- Right Actions: View Toggle + Add Day -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="addNewDay"
          class="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition"
        >
          <Plus class="w-3.5 h-3.5 text-indigo-400" />
          <span>添加一天</span>
        </button>

        <div class="bg-slate-900/80 p-0.5 rounded-xl border border-slate-800 flex items-center">
          <button
            type="button"
            @click="viewMode = 'grid'"
            :class="[
              'p-1.5 rounded-lg text-xs transition',
              viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            ]"
            title="网格视图"
          >
            <LayoutGrid class="w-4 h-4" />
          </button>
          <button
            type="button"
            @click="viewMode = 'list'"
            :class="[
              'p-1.5 rounded-lg text-xs transition',
              viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            ]"
            title="列表视图"
          >
            <List class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredShifts.length === 0" class="p-12 text-center rounded-2xl glass-panel-subtle">
      <CalendarIcon class="w-12 h-12 text-slate-600 mx-auto mb-3" />
      <div class="text-slate-300 font-semibold text-sm">当前筛选条件下暂无班次</div>
      <p class="text-xs text-slate-500 mt-1">切换筛选条件或点击右上角添加排班</p>
    </div>

    <!-- Grid View -->
    <div 
      v-else-if="viewMode === 'grid'"
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5"
    >
      <div
        v-for="shift in filteredShifts"
        :key="shift.id"
        @click="openEditor(shift)"
        :class="[
          'relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer group flex flex-col justify-between hover:scale-[1.01]',
          !shift.is_off && (!shift.start_time || !shift.end_time)
            ? 'bg-rose-950/20 border-rose-500/50 hover:border-rose-400 shadow-sm shadow-rose-950/40'
            : shift.confidence < 0.8
              ? 'bg-amber-950/20 border-amber-500/50 hover:border-amber-400 shadow-sm shadow-amber-950/30'
              : shift.is_off
                ? 'bg-emerald-950/10 border-emerald-500/20 hover:border-emerald-500/40'
                : 'glass-panel hover:border-indigo-500/50'
        ]"
      >
        <!-- Card Top Bar: Date & Weekday -->
        <div class="flex items-center justify-between mb-3">
          <div>
            <div class="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <span>{{ formatDisplayDate(shift.date) }}</span>
              <span class="text-[11px] font-normal text-slate-400">({{ getWeekdayName(shift.date) }})</span>
            </div>
            <div class="text-[10px] text-slate-500 mt-0.5">
              手写识别: <span class="font-mono text-indigo-300 font-medium">{{ shift.raw_text || '-' }}</span>
            </div>
          </div>

          <!-- Status Badge -->
          <div class="flex items-center gap-1.5">
            <!-- Anomaly Badge -->
            <span 
              v-if="!shift.is_off && (!shift.start_time || !shift.end_time)"
              class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1"
            >
              <AlertCircle class="w-3 h-3" />
              时间缺失
            </span>
            <span 
              v-else-if="shift.confidence < 0.8"
              class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1"
            >
              <AlertTriangle class="w-3 h-3" />
              低置信度 {{ (shift.confidence * 100).toFixed(0) }}%
            </span>

            <!-- Normal Shift Pill -->
            <span
              v-else-if="shift.is_off"
              class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
            >
              休假 (OFF)
            </span>
            <span
              v-else
              class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
            >
              出勤
            </span>
          </div>
        </div>

        <!-- Shift Main Display -->
        <div class="my-2 py-2 px-3 rounded-xl bg-slate-950/40 border border-white/5 flex items-center justify-between">
          <div v-if="shift.is_off" class="text-emerald-300 font-semibold text-sm flex items-center gap-2">
            <Coffee class="w-4 h-4 text-emerald-400" />
            <span>全天休假 (Off)</span>
          </div>
          <div v-else class="flex items-center gap-2">
            <Clock class="w-4 h-4 text-indigo-400 shrink-0" />
            <div class="font-mono text-sm font-bold text-white tracking-wide">
              {{ shift.start_time || '??:??' }} - {{ shift.end_time || '??:??' }}
            </div>
          </div>
          
          <ChevronRight class="w-4 h-4 text-slate-500 group-hover:text-indigo-300 group-hover:translate-x-0.5 transition" />
        </div>

        <!-- Card Footer -->
        <div class="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span class="truncate max-w-[150px]">{{ shift.note || '点击微调或换班' }}</span>
          <span class="text-[10px]" :class="shift.confidence >= 0.8 ? 'text-slate-500' : 'text-amber-400 font-medium'">
            AI 置信度: {{ (shift.confidence * 100).toFixed(0) }}%
          </span>
        </div>
      </div>
    </div>

    <!-- List View -->
    <div v-else class="space-y-2">
      <div
        v-for="shift in filteredShifts"
        :key="shift.id"
        @click="openEditor(shift)"
        :class="[
          'p-3 sm:px-4 rounded-xl border transition cursor-pointer flex items-center justify-between group',
          !shift.is_off && (!shift.start_time || !shift.end_time)
            ? 'bg-rose-950/20 border-rose-500/40'
            : shift.confidence < 0.8
              ? 'bg-amber-950/20 border-amber-500/40'
              : shift.is_off
                ? 'bg-slate-900/40 border-slate-800'
                : 'glass-panel-subtle hover:border-indigo-500/40'
        ]"
      >
        <div class="flex items-center gap-3 sm:gap-6">
          <div class="w-24 shrink-0">
            <div class="text-xs font-mono font-bold text-white">{{ formatDisplayDate(shift.date) }}</div>
            <div class="text-[10px] text-slate-400">{{ getWeekdayName(shift.date) }}</div>
          </div>

          <div class="w-16 shrink-0 text-center">
            <span class="text-[10px] px-2 py-0.5 rounded-full font-mono bg-slate-800 text-slate-300 border border-slate-700">
              {{ shift.raw_text || '-' }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <div v-if="shift.is_off" class="text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
              <Coffee class="w-3.5 h-3.5" />
              <span>休假 (OFF)</span>
            </div>
            <div v-else class="font-mono text-xs font-bold text-white flex items-center gap-1.5">
              <Clock class="w-3.5 h-3.5 text-indigo-400" />
              <span>{{ shift.start_time || '??:??' }} - {{ shift.end_time || '??:??' }}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <span 
            v-if="shift.confidence < 0.8 || (!shift.is_off && (!shift.start_time || !shift.end_time))"
            class="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1"
          >
            <AlertTriangle class="w-3 h-3" />
            需复核
          </span>
          <Edit3 class="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition" />
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
  { id: 'all', label: '全部', count: props.shifts.length },
  { id: 'anomalies', label: '需复核', count: anomalyCount.value },
  { id: 'work', label: '工作班次', count: workDaysCount.value },
  { id: 'off', label: '休假', count: offDaysCount.value },
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
