<script setup lang="ts">
import ratesData from '~/data/rates.json'

interface RateItem {
  key: string
  label: string
  value: number
  unit: string
}
interface RatesData {
  updated: string
  auto: boolean
  source: string
  sourceUrl: string
  note: string
  rates: RateItem[]
}

const data = ratesData as RatesData
</script>

<template>
  <section class="card p-5 md:p-6">
    <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
      <h2 class="text-base font-extrabold text-slate-900 flex items-center gap-2">
        <span class="w-1.5 h-4 bg-sky-500 rounded"></span>
        市場參考利率
      </h2>
      <span class="text-[11px] text-slate-400">
        資料來源：{{ data.source }} ·
        {{ data.auto ? '每週自動更新' : '參考值' }} · 更新於 {{ data.updated }}
      </span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div
        v-for="r in data.rates"
        :key="r.key"
        class="rounded-xl border border-slate-200 bg-slate-50/50 p-3"
      >
        <p class="text-xs text-slate-500 leading-snug">{{ r.label }}</p>
        <p class="text-xl font-black text-slate-900 mt-1">
          {{ r.value }}<span class="text-sm font-bold text-slate-500">{{ r.unit }}</span>
        </p>
      </div>
    </div>

    <p class="text-[11px] text-slate-400 mt-3 leading-relaxed">
      ⓘ {{ data.note }}
      <a
        :href="data.sourceUrl"
        target="_blank"
        rel="noopener"
        class="text-blue-600 hover:text-blue-700 underline underline-offset-2"
        >查看{{ data.source }}原始牌告 →</a
      >
    </p>
  </section>
</template>
