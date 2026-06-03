<script setup lang="ts">
interface Post {
  _path?: string
  title?: string
  description?: string
  date?: string
}

defineProps<{
  posts: Post[]
  currentPage: number
  totalPages: number
  totalCount: number
}>()

function formatDate(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

function pageHref(n: number): string {
  return n === 1 ? '/blog' : `/blog/page/${n}`
}
</script>

<template>
  <section v-if="posts && posts.length" class="space-y-4">
    <NuxtLink
      v-for="post in posts"
      :key="post._path"
      :to="post._path"
      class="card block p-6 hover:border-blue-300 transition group"
    >
      <p class="text-xs font-bold text-slate-400 mb-1">
        {{ formatDate(post.date) }}
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

  <div v-else class="card p-12 text-center text-slate-400">尚無文章。</div>

  <!-- 分頁 -->
  <nav
    v-if="totalPages > 1"
    class="card p-4 flex flex-wrap items-center justify-center gap-2"
    aria-label="文章分頁導覽"
  >
    <!-- 上一頁 -->
    <NuxtLink
      v-if="currentPage > 1"
      :to="pageHref(currentPage - 1)"
      class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 hover:border-blue-500 hover:text-blue-700 text-sm font-bold text-slate-600 transition"
      rel="prev"
    >
      ← 上一頁
    </NuxtLink>

    <!-- 頁碼 -->
    <NuxtLink
      v-for="n in totalPages"
      :key="n"
      :to="pageHref(n)"
      class="inline-flex items-center justify-center min-w-[36px] px-3 py-1.5 rounded-lg text-sm font-bold transition"
      :class="
        n === currentPage
          ? 'bg-blue-600 text-white shadow'
          : 'border border-slate-300 text-slate-600 hover:border-blue-500 hover:text-blue-700'
      "
      :aria-current="n === currentPage ? 'page' : undefined"
    >
      {{ n }}
    </NuxtLink>

    <!-- 下一頁 -->
    <NuxtLink
      v-if="currentPage < totalPages"
      :to="pageHref(currentPage + 1)"
      class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 hover:border-blue-500 hover:text-blue-700 text-sm font-bold text-slate-600 transition"
      rel="next"
    >
      下一頁 →
    </NuxtLink>

    <span class="ml-3 text-xs text-slate-400">
      共 {{ totalCount }} 篇 · 第 {{ currentPage }} / {{ totalPages }} 頁
    </span>
  </nav>
</template>
