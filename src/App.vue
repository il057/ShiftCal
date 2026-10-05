<template>
  <div class="min-h-screen flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-200">
    <!-- Top Navigation Header -->
    <header class="sticky top-0 z-40 glass-panel border-b border-white/10 pt-safe">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <!-- Logo with user's customized SVG icon -->
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shadow-md shadow-indigo-500/20 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-5 h-5 text-indigo-300" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6">
              <path d="M16 2v4M8 2v4m13 8v-2c0-3.771 0-5.657-1.172-6.828S16.771 4 13 4h-2C7.229 4 5.343 4 4.172 5.172S3 8.229 3 12v2c0 3.771 0 5.657 1.172 6.828S7.229 22 11 22h1M3 10h18"/>
              <path d="m18.105 15.506l.616 1.241a.76.76 0 0 0 .497.371l1.116.187c.714.12.882.642.367 1.157l-.867.875a.77.77 0 0 0-.183.64l.249 1.082c.196.858-.255 1.19-1.008.741l-1.046-.624a.75.75 0 0 0-.693 0l-1.047.624c-.749.448-1.204.113-1.008-.74l.249-1.084a.77.77 0 0 0-.182-.639l-.868-.875c-.51-.515-.346-1.037.368-1.157l1.116-.187a.76.76 0 0 0 .493-.37l.616-1.243c.336-.674.882-.674 1.215 0"/>
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-sm sm:text-base font-bold text-white tracking-tight">ShiftCal</h1>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hidden xs:inline-block">
                本地单页
              </span>
            </div>
            <p class="text-[11px] text-slate-400 hidden sm:block">手写排班表转 iOS 日历 (.ics)</p>
          </div>
        </div>

        <!-- Right Header Actions -->
        <div class="flex items-center gap-2 sm:gap-3">
          <!-- Install PWA prompt button if available -->
          <button
            v-if="installPrompt"
            type="button"
            @click="installPwa"
            class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-500/30 transition shadow-sm"
          >
            <Download class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">安装到主屏幕</span>
            <span class="sm:hidden">安装</span>
          </button>

          <!-- API Settings Button -->
          <button
            id="api-settings-btn"
            type="button"
            @click="openSettings"
            :class="[
              'px-3.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition relative cursor-pointer select-none active:scale-95',
              isConfigValid()
                ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-slate-500 hover:bg-slate-700/80'
                : 'bg-amber-500/20 border-amber-500/50 text-amber-200 animate-pulse'
            ]"
          >
            <Settings class="w-3.5 h-3.5 text-indigo-400" />
            <span>API 设置</span>
            <span v-if="!isConfigValid()" class="w-2 h-2 rounded-full bg-amber-400 absolute -top-1 -right-1"></span>
            <span v-else class="w-2 h-2 rounded-full bg-emerald-400 absolute -top-1 -right-1"></span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content Container -->
    <main class="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full space-y-6">
      <!-- API Missing Warning Banner (if user hasn't configured key or model yet) -->
      <div 
        v-if="!isConfigValid()" 
        class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-200 text-xs animate-in fade-in"
      >
        <div class="flex items-center gap-3">
          <AlertCircle class="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span class="font-bold text-amber-300">尚未完成 API 配置</span>
            <span class="text-amber-200/80 ml-1">请先填入您的 API Key 与 Base URL，并拉取选择模型以启用手写排班识别。</span>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button
            type="button"
            @click="openSettings"
            class="px-4 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition cursor-pointer"
          >
            立即设置 API
          </button>
        </div>
      </div>

      <!-- Step Progress Header -->
      <div class="flex items-center justify-between border-b border-white/5 pb-4">
        <div class="flex items-center gap-2 sm:gap-4 text-xs font-semibold">
          <button
            type="button"
            @click="currentStep = 1"
            :class="[
              'flex items-center gap-2 pb-1 transition border-b-2',
              currentStep === 1 
                ? 'border-indigo-500 text-white' 
                : 'border-transparent text-slate-500 hover:text-slate-300'
            ]"
          >
            <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px]" :class="currentStep === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'">1</span>
            <span>拍照 / 上传</span>
          </button>

          <ChevronRight class="w-3.5 h-3.5 text-slate-600" />

          <button
            type="button"
            @click="shifts.length > 0 ? (currentStep = 2) : null"
            :disabled="shifts.length === 0"
            :class="[
              'flex items-center gap-2 pb-1 transition border-b-2 disabled:opacity-40 disabled:cursor-not-allowed',
              currentStep === 2 
                ? 'border-indigo-500 text-white' 
                : 'border-transparent text-slate-500 hover:text-slate-300'
            ]"
          >
            <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px]" :class="currentStep === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'">2</span>
            <span>排班校验</span>
            <span v-if="shifts.length > 0" class="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-indigo-300">{{ shifts.length }}天</span>
          </button>

          <ChevronRight class="w-3.5 h-3.5 text-slate-600" />

          <button
            type="button"
            @click="shifts.length > 0 ? (isExportOpen = true) : null"
            :disabled="shifts.length === 0"
            :class="[
              'flex items-center gap-2 pb-1 transition border-b-2 disabled:opacity-40 disabled:cursor-not-allowed',
              currentStep === 3 
                ? 'border-indigo-500 text-white' 
                : 'border-transparent text-slate-500 hover:text-slate-300'
            ]"
          >
            <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px]" :class="currentStep === 3 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'">3</span>
            <span>导出 iOS 日历</span>
          </button>
        </div>
      </div>

      <!-- Step 1: Upload Section (Only rendered when currentStep === 1) -->
      <section v-if="currentStep === 1" class="space-y-6">
        <ImageUploader
          :is-parsing="isParsing"
          :progress-text="parseProgressText"
          :available-staff-list="availableStaffList"
          @start-parse="handleStartParse"
          @reparse-person="handleReparsePerson"
        />

        <!-- Local History Records Section -->
        <HistoryList
          @load-record="handleLoadHistoryRecord"
          @export-record="handleExportHistoryRecord"
        />
      </section>

      <!-- Step 2: Verification Section (Only rendered when currentStep === 2) -->
      <section v-if="currentStep === 2" class="space-y-6">
        <!-- Action Toolbar -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl glass-panel">
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base font-bold text-white">排班表校验与调整</h2>
              <span v-if="currentStaffName" class="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                员工: {{ currentStaffName }}
              </span>
              <span v-if="monthInfo" class="px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300">
                月份: {{ monthInfo }}
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-1">
              请检查标黄或标红的单元格，点击任意卡片即可微调时间或切换班次。
            </p>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="currentStep = 1"
              class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              重新上传
            </button>
            <button
              type="button"
              @click="isExportOpen = true"
              class="px-5 py-2 rounded-xl glass-button text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 hover:opacity-95 transition"
            >
              <DownloadCloud class="w-4 h-4" />
              <span>导出 iOS 日历 (.ics)</span>
            </button>
          </div>
        </div>

        <!-- Shift Grid View -->
        <ShiftGridView
          :shifts="shifts"
          @edit-shift="handleOpenShiftEditor"
          @add-shift="handleAddNewShift"
        />
      </section>
    </main>

    <!-- Footer: Clean, elegant, zero jargon, no awkward multi-line wraps -->
    <footer class="border-t border-white/5 py-4 pb-safe mt-8 text-center text-xs text-slate-500">
      <div>ShiftCal · 本地数据处理</div>
    </footer>

    <!-- Modals -->
    <!-- API Settings Modal -->
    <ApiSettingsModal
      :is-open="isSettingsOpen"
      @close="isSettingsOpen = false"
    />

    <!-- Shift Editor Modal -->
    <ShiftEditorModal
      :is-open="isEditorOpen"
      :current-shift="editingShift"
      @close="isEditorOpen = false"
      @save="handleSaveShift"
      @delete="handleDeleteShift"
    />

    <!-- Export Action Sheet Modal -->
    <ExportActionSheet
      :is-open="isExportOpen"
      :staff-name="currentStaffName"
      :month-info="monthInfo"
      @close="isExportOpen = false"
      @confirm-export="handleExecuteExport"
    />

    <!-- Toast Notification (Top Centered on Mobile, Top Right on PC) -->
    <Teleport to="body">
      <div
        v-if="toastMessage"
        class="fixed top-5 inset-x-4 sm:inset-x-auto sm:right-6 sm:top-6 sm:max-w-md z-[10001] p-3.5 sm:p-4 rounded-2xl glass-panel shadow-2xl border flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-300"
        :class="toastType === 'success' 
          ? 'bg-slate-900/95 border-emerald-500/50 text-emerald-200' 
          : 'bg-slate-900/95 border-rose-500/50 text-rose-200'"
      >
        <div class="flex items-center gap-3">
          <CheckCircle2 v-if="toastType === 'success'" class="w-5 h-5 text-emerald-400 shrink-0" />
          <AlertTriangle v-else class="w-5 h-5 text-rose-400 shrink-0" />
          <span class="text-xs sm:text-sm font-semibold leading-snug">{{ toastMessage }}</span>
        </div>
        <button
          type="button"
          @click="toastMessage = ''"
          class="text-slate-400 hover:text-white p-1 rounded-lg transition shrink-0 cursor-pointer"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { 
  Settings, Download, DownloadCloud, AlertCircle, ChevronRight, 
  CheckCircle2, AlertTriangle, X 
} from 'lucide-vue-next';
import { useConfig } from './composables/useConfig';
import { useScheduleParser } from './composables/useScheduleParser';
import { useIcsExporter } from './composables/useIcsExporter';
import ApiSettingsModal from './components/ApiSettingsModal.vue';
import ImageUploader from './components/ImageUploader.vue';
import ShiftGridView from './components/ShiftGridView.vue';
import ShiftEditorModal from './components/ShiftEditorModal.vue';
import ExportActionSheet from './components/ExportActionSheet.vue';
import HistoryList from './components/HistoryList.vue';
import { useScheduleHistory } from './composables/useScheduleHistory';

