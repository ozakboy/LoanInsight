<script setup lang="ts">
import { reactive, computed } from 'vue'
import type { PersonalLoanInput } from '~/types/personalLoan'

useSeoMeta({
  title: '信貸試算 — LoanInsight 智貸見解',
  description:
    '免費信貸試算工具：算出真實月付、總利息、含開辦費的 APR，並檢查是否超過金管會 DBR 22 倍規範。資料不上傳、瀏覽器端即時計算。',
  ogTitle: '信貸試算｜LoanInsight 智貸見解',
  ogDescription:
    '輸入信貸金額、年限、利率與既有負債，立刻算出 APR、月付與 DBR 22 倍規範檢查。',
  ogType: 'website',
  ogUrl: 'https://loaninsight.ozakboy.life/personal-loan',
})

const DEFAULTS: PersonalLoanInput = {
  amountWan: 50,
  years: 5,
  rate: 4.5,
  originationFee: 5000,
  monthlyIncome: 60000,
  existingUnsecuredDebt: 0,
}

const input = reactive<PersonalLoanInput>({ ...DEFAULTS })
const result = computed(() => calculatePersonalLoan(input))

const { copyShareLink, clearPersisted } = useStateSync('loaninsight-personal-loan', {
  input,
})

function resetAll() {
  Object.assign(input, DEFAULTS)
  clearPersisted()
}

const dbrStyles = computed(() => {
  if (result.value.dbrLevel === 'exceeded')
    return {
      wrap: 'bg-rose-50 border-rose-200',
      tag: 'text-rose-700',
      title: 'text-rose-900',
      label: '🔴 超過 DBR 22 倍上限',
      message: '銀行依規定不會核貸這個金額。請降低申請金額、先還清部分既有負債、或拉高月收入證明。',
    }
  if (result.value.dbrLevel === 'warning')
    return {
      wrap: 'bg-amber-50 border-amber-200',
      tag: 'text-amber-700',
      title: 'text-amber-900',
      label: '🟡 接近 DBR 上限',
      message: '雖未超過 22 倍但已接近上限，銀行可能會調降額度或拉高利率以控制風險。',
    }
  return {
    wrap: 'bg-emerald-50 border-emerald-200',
    tag: 'text-emerald-700',
    title: 'text-emerald-900',
    label: '🟢 在 DBR 規範內',
    message: '無擔保負債總額遠低於月收入 22 倍，銀行核貸機會高，利率也可能談得較低。',
  }
})
</script>

