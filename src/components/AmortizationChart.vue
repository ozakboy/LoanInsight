<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  type TooltipItem,
} from 'chart.js'
import type { LoanResult } from '../types/loan'
import { formatCurrency } from '../utils/finance'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
)

const props = defineProps<{ result: LoanResult }>()

// 以「年」為單位抽樣，避免 360+ 點造成圖表雜亂
const yearly = computed(() => {
  const rows = props.result.schedule
  const points: { year: number; balance: number; cumInterest: number }[] = []
  let cumInterest = 0
  rows.forEach((row, idx) => {
    cumInterest += row.interest
    const isYearEnd = (idx + 1) % 12 === 0
    const isLast = idx === rows.length - 1
    if (isYearEnd || isLast) {
      points.push({
        year: Math.ceil((idx + 1) / 12),
        balance: row.balance,
        cumInterest,
      })
    }
  })
  return points
})

const chartData = computed(() => ({
  labels: yearly.value.map((p) => `${p.year}年`),
  datasets: [
    {
      label: '剩餘本金',
      data: yearly.value.map((p) => Math.round(p.balance)),
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.12)',
      fill: true,
      tension: 0.3,
      pointRadius: 0,
      pointHoverRadius: 4,
      borderWidth: 2,
    },
    {
      label: '累積利息',
      data: yearly.value.map((p) => Math.round(p.cumInterest)),
      borderColor: '#e11d48',
      backgroundColor: 'rgba(225, 29, 72, 0.08)',
      fill: true,
      tension: 0.3,
      pointRadius: 0,
      pointHoverRadius: 4,
      borderWidth: 2,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index' as const, intersect: false },
  plugins: {
    legend: { position: 'bottom' as const, labels: { font: { family: 'Noto Sans TC' } } },
    tooltip: {
      callbacks: {
        label: (ctx: TooltipItem<'line'>) =>
          `${ctx.dataset.label}：NT$ ${formatCurrency(ctx.parsed.y ?? 0)}`,
      },
    },
  },
  scales: {
    y: {
      ticks: {
        callback: (value: string | number) =>
          `${Math.round(Number(value) / 10000)}萬`,
      },
      grid: { color: 'rgba(148, 163, 184, 0.15)' },
    },
    x: { grid: { display: false } },
  },
}
</script>

<template>
  <div class="card p-6">
    <h3 class="text-base font-extrabold text-slate-900 flex items-center gap-2 mb-4">
      <span class="w-1.5 h-4 bg-indigo-600 rounded"></span>
      本金遞減 vs. 累積利息曲線
    </h3>
    <div class="h-72">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>
