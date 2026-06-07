<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { LoanInput, FinanceProfile } from '~/types/loan'

useSeoMeta({
  title: 'LoanInsight 智貸見解 — 真實 APR 貸款試算與財務診斷工具',
  description:
    '結合真實 APR（含開辦費攤還）與分階段 DSR 收支診斷的現代化貸款試算工具，支援兩段式利率、寬限期與雙銀行同屏 PK。資料不外流、全前端即時計算。',
  ogTitle: 'LoanInsight 智貸見解｜真實 APR 貸款試算',
  ogDescription:
    '揭露隱藏的開辦費成本、分階段收支壓力診斷、雙銀行同屏 PK。零後端、不蒐集任何個人財務資料。',
  ogType: 'website',
  ogUrl: 'https://loaninsight.ozakboy.life/',
  twitterCard: 'summary_large_image',
})

// 取得最新 3 篇文章用於首頁文章區塊（預渲染時打包進 HTML）
const { data: latestPosts } = await useAsyncData('home-latest-posts', () =>
  queryContent('/blog')
    .where({ _draft: { $ne: true } })
    .sort({ date: -1 })
    .limit(3)
    .find(),
)

function formatDate(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

// ---- 預設值（reset 也用同一份）----
const DEFAULT_PROFILE: FinanceProfile = {
  monthlyIncome: 80000,
  existingExpenses: 25000,
}
const DEFAULT_A: LoanInput = {
  name: '銀行 A',
  amountWan: 800,
  years: 30,
  gracePeriodMonths: 0,
  rateType: 'dual',
  stage1Months: 24,
  stage1Rate: 1.7,
  stage2Rate: 2.1,
  originationFee: 30000,
  extraMonthlyPrincipal: 0,
}
const DEFAULT_B: LoanInput = {
  name: '銀行 B',
  amountWan: 800,
  years: 30,
  gracePeriodMonths: 0,
  rateType: 'single',
  stage1Months: 24,
  stage1Rate: 2.06,
  stage2Rate: 2.4,
  originationFee: 9000,
  extraMonthlyPrincipal: 0,
}

// 個人財務狀況（雙方案共用，用於 DSR）
const profile = reactive<FinanceProfile>({ ...DEFAULT_PROFILE })

const { input: inputA, result: resultA } = useLoanScenario({ ...DEFAULT_A })
const { input: inputB, result: resultB } = useLoanScenario({ ...DEFAULT_B })

const diagA = useDiagnosis(resultA, profile)
const diagB = useDiagnosis(resultB, profile)

const activeChart = ref<'A' | 'B'>('A')

// URL hash 分享連結 + localStorage 自動儲存
const { copyShareLink, clearPersisted } = useStateSync('loaninsight-home', {
  profile,
  inputA,
  inputB,
})

function resetAll() {
  Object.assign(profile, DEFAULT_PROFILE)
  Object.assign(inputA, DEFAULT_A)
  Object.assign(inputB, DEFAULT_B)
  clearPersisted()
}
</script>

<template>
  <!-- Hero 介紹（SEO 文案） -->
  <section class="card p-6 md:p-8">
    <span
      class="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
    >
      <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
      貸款試算 · 財務診斷
    </span>
    <h1 class="text-2xl md:text-3xl font-black mt-3 tracking-tight leading-tight text-slate-900">
      免費房貸試算工具 — 真實 APR、寬限期、兩段式利率一次算清
    </h1>
    <p class="text-slate-600 mt-3 text-base leading-relaxed">
      LoanInsight 結合
      <strong class="text-slate-900">真實 APR（含開辦費攤還）</strong>
      與
      <strong class="text-slate-900">分階段 DSR 收支動態診斷</strong>，
      支援兩段式利率、寬限期、雙銀行同屏 PK。讓隱藏的貸款成本無所遁形，
      <strong class="text-slate-900">所有計算皆於瀏覽器端完成、不蒐集任何個人財務資料</strong>。
    </p>
    <div class="mt-5 pt-4 border-t border-slate-100">
      <ShareActions
        :share="copyShareLink"
        :reset="resetAll"
        hint="輸入會自動存在本機 — 下次回來自動恢復"
      />
    </div>
  </section>

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
          <span
            class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium"
            >NT$</span
          >
          <input
            v-model.number="profile.monthlyIncome"
            type="number"
            inputmode="decimal"
            min="0"
            step="1000"
            class="field-input pl-12"
          />
        </div>
      </div>
      <div>
        <label class="field-label">既有固定支出（不含本貸款）</label>
        <div class="relative">
          <span
            class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium"
            >NT$</span
          >
          <input
            v-model.number="profile.existingExpenses"
            type="number"
            inputmode="decimal"
            min="0"
            step="1000"
            class="field-input pl-12"
          />
        </div>
      </div>
    </div>
  </section>

  <!-- 雙方案輸入 + 診斷
       桌面 (lg+)：subgrid 讓兩家銀行的 LoanInputPanel 對齊、DiagnosisCard 也對齊，
       即使 A=兩段式、B=一段式（高度不同）也不會跑位。
       行動：維持「Input A → Result A → Input B → Result B」垂直堆疊順序。 -->
  <div class="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-[auto_auto] gap-6">
    <div class="space-y-6 lg:space-y-0 lg:grid lg:grid-rows-subgrid lg:row-span-2 lg:gap-6">
      <LoanInputPanel v-model="inputA" accent="blue" />
      <DiagnosisCard :diagnosis="diagA" :name="inputA.name" />
    </div>
    <div class="space-y-6 lg:space-y-0 lg:grid lg:grid-rows-subgrid lg:row-span-2 lg:gap-6">
      <LoanInputPanel v-model="inputB" accent="indigo" />
      <DiagnosisCard :diagnosis="diagB" :name="inputB.name" />
    </div>
  </div>

  <!-- 報表交界橫幅廣告 -->
  <AdSlot format="banner" />

  <!-- 攤還曲線（可切換方案） -->
  <section class="space-y-3">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="no-print flex items-center gap-2">
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
      <ExportActions
        :name="activeChart === 'A' ? inputA.name : inputB.name"
        :result="activeChart === 'A' ? resultA : resultB"
      />
    </div>
    <ClientOnly>
      <AmortizationChart :result="activeChart === 'A' ? resultA : resultB" />
      <template #fallback>
        <div class="card p-6 h-72 flex items-center justify-center text-slate-400 text-sm">
          載入圖表中…
        </div>
      </template>
    </ClientOnly>
  </section>

  <!-- 雙銀行 PK -->
  <BankComparison
    :name-a="inputA.name"
    :name-b="inputB.name"
    :result-a="resultA"
    :result-b="resultB"
  />

  <!-- 最新文章區塊（導流 + SEO 內部連結） -->
  <section class="card p-6">
    <div class="flex items-center justify-between gap-3 mb-4">
      <h2 class="text-lg font-extrabold text-slate-900 flex items-center gap-2">
        <span class="w-1.5 h-5 bg-amber-500 rounded"></span>
        貸款知識文章
      </h2>
      <NuxtLink
        to="/blog"
        class="text-xs font-bold text-blue-600 hover:text-blue-700 transition shrink-0"
      >
        全部文章 →
      </NuxtLink>
    </div>
    <p class="text-sm text-slate-600 mb-5">
      由淺入深，幫你避開常見陷阱，做出更聰明的貸款決策。
    </p>
    <div v-if="latestPosts && latestPosts.length" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <NuxtLink
        v-for="post in latestPosts"
        :key="post._path"
        :to="post._path"
        class="block rounded-xl border border-slate-200 hover:border-blue-300 p-4 transition group bg-slate-50/30 hover:bg-white"
      >
        <p class="text-[11px] font-bold text-slate-400 mb-1">
          {{ formatDate(post.date as string | undefined) }}
        </p>
        <h3
          class="text-sm font-extrabold text-slate-900 group-hover:text-blue-700 transition leading-snug"
        >
          {{ post.title }}
        </h3>
        <p
          v-if="post.description"
          class="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-3"
        >
          {{ post.description }}
        </p>
        <p class="text-[11px] font-bold text-blue-600 mt-3 group-hover:translate-x-0.5 transition">
          繼續閱讀 →
        </p>
      </NuxtLink>
    </div>
  </section>

  <!-- 免責聲明 -->
  <p class="text-xs text-slate-400 leading-relaxed px-1">
    ※ 本工具所有計算皆於瀏覽器端即時完成，不蒐集或上傳任何個人財務資料。試算結果採等額本息法與牛頓迭代法估算，
    實際數字依各銀行計息方式、撥款日與費用認定而異，僅供財務規劃參考，不構成任何貸款或投資建議。
  </p>
</template>
