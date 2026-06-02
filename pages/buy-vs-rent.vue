<script setup lang="ts">
import { reactive, computed } from 'vue'
import type { BuyVsRentInput } from '~/types/buyVsRent'

useSeoMeta({
  title: '房貸 vs 租屋試算 — LoanInsight 智貸見解',
  description:
    '到底是租划算還是買划算？輸入房價、月租、利率、投資報酬等條件，立刻看出 N 年後買房 vs 租屋的淨成本差距、總現金流出、最終資產淨值。全前端即時計算，不蒐集任何資料。',
  ogTitle: '房貸 vs 租屋試算｜LoanInsight 智貸見解',
  ogDescription:
    '量化買房與租屋的真實成本差距。考慮房價漲幅、投資機會成本、稅費與租金漲幅，給你客觀的對比。',
  ogType: 'website',
  ogUrl: 'https://loaninsight.ozakboy.life/buy-vs-rent',
})

const input = reactive<BuyVsRentInput>({
  housePriceWan: 1500,
  downPaymentPercent: 20,
  loanRate: 2.1,
  loanYears: 30,
  annualTaxPercent: 0.15,
  annualMaintenancePercent: 0.5,
  monthlyRent: 30000,
  rentGrowth: 2,
  housePriceGrowth: 2,
  investmentReturn: 5,
  holdYears: 10,
})

const result = computed(() => calculateBuyVsRent(input))
</script>

