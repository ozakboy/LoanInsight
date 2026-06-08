// 自動更新參考利率：於 GitHub Actions 排程中執行（runner 有開放網路）。
//
// 資料源：政府資料開放平臺資料集 10359「五大銀行存放款利率歷史月資料」
//   先取 metadata 找 CSV 下載網址（A13Rate.csv），解析「最新月、五大銀行平均」。
//   官方、機器友善、UTF-8，不會被導向維護頁。
//
// 設計原則 — 故障安全（fail-safe）：失敗/解析不到就保留現有 data/rates.json，
//   不覆蓋、不讓 CI 失敗；解析失敗時印 [diag] 標題列/片段以利調整。

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_PATH = join(__dirname, '..', 'data', 'rates.json')

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
const HEADERS = { 'User-Agent': UA, 'Accept-Language': 'zh-TW' }

const GOV_DATASET_META = 'https://data.gov.tw/api/v2/rest/dataset/10359'
// 已知的 CSV 直連（metadata 解析失敗時的後備）
const A13_CSV_FALLBACK = 'https://www.cbc.gov.tw/public/data/OpenData/A13Rate.csv'

// rates.json 的 key → CSV 欄位標題（取五大銀行最新月平均）
const COLUMN_MAP = {
  index_mortgage: '指數房貸-機動',
  base_lending: '基準利率-機動',
  deposit_index_2y: '定儲利率-二年期-機動',
}

function plausibleRate(v) {
  return typeof v === 'number' && Number.isFinite(v) && v > 0 && v < 20
}

function num(s) {
  if (s == null) return NaN
  const m = String(s).replace(/,/g, '').match(/-?\d+(?:\.\d+)?/)
  return m ? parseFloat(m[0]) : NaN
}

function round3(n) {
  return Math.round(n * 1000) / 1000
}

/** 民國年月 11411 → 「民國114年11月」 */
function rocPeriod(ym) {
  const s = String(ym)
  return s.length === 5 ? `民國${s.slice(0, 3)}年${s.slice(3)}月` : s
}

/** 極簡 CSV 單列切分（處理雙引號包覆） */
function splitCsvLine(line) {
  const out = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"'
        i++
      } else inQuotes = !inQuotes
    } else if (c === ',' && !inQuotes) {
      out.push(cur)
      cur = ''
    } else cur += c
  }
  out.push(cur)
  return out.map((s) => s.trim())
}

async function fetchText(url, label) {
  const res = await fetch(url, { headers: HEADERS })
  const body = await res.text()
  console.log(`[update-rates] GET ${label} → status=${res.status} len=${body.length}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return body
}

/** 抓 CSV，UTF-8 解不出中文時自動改用 Big5 */
async function fetchCsv(url, label) {
  const res = await fetch(url, { headers: HEADERS })
  console.log(`[update-rates] GET ${label} → status=${res.status}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  let text = buf.toString('utf-8')
  if (!/利率|放款|年月|房貸|基準/.test(text)) {
    try {
      text = new TextDecoder('big5').decode(buf)
      console.log('[update-rates] CSV 改用 Big5 解碼')
    } catch {
      /* 保留 UTF-8 */
    }
  }
  return text
}

/** 從資料集 metadata 找出 CSV 下載網址 */
async function resolveCsvUrl() {
  try {
    const meta = JSON.parse(await fetchText(GOV_DATASET_META, 'data.gov.tw metadata'))
    const dist = meta?.result?.distribution || meta?.distribution || []
    const csv = dist.find((d) => /csv/i.test(d.resourceFormat || d.format || ''))
    const url = csv?.resourceDownloadUrl || csv?.downloadUrl
    if (url) return url
    const m = JSON.stringify(meta).match(/https?:\/\/[^"'\\]+\.csv[^"'\\]*/i)
    if (m) return m[0]
    console.log('[diag] metadata 找不到 CSV 網址，改用後備直連')
  } catch (e) {
    console.warn(`[update-rates] metadata 失敗（改用後備直連）：${e.message}`)
  }
  return A13_CSV_FALLBACK
}

async function fetchGovRates() {
  const csvUrl = await resolveCsvUrl()
  let csv
  try {
    csv = await fetchCsv(csvUrl, `CSV ${csvUrl}`)
  } catch (e) {
    console.warn(`[update-rates] CSV 下載失敗：${e.message}`)
    return null
  }

  const lines = csv.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) {
    console.log('[diag] CSV 行數不足')
    return null
  }
  const header = splitCsvLine(lines[0])
  const rows = lines.slice(1).map(splitCsvLine)
  const ymIdx = header.findIndex((h) => h.includes('年月'))
  if (ymIdx < 0) {
    console.log('[diag] 找不到「年月」欄；標題列：', header.join(' | '))
    return null
  }

  // 最新月份 + 該月所有（五大銀行）列
  const latest = rows.reduce((mx, r) => Math.max(mx, num(r[ymIdx]) || -1), -1)
  const latestRows = rows.filter((r) => num(r[ymIdx]) === latest)
  console.log(`[update-rates] 最新年月 ${latest}（${latestRows.length} 家銀行）`)

  const avgOf = (colName) => {
    const idx = header.findIndex((h) => h === colName)
    if (idx < 0) {
      console.log(`[diag] 找不到欄位「${colName}」`)
      return null
    }
    const vals = latestRows.map((r) => num(r[idx])).filter(plausibleRate)
    return vals.length ? round3(vals.reduce((a, b) => a + b, 0) / vals.length) : null
  }

  const out = { period: rocPeriod(latest), values: {} }
  for (const [key, col] of Object.entries(COLUMN_MAP)) {
    const v = avgOf(col)
    if (v != null) out.values[key] = v
  }
  if (Object.keys(out.values).length === 0) {
    console.log('[diag] 沒有任何欄位解析成功；標題列：', header.join(' | '))
    return null
  }
  console.log('[update-rates] CSV 解析到：', out.values, `（${out.period}）`)
  return out
}

async function main() {
  const current = JSON.parse(await readFile(DATA_PATH, 'utf-8'))

  const gov = await fetchGovRates()
  if (!gov) {
    console.warn('[update-rates] 本次未取得有效利率，保留現有資料（見上方 [diag]）')
    return // fail-safe
  }

  const rates = current.rates.map((r) =>
    gov.values[r.key] != null
      ? { ...r, value: gov.values[r.key], period: gov.period }
      : r,
  )
  const today = new Date().toISOString().slice(0, 10)
  const next = { ...current, updated: today, auto: true, rates }

  if (JSON.stringify(next) === JSON.stringify(current)) {
    console.log('[update-rates] 利率無變化，不需更新')
    return
  }

  await writeFile(DATA_PATH, JSON.stringify(next, null, 2) + '\n', 'utf-8')
  console.log(
    `[update-rates] 已更新 ${Object.keys(gov.values).join(', ')}（${gov.period}）`,
  )
}

main().catch((err) => {
  console.warn('[update-rates] 非預期錯誤，保留現有資料：', err)
})
