<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { LoanInput, FinanceProfile } from './types/loan'
import { useLoanScenario, useDiagnosis } from './composables/useLoanCalculator'
import LoanInputPanel from './components/LoanInputPanel.vue'
import DiagnosisCard from './components/DiagnosisCard.vue'
import AmortizationChart from './components/AmortizationChart.vue'
import BankComparison from './components/BankComparison.vue'
import AdSlot from './components/AdSlot.vue'

// 個人財務狀況（雙方案共用，用於 DSR）
const profile = reactive<FinanceProfile>({
  monthlyIncome: 80000,
  existingExpenses: 25000,
})

const defaultA: LoanInput = {
  name: '銀行 A',
  amountWan: 800,
  years: 30,
  gracePeriodMonths: 0,
  rateType: 'dual',
  stage1Months: 24,
  stage1Rate: 1.7,
  stage2Rate: 2.1,
  originationFee: 30000,
}

const defaultB: LoanInput = {
  name: '銀行 B',
  amountWan: 800,
  years: 30,
  gracePeriodMonths: 0,
  rateType: 'single',
  stage1Months: 24,
  stage1Rate: 2.06,
  stage2Rate: 2.4,
  originationFee: 9000,
}

const { input: inputA, result: resultA } = useLoanScenario(defaultA)
const { input: inputB, result: resultB } = useLoanScenario(defaultB)

const diagA = useDiagnosis(resultA, profile)
const diagB = useDiagnosis(resultB, profile)

const activeChart = ref<'A' | 'B'>('A')
</script>

<template>
  <!-- 頂部視覺 -->
  <header
    class="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white py-14 px-6 relative overflow-hidden border-b border-indigo-800"
  >
    <div
      class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent"
    ></div>
    <div class="max-w-6xl mx-auto relative z-10">
      <span
        class="inline-flex items-center gap-1.5 bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
      >
        <span class="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
        貸款試算 · 財務診斷
      </span>
      <h1 class="text-3xl md:text-5xl font-black mt-4 tracking-tight leading-tight">
        LoanInsight
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
          智貸見解
        </span>
      </h1>
      <p class="text-slate-300 mt-4 text-base md:text-lg max-w-3xl font-light leading-relaxed">
        結合<strong class="text-white font-medium">真實 APR（含開辦費攤還）</strong>與<strong
          class="text-white font-medium"
          >分階段收支動態診斷</strong
        >的現代化貸款試算工具。支援兩段式利率、寬限期與雙銀行同屏 PK，讓隱藏的貸款成本無所遁形。
      </p>
    </div>
  </header>

  <main class="py-10">
    <div class="flex justify-center gap-6">
      <!-- 左側留白：與右側廣告對稱，維持主內容置中（僅超寬螢幕顯示） -->
      <div class="hidden min-[1800px]:block w-[300px] shrink-0" aria-hidden="true"></div>

      <!-- 主內容（永遠使用完整寬度，不被廣告壓縮） -->
      <div class="w-full max-w-6xl min-w-0 px-4 md:px-6 space-y-8">
        <!-- 個人財務狀況 -->
        <section class="card p-6">
          <h2 class="text-base font-extrabold text-slate-900 flex items-center gap-2 mb-4">
            <span class="w-1.5 h-4 bg-emerald-500 rounded"></span>
            個人財務狀況（用於 DSR 收支診斷）
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label class="field-label">月收入</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">NT$</span>
                <input
                  v-model.number="profile.monthlyIncome"
                  type="number"
                  min="0"
                  step="1000"
                  class="field-input pl-12"
                />
              </div>
            </div>
            <div>
              <label class="field-label">既有固定支出（不含本貸款）</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">NT$</span>
                <input
                  v-model.number="profile.existingExpenses"
                  type="number"
                  min="0"
                  step="1000"
                  class="field-input pl-12"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- 雙方案輸入 + 診斷 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="space-y-6">
            <LoanInputPanel v-model="inputA" accent="blue" />
            <DiagnosisCard :diagnosis="diagA" :name="inputA.name" />
          </div>
          <div class="space-y-6">
            <LoanInputPanel v-model="inputB" accent="indigo" />
            <DiagnosisCard :diagnosis="diagB" :name="inputB.name" />
          </div>
        </div>

        <!-- 報表交界橫幅廣告 -->
        <AdSlot format="banner" label="贊助廣告" />

        <!-- 攤還曲線（可切換方案） -->
        <section class="space-y-3">
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="px-4 py-1.5 rounded-full text-sm font-bold transition"
              :class="
                activeChart === 'A'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-white text-slate-500 border border-slate-200'
              "
              @click="activeChart = 'A'"
            >
              {{ inputA.name }}
            </button>
            <button
              type="button"
              class="px-4 py-1.5 rounded-full text-sm font-bold transition"
              :class="
                activeChart === 'B'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-white text-slate-500 border border-slate-200'
              "
              @click="activeChart = 'B'"
            >
              {{ inputB.name }}
            </button>
          </div>
          <AmortizationChart :result="activeChart === 'A' ? resultA : resultB" />
        </section>

        <!-- 雙銀行 PK -->
        <BankComparison
          :name-a="inputA.name"
          :name-b="inputB.name"
          :result-a="resultA"
          :result-b="resultB"
        />

        <!-- 免責聲明 -->
        <p class="text-xs text-slate-400 leading-relaxed px-1">
          ※ 本工具所有計算皆於瀏覽器端即時完成，不蒐集或上傳任何個人財務資料。試算結果採等額本息法與牛頓迭代法估算，
          實際數字依各銀行計息方式、撥款日與費用認定而異，僅供財務規劃參考，不構成任何貸款或投資建議。
        </p>
      </div>

      <!-- 右側留白區：黏性摩天大樓廣告（僅超寬螢幕，不佔用主內容寬度） -->
      <div class="hidden min-[1800px]:block w-[300px] shrink-0">
        <div class="sticky top-6">
          <AdSlot format="skyscraper" label="贊助廣告" />
        </div>
      </div>
    </div>
  </main>

  <footer
    class="bg-slate-900 text-slate-400 py-10 text-center text-xs border-t border-slate-800 tracking-wider mt-12"
  >
    <div class="max-w-6xl mx-auto px-6 space-y-2">
      <p class="text-slate-300 font-medium">LoanInsight 智貸見解 · 全功能貸款試算與利息工程平台</p>
      <p>© 2026 LoanInsight Project. Built with Vue 3 + Vite.</p>
    </div>
  </footer>
</template>
