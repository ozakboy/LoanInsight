<script setup lang="ts">
import { computed } from 'vue'
import type { LoanResult } from '../types/loan'
import { formatCurrency, formatPercent } from '../utils/finance'

const props = defineProps<{
  nameA: string
  nameB: string
  resultA: LoanResult
  resultB: LoanResult
}>()

type Metric = {
  key: string
  label: string
  a: number
  b: number
  format: (v: number) => string
  lowerIsBetter: boolean
}

const metrics = computed<Metric[]>(() => [
  {
    key: 'apr',
    label: '真實 APR（含開辦費）',
    a: props.resultA.apr,
    b: props.resultB.apr,
    format: (v) => formatPercent(v),
    lowerIsBetter: true,
  },
  {
    key: 'interest',
    label: '累積總利息',
    a: props.resultA.totalInterest,
    b: props.resultB.totalInterest,
    format: (v) => `NT$ ${formatCurrency(v)}`,
    lowerIsBetter: true,
  },
  {
    key: 'maxPay',
    label: '全期最高月付',
    a: props.resultA.maxMonthlyPayment,
    b: props.resultB.maxMonthlyPayment,
    format: (v) => `NT$ ${formatCurrency(v)}`,
    lowerIsBetter: true,
  },
  {
    key: 'cost',
    label: '總成本（本利 + 開辦費）',
    a: props.resultA.totalCost,
    b: props.resultB.totalCost,
    format: (v) => `NT$ ${formatCurrency(v)}`,
    lowerIsBetter: true,
  },
])

/** 各指標勝方：'a' | 'b' | 'tie' */
function winner(m: Metric): 'a' | 'b' | 'tie' {
  if (Math.abs(m.a - m.b) < 1e-6) return 'tie'
  const aWins = m.lowerIsBetter ? m.a < m.b : m.a > m.b
  return aWins ? 'a' : 'b'
}

// 綜合推薦：以總成本最低者勝出（最能反映「省下最多錢」）
const overall = computed(() => {
  const diff = props.resultA.totalCost - props.resultB.totalCost
  if (Math.abs(diff) < 1) return { side: 'tie' as const, saving: 0 }
  return diff < 0
    ? { side: 'a' as const, saving: Math.abs(diff) }
    : { side: 'b' as const, saving: Math.abs(diff) }
})

const winnerName = computed(() =>
  overall.value.side === 'a'
    ? props.nameA
    : overall.value.side === 'b'
      ? props.nameB
      : '',
)

function cellClass(m: Metric, side: 'a' | 'b'): string {
  return winner(m) === side
    ? 'text-emerald-700 font-black bg-emerald-50'
    : 'text-slate-600 font-semibold'
}
</script>

<template>
  <section class="card p-6 md:p-8">
    <div class="flex items-center gap-3 mb-6">
      <div class="p-2 bg-amber-50 text-amber-600 rounded-xl">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      </div>
      <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">雙銀行方案同屏 PK</h2>
    </div>

    <!-- 智慧推薦橫幅 -->
    <div
      class="rounded-2xl p-5 mb-6 border"
      :class="
        overall.side === 'tie'
          ? 'bg-slate-50 border-slate-200'
          : 'bg-gradient-to-r from-emerald-50 to-emerald-100/60 border-emerald-200'
      "
    >
      <template v-if="overall.side === 'tie'">
        <p class="font-bold text-slate-700">兩方案總成本相當，可依其他條件（如服務、彈性）決定。</p>
      </template>
      <template v-else>
        <p class="text-sm text-emerald-700/80 font-semibold">💡 智慧推薦</p>
        <p class="text-lg font-black text-emerald-900 mt-1">
          選擇「{{ winnerName }}」可省下約 NT$ {{ formatCurrency(overall.saving) }}
        </p>
        <p class="text-xs text-emerald-700/70 mt-1">以全期總成本（本金 + 利息 + 開辦費）計算</p>
      </template>
    </div>

    <!-- 對比表 -->
    <div class="overflow-x-auto border border-slate-200 rounded-xl">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-200 text-slate-700">
            <th class="p-3 text-left font-bold">比較項目</th>
            <th class="p-3 text-right font-bold">{{ nameA }}</th>
            <th class="p-3 text-right font-bold">{{ nameB }}</th>
            <th class="p-3 text-center font-bold w-20">勝出</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="m in metrics" :key="m.key">
            <td class="p-3 text-slate-500">{{ m.label }}</td>
            <td class="p-3 text-right" :class="cellClass(m, 'a')">{{ m.format(m.a) }}</td>
            <td class="p-3 text-right" :class="cellClass(m, 'b')">{{ m.format(m.b) }}</td>
            <td class="p-3 text-center">
              <span
                v-if="winner(m) !== 'tie'"
                class="inline-block text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700"
              >
                {{ winner(m) === 'a' ? nameA : nameB }}
              </span>
              <span v-else class="text-xs text-slate-400">平手</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
