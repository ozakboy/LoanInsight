// 自動更新參考利率：於 GitHub Actions 排程中執行（runner 有開放網路）。
//
// 設計原則 — 故障安全（fail-safe）：
//  1. 抓不到 / 解析失敗 → 保留現有 data/rates.json，不覆蓋、不讓 CI 失敗。
//  2. 只有成功解析出「合理範圍」的數值時，才寫回檔案。
//  3. 本機沙箱通常連不到台銀（host allowlist），請在 GitHub 上以
//     workflow_dispatch 手動觸發首次驗證，並依 log 調整解析規則。
//
// 用法：node scripts/update-rates.mjs

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_PATH = join(__dirname, '..', 'data', 'rates.json')
const SOURCE_URL = 'https://rate.bot.com.tw/lir?Lang=zh-TW'

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

/** 合理性檢查：台灣利率應落在此區間，超出視為解析錯誤 */
function plausible(v) {
  return typeof v === 'number' && Number.isFinite(v) && v > 0 && v < 20
}

/**
 * 從台銀「基準利率」頁面 HTML 解析基準放款利率。
 * 台銀頁面以表格呈現，這裡用寬鬆 regex 抓「基準放款利率」附近的百分比數字。
 * 若台銀改版導致抓不到，回傳 null（觸發 fail-safe）。
 */
function parseBaseLendingRate(html) {
  // 移除標籤後在「基準放款利率」關鍵字後方找第一個百分比數字
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
  const m = text.match(/基準放款利率[^0-9]{0,20}(\d{1,2}\.\d{1,3})/)
  if (m) {
    const v = parseFloat(m[1])
    return plausible(v) ? v : null
  }
  return null
}

async function main() {
  const current = JSON.parse(await readFile(DATA_PATH, 'utf-8'))

  let html
  try {
    const res = await fetch(SOURCE_URL, {
      headers: { 'User-Agent': UA, 'Accept-Language': 'zh-TW' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    html = await res.text()
  } catch (err) {
    console.warn(`[update-rates] 取得來源失敗，保留現有資料：${err.message}`)
    return // fail-safe：不修改檔案、正常退出
  }

  const baseLending = parseBaseLendingRate(html)
  if (baseLending === null) {
    console.warn('[update-rates] 解析不到基準放款利率，保留現有資料（請檢查台銀頁面是否改版）')
    return // fail-safe
  }

  // 僅更新成功解析的欄位，其餘保留
  const rates = current.rates.map((r) =>
    r.key === 'bot_base_lending' ? { ...r, value: baseLending } : r,
  )

  const today = new Date().toISOString().slice(0, 10)
  const next = { ...current, updated: today, auto: true, rates }

  if (JSON.stringify(next) === JSON.stringify(current)) {
    console.log('[update-rates] 利率無變化，不需更新')
    return
  }

  await writeFile(DATA_PATH, JSON.stringify(next, null, 2) + '\n', 'utf-8')
  console.log(`[update-rates] 已更新基準放款利率為 ${baseLending}%（${today}）`)
}

main().catch((err) => {
  // 任何未預期錯誤也不讓 CI 失敗，避免噪音
  console.warn('[update-rates] 非預期錯誤，保留現有資料：', err)
})
