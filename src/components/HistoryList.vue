<template>
  <div class="mt-8 space-y-4">
    <!-- Section Header (Hardware Archive Panel) -->
    <div class="pb-2.5 border-b-2 border-black space-y-1">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 sm:gap-3 min-w-0">
          <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#E8F624] text-black border-2 border-black flex items-center justify-center font-bold shadow-[0_2px_0_#000] shrink-0">
            <History class="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
          </div>
          <h3 class="text-xs sm:text-base font-normal text-white uppercase tracking-tight font-unbounded truncate">
            <span>本地磁带库</span> <span class="text-[#E8F624] font-tech text-[10px] sm:text-xs tracking-normal font-bold">// ARCHIVE</span>
          </h3>
        </div>

        <button
          v-if="historyRecords.length > 0"
          type="button"
          @click="confirmClearAll"
          class="px-2.5 sm:px-3 py-1 rounded-full zzz-btn-close text-[10px] sm:text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
        >
          <Trash2 class="w-3 h-3 stroke-[2.2]" />
          <span class="hidden sm:inline">清空卡带库</span>
          <span class="sm:hidden">清空</span>
        </button>
      </div>

      <p class="text-[10px] sm:text-[11px] text-[#9CA3AF] font-tech pl-9 sm:pl-11 leading-tight">
        排班数据已本地固化，无需重复消耗多模态 Token
      </p>
    </div>

    <!-- Empty State -->
    <div 
      v-if="historyRecords.length === 0" 
      class="p-8 rounded-3xl zzz-slot text-center select-none"
    >
      <div class="w-12 h-12 rounded-2xl bg-[#111215] border-2 border-[#181A1D] flex items-center justify-center text-[#9CA3AF] mx-auto mb-3 shadow-inner">
        <CalendarCheck class="w-6 h-6" />
      </div>
      <p class="text-xs font-bold text-white uppercase tracking-wide">NO ARCHIVED CASSETTES // 暂无磁带记录</p>
      <p class="text-[11px] text-[#9CA3AF] font-tech mt-1 max-w-sm mx-auto">
        成功识别手写排班表后，排班磁轨数据将自动写入本地存储，供随时离线复核与导出。
      </p>
    </div>

    <!-- History Cards Grid (Cassette Cartridges / Ticket Stubs) -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
      <div
        v-for="record in historyRecords"
        :key="record.id"
        class="relative p-3.5 sm:p-5 rounded-2xl zzz-card hover:bg-[#333740] transition-all group flex flex-col justify-between"
      >
        <!-- Top Cassette Information -->
        <div>
          <div class="flex items-center justify-between gap-2 mb-2.5 sm:mb-3">
            <div class="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span class="px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-bold bg-[#E8F624] text-black border border-[#181A1D] truncate">
                {{ record.staffName }}
              </span>
              <span v-if="record.monthInfo" class="px-1.5 sm:px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-tech font-bold bg-[#181A1E] text-white border border-[#181A1D] shrink-0">
                {{ record.monthInfo }}
              </span>
            </div>
            
            <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <span class="text-[9px] sm:text-[10px] text-[#9CA3AF] font-tech flex items-center gap-1">
                <Clock class="w-3 h-3 text-[#9CA3AF]" />
                {{ record.savedAt }}
              </span>
              <!-- Delete Capsule Button -->
              <button
                type="button"
                @click="handleDelete(record.id)"
                class="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#181A1E] border border-[#2A2E35] text-[#9CA3AF] hover:text-[#E03030] hover:border-[#E03030] flex items-center justify-center transition cursor-pointer"
                title="删除该记录"
              >
                <Trash2 class="w-3 sm:w-3.5 h-3 sm:h-3.5" />
              </button>
            </div>
          </div>

          <!-- High-density DIN Stats & Date Range (Responsive layout so dates never break) -->
          <div class="flex flex-col xs:flex-row xs:items-center justify-between gap-1 sm:gap-1.5 text-xs font-tech mb-3 pb-2 border-b border-[#181A1D]">
            <span class="text-white font-bold tracking-tight text-[11px] sm:text-xs whitespace-nowrap">{{ record.dateRange }}</span>
            <div class="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold shrink-0">
              <span class="text-[#E8F624]">DUTY {{ record.workDays }}D</span>
              <span class="text-[#6B7280]">/</span>
              <span class="text-[#36E4DA]">OFF {{ record.offDays }}D</span>
            </div>
          </div>

          <!-- Micro Tape Track Preview Pills -->
          <div class="flex flex-wrap gap-1.5 mb-3 sm:mb-4">
            <span
              v-for="s in record.shifts.slice(0, 6)"
              :key="s.id || s.date"
              :class="[
                'px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-tech font-bold border',
                s.is_off
                  ? 'bg-[#181A1E] text-[#9CA3AF] border-[#2A2E35]'
                  : 'bg-[#181A1E] text-[#E8F624] border-[#2A2E35]'
              ]"
            >
              {{ s.date ? s.date.slice(5) : '' }} {{ s.is_off ? '休' : (s.raw_text || (s.start_time ? `${s.start_time.slice(0,2)}-${s.end_time.slice(0,2)}` : '班')) }}
            </span>
            <span v-if="record.shifts.length > 6" class="px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-tech text-[#9CA3AF] bg-[#181A1E] border border-[#2A2E35]">
              +{{ record.shifts.length - 6 }}D
            </span>
          </div>
        </div>

        <!-- Action Buttons: Tactile Spring Hardware Keys -->
        <div class="pt-2.5 sm:pt-3 border-t-2 border-[#181A1D] flex items-center justify-between gap-2 sm:gap-3">
          <button
            type="button"
            @click="$emit('load-record', record)"
            class="flex-1 py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-xl zzz-btn-yellow text-black text-xs font-bold flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer"
          >
            <Edit3 class="w-3.5 h-3.5 stroke-[2.2]" />
            <span>装填载入<span class="hidden xs:inline"> // LOAD</span></span>
          </button>

          <button
            type="button"
            @click="$emit('export-record', record)"
            class="py-1.5 sm:py-2 px-3 sm:px-4 rounded-xl zzz-btn-dark text-white text-xs font-bold flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer"
          >
            <Download class="w-3.5 h-3.5 text-[#E8F624]" />
            <span>刻录日历</span>
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
  if (confirm('确定要删除这条排班磁带记录吗？')) {
    deleteScheduleRecord(id);
  }
}

function confirmClearAll() {
  if (confirm('确定要清空全部本地磁带保管库吗？')) {
    clearAllHistory();
  }
}
</script>