<template>
  <section class="card p-6 md:p-8">
    <span
      class="inline-flex items-center gap-1.5 bg-purple-500/10 border border-purple-200 text-purple-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
    >
      <span class="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
      決策試算
    </span>
    <h1
      class="text-2xl md:text-3xl font-black mt-3 tracking-tight leading-tight text-slate-900"
    >
      房貸 vs 租屋試算 — N 年後到底誰划算？
    </h1>
    <p class="text-slate-600 mt-3 text-base leading-relaxed">
      把<strong>房價漲幅、投資機會成本、稅費、租金漲幅</strong>全部考慮進來，
      告訴你 N 年後買房與租屋的「淨成本」差距、終局資產淨值。所有計算皆於瀏覽器端完成。
    </p>
  </section>

  <!-- 輸入面板 -->
  <section class="card p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- 左欄：房屋與貸款 -->
    <div class="space-y-4">
      <h2 class="text-base font-extrabold text-slate-900 flex items-center gap-2 pb-1 border-b border-slate-100">
        <span class="w-1.5 h-4 bg-blue-600 rounded"></span>
        房屋與貸款
      </h2>

      <RangeInput
        v-model="input.housePriceWan"
        label="房屋總價"
        :min="300"
        :max="10000"
        :step="50"
        unit="萬元"
      />
      <RangeInput
        v-model="input.downPaymentPercent"
        label="自備款比例"
        :min="10"
        :max="50"
        :step="1"
        unit="%"
        :hint="`約 NT$ ${formatCurrency(input.housePriceWan * 10000 * input.downPaymentPercent / 100)}`"
      />
      <RangeInput
        v-model="input.loanRate"
        label="房貸年利率"
        :min="1"
        :max="6"
        :step="0.05"
        unit="%"
      />
      <RangeInput
        v-model="input.loanYears"
        label="房貸年限"
        :min="10"
        :max="40"
        :step="1"
        unit="年"
      />
      <RangeInput
        v-model="input.annualTaxPercent"
        label="年稅費（房屋+地價稅）"
        :min="0"
        :max="2"
        :step="0.05"
        unit="%"
        hint="占房價比例，台灣自住約 0.1-0.3%"
      />
      <RangeInput
        v-model="input.annualMaintenancePercent"
        label="年維護費（管理費+保險+修繕）"
        :min="0"
        :max="3"
        :step="0.1"
        unit="%"
        hint="占房價比例，常見 0.5-1.5%"
      />
    </div>

    <!-- 右欄：租屋與市場假設 -->
    <div class="space-y-4">
      <h2 class="text-base font-extrabold text-slate-900 flex items-center gap-2 pb-1 border-b border-slate-100">
        <span class="w-1.5 h-4 bg-amber-500 rounded"></span>
        租屋與市場假設
      </h2>

      <div>
        <label class="field-label">月租金（同等房屋）</label>
        <div class="relative">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">NT$</span>
          <input
            v-model.number="input.monthlyRent"
            type="number"
            min="0"
            step="1000"
            class="field-input pl-12"
          />
        </div>
      </div>
      <RangeInput
        v-model="input.rentGrowth"
        label="租金年漲幅"
        :min="0"
        :max="8"
        :step="0.5"
        unit="%"
      />
      <RangeInput
        v-model="input.housePriceGrowth"
        label="房價年漲幅"
        :min="-3"
        :max="10"
        :step="0.5"
        unit="%"
        hint="保守可填 0-2%，樂觀 3-5%"
      />
      <RangeInput
        v-model="input.investmentReturn"
        label="投資年化報酬率"
        :min="0"
        :max="12"
        :step="0.5"
        unit="%"
        hint="自備款的機會成本，0050 長期約 6-8%"
      />
      <RangeInput
        v-model="input.holdYears"
        label="持有 / 比較年數"
        :min="3"
        :max="40"
        :step="1"
        unit="年"
      />
    </div>
  </section>

  <!-- 結論橫幅 -->
  <section
    class="card p-6"
    :class="
      result.buyAdvantage > 0
        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
        : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
    "
  >
    <p
      class="text-xs font-bold uppercase tracking-widest mb-1"
      :class="result.buyAdvantage > 0 ? 'text-blue-700' : 'text-amber-700'"
    >
      💡 智慧推薦（{{ input.holdYears }} 年後）
    </p>
    <p
      class="text-xl md:text-2xl font-black"
      :class="result.buyAdvantage > 0 ? 'text-blue-900' : 'text-amber-900'"
    >
      <template v-if="result.buyAdvantage > 0">
        買比租划算 約 NT$ {{ formatCurrency(result.buyAdvantage) }}
      </template>
      <template v-else>
        租比買划算 約 NT$ {{ formatCurrency(-result.buyAdvantage) }}
      </template>
    </p>
    <p class="text-sm mt-2 text-slate-600 leading-relaxed">
      此結論考慮了房價漲跌、租金漲幅、投資機會成本、稅費與維護費。
      <strong>數字會隨假設大幅變動</strong>——調整上方滑桿看看不同假設下的結果。
    </p>
  </section>

  <!-- 詳細對比表 -->
  <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- 買房 -->
    <div class="card p-6 space-y-4">
      <h3 class="text-base font-extrabold text-blue-700 flex items-center gap-2">
        <span class="w-1.5 h-4 bg-blue-600 rounded"></span>
        買房試算
      </h3>
      <dl class="grid grid-cols-2 gap-y-2 text-sm">
        <dt class="text-slate-500">自備款</dt>
        <dd class="text-right font-bold">NT$ {{ formatCurrency(result.downPayment) }}</dd>

        <dt class="text-slate-500">貸款金額</dt>
        <dd class="text-right font-bold">NT$ {{ formatCurrency(result.loanAmount) }}</dd>

        <dt class="text-slate-500">月付房貸</dt>
        <dd class="text-right font-bold">NT$ {{ formatCurrency(result.monthlyMortgage) }}</dd>

        <dt class="text-slate-500">{{ input.holdYears }} 年房貸累計</dt>
        <dd class="text-right">NT$ {{ formatCurrency(result.totalMortgagePaid) }}</dd>

        <dt class="text-slate-500">{{ input.holdYears }} 年稅費+維護</dt>
        <dd class="text-right">NT$ {{ formatCurrency(result.totalTaxAndMaintenance) }}</dd>

        <dt class="text-slate-500 col-span-2 pt-2 border-t border-slate-100"></dt>
        <dt class="text-slate-500 font-bold">總現金流出</dt>
        <dd class="text-right font-black text-slate-900">
          NT$ {{ formatCurrency(result.totalBuyCashOut) }}
        </dd>

        <dt class="text-slate-500">{{ input.holdYears }} 年後房屋估值</dt>
        <dd class="text-right">NT$ {{ formatCurrency(result.finalHomeValue) }}</dd>

        <dt class="text-slate-500">剩餘房貸本金</dt>
        <dd class="text-right">NT$ {{ formatCurrency(result.remainingLoanBalance) }}</dd>

        <dt class="text-slate-500 font-bold">房屋淨值</dt>
        <dd class="text-right font-black text-emerald-700">
          NT$ {{ formatCurrency(result.buyerEquity) }}
        </dd>

        <dt class="text-blue-700 font-bold col-span-2 pt-2 border-t border-slate-100"></dt>
        <dt class="text-blue-700 font-bold">買房淨成本</dt>
        <dd class="text-right font-black text-blue-900">
          NT$ {{ formatCurrency(result.buyNetCost) }}
        </dd>
      </dl>
      <p class="text-[11px] text-slate-400 leading-relaxed">
        淨成本 = 總現金流出 − 房屋淨值。代表你「實際付出」的成本。
      </p>
    </div>

    <!-- 租屋 -->
    <div class="card p-6 space-y-4">
      <h3 class="text-base font-extrabold text-amber-700 flex items-center gap-2">
        <span class="w-1.5 h-4 bg-amber-500 rounded"></span>
        租屋試算
      </h3>
      <dl class="grid grid-cols-2 gap-y-2 text-sm">
        <dt class="text-slate-500">起始月租</dt>
        <dd class="text-right font-bold">NT$ {{ formatCurrency(input.monthlyRent) }}</dd>

        <dt class="text-slate-500">投資本金（自備款）</dt>
        <dd class="text-right font-bold">NT$ {{ formatCurrency(result.downPayment) }}</dd>

        <dt class="text-slate-500 col-span-2 pt-2 border-t border-slate-100"></dt>
        <dt class="text-slate-500 font-bold">{{ input.holdYears }} 年累計租金</dt>
        <dd class="text-right font-black text-slate-900">
          NT$ {{ formatCurrency(result.totalRentPaid) }}
        </dd>

        <dt class="text-slate-500">投資累積資產</dt>
        <dd class="text-right">NT$ {{ formatCurrency(result.renterFinalWealth) }}</dd>

        <dt class="text-slate-500 font-bold">投資獲利</dt>
        <dd class="text-right font-black text-emerald-700">
          NT$ {{ formatCurrency(result.renterInvestmentGain) }}
        </dd>

        <dt class="text-amber-700 font-bold col-span-2 pt-2 border-t border-slate-100"></dt>
        <dt class="text-amber-700 font-bold">租屋淨成本</dt>
        <dd class="text-right font-black text-amber-900">
          NT$ {{ formatCurrency(result.rentNetCost) }}
        </dd>
      </dl>
      <p class="text-[11px] text-slate-400 leading-relaxed">
        淨成本 = 累計租金 − 投資獲利。把「自備款拿去投資的潛在獲利」算進來才能公平比較。
      </p>
    </div>
  </section>

  <!-- 廣告 -->
  <AdSlot format="banner" />

  <!-- 注意事項 -->
  <section class="card p-6 bg-slate-50/50">
    <h3 class="text-sm font-bold text-slate-700 mb-2">⚠️ 模型假設與使用注意</h3>
    <ul class="text-xs text-slate-600 list-disc pl-5 space-y-1 leading-relaxed">
      <li>「年稅費 0.15%」「年維護 0.5%」是台灣常見估算，實際依房屋類型與地區會差異很大。</li>
      <li>未計入「裝潢費」「家具」「房屋仲介費」「契稅」等買賣相關費用。</li>
      <li>投資報酬率假設為穩定複利，實際投資有波動風險。</li>
      <li>不考慮房地產交易稅、土增稅、奢侈稅等出售時的稅務影響。</li>
      <li>結果對「房價漲幅」與「投資報酬率」這兩個假設最敏感，建議多試幾個情境。</li>
    </ul>
  </section>

  <!-- 跳到主試算工具 -->
  <section class="card p-6">
    <h3 class="text-base font-extrabold text-slate-900 mb-2">想精準試算房貸方案？</h3>
    <p class="text-sm text-slate-600 mb-4">
      決定買房後，用主試算工具比較兩家銀行的真實 APR、寬限期影響與分階段 DSR。
    </p>
    <NuxtLink
      to="/"
      class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition"
    >
      打開房貸試算工具 →
    </NuxtLink>
  </section>
</template>
