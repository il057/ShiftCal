<template>
  <Teleport to="body" v-if="isOpen && currentShift">
    <div class="fixed inset-0 z-[9999] overflow-y-auto">
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity" 
        aria-hidden="true"
        @click="handleCancel"
      ></div>

      <!-- Container: bottom sheet on mobile, centered card on desktop -->
      <div 
        class="min-h-full flex items-end sm:items-center justify-center p-0 sm:p-4"
        @click.self="handleCancel"
      >
        <!-- Modal Box -->
        <div 
          class="relative w-full max-w-lg rounded-t-3xl sm:rounded-2xl glass-panel p-5 sm:p-6 shadow-2xl border border-white/10 z-10 max-h-[90vh] overflow-y-auto pb-safe bg-slate-900" 
          @click.stop
        >
          <!-- Mobile drag handle indicator -->
          <div class="w-12 h-1 rounded-full bg-slate-700 mx-auto mb-3 sm:hidden"></div>

      <!-- Header -->
      <div class="flex items-center justify-between pb-3.5 border-b border-white/10">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <CalendarIcon class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <span>编辑班次：{{ currentShift.date }}</span>
              <span v-if="currentShift.isAnomaly" class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                待复核
              </span>
            </h3>
            <p class="text-xs text-slate-400">
              手写原始标记: <span class="font-mono text-indigo-300 font-semibold">{{ currentShift.raw_text || '无' }}</span>
              <span class="mx-1.5 opacity-40">|</span>
              AI 置信度: <span :class="currentShift.confidence < 0.8 ? 'text-amber-400 font-semibold' : 'text-emerald-400'">{{ (currentShift.confidence * 100).toFixed(0) }}%</span>
            </p>
          </div>
        </div>
        <button 
          @click="handleCancel"
          class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Quick Shift Presets -->
      <div class="mt-4">
        <label class="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
          <Zap class="w-3.5 h-3.5 text-amber-400" />
          <span>一键切换常用班次</span>
        </label>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="preset in SHIFT_PRESETS"
            :key="preset.id"
            type="button"
            @click="applyPreset(preset)"
            :class="[
              'p-2.5 rounded-xl border text-left transition flex flex-col justify-between h-14 active:scale-95',
              isPresetActive(preset)
                ? 'bg-indigo-600/30 border-indigo-500 ring-1 ring-indigo-500/50'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            ]"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold" :class="isPresetActive(preset) ? 'text-white' : 'text-slate-200'">{{ preset.tag }}</span>
              <span v-if="preset.is_off" class="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold">休</span>
            </div>
            <div class="text-[11px] font-mono text-slate-400 truncate">
              {{ preset.is_off ? '全天休假' : `${preset.start_time}-${preset.end_time}` }}
            </div>
          </button>
        </div>
      </div>

      <!-- Custom Details Form -->
      <div class="mt-4 pt-4 border-t border-white/5 space-y-3.5 text-xs">
        <!-- Date Selector (iOS Optimized) -->
        <div>
          <label class="block text-slate-300 font-medium mb-1.5">班次日期</label>
          <div class="relative flex items-center">
            <div class="absolute left-3.5 pointer-events-none text-slate-400">
              <CalendarIcon class="w-4 h-4" />
            </div>
            <input
              type="date"
              v-model="editForm.date"
              class="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white font-mono text-base sm:text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <!-- Shift Type Toggle -->
        <div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/50 border border-slate-800">
          <div>
            <div class="font-semibold text-slate-200 text-xs sm:text-sm">设为休假 / 不上班</div>
            <div class="text-[11px] text-slate-400">休假将在日历中标记为全天休假</div>
          </div>
          <button
            type="button"
            @click="toggleOffState"
            :class="[
              'w-12 h-6 rounded-full transition-colors relative focus:outline-none shrink-0',
              editForm.is_off ? 'bg-emerald-600' : 'bg-slate-700'
            ]"
          >
            <span
              :class="[
                'absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform',
                editForm.is_off ? 'translate-x-6' : 'translate-x-0'
              ]"
            ></span>
          </button>
        </div>

        <!-- Time Picker (iOS Optimized, if not off) -->
        <div v-if="!editForm.is_off" class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-slate-300 font-medium mb-1.5">上班起始时间</label>
            <div class="relative flex items-center">
              <div class="absolute left-3 pointer-events-none text-slate-400">
                <Clock class="w-4 h-4" />
              </div>
              <input
                type="time"
                v-model="editForm.start_time"
                class="w-full pl-9 pr-2 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white font-mono text-base sm:text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <label class="block text-slate-300 font-medium mb-1.5">下班截止时间</label>
            <div class="relative flex items-center">
              <div class="absolute left-3 pointer-events-none text-slate-400">
                <Clock class="w-4 h-4" />
              </div>
              <input
                type="time"
                v-model="editForm.end_time"
                class="w-full pl-9 pr-2 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white font-mono text-base sm:text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <!-- Note & Raw Text -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-slate-400 mb-1">原始识别标记</label>
            <input
              type="text"
              v-model="editForm.raw_text"
              placeholder="例如 2-11, 9-6, X"
              class="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 text-base sm:text-xs font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label class="block text-slate-400 mb-1">自定义备注</label>
            <input
              type="text"
              v-model="editForm.note"
              placeholder="例如: 打烊负责人"
              class="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 text-base sm:text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
        <button
          type="button"
          @click="deleteShift"
          class="px-3.5 py-2.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs font-medium transition flex items-center gap-1.5"
        >
          <Trash2 class="w-4 h-4" />
          <span>删除此天</span>
        </button>

        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="handleCancel"
            class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
          >
            取消
          </button>
          <button
            type="button"
            @click="saveChanges"
            class="px-5 py-2.5 rounded-xl glass-button text-white text-xs font-semibold hover:opacity-95 transition"
          >
            保存并确认
          </button>
        </div>
      </div>
    </div>
  </div>
  </div>
