<template>
  <div class="mt-8 space-y-4">
    <!-- Section Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <History class="w-4 h-4" />
        </div>
        <div>
          <h3 class="text-sm sm:text-base font-bold text-white tracking-tight">历史排班记录</h3>
          <p class="text-xs text-slate-400">已自动保存在本地，可随时重新载入、编辑或导出，无需再次调用 AI</p>
        </div>
      </div>

      <button
        v-if="historyRecords.length > 0"
        type="button"
        @click="confirmClearAll"
        class="text-xs text-slate-500 hover:text-rose-400 transition flex items-center gap-1 cursor-pointer"
      >
        <Trash2 class="w-3.5 h-3.5" />
        <span>清空历史</span>
      </button>
    </div>

    <!-- Empty State -->
    <div 
      v-if="historyRecords.length === 0" 
      class="p-6 rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 text-center"
    >
      <div class="w-10 h-10 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-slate-500 mx-auto mb-2.5">
        <CalendarCheck class="w-5 h-5" />
      </div>
      <p class="text-xs font-semibold text-slate-300">暂无本地历史记录</p>
      <p class="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
        成功识别手写排班表后，排班数据将自动存储在当前设备，方便您随时微调或导出日历。
      </p>
    </div>

    <!-- History Cards Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
      <div
        v-for="record in historyRecords"
        :key="record.id"
        class="p-4 rounded-2xl glass-panel border border-white/10 hover:border-indigo-500/40 transition-all group flex flex-col justify-between"
      >
        <!-- Top Info -->
        <div>
          <div class="flex items-center justify-between gap-2 mb-2">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {{ record.staffName }}
              </span>
              <span v-if="record.monthInfo" class="text-xs font-semibold text-white">
                {{ record.monthInfo }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                <Clock class="w-3 h-3 text-slate-500" />
                {{ record.savedAt }}
              </span>
              <button
                type="button"
                @click="handleDelete(record.id)"
                class="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-white/5 transition"
                title="删除记录"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Date span & stats -->
          <div class="flex items-center gap-2 text-xs text-slate-400 mb-3">
            <span class="font-mono text-[11px] text-slate-300">{{ record.dateRange }}</span>
            <span class="text-slate-600">·</span>
            <span class="text-emerald-400 font-medium">上班 {{ record.workDays }} 天</span>
            <span class="text-slate-600">·</span>
            <span class="text-slate-400">休息 {{ record.offDays }} 天</span>
          </div>

          <!-- Quick Preview Badges -->
          <div class="flex flex-wrap gap-1.5 mb-4">
            <span
              v-for="s in record.shifts.slice(0, 6)"
              :key="s.id || s.date"
              :class="[
                'px-2 py-0.5 rounded-md text-[10px] font-mono border',
                s.is_off
                  ? 'bg-slate-900 text-slate-500 border-slate-800'
                  : 'bg-indigo-950/40 text-indigo-300 border-indigo-500/30'
              ]"
            >
              {{ s.date ? s.date.slice(5) : '' }} {{ s.is_off ? '休' : (s.raw_text || (s.start_time ? `${s.start_time.slice(0,2)}-${s.end_time.slice(0,2)}` : '班')) }}
            </span>
            <span v-if="record.shifts.length > 6" class="px-1.5 py-0.5 rounded-md text-[10px] text-slate-500">
              +{{ record.shifts.length - 6 }}天
            </span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
          <button
            type="button"
            @click="$emit('load-record', record)"
            class="flex-1 py-2 px-3 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <Edit3 class="w-3.5 h-3.5 text-indigo-400" />
            <span>载入查看 / 修改</span>
          </button>

          <button
            type="button"
            @click="$emit('export-record', record)"
            class="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <Download class="w-3.5 h-3.5 text-slate-400" />
            <span>导出日历</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { History, Trash2, CalendarCheck, Clock, Edit3, Download } from 'lucide-vue-next';
import { useScheduleHistory } from '../composables/useScheduleHistory';

const emit = defineEmits(['load-record', 'export-record']);

const { historyRecords, deleteScheduleRecord, clearAllHistory } = useScheduleHistory();

function handleDelete(id) {
  if (confirm('确定要删除这条排班记录吗？')) {
    deleteScheduleRecord(id);
  }
}

function confirmClearAll() {
  if (confirm('确定要清空全部本地历史记录吗？')) {
    clearAllHistory();
  }
}
</script>
