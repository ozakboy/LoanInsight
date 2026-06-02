<script setup lang="ts">
import { reactive, computed } from 'vue'
import type { RefinanceInput } from '~/types/refinance'

useSeoMeta({
  title: '房貸轉貸試算 — LoanInsight 智貸見解',
  description:
    '想轉貸但不確定划不划算？輸入目前貸款狀況與新方案，立刻看出月付差距、總利息省下多少、扣除轉貸費用後是否真的有賺，並算出損益平衡月數。',
  ogTitle: '房貸轉貸試算｜LoanInsight 智貸見解',
  ogDescription:
    '量化轉貸的真實效益。考慮代書費、塗銷費、違約金與利息省下，給你客觀的「值不值得轉」答案。',
  ogType: 'website',
  ogUrl: 'https://loaninsight.ozakboy.life/refinance',
})

const DEFAULTS: RefinanceInput = {
  originalAmountWan: 800,
  originalYears: 30,
  currentRate: 2.5,
  paidMonths: 24,
  newRate: 2.0,
  newYears: 28,
  refinanceFees: 40000,
  penalty: 0,
}

const input = reactive<RefinanceInput>({ ...DEFAULTS })

const result = computed(() => calculateRefinance(input))

// URL 分享 + localStorage 自動儲存
const { copyShareLink, clearPersisted } = useStateSync('loaninsight-refinance', { input })

function resetAll() {
  Object.assign(input, DEFAULTS)
  clearPersisted()
}

const verdictStyles = computed(() => {
  if (result.value.netSaving > 200000)
    return {
      wrap: 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200',
      tag: 'text-emerald-700',
      title: 'text-emerald-900',
      label: '🟢 強烈建議轉貸',
    }
  if (result.value.netSaving > 0)
    return {
      wrap: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200',
      tag: 'text-blue-700',
      title: 'text-blue-900',
      label: '💡 可以考慮轉貸',
    }
  return {
    wrap: 'bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200',
    tag: 'text-rose-700',
    title: 'text-rose-900',
    label: '⚠️ 不建議轉貸',
  }
})
</script>