const { config, isConfigValid } = useConfig();
const { isParsing, parseProgressText, parseScheduleImage } = useScheduleParser();
const { exportScheduleToIcs } = useIcsExporter();
const { saveScheduleRecord } = useScheduleHistory();

const currentStep = ref(1);
const isSettingsOpen = ref(false);
const isEditorOpen = ref(false);
const isExportOpen = ref(false);
const editingShift = ref(null);
const currentRecordId = ref('');

function openSettings() {
  console.log('[ShiftCal] openSettings called');
  isSettingsOpen.value = true;
}

const currentStaffName = ref('');
const monthInfo = ref('');
const availableStaffList = ref([]);
const shifts = ref([]);
const lastImageBase64 = ref('');

// Toast notification
const toastMessage = ref('');
const toastType = ref('success');
let toastTimer = null;

function showToast(msg, type = 'success') {
  toastMessage.value = msg;
  toastType.value = type;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastMessage.value = '';
  }, 4000);
}

// PWA Install prompt
const installPrompt = ref(null);
onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    installPrompt.value = e;
  });
});

async function installPwa() {
  if (!installPrompt.value) return;
  installPrompt.value.prompt();
  const choice = await installPrompt.value.userChoice;
  if (choice.outcome === 'accepted') {
    installPrompt.value = null;
    showToast('已成功添加到主屏幕');
  }
}

