// 在 Nuxt 客戶端最早期就抓 URL hash 存到 window 全域，
// 避開 Vue Router scroll behavior / Nuxt 內部機制把 hash 清掉的時機問題。
// useStateSync 會優先讀這個值。
declare global {
  interface Window {
    __loaninsightInitialHash?: string
    __loaninsightInitialHref?: string
  }
}

export default defineNuxtPlugin(() => {
  try {
    window.__loaninsightInitialHash = window.location.hash
    window.__loaninsightInitialHref = window.location.href
    // eslint-disable-next-line no-console
    console.info(
      '[loaninsight plugin] captured at plugin time, hash =',
      window.location.hash,
      '| href =',
      window.location.href,
    )
  } catch {
    /* ignore */
  }
})
