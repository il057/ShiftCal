<template>
  <div class="min-h-screen flex flex-col justify-between selection:bg-[#E8F624] selection:text-black bg-[#111215] text-white">
    <!-- Top Hardware Control Deck / Header -->
    <header class="sticky top-0 z-50 bg-[#1E2024] border-b-[2.5px] border-black pt-safe shadow-[0_4px_0_#000000]">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <!-- Logo & Hardware Markings -->
        <div class="flex items-center gap-2.5 sm:gap-3">
          <!-- Industrial Cassette Icon -->
          <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#E8F624] border-2 border-black flex items-center justify-center text-black shadow-[0_3px_0_#000000] shrink-0 transform active:rotate-12 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2">
              <rect x="2" y="4" width="20" height="16" rx="3" />
              <circle cx="8" cy="12" r="2.5" />
              <circle cx="16" cy="12" r="2.5" />
              <path d="M8 14.5h8" />
              <path d="M6 4v3h12V4" />
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-1.5 sm:gap-2">
              <h1 class="text-sm sm:text-base font-normal tracking-tight text-white uppercase font-unbounded">
                SHIFTCAL <span class="text-[#E8F624] font-tech text-xs tracking-normal font-bold">PRO</span>
              </h1>
              <span class="px-2 py-0.5 rounded-full text-[9px] font-tech font-bold bg-[#181A1E] text-[#E8F624] border border-black hidden xs:inline-flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-[#E8F624] animate-pulse"></span>
                DECK-ROM // V2.4
              </span>
            </div>
            <p class="text-[10px] text-[#9CA3AF] font-tech hidden sm:block uppercase tracking-wider">
              TACTILE CASSETTE HARDWARE // ICS RECORDER
            </p>
          </div>
        </div>

        <!-- Right Hardware Status & Actions -->
        <div class="flex items-center gap-2 sm:gap-3">
          <!-- Install PWA prompt button if available -->
          <button
            v-if="installPrompt"
            type="button"
            @click="installPwa"
            class="px-2.5 sm:px-3 py-1.5 rounded-xl zzz-btn-dark text-xs flex items-center gap-1.5 text-white active:scale-95 cursor-pointer font-bold"
          >
            <Download class="w-3.5 h-3.5 text-[#E8F624]" />
            <span class="hidden sm:inline">安装到主屏</span>
            <span class="sm:hidden">安装</span>
          </button>

          <!-- API Settings Hardware Button -->
          <button
            id="api-settings-btn"
            type="button"
            @click="openSettings"
            :class="[
              'px-3 sm:px-3.5 py-1.5 rounded-xl border-2 border-black text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all relative cursor-pointer select-none active:scale-95',
              isConfigValid()
                ? 'bg-[#2A2E35] text-white hover:bg-[#353A42] shadow-[0_3px_0_#000000]'
                : 'bg-[#E8F624] text-black shadow-[0_3px_0_#000000] animate-bounce'
            ]"
          >
            <Settings class="w-3.5 h-3.5" :class="isConfigValid() ? 'text-[#E8F624]' : 'text-black'" />
            <span class="tracking-wide">API 配置</span>
            <span 
              class="w-2 h-2 rounded-full border border-black" 
              :class="isConfigValid() ? 'bg-[#36E4DA]' : 'bg-[#E03030]'"
            ></span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Chassis Container -->
    <main class="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-7 flex-1 w-full space-y-5 sm:space-y-6">
      <!-- API Missing Warning Banner (Industrial Hazard Alert) -->
      <div 
        v-if="!isConfigValid()" 
        class="relative p-3.5 sm:p-4 rounded-2xl bg-[#1E2024] border-[2.5px] border-black shadow-[0_5px_0_#000000] overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
      >
        <!-- Hazard Stripe Accent Edge -->
        <div class="absolute left-0 top-0 bottom-0 w-2.5 zzz-hazard-stripe"></div>
        <div class="flex items-center gap-3 pl-2.5 sm:pl-3">
          <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#E8F624] text-black flex items-center justify-center font-bold shrink-0 border border-black shadow-[0_2px_0_#000]">
            <AlertCircle class="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
          </div>
          <div>
            <div class="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
              <span>[WARNING] 尚未完成 API 模组装填</span>
              <span class="text-[9px] font-tech text-[#E8F624] px-1.5 py-0.2 rounded bg-black border border-[#E8F624]/40 hidden xs:inline">CONFIG REQ</span>
            </div>
            <p class="text-[11px] text-[#9CA3AF] mt-0.5 leading-snug font-tech">
              请填入 API Key 与 Base URL 并选择多模态视觉模型，以启动排班识别。
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <button
            type="button"
            @click="openSettings"
            class="w-full sm:w-auto px-4 sm:px-5 py-2 rounded-xl zzz-btn-yellow text-xs font-bold tracking-wider uppercase cursor-pointer"
          >
            立即配置 API // SET
          </button>
        </div>
      </div>

      <!-- Folder Tabs Navigation (文件袋边缘突起索引标签 - 完美对齐绝区零日常标签与角标) -->
      <div class="pt-1 sm:pt-2">
        <div class="flex items-end border-b-[3px] border-black px-1 sm:px-2 gap-1.5 sm:gap-2">
          <!-- Step 1 Tab -->
          <button
            type="button"
            @click="currentStep = 1"
            :class="[
              'flex-1 min-w-0 py-2 sm:py-2.5 px-2 sm:px-5 text-xs font-bold tracking-wide uppercase transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer zzz-folder-tab whitespace-nowrap',
              currentStep === 1
                ? 'zzz-folder-tab-active'
                : 'zzz-folder-tab-inactive'
            ]"
          >
            <span 
              class="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-tech text-[10px] border shrink-0"
              :class="currentStep === 1 ? 'bg-black text-[#E8F624] border-black' : 'bg-[#181A1E] text-[#9CA3AF] border-[#2A2E35]'"
            >
              01
            </span>
            <span class="hidden sm:inline">磁带装填 // 上传</span>
            <span class="sm:hidden">装填</span>
          </button>

          <!-- Step 2 Tab (with ZZZ Red Exclamation Badge) -->
          <button
            type="button"
            @click="shifts.length > 0 ? (currentStep = 2) : null"
            :disabled="shifts.length === 0"
            :class="[
              'relative flex-1 min-w-0 py-2 sm:py-2.5 px-2 sm:px-5 text-xs font-bold tracking-wide uppercase transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer zzz-folder-tab whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed',
              currentStep === 2
                ? 'zzz-folder-tab-active'
                : 'zzz-folder-tab-inactive'
            ]"
          >
            <!-- ZZZ Signature Red Exclamation Diamond Badge (对齐绝区零日常日程 Tab 角标) -->
            <span 
              v-if="shifts.length > 0" 
              class="absolute -top-2 left-3 w-4 h-4 bg-[#E03030] text-white border border-black rounded-xs flex items-center justify-center font-bold text-[9px] shadow-[0_1px_0_#000] rotate-12 z-30"
            >
              !
            </span>

            <span 
              class="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-tech text-[10px] border shrink-0"
              :class="currentStep === 2 ? 'bg-black text-[#E8F624] border-black' : 'bg-[#181A1E] text-[#9CA3AF] border-[#2A2E35]'"
            >
              02
            </span>
            <span class="hidden sm:inline">磁轨校验 // 调整</span>
            <span class="sm:hidden">校验</span>
            <span 
              v-if="shifts.length > 0" 
              class="px-1.5 py-0.2 rounded-full text-[9px] sm:text-[10px] font-tech font-bold shrink-0"
              :class="currentStep === 2 ? 'bg-black text-white' : 'bg-[#181A1E] text-[#E8F624] border border-[#2A2E35]'"
            >
              {{ shifts.length }}D
            </span>
          </button>

          <!-- Step 3 Tab (with ZZZ Yellow NEW! Badge) -->
          <button
            type="button"
            @click="shifts.length > 0 ? (isExportOpen = true) : null"
            :disabled="shifts.length === 0"
            :class="[
              'relative flex-1 min-w-0 py-2 sm:py-2.5 px-2 sm:px-5 text-xs font-bold tracking-wide uppercase transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer zzz-folder-tab whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed',
              currentStep === 3
                ? 'zzz-folder-tab-active'
                : 'zzz-folder-tab-inactive'
            ]"
          >
            <!-- ZZZ Yellow NEW! Badge -->
            <span 
              v-if="shifts.length > 0"
              class="absolute -top-2 right-3 px-1.5 py-0.2 bg-[#E8F624] text-black border border-black rounded-sm font-tech font-bold text-[8px] shadow-[0_1px_0_#000] z-30 animate-pulse"
            >
              NEW!
            </span>

            <span 
              class="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-tech text-[10px] border shrink-0"
              :class="currentStep === 3 ? 'bg-black text-[#E8F624] border-black' : 'bg-[#181A1E] text-[#9CA3AF] border-[#2A2E35]'"
            >
              03
            </span>
            <span class="hidden sm:inline">日历刻录 // 导出</span>
            <span class="sm:hidden">刻录</span>
          </button>
        </div>
      </div>

      <!-- ========================================================
           AUTHENTIC ZZZ TACTILE SCHEDULE BINDER / CHASSIS 
           (绝区零实体手账活页夹与工控外壳底座 - 移动端全显橙红边骨)
           ======================================================== -->
      <div class="relative rounded-3xl zzz-chassis p-2.5 sm:p-5 bg-[#141619] border-[3px] border-black shadow-[0_10px_0_#07080A] flex flex-row gap-2.5 sm:gap-5 overflow-hidden">
        <!-- External Red Rubber Plug Key on Right Chassis Flange (绝区零侧边外挂红色插塞键) -->
        <button
          type="button"
          @click="openSettings"
          class="hidden lg:flex absolute -right-1 top-8 z-30 px-2 py-3 bg-[#E03030] text-white rounded-l-xl border-2 border-r-0 border-black shadow-[-2px_3px_0_#000] flex-col items-center gap-1 cursor-pointer hover:bg-[#ed3838] transition-all"
          title="快速配置 API 模组"
        >
          <Settings class="w-3.5 h-3.5" />
          <span class="text-[8px] font-tech font-bold [writing-mode:vertical-rl] tracking-widest">ROM</span>
        </button>

        <!-- Left Tactical Binder Spine (橙红活页夹咬合边骨与挂坠 - 移动端全面展示) -->
        <div class="flex flex-col items-center justify-between w-7 sm:w-10 md:w-12 bg-[#FF4E00] border-2 border-black rounded-l-2xl py-3 sm:py-4 select-none relative shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.5)] shrink-0">
          <!-- 3 Spiral Binder Rings looping into chassis -->
          <div class="space-y-4 sm:space-y-6 w-full flex flex-col items-center">
            <div v-for="ring in 3" :key="ring" class="relative w-5 sm:w-7 md:w-8 h-2 sm:h-3.5 bg-[#111215] border-2 border-black rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.9)] -mr-4 sm:-mr-6 md:-mr-7 z-30">
              <div class="w-1 sm:w-1.5 h-0.5 sm:h-1 rounded-full bg-white/40 absolute top-0.5 left-0.5 sm:left-1"></div>
            </div>
          </div>

          <!-- Hanging Acrylic Keychain Charm (复古卡带掌机亚克力挂坠) -->
          <div class="absolute -top-3.5 -left-1 sm:-left-1.5 z-10 transform hover:rotate-12 transition-transform cursor-pointer">
            <div class="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full border-2 border-black bg-white/70 mx-auto"></div>
            <div class="p-0.5 sm:p-1 rounded-lg bg-[#181A1E] border-2 border-black shadow-md flex items-center justify-center">
              <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E8F624]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <circle cx="8" cy="12" r="2"/>
                <circle cx="16" cy="12" r="2"/>
                <path d="M8 12h8"/>
              </svg>
            </div>
          </div>

          <!-- Vertical Emblazoned Text: SCHEDULE -->
          <div class="my-auto py-2">
            <span class="text-[8px] sm:text-[10px] md:text-xs font-unbounded text-black tracking-[0.15em] sm:tracking-[0.25em] font-normal [writing-mode:vertical-rl] rotate-180 uppercase select-none opacity-90 drop-shadow-sm">
              SCHEDULE
            </span>
          </div>

          <!-- Bottom Tech Markings -->
          <div class="text-[6px] sm:text-[7px] font-tech text-black font-bold tracking-tighter opacity-80 text-center leading-tight">
            DECK<br/>ROM
          </div>
        </div>

        <!-- Main Workspace Bay (主工控与流转中心) -->
        <div class="flex-1 w-full space-y-4 sm:space-y-5 min-w-0">

          <!-- Step 1: Upload / Cassette Bay -->
          <section v-if="currentStep === 1" class="space-y-6">
            <ImageUploader
              :is-parsing="isParsing"
              :progress-text="parseProgressText"
              :available-staff-list="availableStaffList"
              @start-parse="handleStartParse"
              @reparse-person="handleReparsePerson"
            />

            <!-- Local Cassette Tape Archive / History -->
            <HistoryList
              @load-record="handleLoadHistoryRecord"
              @export-record="handleExportHistoryRecord"
            />
          </section>

          <!-- Step 2: Verification Section -->
          <section v-if="currentStep === 2" class="space-y-6">
            <!-- Action Control Console Bar (移动端完美响应式) -->
            <div class="relative p-3.5 sm:p-5 rounded-2xl zzz-panel flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 border-[2.5px] border-black shadow-[0_5px_0_#000000]">
              <div class="sm:pl-1">
                <div class="flex flex-wrap items-center gap-2">
                  <h2 class="text-sm sm:text-base font-normal text-white uppercase tracking-tight flex items-center gap-2 font-unbounded">
                    <span>排班磁轨参数复核</span>
                  </h2>
                  <span v-if="currentStaffName" class="px-2 py-0.5 rounded-full text-xs font-bold bg-[#E8F624] text-black border border-black shadow-[0_1px_0_#000]">
                    {{ currentStaffName }}
                  </span>
                  <span v-if="monthInfo" class="px-2 py-0.5 rounded-lg text-xs font-tech font-bold bg-[#181A1E] text-white border border-black">
                    {{ monthInfo }}
                  </span>
                </div>
                <p class="text-[11px] sm:text-xs text-[#9CA3AF] font-tech mt-1">
                  STATUS: READY // 单击任意工控卡片即可调整时间或切换常用班次
                </p>
              </div>

              <!-- Dual Button Group: Grid 2 Columns on Mobile, Flex on Desktop -->
              <div class="grid grid-cols-2 sm:flex sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto">
                <button
                  type="button"
                  @click="currentStep = 1"
                  class="w-full sm:w-auto px-4 py-2.5 rounded-xl zzz-btn-dark text-xs font-bold text-[#E0E2E6] transition cursor-pointer text-center"
                >
                  重新装填
                </button>
                <button
                  type="button"
                  @click="isExportOpen = true"
                  class="w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-xl zzz-btn-yellow text-black text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer text-center"
                >
                  <DownloadCloud class="w-4 h-4 stroke-[2.2] shrink-0" />
                  <span>导出日历 (.ics)</span>
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
        </div>
      </div>
    </main>

    <!-- Industrial Chassis Footer -->
    <footer class="border-t-[2.5px] border-[#181A1D] bg-[#181A1E] py-4 pb-safe mt-10">
      <div class="max-w-6xl mx-auto px-4 text-center">
        <!-- Desktop Footer -->
        <div class="hidden sm:flex text-[11px] font-tech text-[#9CA3AF] tracking-wider uppercase items-center justify-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-[#E8F624]"></span>
          <span>SHIFTCAL CASSETTE ROM // SECURE LOCAL PROCESSING ONLY · REV 2.4</span>
          <span class="w-1.5 h-1.5 rounded-full bg-[#E8F624]"></span>
        </div>
        <!-- Mobile Footer (Single line, clean and zero wrapping) -->
        <div class="sm:hidden text-[10px] font-tech text-[#9CA3AF] tracking-wide flex items-center justify-center gap-1.5 whitespace-nowrap">
          <span class="w-1.5 h-1.5 rounded-full bg-[#E8F624]"></span>
          <span>SHIFTCAL // 本地安全处理 · 单页无后端</span>
          <span class="w-1.5 h-1.5 rounded-full bg-[#E8F624]"></span>
        </div>
      </div>
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

    <!-- Toast Notification (ZZZ Industrial Alert Card) -->
    <Teleport to="body">
      <div
        v-if="toastMessage"
        class="fixed top-5 inset-x-4 sm:inset-x-auto sm:right-6 sm:top-6 sm:max-w-md z-[10001] p-4 rounded-2xl border-[2.5px] border-[#181A1D] shadow-[0_6px_0_#181A1D] flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-200"
        :class="toastType === 'success' 
          ? 'bg-[#1E2024] text-white' 
          : 'bg-[#1E2024] text-[#E03030]'"
      >
        <div class="flex items-center gap-3">
          <div 
            class="w-8 h-8 rounded-xl border-2 border-[#181A1D] flex items-center justify-center font-black shrink-0"
            :class="toastType === 'success' ? 'bg-[#E8F624] text-black' : 'bg-[#E03030] text-white'"
          >
            <CheckCircle2 v-if="toastType === 'success'" class="w-4 h-4 stroke-[2.5]" />
            <AlertTriangle v-else class="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <div class="text-[10px] font-tech text-[#7A808C] uppercase tracking-wider">
              {{ toastType === 'success' ? 'SYSTEM NOTIFICATION // OK' : 'SYSTEM ALERT // ERR' }}
            </div>
            <span class="text-xs sm:text-sm font-bold leading-snug text-white">{{ toastMessage }}</span>
          </div>
        </div>
        <button
          type="button"
          @click="toastMessage = ''"
          class="w-7 h-7 rounded-lg bg-[#2A2E35] border border-[#181A1D] text-[#7A808C] hover:text-white flex items-center justify-center transition shrink-0 cursor-pointer active:scale-95"
        >
          <X class="w-3.5 h-3.5" />
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