<template>
  <section class="card p-6 md:p-8">
    <span
      class="inline-flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-200 text-cyan-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
    >
      <span class="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
      轉貸試算
    </span>
    <h1
      class="text-2xl md:text-3xl font-black mt-3 tracking-tight leading-tight text-slate-900"
    >
      房貸轉貸試算 — 利率差多少才真的划算？
    </h1>
    <p class="text-slate-600 mt-3 text-base leading-relaxed">
      把<strong>代書費、塗銷費、違約金</strong>都算進去，告訴你轉貸後**真實**省下多少利息、
      多少個月後回本。所有計算在你瀏覽器端完成，不上傳任何資料。
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
    <!-- 目前貸款 -->
    <div class="card p-6 space-y-4">
      <h2 class="text-base font-extrabold text-slate-900 flex items-center gap-2 pb-1 border-b border-slate-100">
        <span class="w-1.5 h-4 bg-rose-500 rounded"></span>
        目前貸款狀況
      </h2>

      <RangeInput
        v-model="input.originalAmountWan"
        label="原始貸款金額"
        :min="100"
        :max="5000"
        :step="50"
        unit="萬元"
      />
      <RangeInput
        v-model="input.originalYears"
        label="原始貸款年限"
        :min="10"
        :max="40"
        :step="1"
        unit="年"
      />
      <RangeInput
        v-model="input.currentRate"
        label="目前年利率"
        :min="0.5"
        :max="6"
        :step="0.05"
        unit="%"
      />
      <RangeInput
        v-model="input.paidMonths"
        label="已繳期數"
        :min="0"
        :max="input.originalYears * 12"
        :step="1"
        unit="月"
        :hint="`剩餘 ${input.originalYears * 12 - input.paidMonths} 期`"
      />
    </div>

    <!-- 新方案 -->
    <div class="card p-6 space-y-4">
      <h2 class="text-base font-extrabold text-slate-900 flex items-center gap-2 pb-1 border-b border-slate-100">
        <span class="w-1.5 h-4 bg-emerald-500 rounded"></span>
        新貸款方案
      </h2>

      <RangeInput
        v-model="input.newRate"
        label="新貸款年利率"
        :min="0.5"
        :max="6"
        :step="0.05"
        unit="%"
        :hint="`比目前低 ${(input.currentRate - input.newRate).toFixed(2)}%`"
      />
      <RangeInput
        v-model="input.newYears"
        label="新貸款年限"
        :min="5"
        :max="40"
        :step="1"
        unit="年"
        hint="可拉長以降低月付，但會增加總利息"
      />

      <div>
        <label class="field-label">轉貸前置費用</label>
        <div class="relative">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">NT$</span>
          <input
            v-model.number="input.refinanceFees"
            type="number"
            inputmode="decimal"
            min="0"
            step="1000"
            class="field-input pl-12"
          />
        </div>
        <p class="text-xs text-slate-400 mt-1">代書費、塗銷費、火險、估價費，常見 3-6 萬</p>
      </div>

      <div>
        <label class="field-label">原貸款提前清償違約金</label>
        <div class="relative">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">NT$</span>
          <input
            v-model.number="input.penalty"
            type="number"
            inputmode="decimal"
            min="0"
            step="1000"
            class="field-input pl-12"
          />
        </div>
        <p class="text-xs text-slate-400 mt-1">通常綁約期 1-3 年內才會有；無則填 0</p>
      </div>
    </div>
  </section>

  <!-- 結論橫幅 -->
  <section class="card p-6 border" :class="verdictStyles.wrap">
    <p
      class="text-xs font-bold uppercase tracking-widest mb-1"
      :class="verdictStyles.tag"
    >
      {{ verdictStyles.label }}
    </p>
    <p
      class="text-xl md:text-2xl font-black"
      :class="verdictStyles.title"
    >
      <template v-if="result.netSaving > 0">
        轉貸後預計可省下 NT$ {{ formatCurrency(result.netSaving) }}
      </template>
      <template v-else>
        轉貸後反而多繳 NT$ {{ formatCurrency(-result.netSaving) }}
      </template>
    </p>
    <p class="text-sm mt-2 text-slate-600 leading-relaxed">
      已扣除前置費用 NT$ {{ formatCurrency(result.upfrontCost) }}。
      <template v-if="result.breakEvenMonths > 0">
        損益平衡點約 **{{ result.breakEvenMonths }} 個月**（{{ Math.floor(result.breakEvenMonths / 12) }} 年
        {{ result.breakEvenMonths % 12 }} 月）後省下的月付差就能 cover 費用。
      </template>
      <template v-else>
        新月付未變輕，無法靠每月省下的錢 cover 前置成本。
      </template>
    </p>
  </section>

  <!-- 詳細對比 -->
  <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="card p-6 space-y-3">
      <h3 class="text-base font-extrabold text-rose-700 flex items-center gap-2">
        <span class="w-1.5 h-4 bg-rose-500 rounded"></span>
        若不轉貸（維持原貸）
      </h3>
      <dl class="grid grid-cols-2 gap-y-2 text-sm">
        <dt class="text-slate-500">剩餘本金</dt>
        <dd class="text-right font-bold">NT$ {{ formatCurrency(result.currentBalance) }}</dd>

        <dt class="text-slate-500">剩餘期數</dt>
        <dd class="text-right font-bold">{{ result.remainingMonths }} 月</dd>

        <dt class="text-slate-500">月付</dt>
        <dd class="text-right font-bold">NT$ {{ formatCurrency(result.oldMonthlyPayment) }}</dd>

        <dt class="text-slate-500 col-span-2 pt-2 border-t border-slate-100"></dt>
        <dt class="text-slate-500 font-bold">剩餘總利息</dt>
        <dd class="text-right font-black text-rose-700">
          NT$ {{ formatCurrency(result.oldRemainingInterest) }}
        </dd>
      </dl>
    </div>

    <div class="card p-6 space-y-3">
      <h3 class="text-base font-extrabold text-emerald-700 flex items-center gap-2">
        <span class="w-1.5 h-4 bg-emerald-500 rounded"></span>
        轉貸到新方案
      </h3>
      <dl class="grid grid-cols-2 gap-y-2 text-sm">
        <dt class="text-slate-500">新貸款本金</dt>
        <dd class="text-right font-bold">NT$ {{ formatCurrency(result.currentBalance) }}</dd>

        <dt class="text-slate-500">新貸款期數</dt>
        <dd class="text-right font-bold">{{ input.newYears * 12 }} 月</dd>

        <dt class="text-slate-500">新月付</dt>
        <dd class="text-right font-bold">
          NT$ {{ formatCurrency(result.newMonthlyPayment) }}
          <span
            class="text-xs ml-1"
            :class="result.monthlyPaymentDiff > 0 ? 'text-emerald-600' : 'text-rose-500'"
          >
            ({{ result.monthlyPaymentDiff > 0 ? '−' : '+' }}{{
              formatCurrency(Math.abs(result.monthlyPaymentDiff))
            }})
          </span>
        </dd>

        <dt class="text-slate-500 col-span-2 pt-2 border-t border-slate-100"></dt>
        <dt class="text-slate-500 font-bold">新方案總利息</dt>
        <dd class="text-right font-black text-emerald-700">
          NT$ {{ formatCurrency(result.newTotalInterest) }}
        </dd>
      </dl>
    </div>
  </section>

  <!-- 廣告 -->
  <AdSlot format="banner" />

  <!-- 注意事項 -->
  <section class="card p-6 bg-slate-50/50">
    <h3 class="text-sm font-bold text-slate-700 mb-2">⚠️ 轉貸前必須確認的事</h3>
    <ul class="text-xs text-slate-600 list-disc pl-5 space-y-1 leading-relaxed">
      <li><strong>綁約違約金</strong>：簽約後通常 1-3 年內提前清償會被收違約金，常見原貸款金額的 0.5-1%。</li>
      <li><strong>不只看利率</strong>：新銀行可能塞「綁約 3 年」「特定信用卡」「保險」等隱藏條件。</li>
      <li><strong>轉貸不只是換利率</strong>：新方案可能改變年限、寬限期、利率類型，都會影響真實成本。</li>
      <li><strong>持有時間 vs 損益平衡點</strong>：若你 5 年內可能會搬家賣房，要算清楚轉貸後是否真能撐到回本。</li>
      <li><strong>新方案的真實 APR</strong>：把新方案的開辦費也算進去，用 LoanInsight 的雙銀行 PK 工具對比。</li>
    </ul>
  </section>

  <!-- 跳到主試算 / 文章 -->
  <section class="card p-6">
    <h3 class="text-base font-extrabold text-slate-900 mb-2">下一步</h3>
    <div class="flex flex-wrap gap-3">
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition"
      >
        雙銀行方案 PK →
      </NuxtLink>
      <NuxtLink
        to="/blog/refinance-worth-it"
        class="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold px-4 py-2 rounded-lg transition"
      >
        閱讀：轉貸划不划算？完整解析 →
      </NuxtLink>
    </div>
  </section>
</template>