// Parse action
async function handleStartParse({ imageBase64, targetPerson }) {
  if (!isConfigValid()) {
    isSettingsOpen.value = true;
    showToast('请先配置您的 API Key 与模型', 'error');
    return;
  }

  lastImageBase64.value = imageBase64;
  try {
    const result = await parseScheduleImage(imageBase64, targetPerson);
    currentStaffName.value = result.staffName || targetPerson || '员工';
    monthInfo.value = result.monthInfo || '';
    availableStaffList.value = result.availableStaffNames || [];
    shifts.value = result.shifts;

    // Automatically persist to local history
    const savedRec = saveScheduleRecord({
      staffName: currentStaffName.value,
      monthInfo: monthInfo.value,
      shifts: shifts.value
    });
    if (savedRec) {
      currentRecordId.value = savedRec.id;
    }

    showToast(`识别成功！共解析出 ${result.shifts.length} 天排班并保存至本地`);
    currentStep.value = 2; // Jump to Human-in-the-loop review
  } catch (err) {
    console.error('Schedule parse error:', err);
    showToast('识别中断或失败，请重新点击开始识别', 'error');
  }
}

async function handleReparsePerson(name) {
  if (!lastImageBase64.value) return;
  handleStartParse({
    imageBase64: lastImageBase64.value,
    targetPerson: name
  });
}

// History handlers
function handleLoadHistoryRecord(record) {
  currentRecordId.value = record.id;
  currentStaffName.value = record.staffName || '员工';
  monthInfo.value = record.monthInfo || '';
  shifts.value = JSON.parse(JSON.stringify(record.shifts || []));
  currentStep.value = 2; // Jump straight to Step 2 review/edit!
  showToast(`已载入「${record.staffName}」的历史排班（${record.shifts.length}天）`);
}

function handleExportHistoryRecord(record) {
  currentRecordId.value = record.id;
  currentStaffName.value = record.staffName || '员工';
  monthInfo.value = record.monthInfo || '';
  shifts.value = JSON.parse(JSON.stringify(record.shifts || []));
  isExportOpen.value = true;
}

// Editor Modal handlers
function handleOpenShiftEditor(shift) {
  editingShift.value = shift;
  isEditorOpen.value = true;
}

function handleAddNewShift() {
  const newShift = {
    id: `shift_${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    raw_text: '9-6',
    is_off: false,
    start_time: '09:00',
    end_time: '18:00',
    confidence: 1.0,
    note: '手动添加',
    isAnomaly: false
  };
  editingShift.value = newShift;
  isEditorOpen.value = true;
}

function handleSaveShift(updated) {
  const idx = shifts.value.findIndex(s => s.id === updated.id);
  if (idx !== -1) {
    shifts.value[idx] = updated;
  } else {
    shifts.value.push(updated);
  }
  shifts.value.sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  // Sync to history if currently editing an active record
  if (currentRecordId.value) {
    saveScheduleRecord({
      id: currentRecordId.value,
      staffName: currentStaffName.value,
      monthInfo: monthInfo.value,
      shifts: shifts.value
    });
  }

  showToast(`已更新 ${updated.date} 班次并同步至本地记录`);
}

function handleDeleteShift(id) {
  shifts.value = shifts.value.filter(s => s.id !== id);
  if (currentRecordId.value) {
    saveScheduleRecord({
      id: currentRecordId.value,
      staffName: currentStaffName.value,
      monthInfo: monthInfo.value,
      shifts: shifts.value
    });
  }
  showToast('已删除该天排班');
}

// ICS Export execution
function handleExecuteExport(exportOptions) {
  try {
    const res = exportScheduleToIcs(shifts.value, exportOptions);
    showToast(`日历文件 ${res.filename} 已下载，请在 Safari 中点击打开并导入`);
  } catch (err) {
    showToast(err.message || '导出失败', 'error');
  }
}
</script>
