<script setup lang="ts">
import { ref, watch } from 'vue'

// 行動裝置 hamburger menu 開關
const mobileMenuOpen = ref(false)
const route = useRoute()
// 切頁時自動關閉選單
watch(
  () => route.path,
  () => {
    mobileMenuOpen.value = false
  },
)
</script>

<template>
  <div>
    <!-- 頂部視覺 -->
    <header
      class="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white py-6 md:py-10 px-4 md:px-6 relative overflow-hidden border-b border-indigo-800"
    >
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent"
      ></div>
      <div class="max-w-6xl mx-auto relative z-10">
        <div class="flex items-center justify-between gap-4">
          <NuxtLink
            to="/"
            class="text-lg md:text-2xl font-black tracking-tight leading-tight hover:opacity-90 transition shrink-0"
          >
            LoanInsight
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
              智貸見解
            </span>
          </NuxtLink>

          <!-- 桌面版水平導覽（≥md）-->
          <nav class="hidden md:flex items-center gap-4 lg:gap-5 text-sm font-bold text-slate-300">
            <NuxtLink to="/" class="hover:text-white transition">房貸</NuxtLink>
            <NuxtLink to="/refinance" class="hover:text-white transition">轉貸</NuxtLink>
            <NuxtLink to="/personal-loan" class="hover:text-white transition">信貸</NuxtLink>
            <NuxtLink to="/buy-vs-rent" class="hover:text-white transition">買 vs 租</NuxtLink>
            <NuxtLink to="/blog" class="hover:text-white transition">文章</NuxtLink>
            <NuxtLink to="/faq" class="hover:text-white transition">FAQ</NuxtLink>
            <NuxtLink to="/about" class="hover:text-white transition">關於</NuxtLink>
          </nav>

          <!-- 行動版 hamburger 按鈕（<md）-->
          <button
            type="button"
            class="md:hidden -mr-2 p-2 rounded-lg hover:bg-white/10 transition"
            :aria-expanded="mobileMenuOpen"
            aria-label="開啟導覽選單"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <svg
              v-if="!mobileMenuOpen"
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <svg
              v-else
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- 行動版下拉選單 -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <nav
            v-if="mobileMenuOpen"
            class="md:hidden mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-2 text-sm font-bold"
          >
            <NuxtLink
              to="/"
              class="bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white px-4 py-3 rounded-xl transition flex items-center gap-2"
            >
              <span>🧮</span> 房貸試算
            </NuxtLink>
            <NuxtLink
              to="/refinance"
              class="bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white px-4 py-3 rounded-xl transition flex items-center gap-2"
            >
              <span>🔄</span> 轉貸試算
            </NuxtLink>
            <NuxtLink
              to="/personal-loan"
              class="bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white px-4 py-3 rounded-xl transition flex items-center gap-2"
            >
              <span>💳</span> 信貸試算
            </NuxtLink>
            <NuxtLink
              to="/buy-vs-rent"
              class="bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white px-4 py-3 rounded-xl transition flex items-center gap-2"
            >
              <span>🏠</span> 買 vs 租
            </NuxtLink>
            <NuxtLink
              to="/blog"
              class="bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white px-4 py-3 rounded-xl transition flex items-center gap-2"
            >
              <span>📖</span> 知識文章
            </NuxtLink>
            <NuxtLink
              to="/faq"
              class="bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white px-4 py-3 rounded-xl transition flex items-center gap-2"
            >
              <span>❓</span> 常見問題 FAQ
            </NuxtLink>
            <NuxtLink
              to="/about"
              class="bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white px-4 py-3 rounded-xl transition flex items-center gap-2"
            >
              <span>ℹ️</span> 關於本站
            </NuxtLink>
          </nav>
        </Transition>
      </div>
    </header>

    <main class="py-6 md:py-10">
      <div class="flex justify-center gap-6">
        <!-- 左側留白：與右側廣告對稱，維持主內容置中（僅超寬螢幕顯示） -->
        <div
          class="hidden min-[1800px]:block w-[300px] shrink-0"
          aria-hidden="true"
        ></div>

        <!-- 主內容 -->
        <div class="w-full max-w-6xl min-w-0 px-4 md:px-6 space-y-6 md:space-y-8">
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
      class="bg-slate-900 text-slate-400 py-8 md:py-10 text-center text-xs border-t border-slate-800 tracking-wider mt-10 md:mt-12"
    >
      <div class="max-w-6xl mx-auto px-4 md:px-6 space-y-3">
        <p class="text-slate-300 font-medium">
          LoanInsight 智貸見解 · 全功能貸款試算與利息工程平台
        </p>
        <p>© 2026 LoanInsight Project. Built with Nuxt 3.</p>
        <nav
          class="flex flex-wrap justify-center items-center gap-x-3 gap-y-2 text-slate-500"
        >
          <NuxtLink to="/" class="hover:text-slate-300 transition">房貸試算</NuxtLink>
          <span class="text-slate-700">·</span>
          <NuxtLink to="/refinance" class="hover:text-slate-300 transition">轉貸試算</NuxtLink>
          <span class="text-slate-700">·</span>
          <NuxtLink to="/personal-loan" class="hover:text-slate-300 transition">信貸試算</NuxtLink>
          <span class="text-slate-700">·</span>
          <NuxtLink to="/buy-vs-rent" class="hover:text-slate-300 transition">買 vs 租</NuxtLink>
          <span class="text-slate-700">·</span>
          <NuxtLink to="/blog" class="hover:text-slate-300 transition">貸款知識</NuxtLink>
          <span class="text-slate-700">·</span>
          <NuxtLink to="/faq" class="hover:text-slate-300 transition">FAQ</NuxtLink>
          <span class="text-slate-700">·</span>
          <NuxtLink to="/about" class="hover:text-slate-300 transition">關於本站</NuxtLink>
        </nav>
      </div>
    </footer>
  </div>
</template>
