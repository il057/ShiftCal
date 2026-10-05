<template>
  <div class="w-full">
    <!-- Hidden file inputs -->
    <input 
      :ref="(el) => { fileInputRef = el; }"
      type="file" 
      accept="image/*" 
      class="hidden" 
      @change="handleFileChange"
    />

    <input 
      :ref="(el) => { cameraInputRef = el; }"
      type="file" 
      accept="image/*" 
      capture="environment" 
      class="hidden" 
      @change="handleFileChange"
    />

    <!-- Empty State: Authentic ZZZ Retro Cassette Tape Bay (实体复古磁带插槽) -->
    <div 
      v-if="!imagePreview"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      :class="[
        'relative rounded-3xl p-4 sm:p-8 text-center transition-all duration-200 group cursor-pointer flex flex-col items-center justify-center min-h-[360px] overflow-hidden select-none zzz-slot',
        isDragging 
          ? 'border-[#E8F624] ring-4 ring-[#E8F624]/20 scale-[1.01]' 
          : 'hover:border-[#3A3E48]'
      ]"
      @click="triggerFileInput"
    >
      <!-- Top Industrial Caution Strip -->
      <div class="absolute top-0 inset-x-6 sm:inset-x-12 h-1 zzz-hazard-stripe opacity-70"></div>

      <!-- ========================================================
           AUTHENTIC RETRO CASSETTE TAPE SKEUOMORPHIC CHASSIS 
           ======================================================== -->
      <div class="relative w-full max-w-[340px] sm:max-w-[400px] zzz-cassette-body p-3 sm:p-4 mb-4 transform group-hover:translate-y-[-2px] transition-transform duration-300 border-2 border-black shadow-[0_6px_0_#000]">
        <!-- Classic Cassette Label Sticker -->
        <div class="rounded-xl bg-[#232730] border-2 border-black p-2.5 sm:p-3 relative overflow-hidden shadow-inner">
          <!-- Top Label Header Bar (Acid Yellow Street Accent) -->
          <div class="flex items-center justify-between pb-1.5 border-b border-[#353A45]">
            <div class="flex items-center gap-1.5">
              <!-- Side A Emblem -->
              <span class="w-5 h-5 rounded-md bg-[#E8F624] text-black font-tech font-bold text-[11px] flex items-center justify-center border border-black">
                A
              </span>
              <span class="text-[9px] font-tech text-white font-bold tracking-wider">SHIFTCAL CASSETTE</span>
            </div>
            <span class="text-[9px] font-tech text-[#E8F624] font-bold">NORMAL BIAS · 120μs</span>
          </div>

          <!-- Handwritten / Title Track Area -->
          <div class="my-2 px-2.5 py-1 bg-[#181A1E] rounded-md border border-[#2E333D] flex items-center justify-between">
            <span class="text-[10px] font-tech text-[#D1D5DB] font-bold truncate">
              REC // SCHEDULE_DATA_2026.ICS
            </span>
            <span class="text-[9px] font-tech text-[#9CA3AF]">60 MIN</span>
          </div>

          <!-- Transparent Center Window with Dual Sprocket Gears (磁带透视窗与双齿轮) -->
          <div class="relative py-2.5 px-4 rounded-xl bg-[#111215] border-2 border-[#181A1D] flex items-center justify-between overflow-hidden shadow-[inset_0_2px_6px_rgba(0,0,0,0.9)]">
            <!-- Left Spool Reel with Magnetic Tape Roll -->
            <div class="zzz-cassette-sprocket shrink-0">
              <div class="zzz-cassette-teeth"></div>
            </div>

            <!-- Center Window Meter Ruler -->
            <div class="flex-1 mx-2 text-center pointer-events-none">
              <!-- Tape Ribbon Line running across -->
              <div class="w-full h-1 bg-[#3A2216] rounded-full my-1 border-t border-b border-black"></div>
              <div class="text-[8px] font-tech text-[#9CA3AF] tracking-widest flex justify-between px-2">
                <span>100</span>
                <span>50</span>
                <span>0</span>
              </div>
            </div>

            <!-- Right Spool Reel -->
            <div class="zzz-cassette-sprocket shrink-0">
              <div class="zzz-cassette-teeth"></div>
            </div>
          </div>

          <!-- Bottom Tape Head Trapezoid & Guide Holes (磁带读写头与定位导孔) -->
          <div class="mt-2 pt-1 flex items-center justify-between px-4">
            <div class="zzz-tape-guide-hole"></div>
            <div class="flex items-center gap-1.5">
              <div class="w-1.5 h-1.5 rounded-full bg-[#E8F624]"></div>
              <span class="text-[8px] font-tech text-[#9CA3AF] uppercase tracking-wider">MAGNETIC ROM DRIVE</span>
            </div>
            <div class="zzz-tape-guide-hole"></div>
          </div>
        </div>
      </div>

      <!-- Action Prompt Title -->
      <div class="mb-4 px-2">
        <h3 class="text-sm sm:text-base font-normal text-white uppercase tracking-tight font-unbounded">
          <span>装填排班表图像</span> <span class="text-[#E8F624] font-tech text-xs tracking-normal font-bold">// INSERT TAPE</span>
        </h3>
        <p class="text-xs text-[#9CA3AF] font-tech max-w-sm mx-auto mt-1">
          支持拖拽排班表入仓，或轻触下方按键拍照 / 选图
        </p>
      </div>

      <!-- Responsive Mobile-Friendly Action Buttons (移动端防换行，自适应弹性按键) -->
      <div 
        class="w-full max-w-xs sm:max-w-sm mx-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5 px-2"
        @click.stop
      >
        <button
          type="button"
          @click="triggerCameraInput"
          class="w-full py-2.5 sm:py-3 px-4 rounded-xl sm:rounded-2xl zzz-btn-yellow text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
        >
          <Camera class="w-4 h-4 stroke-[2.2] shrink-0" />
          <span>手机拍照 // CAM</span>
        </button>

        <button
          type="button"
          @click="triggerFileInput"
          class="w-full py-2.5 sm:py-3 px-4 rounded-xl sm:rounded-2xl zzz-btn-dark text-xs font-bold flex items-center justify-center gap-2 text-white cursor-pointer"
        >
          <ImagePlus class="w-4 h-4 text-[#E8F624] shrink-0" />
          <span>相册导入 // FILE</span>
        </button>
      </div>

      <!-- Bottom Serial Decal -->
      <div class="mt-4 text-[9px] font-tech text-[#9CA3AF] uppercase tracking-widest">
        CASSETTE ROM ICS // TYPE IV METAL 120μs
      </div>
    </div>

    <!-- Loaded State: Inserted Cassette Deck (已装填卡带控制台) -->
    <div v-else class="space-y-4">
      <div class="relative rounded-3xl zzz-panel p-4 sm:p-6 shadow-[0_6px_0_#000000] border-[2.5px] border-black">
        <div class="flex flex-col md:flex-row gap-5 sm:gap-6 items-start">
          <!-- Cassette Cartridge Preview (卡带实体外壳结构) -->
          <div class="relative w-full md:w-64 h-60 sm:h-64 shrink-0 rounded-2xl overflow-hidden border-[2.5px] border-black bg-[#111215] group shadow-inner">
            <img 
              :src="imagePreview" 
              alt="Schedule cassette preview" 
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            <!-- Top Cassette Tape Label Overlay -->
            <div class="absolute top-0 inset-x-0 bg-[#E8F624] text-black px-2.5 py-1 text-[10px] font-tech font-bold flex items-center justify-between border-b-2 border-black">
              <span>[REC TAPE // SIDE-A]</span>
              <span>{{ imageSizeText || 'IMG' }}</span>
            </div>

            <!-- Hover Action Overlay -->
            <div class="absolute inset-0 bg-[#111215]/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button 
                type="button"
                @click="openFullScreen"
                class="px-3 py-1.5 rounded-xl zzz-btn-dark text-xs font-bold text-white flex items-center gap-1.5"
              >
                <Maximize2 class="w-3.5 h-3.5 text-[#E8F624]" />
                查看大图
              </button>
            </div>

            <!-- Eject Button: High-Contrast Red-Black Capsule (纯红黑底胶囊按键) -->
            <button
              type="button"
              @click="clearImage"
              :disabled="isParsing"
              class="absolute bottom-2 right-2 px-3 py-1.5 rounded-xl zzz-btn-close text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
              title="退出演示磁带"
            >
              <Trash2 class="w-3.5 h-3.5 stroke-[2.2]" />
              <span>EJECT</span>
            </button>
          </div>

          <!-- Right Hardware Console Control Panel -->
          <div class="flex-1 w-full space-y-4">
            <!-- Deck Status Header -->
            <div class="pb-3 border-b-2 border-[#181A1D]">
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-[#E8F624] animate-pulse"></span>
                  <h4 class="text-sm font-bold text-white uppercase tracking-tight flex items-center gap-2">
                    <ScanText class="w-4 h-4 text-[#E8F624]" />
                    <span>排班磁轨数据已就绪</span>
                  </h4>
                </div>
                <span class="text-xs font-tech text-[#E8F624] bg-[#181A1E] px-2.5 py-0.5 rounded-full border border-[#2A2E35]">
                  READY
                </span>
              </div>
              <p class="text-[11px] text-[#9CA3AF] font-tech mt-1">
                多模态视觉引擎将提取手写班次代码，自动映射标准工作时段。
              </p>
            </div>

            <!-- Staff Parameter & Mode Deck (提取模式与目标员工选择插槽) -->
            <div class="p-3.5 rounded-2xl zzz-slot space-y-2.5">
              <div class="flex items-center justify-between">
                <label class="text-xs font-bold text-white flex items-center gap-1.5 uppercase font-sans">
                  <SlidersHorizontal class="w-3.5 h-3.5 text-[#E8F624]" />
                  <span>提取模式 // EXTRACTION MODE</span>
                </label>
                <span class="text-[9px] font-tech text-[#E8F624] px-2 py-0.5 rounded-full bg-black border border-[#E8F624]/40 font-bold">
                  {{ extractMode === 'all' ? 'ALL // 全员' : 'SOLO // 单人' }}
                </span>
              </div>

              <!-- Mode Switch Dual Tabs -->
              <div class="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#111215] border-2 border-[#181A1D]">
                <button
                  type="button"
                  @click="extractMode = 'single'"
                  :class="[
                    'py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none',
                    extractMode === 'single'
                      ? 'bg-[#E8F624] text-black shadow-[0_2px_0_#181A1D]'
                      : 'text-[#9CA3AF] hover:text-white'
                  ]"
                >
                  <User class="w-3.5 h-3.5" />
                  <span>提取指定</span>
                </button>

                <button
                  type="button"
                  @click="extractMode = 'all'"
                  :class="[
                    'py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none relative',
                    extractMode === 'all'
                      ? 'bg-[#E8F624] text-black shadow-[0_2px_0_#181A1D]'
                      : 'text-[#9CA3AF] hover:text-white'
                  ]"
                >
                  <Users class="w-3.5 h-3.5" />
                  <span>提取所有</span>
                  <span class="px-1 py-0.2 rounded bg-black text-[#E8F624] font-tech text-[8px] border border-[#E8F624]/40">ALL</span>
                </button>
              </div>

              <!-- Mode 1: Single Staff Input Deck -->
              <div v-if="extractMode === 'single'" class="space-y-2 pt-0.5">
                <div class="flex items-center justify-between text-[11px] text-[#9CA3AF]">
                  <span>目标员工姓名:</span>
                  <span class="font-tech text-[10px]">留空默认提取首位</span>
                </div>
                <input
                  type="text"
                  v-model="targetPersonName"
                  placeholder="例如: 张三、李四、Alex、Sam"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-[#111215] border-2 border-[#181A1D] text-xs font-bold text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#E8F624] transition font-tech"
                />

                <!-- Detected Staff Pills (快捷切换胶囊) -->
                <div v-if="availableStaffList && availableStaffList.length > 0" class="pt-1">
                  <div class="text-[10px] font-tech text-[#9CA3AF] mb-1.5 uppercase">
                    DETECTED STAFF LIST // 点击直接选用:
                  </div>
                  <div class="flex flex-wrap gap-1.5">
                    <button
                      v-for="name in availableStaffList"
                      :key="name"
                      type="button"
                      @click="targetPersonName = name"
                      :class="[
                        'px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border-2',
                        targetPersonName === name
                          ? 'bg-[#E8F624] text-black border-[#181A1D] shadow-[0_2px_0_#181A1D]'
                          : 'bg-[#181A1E] text-[#9CA3AF] border-[#2A2E35] hover:text-white hover:border-[#9CA3AF]'
                      ]"
                    >
                      {{ name }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Mode 2: All Staff Input Deck -->
              <div v-else class="space-y-2 pt-0.5">
                <div class="p-2.5 rounded-xl bg-[#181A1E] border border-[#2A2E35] text-[11px] text-[#D1D5DB] leading-relaxed">
                  <span class="text-[#E8F624] font-bold">全员提取模式:</span> 识别表中全部员工，可在同屏中对照所有人的排班，并在导出时自由选择导出谁的班次或合并导出。
                </div>
                <div>
                  <div class="flex items-center justify-between text-[11px] text-[#9CA3AF] mb-1">
                    <span>我的姓名:</span>
                    <span class="font-tech text-[10px] text-[#36E4DA]">智能防吵醒</span>
                  </div>
                  <input
                    type="text"
                    v-model="myStaffName"
                    placeholder="输入您在表上的姓名 (例如: 张三)"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-[#111215] border-2 border-[#181A1D] text-xs font-bold text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#E8F624] transition font-tech"
                  />
                </div>
              </div>
            </div>

            <!-- Primary Execution Button (实体高饱和柠檬黄按键) -->
            <div>
              <button
                type="button"
                @click="startParse"
                :disabled="isParsing"
                class="w-full py-3.5 px-5 rounded-2xl zzz-btn-yellow text-black text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
              >
                <Loader2 v-if="isParsing" class="w-5 h-5 animate-spin stroke-[2.2]" />
                <Sparkles v-else class="w-5 h-5 stroke-[2.2]" />
                <span>{{ isParsing ? (progressText || '磁带数据解析中...') : (extractMode === 'all' ? '启动全员识别 // SCAN ALL' : '启动多模态识别 // START SCAN') }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fullscreen Modal View with Teleport -->
    <Teleport to="body" v-if="isFullscreen">
      <div 
        class="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 select-none"
        @click="isFullscreen = false"
      >
        <div class="relative max-w-full max-h-[85vh] p-2 rounded-2xl bg-[#1E2024] border-[2.5px] border-[#181A1D] shadow-2xl" @click.stop>
          <img 
            :src="imagePreview" 
            alt="排班图片原图预览" 
            class="max-w-full max-h-[75vh] object-contain rounded-xl" 
          />
        </div>

        <!-- Pure Red Close Capsule Button -->
        <div class="mt-4">
          <button
            type="button"
            @click.stop="isFullscreen = false"
            class="px-6 py-2 rounded-full zzz-btn-red text-xs font-bold flex items-center gap-2 cursor-pointer"
          >
            <X class="w-4 h-4 stroke-[2.2]" />
            <span>关闭预览 // CLOSE</span>
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Camera, ImagePlus, Sparkles, Trash2, Maximize2, X, ScanText, User, Users, SlidersHorizontal, Loader2 } from 'lucide-vue-next';
import { useConfig } from '../composables/useConfig';

const props = defineProps({
  isParsing: {
    type: Boolean,
    default: false
  },
  progressText: {
    type: String,
    default: ''
  },
  availableStaffList: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['image-ready', 'start-parse', 'reparse-person']);

const { config } = useConfig();
const isDragging = ref(false);
const fileInputRef = ref(null);
const cameraInputRef = ref(null);
const imagePreview = ref('');
const imageSizeText = ref('');
const isFullscreen = ref(false);
const extractMode = ref('single'); // 'single' | 'all'
const targetPersonName = ref(config.savedStaffName || '');
const myStaffName = ref(config.savedStaffName || '');

function triggerFileInput() {
  fileInputRef.value?.click();
}

function triggerCameraInput() {
  cameraInputRef.value?.click();
}

function handleFileChange(e) {
  const file = e.target.files?.[0];
  if (file) {
    processFile(file);
  }
  e.target.value = '';
}

function handleDrop(e) {
  isDragging.value = false;
  const file = e.dataTransfer.files?.[0];
  if (file && file.type.startsWith('image/')) {
    processFile(file);
  }
}

function processFile(file) {
  const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
  imageSizeText.value = `${sizeMb} MB`;

  const reader = new FileReader();
  reader.onload = (ev) => {
    imagePreview.value = ev.target?.result;
    emit('image-ready', imagePreview.value);
  };
  reader.readAsDataURL(file);
}

function clearImage() {
  imagePreview.value = '';
  imageSizeText.value = '';
}

function openFullScreen() {
  isFullscreen.value = true;
}

function startParse() {
  emit('start-parse', {
    imageBase64: imagePreview.value,
    extractMode: extractMode.value,
    targetPerson: targetPersonName.value,
    myStaffName: myStaffName.value
  });
}

defineExpose({
  setImage: (b64) => { imagePreview.value = b64; },
  setTargetPerson: (name) => { targetPersonName.value = name; },
  setMyStaffName: (name) => { myStaffName.value = name; },
  setExtractMode: (mode) => { extractMode.value = mode; }
});
</script>
