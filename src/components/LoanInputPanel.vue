<script setup lang="ts">
import type { LoanInput } from '../types/loan'
import RangeInput from './RangeInput.vue'
import { formatCurrency } from '../utils/finance'

const input = defineModel<LoanInput>({ required: true })

defineProps<{ accent: 'blue' | 'indigo' }>()

const accentRing: Record<string, string> = {
  blue: 'border-blue-200 bg-blue-50/40',
  indigo: 'border-indigo-200 bg-indigo-50/40',
}
const accentText: Record<string, string> = {
  blue: 'text-blue-700',
  indigo: 'text-indigo-700',
}
</script>

<template>
  <div class="card p-6 space-y-5">
    <div class="flex items-center justify-between">
      <input
        v-model="input.name"
        type="text"
        class="text-lg font-extrabold bg-transparent outline-none border-b-2 border-transparent focus:border-blue-400 transition w-40"
        :class="accentText[$props.accent]"
      />
      <span
        class="text-xs font-semibold px-2.5 py-1 rounded-full border"
        :class="accentRing[$props.accent]"
      >
        貸款參數
      </span>
    </div>

    <RangeInput
      v-model="input.amountWan"
      label="貸款總金額"
      :min="50"
      :max="5000"
      :step="10"
      unit="萬元"
      :hint="`約 NT$ ${formatCurrency(input.amountWan * 10000)}`"
    />

    <RangeInput
      v-model="input.years"
      label="貸款總年限"
      :min="5"
      :max="40"
      :step="1"
      unit="年"
      :hint="`共 ${input.years * 12} 期`"
    />

    <RangeInput
      v-model="input.gracePeriodMonths"
      label="寬限期（只繳息）"
      :min="0"
      :max="60"
      :step="1"
      unit="月"
      hint="此期間僅繳利息、不償還本金"
    />

    <div class="grid grid-cols-2 gap-4 pt-1">
      <RangeInput
        v-model="input.stage1Months"
        label="第一階段月數"
        :min="0"
        :max="input.years * 12"
        :step="1"
        unit="月"
      />
      <RangeInput
        v-model="input.stage1Rate"
        label="第一階段年利率"
        :min="0"
        :max="10"
        :step="0.01"
        unit="%"
      />
    </div>

    <RangeInput
      v-model="input.stage2Rate"
      label="第二階段年利率（調升後）"
      :min="0"
      :max="10"
      :step="0.01"
      unit="%"
      hint="第一階段結束後適用至合約結束"
    />

    <div>
      <label class="field-label">開辦費用（一次性）</label>
      <div class="relative">
        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">NT$</span>
        <input
          v-model.number="input.originationFee"
          type="number"
          min="0"
          step="1000"
          class="field-input pl-12"
        />
      </div>
      <p class="text-xs text-slate-400 mt-1">含信用查詢費、銀行手續費、代書費等前期支出</p>
    </div>
  </div>
</template>
