<template>
  <Teleport to="body" v-if="isOpen">
    <div class="fixed inset-0 z-[9999] overflow-y-auto">
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity" 
        aria-hidden="true"
        @click="handleClose"
      ></div>

      <!-- Centering container: min-h-full ensures proper vertical centering without top clipping -->
      <div 
        class="min-h-full flex items-center justify-center p-4 sm:p-6"
        @click.self="handleClose"
      >
        <!-- Modal Box -->
        <div 
          class="relative w-full max-w-lg rounded-2xl glass-panel p-6 sm:p-8 shadow-2xl border border-white/15 z-10 bg-slate-900 max-h-[90vh] overflow-y-auto"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-center justify-between pb-4 border-b border-white/10">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <Key class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-lg font-bold text-white tracking-tight">API 设置</h3>
                <p class="text-xs text-slate-400">客户端直接调用，无需后端中转</p>
              </div>
            </div>
            <button 
              type="button"
              @click="handleClose"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Form Body -->
          <form @submit.prevent="handleClose" class="mt-5 space-y-4 text-sm">
            <!-- Security Notice -->
            <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-emerald-300">
              <ShieldCheck class="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>隐私保证：API Key 仅储存在您本地浏览器的 localStorage 中，所有视觉识别与日历生成都在当前设备完成。</span>
            </div>

            <!-- Provider Selector -->
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1.5">接口协议与提供商</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  @click="setProvider(PROVIDER_TYPES.GEMINI)"
                  :class="[
                    'py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition',
                    config.provider === PROVIDER_TYPES.GEMINI
                      ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 shadow-sm'
                      : 'bg-slate-900/50 border-slate-700/60 text-slate-400 hover:border-slate-600'
                  ]"
                >
                  <Sparkles class="w-4 h-4 text-indigo-400" />
                  Google Gemini (原生)
                </button>
                <button
                  type="button"
                  @click="setProvider(PROVIDER_TYPES.OPENAI_COMPATIBLE)"
                  :class="[
                    'py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition',
                    config.provider === PROVIDER_TYPES.OPENAI_COMPATIBLE
                      ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 shadow-sm'
                      : 'bg-slate-900/50 border-slate-700/60 text-slate-400 hover:border-slate-600'
                  ]"
                >
                  <Cpu class="w-4 h-4 text-purple-400" />
                  OpenAI / 中转兼容器
                </button>
              </div>
            </div>

            <!-- Base URL -->
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1.5">API 请求 Base URL</label>
              <input
                type="text"
                v-model="config.baseUrl"
                :placeholder="config.provider === PROVIDER_TYPES.GEMINI ? 'https://generativelanguage.googleapis.com' : 'https://api.openai.com/v1'"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition font-mono text-xs"
              />
              <p class="mt-1 text-[11px] text-slate-500">
                支持官方地址或自定义代理/反代网关地址。
              </p>
            </div>

            <!-- API Key Input -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-xs font-semibold text-slate-300">API Key <span class="text-rose-400">*</span></label>
                <span v-if="!config.apiKey" class="text-[11px] text-amber-400">必填</span>
              </div>
              <div class="relative">
                <input
                  :type="showApiKey ? 'text' : 'password'"
                  v-model="config.apiKey"
                  autocomplete="current-password"
                  placeholder="AIzaSy... 或 sk-..."
                  class="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition font-mono text-xs"
                />
                <button
                  type="button"
                  @click="showApiKey = !showApiKey"
                  class="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                >
                  <Eye v-if="!showApiKey" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Fetch & Select Models Section -->
            <div class="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div class="flex items-center justify-between">
                <label class="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Boxes class="w-3.5 h-3.5 text-indigo-400" />
                  模型选择 (拉取远程模型)
                </label>
                <button
                  type="button"
                  @click="handleFetchModels"
                  :disabled="isFetchingModels || !config.apiKey || !config.baseUrl"
                  class="px-2.5 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-medium flex items-center gap-1.5 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Loader2 v-if="isFetchingModels" class="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  <RefreshCw v-else class="w-3.5 h-3.5 text-indigo-400" />
                  <span>{{ isFetchingModels ? '拉取中...' : '拉取可用模型列表' }}</span>
                </button>
              </div>

              <!-- Models Dropdown -->
              <div v-if="config.fetchedModels && config.fetchedModels.length > 0">
                <div class="relative">
                  <select
                    v-model="config.model"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-indigo-500/50 text-white text-xs font-mono focus:outline-none focus:border-indigo-400 appearance-none pr-8 cursor-pointer"
                  >
                    <option v-for="m in config.fetchedModels" :key="m" :value="m">
                      {{ m }}
                    </option>
                  </select>
                  <div class="pointer-events-none absolute right-3 top-3 text-slate-400">
                    <ChevronDown class="w-4 h-4" />
                  </div>
                </div>
                <p class="mt-1 text-[11px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 class="w-3 h-3" />
                  已成功从服务器获取到 {{ config.fetchedModels.length }} 个可用模型
                </p>
              </div>

              <!-- Manual input or fallback if not fetched yet -->
              <div v-else class="space-y-1.5">
                <input
                  type="text"
                  v-model="config.model"
                  placeholder="请先点击上方“拉取可用模型列表”或直接输入模型名 (如 gemini-2.5-flash)"
                  class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs font-mono"
                />
                <p class="text-[11px] text-slate-400">
                  输入 URL + Key 后，点击“拉取可用模型列表”即可在下拉菜单中直接选择。
                </p>
              </div>

              <div v-if="fetchModelsError" class="text-rose-400 text-[11px] leading-tight flex items-start gap-1">
                <AlertCircle class="w-3 h-3 shrink-0 mt-0.5" />
                <span>{{ fetchModelsError }}</span>
              </div>
            </div>

            <!-- Default Staff Name Preference (Generic Placeholder) -->
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1.5">默认我的排班姓名（选填）</label>
              <input
                type="text"
                v-model="config.savedStaffName"
                placeholder="例如: 张三 (Alex)、员工A（在多行排班表中将优先锁定该姓名）"
                class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>

            <!-- Connection Test Feedback -->
            <div v-if="testResult" class="mt-2 p-3 rounded-xl text-xs flex items-start gap-2.5"
              :class="testResult.success ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'"
            >
              <CheckCircle2 v-if="testResult.success" class="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <AlertCircle v-else class="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div class="leading-relaxed">
                <div class="font-semibold">{{ testResult.success ? '连接成功' : '测试失败' }}</div>
                <div class="text-[11px] opacity-90 break-all">{{ testResult.message }}</div>
              </div>
            </div>
          </form>

          <!-- Action Footer -->
          <div class="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
            <button
              type="button"
              @click="runTest"
              :disabled="isTesting || !config.apiKey || !config.model"
              class="px-4 py-2.5 rounded-xl border border-slate-700 hover:border-slate-500 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-medium flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Loader2 v-if="isTesting" class="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <Radio v-else class="w-3.5 h-3.5 text-indigo-400" />
              <span>{{ isTesting ? '测试连通中...' : '测试当前模型连通性' }}</span>
            </button>

            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="handleClose"
                class="px-5 py-2.5 rounded-xl glass-button text-white text-xs font-semibold hover:opacity-95 transition cursor-pointer"
              >
                完成并保存
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue';
import { 
  Key, X, Eye, EyeOff, ShieldCheck, Sparkles, Cpu, 
  CheckCircle2, AlertCircle, Loader2, Radio, Boxes, RefreshCw, ChevronDown 
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
}

async function handleFetchModels() {
  testResult.value = null;
  try {
    const list = await fetchRemoteModels();
    testResult.value = {
      success: true,
      message: `成功拉取到 ${list.length} 个模型！请在下拉菜单中选择。`
    };
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
  emit('close');
}
</script>
