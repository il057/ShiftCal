<template>
  <div class="w-full">
    <!-- Hidden file inputs (using dynamic function refs to prevent Vue compiler hoisting) -->
    <input 
      :ref="(el) => { fileInputRef = el; }"
      type="file" 
      accept="image/*" 
      class="hidden" 
      @change="handleFileChange"
    />

    <!-- Hidden camera specific input for mobile -->
    <input 
      :ref="(el) => { cameraInputRef = el; }"
      type="file" 
      accept="image/*" 
      capture="environment" 
      class="hidden" 
      @change="handleFileChange"
    />

    <!-- Image Upload Area -->
    <div 
      v-if="!imagePreview"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      :class="[
        'relative border-2 border-dashed rounded-3xl p-6 sm:p-10 text-center transition-all duration-300 group cursor-pointer flex flex-col items-center justify-center min-h-[260px]',
        isDragging 
          ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]' 
          : 'border-slate-700/80 hover:border-indigo-500/60 bg-slate-900/30 hover:bg-slate-900/50'
      ]"
      @click="triggerFileInput"
    >
      <!-- Glow Ambient Effect -->
      <div class="absolute -top-12 -left-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-500"></div>

      <!-- Icon & Upload Prompts -->
      <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 border border-indigo-400/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-indigo-500/10">
        <Camera class="w-8 h-8" />
      </div>

      <h3 class="text-base sm:text-lg font-bold text-white mb-1.5">
        上传或拍照手写排班表
      </h3>
      <p class="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto mb-6">
        拖拽排班照片到这里，或点击选择相册照片
      </p>

      <!-- Fast Actions -->
      <div class="flex flex-wrap items-center justify-center gap-3" @click.stop>
        <button
          type="button"
          @click="triggerCameraInput"
          class="px-5 py-2.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition active:scale-95"
        >
          <Camera class="w-4 h-4" />
          <span>手机相机拍照</span>
        </button>

        <button
          type="button"
          @click="triggerFileInput"
          class="px-5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-2 transition active:scale-95"
        >
          <ImagePlus class="w-4 h-4 text-slate-400" />
          <span>相册文件选择</span>
        </button>
      </div>
    </div>

    <!-- Preview & Parsing State -->
    <div v-else class="space-y-4">
      <div class="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-900/60 p-4">
        <div class="flex flex-col md:flex-row gap-5 items-start">
          <!-- Thumbnail with Zoom preview -->
          <div class="relative w-full md:w-64 h-64 shrink-0 rounded-xl overflow-hidden border border-white/10 bg-slate-950 group">
            <img 
              :src="imagePreview" 
              alt="Schedule preview" 
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div class="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button 
                type="button"
                @click="openFullScreen"
                class="p-2 rounded-lg bg-black/60 text-white hover:bg-black/90 text-xs flex items-center gap-1"
              >
                <Maximize2 class="w-4 h-4" />
                查看大图
              </button>
            </div>
            <button
              type="button"
              @click="clearImage"
              :disabled="isParsing"
              class="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/80 hover:bg-rose-600 text-white transition disabled:opacity-50"
              title="重选图片"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>

          <!-- Controls & Config -->
          <div class="flex-1 w-full space-y-4">
            <div>
              <div class="flex items-center justify-between gap-2">
                <h4 class="text-sm font-bold text-white flex items-center gap-2 shrink-0">
                  <ScanText class="w-4 h-4 text-indigo-400" />
                  <span>已就绪排班图像</span>
                </h4>
                <span v-if="imageSizeText" class="text-xs text-slate-400 font-mono shrink-0">{{ imageSizeText }}</span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">
                AI 将依据系统 Prompt 自动映射手写班次。
              </p>
            </div>

            <!-- Target Staff Selector -->
            <div class="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
              <div class="flex items-center justify-between">
                <label class="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <User class="w-3.5 h-3.5 text-indigo-400" />
                  提取指定员工排班
                </label>
                <span class="text-[11px] text-slate-500">留空则自动识别表格首位员工</span>
              </div>
              <div class="flex gap-2">
                <input
                  type="text"
                  v-model="targetPersonName"
                  placeholder="例如: 张三、李四、Alex、Sam"
                  class="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <!-- Available Detected Staff Shortcuts -->
              <div v-if="availableStaffList && availableStaffList.length > 0" class="pt-1">
                <div class="text-[11px] text-slate-400 mb-1">表中检测到下列员工姓名（点击切换）：</div>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="name in availableStaffList"
                    :key="name"
                    type="button"
                    @click="targetPersonName = name; $emit('reparse-person', name)"
                    :class="[
                      'px-2.5 py-1 rounded-md text-[11px] border transition',
                      targetPersonName === name
                        ? 'bg-indigo-600 text-white border-indigo-500 font-medium'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-500'
                    ]"
                  >
                    {{ name }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Parse Action Button -->
            <div>
              <button
                type="button"
                @click="startParse"
                :disabled="isParsing"
                class="w-full py-3.5 px-4 rounded-xl glass-button text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Loader2 v-if="isParsing" class="w-5 h-5 animate-spin text-white" />
                <Sparkles v-else class="w-5 h-5 text-indigo-300" />
                <span>{{ isParsing ? (progressText || '正在识别中...') : '开始识别' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fullscreen Modal View with Teleport -->
    <Teleport to="body" v-if="isFullscreen">
      <div 
        class="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-4 select-none"
        @click="isFullscreen = false"
      >
        <!-- Center Image -->
        <div class="max-w-full max-h-[85vh] flex items-center justify-center p-2" @click.stop>
          <img 
            :src="imagePreview" 
            alt="排班图片原图预览" 
            class="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl" 
          />
        </div>

        <!-- Bottom Close Button for Mobile -->
        <div class="absolute bottom-8 inset-x-0 flex justify-center pb-safe z-20 pointer-events-none">
          <button
            type="button"
            @click.stop="isFullscreen = false"
            class="pointer-events-auto px-6 py-2.5 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-white/20 text-white text-xs font-semibold shadow-xl active:scale-95 transition flex items-center gap-2 cursor-pointer"
          >
            <X class="w-4 h-4" />
            <span>关闭预览</span>
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Camera, ImagePlus, Sparkles, Trash2, Maximize2, X, ScanText, User, Loader2 } from 'lucide-vue-next';
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
const targetPersonName = ref(config.savedStaffName || '');

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
    targetPerson: targetPersonName.value
  });
}

defineExpose({
  setImage: (b64) => { imagePreview.value = b64; },
  setTargetPerson: (name) => { targetPersonName.value = name; }
});
</script>
