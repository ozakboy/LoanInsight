// 將任意巢狀 reactive 狀態同步到 URL hash 與 localStorage
//
// 設計重點：
// - URL hash 使用 base64url（替換 +→-、/→_、去掉 = padding）避免 URLSearchParams
//   會把 + 轉成空格而破壞 base64 的問題
// - 自行解析 hash（不靠 URLSearchParams），preserve 所有字元
// - 編碼用 btoa(encodeURIComponent(JSON))，支援中文等 Unicode
// - hydrate 後立即 persist 一次，讓 URL hash 與 localStorage 同步
// - 預設大量 console log 方便除錯（之後可移除）
import { onMounted, watch } from 'vue'

type Namespace = Record<string, unknown>

const LOG = '[loaninsight]'

// base64 → base64url（URL 安全，不含 +/=）
function toBase64Url(b64: string): string {
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// base64url（或被 URLSearchParams 破壞的 base64）→ standard base64
function fromBase64UrlOrBroken(s: string): string {
  // 1. 還原 base64url 的字元替換
  // 2. 處理被 URLSearchParams `+` → ' '(空格) 破壞的情況：把空格轉回 +
  let b64 = s.replace(/-/g, '+').replace(/_/g, '/').replace(/ /g, '+')
  // 補回 = padding
  while (b64.length % 4) b64 += '='
  return b64
}

function encode(state: Namespace): string {
  return toBase64Url(btoa(encodeURIComponent(JSON.stringify(state))))
}

function decode(s: string): Namespace | null {
  try {
    const b64 = fromBase64UrlOrBroken(s)
    const json = decodeURIComponent(atob(b64))
    return JSON.parse(json) as Namespace
  } catch (e) {
    console.warn(`${LOG} decode failed`, { input: s, error: e })
    return null
  }
}

// 自行解析 hash（不靠 URLSearchParams 避免它把 + 轉成空格）
function getHashParam(hash: string, name: string): string | null {
  const cleaned = hash.replace(/^#/, '')
  if (!cleaned) return null
  for (const part of cleaned.split('&')) {
    const eq = part.indexOf('=')
    if (eq < 0) continue
    const k = part.slice(0, eq)
    const v = part.slice(eq + 1)
    if (k === name) return v
  }
  return null
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
  copyShareLink: () => Promise<boolean>
  clearPersisted: () => void
}

export function useStateSync(key: string, state: Namespace): UseStateSyncReturn {
  if (typeof window === 'undefined') {
    return {
      copyShareLink: () => Promise.resolve(false),
      clearPersisted: () => {},
    }
  }

  // 從 Nuxt plugin 抓取「真正最早期」的 hash（在 Vue Router 之前），
  // 退而求其次才用 setup-time 的 window.location.hash
  const pluginHash =
    typeof window.__loaninsightInitialHash === 'string'
      ? window.__loaninsightInitialHash
      : ''
  const setupHash = window.location.hash
  const initialHash = pluginHash || setupHash
  console.info(`${LOG} hash sources:`, { pluginHash, setupHash, picked: initialHash })

  function hydrate(): 'url' | 'localStorage' | 'none' {
    let source: Namespace | null = null
    let from: 'url' | 'localStorage' | 'none' = 'none'

    // 同時看「現在的 hash」與「setup 快照」，誰有用誰
    const currentHash = window.location.hash
    const rawHash = currentHash || initialHash
    console.info(`${LOG} hydrate: currentHash =`, currentHash, '| initialHash =', initialHash)

    const s = getHashParam(rawHash, 's')
    console.info(`${LOG} extracted s param =`, s)
    if (s) {
      source = decode(s)
      console.info(`${LOG} URL hash decode result =`, source)
      if (source) from = 'url'
    }

    if (!source) {
      try {
        const stored = localStorage.getItem(key)
        console.info(`${LOG} localStorage raw =`, stored)
        if (stored) {
          source = decode(stored)
          console.info(`${LOG} localStorage decode result =`, source)
          if (source) from = 'localStorage'
        }
      } catch (e) {
        console.warn(`${LOG} localStorage read failed`, e)
      }
    }

    console.info(`${LOG} state BEFORE applyPartial =`, JSON.parse(JSON.stringify(state)))
    if (source) applyPartial(state, source)
    console.info(`${LOG} state AFTER applyPartial =`, JSON.parse(JSON.stringify(state)))

    return from
  }

  function persist() {
    const encoded = encode(state)
    // 用 location.hash 直接賦值（不會觸發 navigation），比 URL/history.replaceState 簡單
    // 但要先檢查是否變了才寫，避免無意義的 history 變動
    const newHash = `#s=${encoded}`
    if (window.location.hash !== newHash) {
      // history.replaceState 不會觸發 hashchange，避免造成 listener 重入
      const url = window.location.pathname + window.location.search + newHash
      window.history.replaceState(null, '', url)
    }
    try {
      localStorage.setItem(key, encoded)
    } catch (e) {
      console.warn(`${LOG} localStorage write failed`, e)
    }
  }

  function copyShareLink(): Promise<boolean> {
    persist()
    if (!navigator.clipboard) return Promise.resolve(false)
    return navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        console.info(`${LOG} copied share link =`, window.location.href)
        return true
      })
      .catch((e) => {
        console.warn(`${LOG} clipboard write failed`, e)
        return false
      })
  }

  function clearPersisted() {
    try {
      localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
    const url = window.location.pathname + window.location.search
    window.history.replaceState(null, '', url)
  }

  onMounted(() => {
    const from = hydrate()
    persist()
    console.info(`${LOG} initial persist done, current URL =`, window.location.href)
    console.info(`${LOG} state hydrated from`, from)

    for (const ns of Object.keys(state)) {
      watch(
        () => state[ns],
        () => {
          persist()
          console.info(`${LOG} persist on change, ns =`, ns)
        },
        { deep: true, flush: 'post' },
      )
    }
  })

  return { copyShareLink, clearPersisted }
}