</Teleport>
</template>

<script setup>
import { ref, watch, reactive } from 'vue';
import { Calendar as CalendarIcon, Clock, X, Zap, Trash2 } from 'lucide-vue-next';
import { SHIFT_PRESETS } from '../utils/presets';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  currentShift: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'save', 'delete']);

const editForm = reactive({
  id: '',
  date: '',
  raw_text: '',
  is_off: false,
  start_time: '',
  end_time: '',
  confidence: 1.0,
  note: ''
});

watch(
  () => props.currentShift,
  (shift) => {
    if (shift) {
      editForm.id = shift.id;
      editForm.date = shift.date || '';
      editForm.raw_text = shift.raw_text || '';
      editForm.is_off = Boolean(shift.is_off);
      editForm.start_time = shift.start_time || '09:00';
      editForm.end_time = shift.end_time || '18:00';
      editForm.confidence = shift.confidence || 1.0;
      editForm.note = shift.note || '';
    }
  },
  { immediate: true }
);

function isPresetActive(preset) {
  if (preset.is_off && editForm.is_off) return true;
  if (!preset.is_off && !editForm.is_off) {
    return preset.start_time === editForm.start_time && preset.end_time === editForm.end_time;
  }
  return false;
}

function applyPreset(preset) {
  editForm.is_off = preset.is_off;
  if (preset.is_off) {
    editForm.start_time = null;
    editForm.end_time = null;
    editForm.raw_text = editForm.raw_text || 'X';
  } else {
    editForm.start_time = preset.start_time;
    editForm.end_time = preset.end_time;
    editForm.raw_text = editForm.raw_text || preset.tag;
  }
  editForm.confidence = 1.0;
}

function toggleOffState() {
  editForm.is_off = !editForm.is_off;
  if (editForm.is_off) {
    editForm.start_time = null;
    editForm.end_time = null;
  } else {
    editForm.start_time = '09:00';
    editForm.end_time = '18:00';
  }
}

function saveChanges() {
  emit('save', {
    ...editForm,
    isAnomaly: false
  });
  emit('close');
}

function deleteShift() {
  emit('delete', editForm.id);
  emit('close');
}

function handleCancel() {
  emit('close');
}
</script>
