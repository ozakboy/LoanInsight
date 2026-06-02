<script setup lang="ts">
import { computed } from 'vue'
import type { DsrDiagnosis, RiskLevel } from '~/types/loan'
import type { ScenarioDiagnosis } from '~/composables/useLoanCalculator'
import { formatCurrency, formatPercent } from '~/utils/finance'

const props = defineProps<{ diagnosis: ScenarioDiagnosis; name: string }>()

const r = computed(() => props.diagnosis.result)

const riskStyles: Record<RiskLevel, { wrap: string; dot: string; title: string; advice: string }> = {
  safe: {
    wrap: 'bg-emerald-50 border-emerald-200',
    dot: 'bg-emerald-500',
    title: 'text-emerald-800',
    advice: '🟢 安全區：還款游刃有餘，基本不影響生活品質與儲蓄規劃。',
  },
  warning: {
    wrap: 'bg-amber-50 border-amber-200',
    dot: 'bg-amber-500',
    title: 'text-amber-800',
    advice: '🟡 警戒區：還款佔比較高，需警惕未來突發大筆開銷的現金流壓力。',
  },
  danger: {
    wrap: 'bg-rose-50 border-rose-200',
    dot: 'bg-rose-500',
    title: 'text-rose-800',
    advice: '🔴 紅線區：高度財務風險！建議調整寬限期、拉長年限或重談利率。',
  },
}

const levelLabel: Record<RiskLevel, string> = {
  safe: '安全',
  warning: '警戒',
  danger: '紅線',
}

function dsrText(d: DsrDiagnosis): string {
  if (!Number.isFinite(d.ratio)) return '可支配收入為 0，無法評估'
  return formatPercent(d.ratio * 100, 1)
}

const hasTwoStages = computed(() => r.value.schedule.some((row) => row.stage === 2))
</script>

<template>
  <div class="card p-6 space-y-5">
    <h3 class="text-base font-extrabold text-slate-900 flex items-center gap-2">
      <span class="w-1.5 h-4 bg-blue-600 rounded"></span>
      {{ name }} · 診斷結果
    </h3>

    <!-- 關鍵指標 -->
    <div class="grid grid-cols-2 gap-3">
      <div class="rounded-xl bg-gradient-to-b from-blue-50 to-blue-50/40 border border-blue-100 p-4">
        <p class="text-xs font-semibold text-blue-700/80">真實 APR（含開辦費）</p>
        <p class="text-2xl font-black text-blue-800 mt-1">{{ formatPercent(r.apr) }}</p>
        <p class="text-[11px] text-blue-600/70 mt-0.5">
          牌告加權 {{ formatPercent(r.nominalRate) }}
        </p>
      </div>
      <div class="rounded-xl bg-gradient-to-b from-slate-50 to-white border border-slate-200 p-4">
        <p class="text-xs font-semibold text-slate-500">全期最高月付</p>
        <p class="text-2xl font-black text-slate-900 mt-1">
          {{ formatCurrency(r.maxMonthlyPayment) }}
        </p>
        <p class="text-[11px] text-slate-400 mt-0.5">單位：元 / 月</p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3 text-sm">
      <div class="flex justify-between border-b border-slate-100 py-2">
        <span class="text-slate-500">累積總利息</span>
        <span class="font-bold text-rose-600">{{ formatCurrency(r.totalInterest) }}</span>
      </div>
      <div class="flex justify-between border-b border-slate-100 py-2">
        <span class="text-slate-500">開辦費用</span>
        <span class="font-bold text-slate-700">{{ formatCurrency(r.originationFee) }}</span>
      </div>
      <template v-if="hasTwoStages">
        <div class="flex justify-between border-b border-slate-100 py-2">
          <span class="text-slate-500">第一階段月付</span>
          <span class="font-bold text-slate-700">{{ formatCurrency(r.stage1Payment) }}</span>
        </div>
        <div class="flex justify-between border-b border-slate-100 py-2">
          <span class="text-slate-500">第二階段月付</span>
          <span class="font-bold text-slate-700">{{ formatCurrency(r.stage2Payment) }}</span>
        </div>
      </template>
      <div v-else class="flex justify-between border-b border-slate-100 py-2 col-span-2">
        <span class="text-slate-500">每月還款金額</span>
        <span class="font-bold text-slate-700">{{ formatCurrency(r.stage1Payment) }}</span>
      </div>
      <div class="flex justify-between py-2 col-span-2">
        <span class="text-slate-500">總成本（本金 + 利息 + 開辦費）</span>
        <span class="font-black text-slate-900">{{ formatCurrency(r.totalCost) }}</span>
      </div>
    </div>

    <!-- 分階段 DSR 診斷 -->
    <div class="space-y-3">
      <p class="text-sm font-bold text-slate-700">
        {{ hasTwoStages ? '分階段' : '' }}收支動態診斷（DSR）
      </p>
      <p class="text-xs text-slate-400 -mt-1.5">
        可支配收入 NT$ {{ formatCurrency(diagnosis.disposableIncome) }}（月收入 − 既有支出）
      </p>

      <div
        v-for="(d, idx) in [diagnosis.stage1Dsr, diagnosis.stage2Dsr]"
        :key="idx"
        v-show="idx === 0 || hasTwoStages"
        class="rounded-xl border p-3"
        :class="riskStyles[d.level].wrap"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-600">
            {{ hasTwoStages ? `第${idx === 0 ? '一' : '二'}階段 ` : '' }}月付 NT$
            {{ formatCurrency(d.payment) }}
          </span>
          <span
            class="inline-flex items-center gap-1.5 text-xs font-extrabold"
            :class="riskStyles[d.level].title"
          >
            <span class="w-2 h-2 rounded-full" :class="riskStyles[d.level].dot"></span>
            DSR {{ dsrText(d) }} · {{ levelLabel[d.level] }}
          </span>
        </div>
        <p class="text-xs mt-1.5" :class="riskStyles[d.level].title">
          {{ riskStyles[d.level].advice }}
        </p>
      </div>
    </div>
  </div>
</template>
