// 自動更新參考利率：於 GitHub Actions 排程中執行（runner 有開放網路）。
//
// 設計原則 — 故障安全（fail-safe）：
//  1. 抓不到 / 解析失敗 → 保留現有 data/rates.json，不覆蓋、不讓 CI 失敗。
//  2. 只有成功解析出「合理範圍」的數值時，才寫回檔案。
//  3. 解析失敗時會印出診斷資訊（HTML 長度、關鍵字命中、片段），
//     方便依實際台銀頁面結構調整解析規則。
//
// 用法：node scripts/update-rates.mjs

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_PATH = join(__dirname, '..', 'data', 'rates.json')

// 多個候選來源頁面（依序嘗試，第一個解析成功者為準）
const SOURCES = [
  'https://rate.bot.com.tw/lir?Lang=zh-TW',
  'https://rate.bot.com.tw/lir/all?Lang=zh-TW',
]

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

/** 合理性檢查：台灣放款利率應落在此區間，超出視為解析錯誤 */
function plausible(v) {
  return typeof v === 'number' && Number.isFinite(v) && v > 0 && v < 20
}

/** 去標籤、收斂空白，方便後續以文字定位 */
function toText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * 嘗試多種標籤與寬窗，從文字中抓出基準放款利率百分比。
 * 回傳 { value, matchedBy } 或 null。
 */
function parseBaseLendingRate(text) {
  const labels = ['基準放款利率', '基準利率', '放款基準利率']
  for (const label of labels) {
    // 標籤後 40 個字元內的第一個百分比數字
    const re = new RegExp(`${label}[^0-9]{0,40}(\\d{1,2}\\.\\d{1,3})`)
    const m = text.match(re)
    if (m) {
      const v = parseFloat(m[1])
      if (plausible(v)) return { value: v, matchedBy: label }
    }
  }
  return null
}

/** 解析失敗時，印出診斷資訊供調整解析規則 */
function logDiagnostics(url, html, text) {
  console.log(`[diag] 來源 ${url}`)
  console.log(`[diag] HTML 長度 ${html.length}、純文字長度 ${text.length}`)
  console.log(`[diag] 原始內容前 800 字：\n${html.slice(0, 800)}`)
  for (const kw of ['基準放款利率', '基準利率', '放款', '定儲', '利率指數', '％', '%']) {
    const idx = text.indexOf(kw)
    if (idx >= 0) {
      const snippet = text.slice(Math.max(0, idx - 10), idx + 50)
      console.log(`[diag] 命中「${kw}」@${idx}: …${snippet}…`)
    } else {
      console.log(`[diag] 未命中「${kw}」`)
    }
  }
  const nums = text.match(/\d{1,2}\.\d{1,3}/g)
  console.log(`[diag] 偵測到的小數（前 20）：${(nums || []).slice(0, 20).join(', ')}`)
}

/** 判斷回應是否為台銀「系統維護公告」導向頁（此時不應視為解析錯誤） */
function isMaintenance(finalUrl, html) {
  return (
    /enotice\.bot\.com\.tw/i.test(finalUrl) ||
    html.includes('系統維護') ||
    html.includes('維護作業中')
  )
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, 'Accept-Language': 'zh-TW' },
  })
  const html = await res.text()
  console.log(
    `[update-rates] GET ${url} → status=${res.status} finalUrl=${res.url} len=${html.length}`,
  )
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return { html, finalUrl: res.url }
}

async function main() {
  const current = JSON.parse(await readFile(DATA_PATH, 'utf-8'))

  let parsed = null
  let usedUrl = null
  let maintenance = false

  for (const url of SOURCES) {
    let html, finalUrl
    try {
      ;({ html, finalUrl } = await fetchHtml(url))
    } catch (err) {
      console.warn(`[update-rates] 取得 ${url} 失敗：${err.message}`)
      continue
    }
    // 台銀系統維護中 → 導向 enotice 維護公告頁，此時所有人都拿不到利率，非程式錯誤
    if (isMaintenance(finalUrl, html)) {
      console.warn(`[update-rates] 台銀系統維護中（導向 ${finalUrl}），保留現有資料`)
      maintenance = true
      continue
    }
    const text = toText(html)
    const result = parseBaseLendingRate(text)
    if (result) {
      parsed = result
      usedUrl = url
      break
    }
    // 此來源解析不到（且非維護）→ 印診斷後試下一個
    logDiagnostics(url, html, text)
  }

  if (!parsed) {
    if (maintenance) {
      console.warn('[update-rates] 因台銀維護而略過本次更新，待維護結束後自動重試')
    } else {
      console.warn('[update-rates] 所有來源都解析不到基準放款利率，保留現有資料（見上方 [diag]）')
    }
    return // fail-safe
  }

  console.log(
    `[update-rates] 由 ${usedUrl} 以「${parsed.matchedBy}」解析到 ${parsed.value}%`,
  )

  const rates = current.rates.map((r) =>
    r.key === 'bot_base_lending' ? { ...r, value: parsed.value } : r,
  )
  const today = new Date().toISOString().slice(0, 10)
  const next = { ...current, updated: today, auto: true, rates }

  if (JSON.stringify(next) === JSON.stringify(current)) {
    console.log('[update-rates] 利率無變化，不需更新')
    return
  }

  await writeFile(DATA_PATH, JSON.stringify(next, null, 2) + '\n', 'utf-8')
  console.log(`[update-rates] 已更新基準放款利率為 ${parsed.value}%（${today}）`)
}

main().catch((err) => {
  console.warn('[update-rates] 非預期錯誤，保留現有資料：', err)
})