<template>
  <!-- Hero -->
  <section class="card p-6 md:p-8">
    <span
      class="inline-flex items-center gap-1.5 bg-pink-500/10 border border-pink-200 text-pink-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
    >
      <span class="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
      信貸試算
    </span>
    <h1
      class="text-2xl md:text-3xl font-black mt-3 tracking-tight leading-tight text-slate-900"
    >
      信貸試算 — 真實 APR 與 DBR 22 倍規範檢查
    </h1>
    <p class="text-slate-600 mt-3 text-base leading-relaxed">
      把<strong>信用查詢費、開辦費</strong>都算進去，告訴你信貸的真實年利率（APR），
      並檢查是否超過<strong>金管會 DBR 22 倍規範</strong>影響核貸。
      所有計算瀏覽器端完成，不上傳資料。
    </p>
    <div class="mt-5 pt-4 border-t border-slate-100">
      <ShareActions
        :share="copyShareLink"
        :reset="resetAll"
        hint="輸入會自動存在本機 — 下次回來自動恢復"
      />
    </div>
  </section>

  <!-- 輸入區 -->
  <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- 信貸條件 -->
    <div class="card p-6 space-y-4">
      <h2 class="text-base font-extrabold text-slate-900 flex items-center gap-2 pb-1 border-b border-slate-100">
        <span class="w-1.5 h-4 bg-pink-500 rounded"></span>
        信貸方案條件
      </h2>

      <RangeInput
        v-model="input.amountWan"
        label="貸款金額"
        :min="5"
        :max="500"
        :step="5"
        unit="萬元"
      />
      <RangeInput
        v-model="input.years"
        label="貸款年限"
        :min="1"
        :max="10"
        :step="1"
        unit="年"
        :hint="`共 ${input.years * 12} 期`"
      />
      <RangeInput
        v-model="input.rate"
        label="年利率"
        :min="2"
        :max="16"
        :step="0.1"
        unit="%"
        hint="信貸常見 4-12%，依信用評分浮動"
      />

      <div>
        <label class="field-label">開辦費 / 帳管費（一次性）</label>
        <div class="relative">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">NT$</span>
          <input
            v-model.number="input.originationFee"
            type="number"
            inputmode="decimal"
            min="0"
            step="500"
            class="field-input pl-12"
          />
        </div>
        <p class="text-xs text-slate-400 mt-1">含信用查詢費、帳管費，常見 3,000-10,000</p>
      </div>
    </div>

    <!-- 收入與既有負債（DBR 用）-->
    <div class="card p-6 space-y-4">
      <h2 class="text-base font-extrabold text-slate-900 flex items-center gap-2 pb-1 border-b border-slate-100">
        <span class="w-1.5 h-4 bg-indigo-500 rounded"></span>
        收入與既有負債（DBR）
      </h2>

      <div>
        <label class="field-label">月收入</label>
        <div class="relative">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">NT$</span>
          <input
            v-model.number="input.monthlyIncome"
            type="number"
            inputmode="decimal"
            min="0"
            step="1000"
            class="field-input pl-12"
          />
        </div>
        <p class="text-xs text-slate-400 mt-1">薪資 / 經常性收入，銀行會以扣繳憑單驗證</p>
      </div>

      <div>
        <label class="field-label">既有無擔保負債</label>
        <div class="relative">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">NT$</span>
          <input
            v-model.number="input.existingUnsecuredDebt"
            type="number"
            inputmode="decimal"
            min="0"
            step="10000"
            class="field-input pl-12"
          />
        </div>
        <p class="text-xs text-slate-400 mt-1">
          其他信貸、信用卡循環餘額、現金卡。**不含**房貸、車貸這類有擔保的。
        </p>
      </div>

      <div
        class="rounded-xl border p-3 text-xs leading-relaxed"
        :class="dbrStyles.wrap"
      >
        <p class="font-bold mb-1" :class="dbrStyles.tag">📐 什麼是 DBR 22 倍？</p>
        <p class="text-slate-600">
          金管會規定：銀行給單一借款人的「**所有無擔保負債總餘額**」不得超過月收入 22 倍。
          超過會被退件、降低額度或要求清償部分後再申請。
        </p>
      </div>
    </div>
  </section>

  <!-- 結果區：DBR 警示 -->
  <section class="card p-6 border" :class="dbrStyles.wrap">
    <p
      class="text-xs font-bold uppercase tracking-widest mb-1"
      :class="dbrStyles.tag"
    >
      {{ dbrStyles.label }}
    </p>
    <p
      class="text-xl md:text-2xl font-black"
      :class="dbrStyles.title"
    >
      DBR {{ result.dbrTimes.toFixed(1) }} 倍 / 22 倍上限 （已用 {{ (result.dbrUsageRatio * 100).toFixed(0) }}%）
    </p>
    <p class="text-sm mt-2 text-slate-600 leading-relaxed">{{ dbrStyles.message }}</p>
  </section>

  <!-- 結果區：金額試算 -->
  <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="card p-6">
      <p class="text-xs font-semibold text-pink-700/80">真實 APR（含開辦費）</p>
      <p class="text-3xl font-black text-pink-800 mt-1">{{ formatPercent(result.apr) }}</p>
      <p class="text-[11px] text-pink-600/70 mt-0.5">
        牌告利率 {{ formatPercent(input.rate) }} + 開辦費攤還
      </p>
    </div>

    <div class="card p-6">
      <p class="text-xs font-semibold text-slate-500">每月還款金額</p>
      <p class="text-3xl font-black text-slate-900 mt-1">
        NT$ {{ formatCurrency(result.monthlyPayment) }}
      </p>
      <p class="text-[11px] text-slate-400 mt-0.5">共 {{ result.totalMonths }} 期</p>
    </div>
  </section>

  <!-- 詳細數字 -->
  <section class="card p-6">
    <h3 class="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
      <span class="w-1.5 h-4 bg-pink-500 rounded"></span>
      詳細試算
    </h3>
    <dl class="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
      <div class="flex justify-between border-b border-slate-100 py-2">
        <dt class="text-slate-500">本金</dt>
        <dd class="font-bold">NT$ {{ formatCurrency(result.principal) }}</dd>
      </div>
      <div class="flex justify-between border-b border-slate-100 py-2">
        <dt class="text-slate-500">開辦費</dt>
        <dd class="font-bold">NT$ {{ formatCurrency(result.originationFee) }}</dd>
      </div>
      <div class="flex justify-between border-b border-slate-100 py-2">
        <dt class="text-slate-500">累積總利息</dt>
        <dd class="font-bold text-rose-600">NT$ {{ formatCurrency(result.totalInterest) }}</dd>
      </div>
      <div class="flex justify-between border-b border-slate-100 py-2">
        <dt class="text-slate-500">總成本（本+息+費）</dt>
        <dd class="font-black text-slate-900">NT$ {{ formatCurrency(result.totalCost) }}</dd>
      </div>
      <div class="flex justify-between border-b border-slate-100 py-2 sm:col-span-2">
        <dt class="text-slate-500">總無擔保負債（本次 + 既有）</dt>
        <dd class="font-bold">NT$ {{ formatCurrency(result.totalUnsecuredDebt) }}</dd>
      </div>
      <div class="flex justify-between border-b border-slate-100 py-2 sm:col-span-2">
        <dt class="text-slate-500">DBR 22 倍上限金額</dt>
        <dd class="font-bold">NT$ {{ formatCurrency(result.dbrLimitAmount) }}</dd>
      </div>
    </dl>
  </section>

  <!-- 廣告 -->
  <AdSlot format="banner" />

  <!-- 注意事項 -->
  <section class="card p-6 bg-slate-50/50">
    <h3 class="text-sm font-bold text-slate-700 mb-2">⚠️ 信貸常見陷阱</h3>
    <ul class="text-xs text-slate-600 list-disc pl-5 space-y-1 leading-relaxed">
      <li>「**首期 0 利率**」常常**第二期起跳到 10% 以上**，總成本反而高</li>
      <li>「**前 N 期月付 999**」是把後面期數的本金挪到後面，本質是欠更多</li>
      <li>**信用查詢費**：銀行查聯徵會收 100-300 元，每次都會記錄</li>
      <li>**短期內申請多家**信貸（超過 3 家）會被聯徵記為「**密集查詢**」，信用評分扣分</li>
      <li>**信貸用途**：用來整合卡債 OK；拿去投資、買幣，風險極高</li>
    </ul>
  </section>

  <!-- 跳到其他工具 -->
  <section class="card p-6">
    <h3 class="text-base font-extrabold text-slate-900 mb-2">其他工具</h3>
    <div class="flex flex-wrap gap-3">
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition"
      >
        房貸試算 →
      </NuxtLink>
      <NuxtLink
        to="/refinance"
        class="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold px-4 py-2 rounded-lg transition"
      >
        房貸轉貸試算 →
      </NuxtLink>
      <NuxtLink
        to="/blog/personal-loan-guide"
        class="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold px-4 py-2 rounded-lg transition"
      >
        閱讀：信貸利率怎麼比 →
      </NuxtLink>
    </div>
  </section>
</template>
