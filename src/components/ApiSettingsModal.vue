<template>
  <Teleport to="body" v-if="isOpen">
    <div class="fixed inset-0 z-[9999] overflow-y-auto">
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-[#000000]/80 backdrop-blur-sm transition-opacity" 
        aria-hidden="true"
        @click="handleClose"
      ></div>

      <!-- Centering container -->
      <div 
        class="min-h-full flex items-center justify-center p-3 sm:p-6 select-none"
        @click.self="handleClose"
      >
        <!-- Modal Hardware Chassis -->
        <div 
          class="relative w-full max-w-lg rounded-3xl bg-[#1E2024] p-5 sm:p-7 shadow-[0_10px_0_#000000] border-[2.5px] border-black z-10 my-4"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-center justify-between pb-3.5 border-b-2 border-black">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-[#E8F624] text-black border-2 border-black flex items-center justify-center font-bold shrink-0 shadow-[0_2px_0_#000000]">
                <Key class="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 class="text-base sm:text-lg font-normal text-white uppercase tracking-tight font-unbounded">
                  <span>API 模组装填</span> <span class="text-[#E8F624] font-tech text-xs tracking-normal font-bold">// CONFIG</span>
                </h3>
                <p class="text-[11px] text-[#9CA3AF] font-tech">直连官方或代理端点 · 密钥仅留存本机</p>
              </div>
            </div>
            
            <!-- High-Contrast Red-Black Close Capsule -->
            <button 
              type="button"
              @click="handleClose"
              class="w-8 h-8 rounded-lg zzz-btn-close flex items-center justify-center text-white cursor-pointer"
              title="关闭"
            >
              <X class="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>

          <!-- Form Body -->
          <form @submit.prevent="handleClose" class="mt-5 space-y-4 text-xs">
            <!-- Privacy Security Pill -->
            <div class="p-3 rounded-2xl zzz-slot flex items-start gap-2.5 text-[#36E4DA]">
              <ShieldCheck class="w-4 h-4 shrink-0 mt-0.5" />
              <span class="font-tech text-[11px] text-[#D1D5DB]">
                PRIVACY GUARANTEE: 所有 API 密钥均保存在当前浏览器本地，直接与多模态端点通信，无中间服务介入。
              </span>
            </div>

            <!-- Provider Selector (Gamepad Dual Keys) -->
            <div>
              <label class="block text-xs font-bold text-white mb-1.5 uppercase font-sans">
                协议提供商 // PROTOCOL SELECT
              </label>
              <div class="p-1 rounded-2xl bg-[#111215] border-2 border-[#181A1D] grid grid-cols-2 gap-1.5 shadow-inner">
                <button
                  type="button"
                  @click="setProvider(PROVIDER_TYPES.GEMINI)"
                  :class="[
                    'py-2 px-3 rounded-xl border-2 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer',
                    config.provider === PROVIDER_TYPES.GEMINI
                      ? 'bg-[#E8F624] text-black border-[#181A1D] shadow-[0_2px_0_#181A1D]'
                      : 'bg-[#181A1E] border-transparent text-[#9CA3AF] hover:text-white'
                  ]"
                >
                  <Sparkles class="w-4 h-4 stroke-[2.2]" />
                  <span>Google Gemini</span>
                </button>
                <button
                  type="button"
                  @click="setProvider(PROVIDER_TYPES.OPENAI_COMPATIBLE)"
                  :class="[
                    'py-2 px-3 rounded-xl border-2 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer',
                    config.provider === PROVIDER_TYPES.OPENAI_COMPATIBLE
                      ? 'bg-[#E8F624] text-black border-[#181A1D] shadow-[0_2px_0_#181A1D]'
                      : 'bg-[#181A1E] border-transparent text-[#9CA3AF] hover:text-white'
                  ]"
                >
                  <Cpu class="w-4 h-4 stroke-[2.2]" />
                  <span>OpenAI 兼容中转</span>
                </button>
              </div>
            </div>

            <!-- Base URL -->
            <div>
              <label class="block text-white font-bold mb-1 font-sans">
                BASE URL // 请求基址
              </label>
              <input
                type="text"
                v-model="config.baseUrl"
                :placeholder="config.provider === PROVIDER_TYPES.GEMINI ? 'https://generativelanguage.googleapis.com' : 'https://api.openai.com/v1'"
                class="w-full px-3.5 py-2.5 rounded-xl zzz-slot text-white font-tech text-xs focus:outline-none focus:border-[#E8F624]"
              />
            </div>

            <!-- API Key Input -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-white font-bold font-sans">API KEY // 授权密钥</label>
                <span v-if="!config.apiKey" class="text-[10px] font-tech text-[#E03030] font-bold">REQUIRED</span>
              </div>
              <div class="relative flex items-center">
                <input
                  :type="showApiKey ? 'text' : 'password'"
                  v-model="config.apiKey"
                  autocomplete="current-password"
                  placeholder="AIzaSy... 或 sk-..."
                  class="w-full px-3.5 py-2.5 pr-10 rounded-xl zzz-slot text-white font-tech text-xs focus:outline-none focus:border-[#E8F624]"
                />
                <button
                  type="button"
                  @click="showApiKey = !showApiKey"
                  class="absolute right-3 text-[#9CA3AF] hover:text-white cursor-pointer"
                >
                  <Eye v-if="!showApiKey" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Fetch & Select Models Section -->
            <div class="p-3.5 rounded-2xl zzz-slot space-y-3">
              <div class="flex items-center justify-between">
                <label class="text-xs font-bold text-white flex items-center gap-1.5 uppercase font-sans">
                  <Boxes class="w-3.5 h-3.5 text-[#E8F624]" />
                  <span>视觉模型选择 // MODEL</span>
                </label>
                <button
                  type="button"
                  @click="handleFetchModels"
                  :disabled="isFetchingModels || !config.apiKey || !config.baseUrl"
                  class="px-3 py-1 rounded-xl zzz-btn-dark text-[11px] font-bold text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Loader2 v-if="isFetchingModels" class="w-3.5 h-3.5 animate-spin text-[#E8F624]" />
                  <RefreshCw v-else class="w-3.5 h-3.5 text-[#E8F624]" />
                  <span>{{ isFetchingModels ? '拉取中...' : '拉取远程模型' }}</span>
                </button>
              </div>

              <!-- Custom Styled Dropdown (全自定义工控风格模型下拉选择器) -->
              <div v-if="config.fetchedModels && config.fetchedModels.length > 0" class="space-y-1.5">
                <div class="relative" ref="dropdownRootRef">
                  <!-- Dropdown Trigger Box -->
                  <div
                    @click="isDropdownOpen = !isDropdownOpen"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-[#111215] border-2 text-white text-xs font-tech flex items-center justify-between transition cursor-pointer select-none shadow-inner"
                    :class="isDropdownOpen ? 'border-[#E8F624] ring-2 ring-[#E8F624]/20' : 'border-black hover:border-[#353A45]'"
                  >
                    <div class="flex items-center gap-2 truncate">
                      <span class="w-2 h-2 rounded-full bg-[#E8F624] shrink-0"></span>
                      <span class="truncate font-bold text-white">{{ config.model || '请选择模型...' }}</span>
                    </div>
                    <div class="flex items-center gap-2 shrink-0 ml-2">
                      <span class="text-[9px] font-tech px-1.5 py-0.2 rounded bg-[#1E2024] text-[#9CA3AF] border border-[#2A2E35]">
                        {{ config.fetchedModels.length }}
                      </span>
                      <ChevronDown 
                        class="w-4 h-4 text-[#E8F624] transition-transform duration-200"
                        :class="{ 'rotate-180': isDropdownOpen }"
                      />
                    </div>
                  </div>

                  <!-- Floating Custom Dropdown Menu: Attached tightly with top-full mt-1 -->
                  <div
                    v-if="isDropdownOpen"
                    class="absolute left-0 right-0 top-full mt-1 z-50 rounded-2xl bg-[#141619] border-2 border-black shadow-[0_12px_28px_rgba(0,0,0,0.98)] p-2 space-y-1.5 animate-in fade-in zoom-in-95 duration-100"
                    @click.stop
                  >
                    <!-- Quick Search Filter Box -->
                    <div class="relative flex items-center">
                      <Search class="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 pointer-events-none" />
                      <input
                        type="text"
                        v-model="modelSearchQuery"
                        placeholder="快速搜索过滤模型名 (如 flash, 4o)..."
                        class="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#1B1E22] border border-black text-white text-xs font-tech placeholder-[#9CA3AF] focus:outline-none focus:border-[#E8F624]"
                      />
                      <button
                        v-if="modelSearchQuery"
                        type="button"
                        @click="modelSearchQuery = ''"
                        class="absolute right-2 text-[#9CA3AF] hover:text-white text-xs px-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <!-- Scrollable Options List -->
                    <div class="max-h-40 overflow-y-auto space-y-1 pr-1">
                      <div
                        v-for="m in filteredFetchedModels"
                        :key="m"
                        @click="selectModel(m)"
                        :class="[
                          'px-3 py-1.5 rounded-xl text-xs font-tech transition flex items-center justify-between cursor-pointer',
                          config.model === m
                            ? 'bg-[#E8F624] text-black font-bold shadow-[0_2px_0_#000000]'
                            : 'text-[#D1D5DB] hover:bg-[#24272E] hover:text-white'
                        ]"
                      >
                        <span class="truncate">{{ m }}</span>
                        <Check v-if="config.model === m" class="w-3.5 h-3.5 stroke-[3] shrink-0 ml-2" />
                      </div>

                      <div v-if="filteredFetchedModels.length === 0" class="py-3 text-center text-xs font-tech text-[#9CA3AF]">
                        未检索到匹配模型 "{{ modelSearchQuery }}"
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Info summary placed cleanly outside the dropdown wrapper -->
                <p class="text-[10px] font-tech text-[#36E4DA] flex items-center gap-1 pl-1">
                  <CheckCircle2 class="w-3 h-3" />
                  <span>已成功载入 {{ config.fetchedModels.length }} 个远端模型</span>
                </p>
              </div>

              <!-- Manual input fallback if not fetched yet -->
              <div v-else class="space-y-1.5">
                <input
                  type="text"
                  v-model="config.model"
                  placeholder="如 gemini-2.5-flash 或 gpt-4o"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-[#111215] border-2 border-[#181A1D] text-white placeholder-[#9CA3AF] text-xs font-tech focus:outline-none focus:border-[#E8F624]"
                />
              </div>

              <div v-if="fetchModelsError" class="text-[#E03030] text-[10px] font-tech leading-tight flex items-start gap-1">
                <AlertCircle class="w-3 h-3 shrink-0 mt-0.5" />
                <span>{{ fetchModelsError }}</span>
              </div>
            </div>

            <!-- Default Staff Name Preference -->
            <div>
              <label class="block text-white font-bold mb-1 font-sans">
                默认提取员工姓名（选填）
              </label>
              <input
                type="text"
                v-model="config.savedStaffName"
                placeholder="例如: 张三 (Alex)"
                class="w-full px-3.5 py-2.5 rounded-xl zzz-slot text-white placeholder-[#9CA3AF] font-tech text-xs focus:outline-none focus:border-[#E8F624]"
              />
            </div>

            <!-- Connection Test Result -->
            <div 
              v-if="testResult" 
              class="p-3 rounded-2xl border-2 text-xs font-tech flex items-start gap-2.5"
              :class="testResult.success ? 'bg-[#181A1E] border-[#36E4DA] text-[#36E4DA]' : 'bg-[#181A1E] border-[#E03030] text-[#E03030]'"
            >
              <CheckCircle2 v-if="testResult.success" class="w-4 h-4 shrink-0 text-[#36E4DA] mt-0.5" />
              <AlertCircle v-else class="w-4 h-4 shrink-0 text-[#E03030] mt-0.5" />
              <div class="leading-relaxed">
                <div class="font-bold">{{ testResult.success ? 'TEST // SUCCESS' : 'TEST // FAILED' }}</div>
                <div class="text-[11px] opacity-90 break-all">{{ testResult.message }}</div>
              </div>
            </div>
          </form>

          <!-- Action Footer -->
          <div class="mt-6 pt-4 border-t-2 border-[#181A1D] flex items-center justify-between gap-3">
            <button
              type="button"
              @click="runTest"
              :disabled="isTesting || !config.apiKey || !config.model"
              class="px-4 py-2.5 rounded-xl zzz-btn-dark text-xs font-bold text-white flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Loader2 v-if="isTesting" class="w-3.5 h-3.5 animate-spin text-[#E8F624]" />
              <Radio v-else class="w-3.5 h-3.5 text-[#E8F624]" />
              <span>{{ isTesting ? '通信测试中...' : '测试连通性' }}</span>
            </button>

            <button
              type="button"
              @click="handleClose"
              class="px-5 py-2.5 rounded-xl zzz-btn-yellow text-black text-xs font-bold cursor-pointer uppercase tracking-wider"
            >
              完成并保存 // SAVE
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { 
  Key, X, Eye, EyeOff, ShieldCheck, Sparkles, Cpu, 
  CheckCircle2, AlertCircle, Loader2, Radio, Boxes, RefreshCw, ChevronDown,
  Search, Check
} from 'lucide-vue-next';
import { useConfig, PROVIDER_TYPES } from '../composables/useConfig';
import { useScheduleParser } from '../composables/useScheduleParser';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);

const { config, isFetchingModels, fetchModelsError, fetchRemoteModels } = useConfig();
const { testConnection } = useScheduleParser();

const showApiKey = ref(false);
const isTesting = ref(false);
const testResult = ref(null);

// Custom Dropdown State
const dropdownRootRef = ref(null);
const isDropdownOpen = ref(false);
const modelSearchQuery = ref('');

const filteredFetchedModels = computed(() => {
  if (!config.fetchedModels) return [];
  if (!modelSearchQuery.value.trim()) return config.fetchedModels;
  const q = modelSearchQuery.value.toLowerCase().trim();
  return config.fetchedModels.filter(m => m.toLowerCase().includes(q));
});

function selectModel(m) {
  config.model = m;
  isDropdownOpen.value = false;
}

function handleDocumentClick(e) {
  if (dropdownRootRef.value && !dropdownRootRef.value.contains(e.target)) {
    isDropdownOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick);
});

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick);
});

