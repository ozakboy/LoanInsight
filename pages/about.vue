<script setup lang="ts">
const siteUrl = 'https://loaninsight.ozakboy.life'
const updated = '2026-06-07'

useSeoMeta({
  title: '關於 LoanInsight ｜ 計算方法與專業聲明',
  description:
    'LoanInsight 智貸見解的計算方法論與專業聲明：等額本息年金公式、牛頓迭代法求真實 APR、DSR 收支診斷門檻、資料來源與免責聲明。所有計算於瀏覽器端完成、不蒐集個資。',
  ogTitle: '關於 LoanInsight ｜ 計算方法與專業聲明',
  ogDescription:
    '公開試算工具的計算公式、診斷門檻與資料處理方式，建立透明可信的財務試算。',
  ogType: 'website',
  ogUrl: `${siteUrl}/about`,
})

// AboutPage + Organization JSON-LD（強化 YMYL 的 E-E-A-T 訊號）
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: '關於 LoanInsight 智貸見解',
        url: `${siteUrl}/about`,
        dateModified: updated,
        mainEntity: {
          '@type': 'Organization',
          name: 'LoanInsight 智貸見解',
          url: siteUrl,
          logo: `${siteUrl}/pwa-512x512.png`,
          description:
            '台灣市場導向的貸款試算與財務診斷工具，揭露真實 APR 並評估財務承載力。',
          founder: { '@type': 'Person', name: 'ozakboy' },
        },
      }),
    },
  ],
})

const methods = [
  {
    title: '等額本息（年金）攤還',
    body: '每期還款金額固定，前期利息佔比高、後期本金佔比高。月付金以年金公式計算：M = P × i × (1+i)ⁿ ÷ [(1+i)ⁿ − 1]，其中 P 為剩餘本金、i 為月利率、n 為剩餘期數。寬限期內只計息不還本；兩段式利率在階段切換時以當期剩餘本金與剩餘期數重算月付金。',
  },
  {
    title: '真實 APR（總費用年百分率）',
    body: '一般「牌告利率」不含開辦費，會低估真實成本。本工具將開辦費視為借款當下的現金流出，以借款人實拿金額（本金 − 開辦費）為現值，用牛頓-Raphson 迭代法求解使所有未來還款折現後等於現值的月內部報酬率，再年化為 APR。開辦費越高、年限越短，APR 與牌告利率的落差越大。',
  },
  {
    title: 'DSR 收支動態診斷',
    body: '以「可支配收入 = 月收入 − 既有固定支出」為分母，計算各階段月付金佔比。分級門檻：≤ 30% 為安全（綠燈）、31–45% 為警戒（黃燈）、> 45% 為紅線（紅燈）。此門檻為一般財務規劃常見的保守參考區間，非任一銀行的核貸標準。',
  },
]
</script>

<template>
  <section class="card p-6 md:p-8">
    <span
      class="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
    >
      關於本站
    </span>
    <h1
      class="text-2xl md:text-3xl font-black mt-3 tracking-tight leading-tight text-slate-900"
    >
      關於 LoanInsight ｜ 計算方法與專業聲明
    </h1>
    <p class="text-slate-600 mt-3 text-base leading-relaxed">
      LoanInsight 智貸見解是一個
      <strong class="text-slate-900">全前端、不蒐集個資</strong>
      的貸款試算工具。我們相信「看得懂的成本，才是可控的成本」——因此把每一條計算公式、
      每一個診斷門檻都攤在這裡，讓你判斷數字是否可信，而不是要你照單全收。
    </p>
    <p class="text-xs text-slate-400 mt-4">最後更新：{{ updated }}</p>
  </section>

  <!-- 計算方法論 -->
  <section class="card p-6 md:p-8 space-y-5">
    <h2 class="text-lg font-extrabold text-slate-900 flex items-center gap-2">
      <span class="w-1.5 h-5 bg-blue-500 rounded"></span>
      計算方法論
    </h2>
    <div
      v-for="m in methods"
      :key="m.title"
      class="rounded-xl border border-slate-200 bg-slate-50/40 p-4"
    >
      <h3 class="text-base font-bold text-slate-900">{{ m.title }}</h3>
      <p class="text-sm text-slate-600 mt-2 leading-relaxed">{{ m.body }}</p>
    </div>
    <p class="text-sm text-slate-500 leading-relaxed">
      以上邏輯的原始碼公開於
      <a
        href="https://github.com/ozakboy/LoanInsight"
        target="_blank"
        rel="noopener"
        class="text-blue-600 hover:text-blue-700 underline underline-offset-2"
        >GitHub（utils/finance.ts）</a
      >，任何人都可檢視與驗證計算過程。
    </p>
  </section>

  <!-- 資料與隱私 -->
  <section class="card p-6 md:p-8 space-y-3">
    <h2 class="text-lg font-extrabold text-slate-900 flex items-center gap-2">
      <span class="w-1.5 h-5 bg-emerald-500 rounded"></span>
      資料來源與隱私
    </h2>
    <ul class="text-sm text-slate-600 leading-relaxed list-disc pl-5 space-y-1.5">
      <li>
        所有試算皆在你的瀏覽器端即時完成，
        <strong class="text-slate-900">不會上傳、不會儲存於任何伺服器</strong>。
      </li>
      <li>輸入的金額、利率、收入等僅暫存於你本機（localStorage），可隨時以「重設」清除。</li>
      <li>利率、費用等參數由你自行輸入；本站不提供也不代表任何特定銀行的核貸條件。</li>
    </ul>
  </section>

  <!-- 免責聲明 -->
  <section class="card p-6 md:p-8 border-amber-200 bg-amber-50/40">
    <h2 class="text-lg font-extrabold text-slate-900 flex items-center gap-2">
      <span class="w-1.5 h-5 bg-amber-500 rounded"></span>
      免責聲明
    </h2>
    <p class="text-sm text-slate-700 mt-3 leading-relaxed">
      本工具之試算結果採等額本息法與牛頓迭代法估算，實際數字會因各銀行計息方式、撥款日、
      費用認定、提前還款違約金等而異。所有內容
      <strong>僅供財務規劃參考，不構成任何貸款、投資或法律建議</strong>，
      <strong>實際貸款條件以各金融機構正式核貸文件為準</strong>。
      重大財務決策前，請諮詢合格的金融、稅務或法律專業人士。
    </p>
  </section>
</template>
