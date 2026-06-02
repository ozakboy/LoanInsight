// 將任意巢狀 reactive 狀態同步到 URL hash 與 localStorage
// 目的：
// 1. 使用者可「複製分享連結」把當前試算結果分享給配偶 / 經紀人
// 2. 使用者下次回來自動恢復上次的輸入
//
// 設計：
// - URL hash (#s=...) 是主要載體，不會影響 SSR / GitHub Pages
// - localStorage 是 fallback：當沒分享連結時自動讀取
// - 編碼用 base64(encodeURIComponent(JSON))，支援中文等 Unicode 字元
import { onMounted, watch } from 'vue'

type Namespace = Record<string, unknown>

function encode(state: Namespace): string {
  return btoa(encodeURIComponent(JSON.stringify(state)))
}

function decode(s: string): Namespace | null {
  try {
    return JSON.parse(decodeURIComponent(atob(s))) as Namespace
  } catch {
    return null
  }
}

function applyPartial(target: Namespace, source: Namespace) {
  for (const k of Object.keys(source)) {
    if (!(k in target)) continue
    const sVal = source[k]
    const tVal = target[k]
    if (sVal === null || sVal === undefined) continue
    if (
      typeof tVal === 'object' &&
      tVal !== null &&
      !Array.isArray(tVal) &&
      typeof sVal === 'object' &&
      !Array.isArray(sVal)
    ) {
      applyPartial(tVal as Namespace, sVal as Namespace)
    } else {
      target[k] = sVal
    }
  }
}

export interface UseStateSyncReturn {
  /** 把當前頁面網址（含 hash 編碼狀態）複製到剪貼簿 */
  copyShareLink: () => Promise<boolean>
  /** 清除 localStorage 與 URL hash（不重設 state，呼叫端自行 reset） */
  clearPersisted: () => void
}

/**
 * @param key       localStorage 鍵名（每頁獨立，例如 'loaninsight-home'）
 * @param state     要同步的物件：{ namespaceA: reactiveObj, namespaceB: reactiveObj }
 *                  支援巢狀，會深度比對與套用
 */
export function useStateSync(key: string, state: Namespace): UseStateSyncReturn {
  // SSR 安全：伺服器端不操作 window / localStorage
  if (typeof window === 'undefined') {
    return {
      copyShareLink: () => Promise.resolve(false),
      clearPersisted: () => {},
    }
  }

  function hydrate() {
    let source: Namespace | null = null

    // 1. 優先讀 URL hash（分享連結）
    const hash = window.location.hash.replace(/^#/, '')
    if (hash) {
      const params = new URLSearchParams(hash)
      const s = params.get('s')
      if (s) source = decode(s)
    }

    // 2. 退而求其次讀 localStorage
    if (!source) {
      try {
        const stored = localStorage.getItem(key)
        if (stored) source = decode(stored)
      } catch {
        /* 隱身模式 / 配額爆掉等情況忽略 */
      }
    }

    if (source) applyPartial(state, source)
  }

  function persist() {
    const encoded = encode(state)
    // 更新 URL hash，不觸發 scroll/reload
    const url = new URL(window.location.href)
    url.hash = `s=${encoded}`
    window.history.replaceState(null, '', url.toString())
    try {
      localStorage.setItem(key, encoded)
    } catch {
      /* 配額爆掉忽略 */
    }
  }

  function copyShareLink(): Promise<boolean> {
    if (!navigator.clipboard) return Promise.resolve(false)
    return navigator.clipboard
      .writeText(window.location.href)
      .then(() => true)
      .catch(() => false)
  }

  function clearPersisted() {
    try {
      localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
    const url = new URL(window.location.href)
    url.hash = ''
    window.history.replaceState(null, '', url.toString())
  }

  onMounted(() => {
    hydrate()
    // 對每個命名空間設一個 deep watcher，避免重複序列化整個物件
    for (const ns of Object.keys(state)) {
      watch(
        () => state[ns],
        () => persist(),
        { deep: true, flush: 'post' },
      )
    }
  })

  return { copyShareLink, clearPersisted }
}
