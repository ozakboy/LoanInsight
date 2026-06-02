<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { adsConfig, type AdFormat } from '~/config/ads'

declare global {
  interface Window {
    adsbygoogle: Record<string, unknown>[]
  }
}

const props = withDefaults(defineProps<{ format?: AdFormat }>(), {
  format: 'banner',
})

const slot = computed(() => adsConfig.slots[props.format])
const insStyle = computed(() =>
  props.format === 'skyscraper'
    ? 'display:block;width:300px;height:600px'
    : 'display:block;min-height:100px',
)

onMounted(() => {
  if (typeof window === 'undefined') return
  try {
    window.adsbygoogle = window.adsbygoogle || []
    window.adsbygoogle.push({})
  } catch (e) {
    // 廣告載入失敗（擋廣告外掛、未通過審核、無填充等）— 靜默忽略
    console.warn('[AdSense] push failed', e)
  }
})
</script>

<template>
  <aside
    :class="format === 'banner' ? 'w-full px-4 py-2' : ''"
    aria-label="advertisement"
  >
    <ins
      class="adsbygoogle"
      :style="insStyle"
      :data-ad-client="adsConfig.publisherId"
      :data-ad-slot="slot"
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  </aside>
</template>