function setProvider(provider) {
  config.provider = provider;
  if (provider === PROVIDER_TYPES.GEMINI) {
    if (config.baseUrl.includes('openai.com')) {
      config.baseUrl = 'https://generativelanguage.googleapis.com';
    }
  } else {
    if (config.baseUrl.includes('googleapis.com')) {
      config.baseUrl = 'https://api.openai.com/v1';
    }
  }
  config.fetchedModels = [];
  testResult.value = null;
  isDropdownOpen.value = false;
}

async function handleFetchModels() {
  testResult.value = null;
  try {
    const list = await fetchRemoteModels();
    testResult.value = {
      success: true,
      message: `成功拉取到 ${list.length} 个模型！请在下拉菜单中选择。`
    };
    isDropdownOpen.value = true;
  } catch (err) {
    // Error is set in fetchModelsError
  }
}

async function runTest() {
  isTesting.value = true;
  testResult.value = null;
  try {
    await testConnection(config);
    testResult.value = {
      success: true,
      message: `已成功连通模型 ${config.model}！端点响应正常。`
    };
  } catch (err) {
    testResult.value = {
      success: false,
      message: err.message || '网络连接超时或密钥无效'
    };
  } finally {
    isTesting.value = false;
  }
}

function handleClose() {
  isDropdownOpen.value = false;
  emit('close');
}
</script>
