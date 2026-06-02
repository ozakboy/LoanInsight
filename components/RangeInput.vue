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
    <div class="flex items-end justify-between gap-3 mb-1.5">
      <label class="field-label mb-0">{{ label }}</label>
      <div class="flex items-center gap-1.5 shrink-0">
        <input
          v-model.number="value"
          type="number"
          :min="min"
          :max="max"
          :step="step"
          class="w-28 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-right text-base font-bold text-blue-700 outline-none transition focus:border-blue-500 focus:shadow-focus"
        />
        <span v-if="unit" class="text-sm font-medium text-slate-500">{{ unit }}</span>
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
