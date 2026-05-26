<script setup lang="ts">
// 非侵入式廣告佔位元件。
// 上線時：於 index.html 載入 AdSense script，並把下方容器替換為實際的
// <ins class="adsbygoogle" ...> 標籤。預設僅顯示佔位框，周邊保留安全防護區避免誤觸。
withDefaults(
  defineProps<{
    label?: string
    format?: 'skyscraper' | 'banner'
    sticky?: boolean
  }>(),
  { label: '廣告', format: 'banner', sticky: false },
)
</script>

<template>
  <aside
    class="my-6 px-4"
    :class="format === 'skyscraper' ? 'w-full' : 'w-full'"
    aria-label="advertisement"
  >
    <div
      class="flex items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-100/70 text-slate-400"
      :class="[
        format === 'skyscraper' ? 'h-[600px] w-[300px] mx-auto' : 'min-h-[100px] w-full',
        sticky ? 'sticky top-6' : '',
      ]"
    >
      <div class="text-center px-4">
        <p class="text-xs font-bold uppercase tracking-widest">{{ label }}</p>
        <p class="text-[11px] mt-1 text-slate-400/80">
          {{ format === 'skyscraper' ? '300 × 600' : 'Responsive Banner' }}
        </p>
      </div>
    </div>
  </aside>
</template>
