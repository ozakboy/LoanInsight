<script setup lang="ts">
useSeoMeta({
  title: '貸款知識文章 — LoanInsight 智貸見解',
  description:
    '深入淺出的房貸、信貸、APR、寬限期教學文章，幫你避開常見陷阱，做出更聰明的貸款決策。',
  ogTitle: '貸款知識文章｜LoanInsight 智貸見解',
  ogDescription: '房貸試算、APR、寬限期、兩段式利率，由淺入深的貸款知識整理。',
  ogType: 'website',
  ogUrl: 'https://loaninsight.ozakboy.life/blog',
})

const { data: posts } = await useAsyncData('blog-list', () =>
  queryContent('/blog')
    .where({ _draft: { $ne: true } })
    .sort({ date: -1 })
    .find(),
)

function formatDate(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}
</script>

<template>
  <section class="card p-6 md:p-8">
    <span
      class="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
    >
      <span class="w-2 h-2 rounded-full bg-amber-500"></span>
      貸款知識
    </span>
    <h1 class="text-2xl md:text-3xl font-black mt-3 tracking-tight leading-tight text-slate-900">
      房貸知識文章
    </h1>
    <p class="text-slate-600 mt-3 text-base leading-relaxed">
      想搞懂貸款的真實成本？這裡有由淺入深的教學文章，幫你避開常見陷阱。
    </p>
  </section>

  <section v-if="posts && posts.length" class="space-y-4">
    <NuxtLink
      v-for="post in posts"
      :key="post._path"
      :to="post._path"
      class="card block p-6 hover:border-blue-300 transition group"
    >
      <p class="text-xs font-bold text-slate-400 mb-1">
        {{ formatDate(post.date as string | undefined) }}
      </p>
      <h2
        class="text-lg md:text-xl font-extrabold text-slate-900 group-hover:text-blue-700 transition"
      >
        {{ post.title }}
      </h2>
      <p v-if="post.description" class="text-sm text-slate-600 mt-2 leading-relaxed">
        {{ post.description }}
      </p>
      <p class="text-xs font-bold text-blue-600 mt-3 group-hover:translate-x-0.5 transition">
        繼續閱讀 →
      </p>
    </NuxtLink>
  </section>

  <div v-else class="card p-12 text-center text-slate-400">
    尚無文章。
  </div>
</template>
