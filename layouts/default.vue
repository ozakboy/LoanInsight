<script setup lang="ts">
// 預設版型：頂部 header + 主內容 + 右側留白區廣告 + 底部 footer
</script>

<template>
  <div>
    <!-- 頂部視覺 -->
    <header
      class="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white py-10 px-6 relative overflow-hidden border-b border-indigo-800"
    >
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent"
      ></div>
      <div class="max-w-6xl mx-auto relative z-10 flex items-center justify-between gap-6">
        <NuxtLink
          to="/"
          class="text-xl md:text-2xl font-black tracking-tight leading-tight hover:opacity-90 transition"
        >
          LoanInsight
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
            智貸見解
          </span>
        </NuxtLink>
        <nav class="flex items-center gap-3 md:gap-5 text-xs md:text-sm font-bold text-slate-300">
          <NuxtLink to="/" class="hover:text-white transition">試算工具</NuxtLink>
          <NuxtLink to="/buy-vs-rent" class="hover:text-white transition">買 vs 租</NuxtLink>
          <NuxtLink to="/blog" class="hover:text-white transition">貸款知識</NuxtLink>
        </nav>
      </div>
    </header>

    <main class="py-10">
      <div class="flex justify-center gap-6">
        <!-- 左側留白：與右側廣告對稱，維持主內容置中（僅超寬螢幕顯示） -->
        <div
          class="hidden min-[1800px]:block w-[300px] shrink-0"
          aria-hidden="true"
        ></div>

        <!-- 主內容 -->
        <div class="w-full max-w-6xl min-w-0 px-4 md:px-6 space-y-8">
          <slot />
        </div>

        <!-- 右側留白區：黏性摩天大樓廣告（僅超寬螢幕，不佔用主內容寬度） -->
        <div class="hidden min-[1800px]:block w-[300px] shrink-0">
          <div class="sticky top-6">
            <AdSlot format="skyscraper" />
          </div>
        </div>
      </div>
    </main>

    <footer
      class="bg-slate-900 text-slate-400 py-10 text-center text-xs border-t border-slate-800 tracking-wider mt-12"
    >
      <div class="max-w-6xl mx-auto px-6 space-y-2">
        <p class="text-slate-300 font-medium">
          LoanInsight 智貸見解 · 全功能貸款試算與利息工程平台
        </p>
        <p>© 2026 LoanInsight Project. Built with Nuxt 3.</p>
        <p class="text-slate-500">
          <NuxtLink to="/" class="hover:text-slate-300">試算工具</NuxtLink>
          ·
          <NuxtLink to="/buy-vs-rent" class="hover:text-slate-300">買 vs 租</NuxtLink>
          ·
          <NuxtLink to="/blog" class="hover:text-slate-300">貸款知識</NuxtLink>
        </p>
      </div>
    </footer>
  </div>
</template>
