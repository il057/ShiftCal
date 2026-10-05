<template>
  <Teleport to="body" v-if="isOpen">
    <div class="fixed inset-0 z-[9999] overflow-y-auto">
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-[#000000]/80 backdrop-blur-sm transition-opacity" 
        aria-hidden="true"
        @click="$emit('close')"
      ></div>

      <!-- Centering container -->
      <div 
        class="min-h-full flex items-center justify-center p-3 sm:p-6 select-none"
        @click.self="$emit('close')"
      >
        <!-- Modal Hardware Chassis -->
        <div 
          class="relative w-full max-w-lg rounded-3xl bg-[#1E2024] p-5 sm:p-7 shadow-[0_10px_0_#000000] border-[2.5px] border-black z-10 max-h-[90vh] overflow-y-auto" 
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-center justify-between pb-3.5 border-b-2 border-black">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-[#E8F624] text-black border-2 border-black flex items-center justify-center font-bold shadow-[0_2px_0_#000000]">
                <DownloadCloud class="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 class="text-base sm:text-lg font-normal text-white uppercase tracking-tight font-unbounded">
                  <span>日历磁带刻录</span> <span class="text-[#E8F624] font-tech text-xs tracking-normal font-bold">// ICS BURNER</span>
                </h3>
                <p class="text-[11px] text-[#9CA3AF] font-tech">RFC 5545 国际标准格式 · 原生同步 iOS / macOS</p>
              </div>
            </div>
            
            <!-- High-Contrast Red-Black Close Capsule -->
            <button 
              type="button"
              @click="$emit('close')"
              class="w-8 h-8 rounded-lg zzz-btn-close flex items-center justify-center text-white cursor-pointer"
              title="关闭"
            >
              <X class="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>

          <!-- Export Form -->
          <div class="mt-5 space-y-4 text-xs">
            <!-- Calendar Title -->
            <div>
              <label class="block text-white font-bold mb-1.5 font-sans">
                日历标题 // CALENDAR TITLE
              </label>
              <input
                type="text"
                v-model="exportForm.calendarTitle"
                placeholder="工作排班表"
                class="w-full px-3.5 py-2.5 rounded-xl zzz-slot text-white font-bold focus:outline-none focus:border-[#E8F624]"
              />
            </div>

            <!-- Staff Name in Title -->
            <div>
              <label class="block text-white font-bold mb-1.5 font-sans">
                员工姓名标签 // STAFF TAG
              </label>
              <input
                type="text"
                v-model="exportForm.staffName"
                placeholder="例如: 张三 (Alex)"
                class="w-full px-3.5 py-2.5 rounded-xl zzz-slot text-white font-bold focus:outline-none focus:border-[#E8F624]"
              />
            </div>

            <!-- Alarm Reminder Selection (Capsule Button Grid) -->
            <div>
              <label class="block text-white font-bold mb-2 flex items-center gap-1.5 font-sans">
                <Bell class="w-3.5 h-3.5 text-[#E8F624]" />
                <span>闹钟提醒参数 // VALARM PRESET</span>
              </label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="alarm in alarmOptions"
                  :key="alarm.minutes"
                  type="button"
                  @click="exportForm.alarmMinutes = alarm.minutes"
                  :class="[
                    'py-2 px-2 rounded-xl border-2 text-center transition font-bold font-tech cursor-pointer',
                    exportForm.alarmMinutes === alarm.minutes
                      ? 'bg-[#E8F624] text-black border-[#181A1D] shadow-[0_2px_0_#181A1D]'
                      : 'bg-[#181A1E] border-[#2A2E35] text-[#9CA3AF] hover:text-white hover:border-[#9CA3AF]'
                  ]"
                >
                  {{ alarm.label }}
                </button>
              </div>
            </div>

            <!-- Toggle Off Days Export -->
            <div class="flex items-center justify-between p-3.5 rounded-2xl zzz-slot">
              <div>
                <div class="font-bold text-white text-xs">同时刻录全天休假日程</div>
                <div class="text-[11px] text-[#9CA3AF] font-tech">将休假班次作为全天事件写入日历</div>
              </div>
              <button
                type="button"
                @click="exportForm.exportOffDays = !exportForm.exportOffDays"
                :class="[
                  'w-12 h-6 rounded-full transition-colors relative border-2 border-[#181A1D] shrink-0 cursor-pointer',
                  exportForm.exportOffDays ? 'bg-[#36E4DA]' : 'bg-[#111215]'
                ]"
              >
                <span
                  :class="[
                    'absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform',
                    exportForm.exportOffDays ? 'translate-x-6 bg-black' : 'translate-x-0 bg-[#9CA3AF]'
                  ]"
                ></span>
              </button>
            </div>

            <!-- iOS Safari Import Guide Card (Ticket Stub / Technical Sheet) -->
            <div class="p-4 rounded-2xl zzz-card border-2 border-[#181A1D] space-y-2">
              <div class="flex items-center gap-2 font-bold text-white uppercase font-sans">
                <Smartphone class="w-4 h-4 text-[#E8F624]" />
                <span>iOS 快速导入磁带指南</span>
              </div>
              <p class="text-[11px] leading-relaxed text-[#D1D5DB] font-tech">
                1. 点击下方按钮下载 <code class="font-bold text-[#E8F624]">.ics</code> 磁带文件；<br />
                2. Safari 弹出提示后点击打开下载项；<br />
                3. 系统日历将自动唤起，点击右上角 <strong class="text-white">“全部添加”</strong> 即可完成刻录！
              </p>
            </div>
          </div>

          <!-- Action Footer -->
          <div class="mt-6 pt-4 border-t-2 border-[#181A1D] flex items-center justify-between gap-3">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2.5 rounded-xl zzz-btn-dark text-xs font-bold text-white cursor-pointer"
            >
              取消
            </button>

            <button
              type="button"
              @click="handleExport"
              class="flex-1 py-3 px-4 rounded-xl zzz-btn-yellow text-black text-xs font-bold flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              <Download class="w-4 h-4 stroke-[2.2]" />
              <span>立即刻录并下载 .ics // BURN</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { reactive, watch } from 'vue';
import { DownloadCloud, X, Bell, Smartphone, Download } from 'lucide-vue-next';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  staffName: {
    type: String,
    default: ''
  },
  monthInfo: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close', 'confirm-export']);

const exportForm = reactive({
  calendarTitle: '工作排班表',
  staffName: '',
  alarmMinutes: 60,
  exportOffDays: false,
});

watch(
  () => props.staffName,
  (val) => {
    exportForm.staffName = val || '';
    if (val) {
      exportForm.calendarTitle = `工作排班 - ${val}`;
    }
  },
  { immediate: true }
);

const alarmOptions = [
  { label: '提前 15 分', minutes: 15 },
  { label: '提前 30 分', minutes: 30 },
  { label: '提前 1 小时', minutes: 60 },
  { label: '提前 2 小时', minutes: 120 },
  { label: '提前前夜 (12h)', minutes: 720 },
  { label: '无提醒', minutes: 0 },
];

function handleExport() {
  emit('confirm-export', { ...exportForm });
  emit('close');
}
</script>
