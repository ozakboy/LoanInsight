<script setup lang="ts">
const route = useRoute()

const { data: post } = await useAsyncData(`post-${route.path}`, () =>
  queryContent(route.path).findOne(),
)

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: '找不到文章', fatal: true })
}

useSeoMeta({
  title: `${post.value.title} — LoanInsight 智貸見解`,
  description: post.value.description,
  ogTitle: post.value.title,
  ogDescription: post.value.description,
  ogType: 'article',
  ogUrl: `https://loaninsight.ozakboy.life${route.path}`,
  twitterCard: 'summary_large_image',
})

// 結構化資料 (Article schema)
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.value.title,
        description: post.value.description,
        datePublished: post.value.date,
        author: {
          '@type': 'Organization',
          name: 'LoanInsight 智貸見解',
        },
        publisher: {
          '@type': 'Organization',
          name: 'LoanInsight 智貸見解',
        },
        mainEntityOfPage: `https://loaninsight.ozakboy.life${route.path}`,
      }),
    },
  ],
})

function formatDate(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}
</script>

<template>
  <article v-if="post" class="card p-6 md:p-10">
    <NuxtLink
      to="/blog"
      class="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-600 transition mb-4"
    >
      ← 返回文章列表
    </NuxtLink>

    <header class="border-b border-slate-200 pb-6 mb-6">
      <p class="text-xs font-bold text-slate-400 mb-2">
        {{ formatDate(post.date as string | undefined) }}
      </p>
      <h1 class="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
        {{ post.title }}
      </h1>
      <p v-if="post.description" class="text-slate-600 mt-3 leading-relaxed">
        {{ post.description }}
      </p>
    </header>

    <ContentRenderer :value="post" class="prose-article" />

    <!-- 文末 CTA：導流到計算器 -->
    <div class="mt-10 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-6">
      <h3 class="font-extrabold text-slate-900 text-lg mb-1">看完想試算看看？</h3>
      <p class="text-sm text-slate-600 mb-3">
        用 LoanInsight 立即試算你的貸款方案，看看真實 APR 與分階段月付。
      </p>
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition"
      >
        打開試算工具 →
      </NuxtLink>
    </div>

    <!-- 文末橫幅廣告 -->
    <AdSlot format="banner" class="mt-8" />
  </article>
</template>
