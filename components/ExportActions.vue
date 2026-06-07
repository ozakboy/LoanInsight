<script setup lang="ts">
import { ref } from 'vue'
import type { LoanResult } from '~/types/loan'
import { scheduleToCsv, downloadTextFile, buildExportFilename } from '~/utils/export'

const props = defineProps<{
  /** 目前要匯出的方案名稱 */
  name: string
  /** 目前要匯出的試算結果 */
  result: LoanResult
}>()

const toast = ref('')

function handleCsv() {
  const csv = scheduleToCsv(props.name, props.result)
  downloadTextFile(
    buildExportFilename(props.name, 'csv'),
    csv,
    'text/csv;charset=utf-8',
  )
  toast.value = '✓ 已下載逐月攤還明細（CSV，可用 Excel 開啟）'
  setTimeout(() => (toast.value = ''), 2500)
}

function handlePrint() {
  if (typeof window !== 'undefined') window.print()
}
</script>

<template>
  <div class="no-print flex flex-wrap items-center gap-2">
    <button
      type="button"
      class="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 md:text-sm"
      @click="handleCsv"
    >
      ⬇ 下載攤還明細 (CSV)
    </button>
    <button
      type="button"
      class="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 md:text-sm"
      @click="handlePrint"
    >
      🖨 列印 / 存成 PDF
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
        class="inline-block rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700"
      >
        {{ toast }}
      </span>
    </Transition>
  </div>
</template>
