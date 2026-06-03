<script setup lang="ts">
const PER_PAGE = 9
const route = useRoute()
const currentPage = computed(() => {
  const n = parseInt(String(route.params.n), 10)
  return Number.isFinite(n) && n >= 1 ? n : 1
})

useSeoMeta({
  title: `貸款知識文章（第 ${currentPage.value} 頁）— LoanInsight 智貸見解`,
  description: `LoanInsight 貸款知識文章列表第 ${currentPage.value} 頁。涵蓋房貸、信貸、學貸、APR、轉貸、稅務等主題。`,
  ogTitle: `貸款知識文章 第 ${currentPage.value} 頁｜LoanInsight 智貸見解`,
  ogType: 'website',
  ogUrl: `https://loaninsight.ozakboy.life/blog/page/${currentPage.value}`,
})

const { data } = await useAsyncData(`blog-list-${currentPage.value}`, async () => {
  const all = await queryContent('/blog')
    .where({ _draft: { $ne: true } })
    .sort({ date: -1 })
    .find()
  const totalCount = all.length
  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE))
  const start = (currentPage.value - 1) * PER_PAGE
  const posts = all.slice(start, start + PER_PAGE)
  return { posts, totalPages, totalCount }
})

// 頁面範圍外回 404
if (data.value && currentPage.value > data.value.totalPages) {
  throw createError({ statusCode: 404, statusMessage: '找不到此頁', fatal: true })
}
</script>

<template>
  <section class="card p-6 md:p-8">
    <span
      class="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
    >
      <span class="w-2 h-2 rounded-full bg-amber-500"></span>
      貸款知識 · 第 {{ currentPage }} 頁
    </span>
    <h1 class="text-2xl md:text-3xl font-black mt-3 tracking-tight leading-tight text-slate-900">
      房貸 / 信貸 / 學貸知識文章
    </h1>
    <p class="text-slate-600 mt-3 text-base leading-relaxed">
      涵蓋首購、轉貸、信貸、學貸、車貸、換屋等主題，由淺入深幫你避開常見陷阱、做出更聰明的貸款決策。
    </p>
  </section>

  <BlogList
    v-if="data"
    :posts="data.posts"
    :current-page="currentPage"
    :total-pages="data.totalPages"
    :total-count="data.totalCount"
  />
</template>
