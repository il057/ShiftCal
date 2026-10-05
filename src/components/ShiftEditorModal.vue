<template>
  <Teleport to="body" v-if="isOpen && currentShift">
    <div class="fixed inset-0 z-[9999] overflow-y-auto">
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-[#000000]/80 backdrop-blur-sm transition-opacity" 
        aria-hidden="true"
        @click="handleCancel"
      ></div>

      <!-- Container -->
      <div 
        class="min-h-full flex items-end sm:items-center justify-center p-0 sm:p-4 select-none"
        @click.self="handleCancel"
      >
        <!-- Modal Hardware Chassis -->
        <div 
          class="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#1E2024] p-5 sm:p-7 shadow-[0_10px_0_#000000] border-[2.5px] border-black z-10 max-h-[90vh] overflow-y-auto pb-safe" 
          @click.stop
        >
          <!-- Mobile drag handle indicator -->
          <div class="w-12 h-1.5 rounded-full bg-[#3A3E46] mx-auto mb-3 sm:hidden"></div>

          <!-- Header -->
          <div class="flex items-center justify-between pb-3.5 border-b-2 border-black">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-[#E8F624] text-black border-2 border-black flex items-center justify-center font-bold shrink-0 shadow-[0_2px_0_#000]">
                <CalendarIcon class="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 class="text-base font-normal text-white uppercase tracking-tight flex items-center gap-2 font-unbounded">
                  <span>微调班次参数</span>
                  <span v-if="currentShift.isAnomaly" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E03030] text-white border border-black shadow-[0_1px_0_#000]">
                    ANOMALY
                  </span>
                </h3>
                <p class="text-[11px] text-[#9CA3AF] font-tech">
                  DATE // {{ currentShift.date }} · RAW: <span class="text-[#E8F624] font-bold">{{ currentShift.raw_text || '-' }}</span>
                </p>
              </div>
            </div>
            
            <!-- High-Contrast Red-Black Close Capsule -->
            <button 
              type="button"
              @click="handleCancel"
              class="w-8 h-8 rounded-lg zzz-btn-close flex items-center justify-center text-white cursor-pointer"
              title="关闭"
            >
              <X class="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>

          <!-- Quick Shift Presets (常用班次快速切换) -->
          <div class="mt-4">
            <label class="block text-xs font-bold text-white mb-2 flex items-center gap-1.5 uppercase font-sans">
              <Zap class="w-3.5 h-3.5 text-[#E8F624] stroke-[2.2]" />
              <span>快速套用标准班次 // PRESETS</span>
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="preset in SHIFT_PRESETS"
                :key="preset.id"
                type="button"
                @click="applyPreset(preset)"
                :class="[
                  'p-2.5 rounded-xl border-2 text-left transition flex flex-col justify-between h-14 active:scale-95 cursor-pointer',
                  isPresetActive(preset)
                    ? 'bg-[#E8F624] text-black border-[#181A1D] shadow-[0_2px_0_#181A1D]'
                    : 'bg-[#181A1E] border-[#2A2E35] text-[#9CA3AF] hover:text-white hover:border-[#9CA3AF]'
                ]"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold" :class="isPresetActive(preset) ? 'text-black' : 'text-white'">{{ preset.tag }}</span>
                  <span v-if="preset.is_off" class="text-[9px] px-1 py-0.2 rounded font-bold" :class="isPresetActive(preset) ? 'bg-black text-[#E8F624]' : 'bg-[#36E4DA]/20 text-[#36E4DA]'">休</span>
                </div>
                <div class="text-[10px] font-tech truncate font-bold" :class="isPresetActive(preset) ? 'text-black' : 'text-[#9CA3AF]'">
                  {{ preset.is_off ? '全天休假' : `${preset.start_time}-${preset.end_time}` }}
                </div>
              </button>
            </div>
          </div>

          <!-- Custom Details Form -->
          <div class="mt-4 pt-4 border-t-2 border-[#181A1D] space-y-3.5 text-xs">
            <!-- Date Selector -->
            <div>
              <label class="block text-white font-bold mb-1.5 font-sans">班次日期 // DATE</label>
              <div class="relative flex items-center">
                <input
                  type="date"
                  v-model="editForm.date"
                  class="w-full px-3.5 py-2.5 rounded-xl zzz-slot text-white font-tech text-xs focus:outline-none focus:border-[#E8F624]"
                />
              </div>
            </div>

            <!-- Shift Type Toggle -->
            <div class="flex items-center justify-between p-3 rounded-2xl zzz-slot">
              <div>
                <div class="font-bold text-white text-xs">设定为全天休假 // OFF-DUTY</div>
                <div class="text-[11px] text-[#9CA3AF] font-tech">写入日历为全天休息日程</div>
              </div>
              <button
                type="button"
                @click="toggleOffState"
                :class="[
                  'w-12 h-6 rounded-full transition-colors relative border-2 border-[#181A1D] shrink-0 cursor-pointer',
                  editForm.is_off ? 'bg-[#36E4DA]' : 'bg-[#111215]'
                ]"
              >
                <span
                  :class="[
                    'absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform',
                    editForm.is_off ? 'translate-x-6 bg-black' : 'translate-x-0 bg-[#9CA3AF]'
                  ]"
                ></span>
              </button>
            </div>

            <!-- Time Picker (if not off) -->
            <div v-if="!editForm.is_off" class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-white font-bold mb-1.5 font-sans">上班起始时间</label>
                <div class="relative flex items-center">
                  <input
                    type="time"
                    v-model="editForm.start_time"
                    class="w-full px-3.5 py-2.5 rounded-xl zzz-slot text-white font-tech text-xs focus:outline-none focus:border-[#E8F624]"
                  />
                </div>
              </div>
              <div>
                <label class="block text-white font-bold mb-1.5 font-sans">下班截止时间</label>
                <div class="relative flex items-center">
                  <input
                    type="time"
                    v-model="editForm.end_time"
                    class="w-full px-3.5 py-2.5 rounded-xl zzz-slot text-white font-tech text-xs focus:outline-none focus:border-[#E8F624]"
                  />
                </div>
              </div>
            </div>

            <!-- Note & Raw Text -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[#9CA3AF] font-tech mb-1">原始识别标记 RAW</label>
                <input
                  type="text"
                  v-model="editForm.raw_text"
                  placeholder="例如 2-11, 9-6"
                  class="w-full px-3 py-2 rounded-xl zzz-slot text-white font-tech text-xs focus:outline-none focus:border-[#E8F624]"
                />
              </div>
              <div>
                <label class="block text-[#9CA3AF] font-tech mb-1">自定义备注 NOTE</label>
                <input
                  type="text"
                  v-model="editForm.note"
                  placeholder="例如: 早班负责人"
                  class="w-full px-3 py-2 rounded-xl zzz-slot text-white font-tech text-xs focus:outline-none focus:border-[#E8F624]"
                />
              </div>
            </div>
          </div>

          <!-- Action Footer -->
          <div class="mt-6 pt-4 border-t-2 border-[#181A1D] flex items-center justify-between gap-3">
            <button
              type="button"
              @click="deleteShift"
              class="px-3.5 py-2 rounded-xl zzz-btn-red text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 class="w-3.5 h-3.5 stroke-[2.2]" />
              <span>删除班次</span>
            </button>

            <div class="flex items-center gap-2.5">
              <button
                type="button"
                @click="handleCancel"
                class="px-4 py-2 rounded-xl zzz-btn-dark text-xs font-bold text-white cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                @click="saveChanges"
                class="px-5 py-2 rounded-xl zzz-btn-yellow text-black text-xs font-bold cursor-pointer uppercase"
              >
                确认保存 // SAVE
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
    editForm.start_time = '';
    editForm.end_time = '';
    editForm.raw_text = preset.tag;
  } else {
    editForm.start_time = preset.start_time;
    editForm.end_time = preset.end_time;
    editForm.raw_text = preset.tag;
  }
}

function toggleOffState() {
  editForm.is_off = !editForm.is_off;
  if (editForm.is_off) {
    editForm.start_time = '';
    editForm.end_time = '';
  } else {
    if (!editForm.start_time) editForm.start_time = '09:00';
    if (!editForm.end_time) editForm.end_time = '18:00';
  }
}

function handleCancel() {
  emit('close');
}

function saveChanges() {
  emit('save', {
    ...editForm,
    confidence: 1.0,
    isAnomaly: false
  });
  emit('close');
}

function deleteShift() {
  if (confirm(`确定删除 ${editForm.date} 的排班吗？`)) {
    emit('delete', editForm.id);
    emit('close');
  }
}
</script>
