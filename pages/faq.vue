<script setup lang="ts">
import { faqGroups } from '~/data/faqs'

useSeoMeta({
  title: '房貸常見問題 FAQ — LoanInsight 智貸見解',
  description:
    '房貸最常被問的 30+ 個問題：APR、寬限期、兩段式利率、DSR、青安貸款、轉貸、提前還款、共同借款人、火險⋯由淺入深一次說清楚。',
  ogTitle: '房貸常見問題 FAQ｜LoanInsight 智貸見解',
  ogDescription: '30 個房貸常見問題，由淺入深一次說清楚。基礎概念、利率費用、申請審核、政府方案、還款轉貸全涵蓋。',
  ogType: 'website',
  ogUrl: 'https://loaninsight.ozakboy.life/faq',
})

// FAQPage schema.org（讓 Google 搜尋結果直接顯示 Q&A 折疊）
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqGroups
          .flatMap((g) => g.items)
          .map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.a,
            },
          })),
      }),
    },
  ],
})

const totalCount = faqGroups.reduce((sum, g) => sum + g.items.length, 0)
</script>

<template>
  <!-- Hero -->
  <section class="card p-6 md:p-8">
    <span
      class="inline-flex items-center gap-1.5 bg-violet-500/10 border border-violet-200 text-violet-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
    >
      <span class="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></span>
      常見問題
    </span>
    <h1
      class="text-2xl md:text-3xl font-black mt-3 tracking-tight leading-tight text-slate-900"
    >
      房貸 FAQ — {{ totalCount }} 個最常被問的問題
    </h1>
    <p class="text-slate-600 mt-3 text-base leading-relaxed">
      從基礎概念到實際情境，把最常被問的房貸問題一次說清楚。
      <strong>點任一題即可展開答案</strong>；想搜尋特定關鍵字請用瀏覽器 Ctrl+F。
    </p>

    <!-- 資料更新日 + 免責聲明 -->
    <div
      class="mt-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 rounded-xl bg-amber-50/70 border border-amber-200 px-4 py-3 text-xs text-amber-800/90 leading-relaxed"
    >
      <span class="inline-flex items-center gap-1.5 font-bold shrink-0">
        📅 資料更新日：2026/06/03
      </span>
      <span class="text-amber-700/90">
        本頁資訊僅供參考，**利率、額度、補貼期、稅務扣除額等隨政策變動**，正式申辦前請以
        <strong>承貸銀行公告與政府機關（內政部、財政部、央行）最新規定為準</strong>。
      </span>
    </div>
  </section>

  <!-- 分類錨點導航 -->
  <nav class="card p-4 flex flex-wrap gap-2">
    <a
      v-for="g in faqGroups"
      :key="g.id"
      :href="`#${g.id}`"
      class="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-full transition"
    >
      <span>{{ g.icon }}</span>
      {{ g.title }}
      <span class="text-slate-400">({{ g.items.length }})</span>
    </a>
  </nav>

  <!-- 各分類 -->
  <section
    v-for="g in faqGroups"
    :key="g.id"
    :id="g.id"
    class="card p-6 md:p-8 scroll-mt-24"
  >
    <h2 class="text-xl font-extrabold text-slate-900 flex items-center gap-2 mb-5">
      <span class="text-2xl">{{ g.icon }}</span>
      {{ g.title }}
    </h2>

    <div class="space-y-2">
      <details
        v-for="(item, idx) in g.items"
        :key="idx"
        class="group rounded-xl border border-slate-200 hover:border-blue-200 transition overflow-hidden"
      >
        <summary
          class="px-4 py-3 cursor-pointer flex items-start gap-3 hover:bg-slate-50 transition list-none [&::-webkit-details-marker]:hidden"
        >
          <span
            class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold shrink-0 mt-0.5 group-open:bg-blue-600 group-open:text-white transition"
          >
            Q
          </span>
          <span class="flex-1 text-sm md:text-base font-bold text-slate-900 leading-snug">
            {{ item.q }}
          </span>
          <svg
            class="w-5 h-5 text-slate-400 shrink-0 mt-0.5 transition group-open:rotate-180"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </summary>
        <div class="px-4 pb-4 pt-1 pl-13 ml-9 border-l-2 border-blue-100">
          <p class="text-sm text-slate-600 leading-relaxed">{{ item.a }}</p>
        </div>
      </details>
    </div>
  </section>

  <!-- 廣告 -->
  <AdSlot format="banner" />

  <!-- 沒找到答案 CTA -->
  <section class="card p-6 bg-slate-50/50 text-center">
    <p class="text-slate-700 font-bold mb-3">沒找到你的問題？看深度文章或直接試算</p>
    <div class="flex flex-wrap justify-center gap-3">
      <NuxtLink
        to="/blog"
        class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition"
      >
        閱讀深度文章 →
      </NuxtLink>
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold px-4 py-2 rounded-lg transition"
      >
        打開試算工具 →
      </NuxtLink>
    </div>
  </section>
</template>
