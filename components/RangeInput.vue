<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: number
    label: string
    min: number
    max: number
    step?: number
    unit?: string
    hint?: string
  }>(),
  { step: 1, unit: '', hint: '' },
)

const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

function clamp(v: number): number {
  if (Number.isNaN(v)) return props.min
  return Math.min(props.max, Math.max(props.min, v))
}

const value = computed({
  get: () => props.modelValue,
  set: (v: number) => emit('update:modelValue', clamp(Number(v))),
})

/** +/− 微調：以 step 為單位增減，避免浮點誤差後夾在範圍內 */
function nudge(direction: 1 | -1) {
  const decimals = (String(props.step).split('.')[1] || '').length
  const next = Number((value.value + direction * props.step).toFixed(decimals))
  value.value = next
}

const percent = computed(() => {
  const range = props.max - props.min
  if (range <= 0) return 0
  return ((value.value - props.min) / range) * 100
})

const trackStyle = computed(() => ({
  background: `linear-gradient(to right, #2563eb 0%, #2563eb ${percent.value}%, #e2e8f0 ${percent.value}%, #e2e8f0 100%)`,
}))
</script>

<template>
  <div>
    <div class="flex items-end justify-between gap-2 sm:gap-3 mb-1.5">
      <label class="field-label mb-0 min-w-0 leading-tight">{{ label }}</label>
      <div class="flex items-center gap-1 sm:gap-1.5 shrink-0">
        <button
          type="button"
          aria-label="減少"
          class="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-slate-300 bg-white text-lg font-bold leading-none text-slate-600 transition hover:bg-slate-50 active:bg-slate-100 disabled:opacity-40"
          :disabled="value <= min"
          @click="nudge(-1)"
        >
          −
        </button>
        <input
          v-model.number="value"
          type="number"
          inputmode="decimal"
          :min="min"
          :max="max"
          :step="step"
          class="w-16 sm:w-24 rounded-lg border border-slate-300 bg-white px-2 sm:px-2.5 py-1.5 text-right text-sm sm:text-base font-bold text-blue-700 outline-none transition focus:border-blue-500 focus:shadow-focus"
        />
        <button
          type="button"
          aria-label="增加"
          class="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-slate-300 bg-white text-lg font-bold leading-none text-slate-600 transition hover:bg-slate-50 active:bg-slate-100 disabled:opacity-40"
          :disabled="value >= max"
          @click="nudge(1)"
        >
          +
        </button>
        <span v-if="unit" class="text-xs sm:text-sm font-medium text-slate-500">{{ unit }}</span>
      </div>
    </div>
    <input
      v-model.number="value"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      class="w-full"
      :style="trackStyle"
    />
    <p v-if="hint" class="text-xs text-slate-400 mt-1">{{ hint }}</p>
  </div>
</template>
