import { reactive, ref, watch } from 'vue';

const STORAGE_KEY = 'shiftcal_api_config_v2';

export const PROVIDER_TYPES = {
  GEMINI: 'gemini',
  OPENAI_COMPATIBLE: 'openai_compatible',
};

const DEFAULT_CONFIG = {
  provider: PROVIDER_TYPES.GEMINI,
  apiKey: '',
  baseUrl: 'https://generativelanguage.googleapis.com',
  model: '',
  fetchedModels: [],
  temperature: 0.1,
  savedStaffName: '',
};

function loadStoredConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_CONFIG,
        ...parsed,
        fetchedModels: Array.isArray(parsed?.fetchedModels) ? parsed.fetchedModels : []
      };
    }
  } catch (e) {
    console.warn('Failed to read config from localStorage:', e);
  }
  return { ...DEFAULT_CONFIG };
}

// 全局单例响应式配置
const configState = reactive(loadStoredConfig());

// 自动持久化
watch(
  () => configState,
  (newVal) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal));
    } catch (e) {
      console.error('Failed to save config to localStorage:', e);
    }
  },
  { deep: true }
);

export function useConfig() {
  const isFetchingModels = ref(false);
  const fetchModelsError = ref('');

  const isConfigValid = () => {
    const key = typeof configState.apiKey === 'string' ? configState.apiKey.trim() : '';
    const model = typeof configState.model === 'string' ? configState.model.trim() : '';
    return key.length > 0 && model.length > 0;
  };

  const resetToDefaults = () => {
    Object.assign(configState, DEFAULT_CONFIG);
  };

  const getEffectiveModel = () => {
    return configState.model?.trim() || '';
  };

  // 通过填入的 URL 和 Key 动态拉取模型列表
  async function fetchRemoteModels() {
    const apiKey = configState.apiKey?.trim();
    let baseUrl = configState.baseUrl?.trim() || '';
    const provider = configState.provider;

    if (!apiKey) {
      throw new Error('请先填写 API Key');
    }
    if (!baseUrl) {
      throw new Error('请先填写 Base URL');
    }

    isFetchingModels.value = true;
    fetchModelsError.value = '';

    try {
      baseUrl = baseUrl.replace(/\/+$/, '');
      let modelsList = [];

      if (provider === PROVIDER_TYPES.GEMINI) {
        // Google Gemini List Models API
        const endpoint = `${baseUrl}/v1beta/models?key=${apiKey}`;
        const res = await fetch(endpoint);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `拉取失败 (HTTP ${res.status}: ${res.statusText})`);
        }
        const data = await res.json();
        if (!data.models || !Array.isArray(data.models)) {
          throw new Error('未能获取到有效的 models 列表');
        }

        // 筛选支持视觉与内容生成的模型并排序
        modelsList = data.models
          .filter(m => {
            const methods = m.supportedGenerationMethods || [];
            return methods.includes('generateContent');
          })
          .map(m => m.name.replace(/^models\//, ''))
          // 排除不适合视觉排班的纯嵌入或轻量非通用模型
          .filter(name => !name.includes('embedding') && !name.includes('aqa') && !name.includes('imagen'));
      } else {
        // OpenAI 兼容模型列表
        const endpoint = `${baseUrl}/models`;
        const res = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `拉取失败 (HTTP ${res.status}: ${res.statusText})`);
        }
        const data = await res.json();
        const rawList = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
        modelsList = rawList.map(item => typeof item === 'string' ? item : item.id).filter(Boolean);
      }

      if (modelsList.length === 0) {
        throw new Error('接口未返回任何可用模型，请确认权限或地址');
      }

      // 保存获取到的模型列表
      configState.fetchedModels = modelsList;

      // 如果当前选中的模型不在新列表中，默认选中第一项或推荐的 flash/vision 项
      if (!modelsList.includes(configState.model)) {
        const preferred = modelsList.find(m => m.includes('flash') || m.includes('4o') || m.includes('vision')) || modelsList[0];
        configState.model = preferred;
      }

      return modelsList;
    } catch (err) {
      fetchModelsError.value = err.message || '拉取模型列表失败';
      throw err;
    } finally {
      isFetchingModels.value = false;
    }
  }

  return {
    config: configState,
    isFetchingModels,
    fetchModelsError,
    fetchRemoteModels,
    isConfigValid,
    resetToDefaults,
    getEffectiveModel,
    PROVIDER_TYPES,
  };
}
