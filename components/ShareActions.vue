<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  /** 父層提供的分享處理：複製連結到剪貼簿，回傳是否成功 */
  share: () => Promise<boolean>
  /** 父層提供的重設處理：把 state 回到預設值，並清除已儲存的內容 */
  reset: () => void
  /** 顯示 hint 文字（選用），例如「自動儲存中」*/
  hint?: string
}>()

const toast = ref('')
const sharing = ref(false)

async function handleShare() {
  sharing.value = true
  const ok = await props.share()
  toast.value = ok ? '✓ 已複製分享連結到剪貼簿' : '複製失敗，請手動複製網址列'
  sharing.value = false
  setTimeout(() => (toast.value = ''), 2500)
}

function handleReset() {
  if (
    typeof window !== 'undefined' &&
    !window.confirm('確定要清空所有輸入並重設為預設值？此動作無法復原。')
  )
    return
  props.reset()
  toast.value = '已重設為預設值'
  setTimeout(() => (toast.value = ''), 2000)
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <button
      type="button"
      class="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-bold px-3 py-1.5 rounded-lg transition disabled:opacity-50"
      :disabled="sharing"
      @click="handleShare"
    >
      🔗 複製分享連結
    </button>
    <button
      type="button"
      class="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs md:text-sm font-bold px-3 py-1.5 rounded-lg transition"
      @click="handleReset"
    >
      ↺ 重設
    </button>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-x-2"
      enter-to-class="opacity-100 translate-x-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <span
        v-if="toast"
        class="inline-block text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full"
      >
        {{ toast }}
      </span>
    </Transition>

    <span v-if="hint && !toast" class="hidden sm:inline-block text-[11px] text-slate-400 ml-auto">
      {{ hint }}
    </span>
  </div>
</template>
