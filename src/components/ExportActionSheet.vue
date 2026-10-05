<template>
  <Teleport to="body" v-if="isOpen">
    <div class="fixed inset-0 z-[9999] overflow-y-auto">
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity" 
        aria-hidden="true"
        @click="$emit('close')"
      ></div>

      <!-- Centering container -->
      <div 
        class="min-h-full flex items-center justify-center p-4 sm:p-6"
        @click.self="$emit('close')"
      >
        <!-- Modal Box -->
        <div 
          class="relative w-full max-w-lg rounded-2xl glass-panel p-6 sm:p-8 shadow-2xl border border-white/10 z-10 bg-slate-900 max-h-[90vh] overflow-y-auto" 
          @click.stop
        >
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-white/10">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <DownloadCloud class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-white tracking-tight">导出 iOS 系统日历 (.ics)</h3>
            <p class="text-xs text-slate-400">符合 RFC 5545 国际标准日历格式</p>
          </div>
        </div>
        <button 
          @click="$emit('close')"
          class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Export Form -->
      <div class="mt-5 space-y-4 text-xs">
        <!-- Calendar Title -->
        <div>
          <label class="block text-slate-300 font-semibold mb-1.5">日历名称 (Calendar Title)</label>
          <input
            type="text"
            v-model="exportForm.calendarTitle"
            placeholder="工作排班表"
            class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none focus:border-indigo-500"
          />
        </div>

        <!-- Staff Name in Title -->
        <div>
          <label class="block text-slate-300 font-semibold mb-1.5">标注员工姓名</label>
          <input
            type="text"
            v-model="exportForm.staffName"
            placeholder="例如: 张三 (Alex)"
            class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none focus:border-indigo-500"
          />
        </div>

        <!-- Alarm Reminder Selection -->
        <div>
          <label class="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
            <Bell class="w-3.5 h-3.5 text-amber-400" />
            上班提醒 (VALARM 闹钟)
          </label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="alarm in alarmOptions"
              :key="alarm.minutes"
              type="button"
              @click="exportForm.alarmMinutes = alarm.minutes"
              :class="[
                'py-2 px-2 rounded-xl border text-center transition font-medium',
                exportForm.alarmMinutes === alarm.minutes
                  ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              ]"
            >
              {{ alarm.label }}
            </button>
          </div>
        </div>

        <!-- Toggle Off Days Export -->
        <div class="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800">
          <div>
            <div class="font-semibold text-slate-200">同时导出休假日程</div>
            <div class="text-[11px] text-slate-500">将休假（X/Vacay）作为全天日程写入日历</div>
          </div>
          <button
            type="button"
            @click="exportForm.exportOffDays = !exportForm.exportOffDays"
            :class="[
              'w-12 h-6 rounded-full transition-colors relative focus:outline-none',
              exportForm.exportOffDays ? 'bg-indigo-600' : 'bg-slate-700'
            ]"
          >
            <span
              :class="[
                'absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform',
                exportForm.exportOffDays ? 'translate-x-6' : 'translate-x-0'
              ]"
            ></span>
          </button>
        </div>

        <!-- iOS Safari Import Guide Card -->
        <div class="p-3.5 rounded-xl bg-gradient-to-r from-blue-950/30 to-indigo-950/30 border border-indigo-500/20 text-indigo-200 space-y-1.5">
          <div class="flex items-center gap-2 font-semibold text-white">
            <Smartphone class="w-4 h-4 text-sky-400" />
            <span>iOS Safari 导入说明</span>
          </div>
          <p class="text-[11px] leading-relaxed text-indigo-200/80">
            1. 点击下方按钮下载 <code class="font-mono text-white">.ics</code> 文件；<br />
            2. Safari 弹出下载确认后，点击右上角下载图标打开；<br />
            3. 系统日历将自动唤起，点击右上角 <strong class="text-white">“全部添加”</strong>，即可同步至 iPhone、iPad 与 Apple Watch！
          </p>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
        <button
          type="button"
          @click="$emit('close')"
          class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
        >
          取消
        </button>

        <button
          type="button"
          @click="handleExport"
          class="flex-1 py-2.5 px-4 rounded-xl glass-button text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 hover:opacity-95 transition"
        >
          <Download class="w-4 h-4" />
          <span>立即生成并导出 .ics 日历</span>
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
  alarmMinutes: 60, // 默认提前1小时提醒
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
  { label: '提前 15 分钟', minutes: 15 },
  { label: '提前 30 分钟', minutes: 30 },
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
