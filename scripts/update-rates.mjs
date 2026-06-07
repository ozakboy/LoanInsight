// 自動更新參考利率：於 GitHub Actions 排程中執行（runner 有開放網路）。
//
// 資料源（皆為官方、機器友善，不會被導向維護頁）：
//  1. 央行重貼現率 — 中央銀行 OpenData JSON API（set_id=6022）
//  2. 五大銀行新承做購屋貸款/放款平均利率 — 政府資料開放平臺資料集 10359（CSV）
//
// 設計原則 — 故障安全（fail-safe）：
//  - 任一來源失敗/解析不到 → 保留現有 data/rates.json，不覆蓋、不讓 CI 失敗。
//  - 只有解析出「合理範圍」的數值時，才寫回對應欄位。
//  - 解析失敗時印出診斷（狀態、結構、標題列、片段）以利調整規則。
//
// 注意：本機沙箱有 host allowlist，通常連不到上述網域；請於 GitHub Actions
//       以 workflow_dispatch 手動觸發首次驗證，依 [diag] 調整欄位對應。

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_PATH = join(__dirname, '..', 'data', 'rates.json')

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

// 央行貼放利率（含重貼現率）JSON API
const CBC_REDISCOUNT_URL =
  'https://cpx.cbc.gov.tw/api/OpenData/DataSet?set_id=6022&index=0'
// 五大銀行存放款利率歷史月資料（含新承做購屋貸款/放款利率）資料集 metadata
const GOV_DATASET_META = 'https://data.gov.tw/api/v2/rest/dataset/10359'

const HEADERS = { 'User-Agent': UA, 'Accept-Language': 'zh-TW' }

function plausibleRate(v) {
  return typeof v === 'number' && Number.isFinite(v) && v > 0 && v < 20
}

/** 從字串中抽出第一個數字（去除逗號、百分比、全形等雜訊） */
function num(s) {
  if (s == null) return NaN
  const m = String(s).replace(/,/g, '').match(/-?\d+(?:\.\d+)?/)
  return m ? parseFloat(m[0]) : NaN
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
  console.log(
    `[update-rates] GET ${label} → status=${res.status} finalUrl=${res.url} len=${body.length}`,
  )
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return { body, finalUrl: res.url }
}

/** 抓 CSV，UTF-8 解不出中文時自動改用 Big5（data.gov.tw 部分檔為 Big5） */
async function fetchCsv(url, label) {
  const res = await fetch(url, { headers: HEADERS })
  console.log(
    `[update-rates] GET ${label} → status=${res.status} finalUrl=${res.url}`,
  )
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  let text = buf.toString('utf-8')
  if (!/利率|放款|年月|月別|購屋|期別/.test(text)) {
    try {
      text = new TextDecoder('big5').decode(buf)
      console.log('[update-rates] CSV 改用 Big5 解碼')
    } catch {
      /* 保留 UTF-8 結果 */
    }
  }
  return text
}

// ---- 央行重貼現率 ----
async function fetchRediscount() {
  let body
  try {
    ;({ body } = await fetchText(CBC_REDISCOUNT_URL, '央行重貼現率 JSON'))
  } catch (e) {
    console.warn(`[update-rates] 央行 API 取得失敗：${e.message}`)
    return null
  }
  let json
  try {
    json = JSON.parse(body)
  } catch {
    console.warn('[update-rates] 央行回應非 JSON')
    console.log('[diag] 前 400 字：', body.slice(0, 400))
    return null
  }
  // 收斂出記錄陣列（容忍多種包裝）
  const records = Array.isArray(json)
    ? json
    : json.data || json.result || json.Data || json.dataset || [json]
  if (!Array.isArray(records) || records.length === 0) {
    console.log('[diag] 央行 JSON 頂層 keys：', Object.keys(json))
    return null
  }
  // 取最後一筆（最新），找含「重貼現」的欄位
  const rec = records[records.length - 1]
  const key = Object.keys(rec).find((k) => k.includes('重貼現'))
  if (!key) {
    console.log('[diag] 央行記錄欄位：', Object.keys(rec))
    return null
  }
  const v = num(rec[key])
  if (!plausibleRate(v)) {
    console.log('[diag] 央行重貼現率值不合理：', rec[key])
    return null
  }
  console.log(`[update-rates] 央行重貼現率解析到 ${v}%`)
  return { value: v }
}

// ---- 五大銀行新承做購屋貸款/放款平均利率 ----
async function fetchGovMortgage() {
  // 1) 取資料集 metadata，找 CSV 下載網址
  let meta
  try {
    const { body } = await fetchText(GOV_DATASET_META, 'data.gov.tw metadata')
    meta = JSON.parse(body)
  } catch (e) {
    console.warn(`[update-rates] 資料集 metadata 失敗：${e.message}`)
    return null
  }
  const dist = meta?.result?.distribution || meta?.distribution || []
  let csvUrl =
    dist.find((d) => /csv/i.test(d.resourceFormat || d.format || ''))
      ?.resourceDownloadUrl ||
    dist.find((d) => /csv/i.test(d.resourceFormat || d.format || ''))
      ?.downloadUrl
  if (!csvUrl) {
    // 後備：在整包 metadata 找 .csv 連結
    const m = JSON.stringify(meta).match(/https?:\/\/[^"'\\]+\.csv[^"'\\]*/i)
    csvUrl = m?.[0]
  }
  if (!csvUrl) {
    console.log('[diag] 找不到 CSV 下載網址；distribution=', JSON.stringify(dist).slice(0, 600))
    return null
  }

  // 2) 抓 CSV 並解析最新一列
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
  console.log('[diag] CSV 標題列：', header.join(' | '))
  const last = splitCsvLine(lines[lines.length - 1])
  console.log('[diag] CSV 最後一列：', last.join(' | '))

  const mortgageCol = header.findIndex((h) => h.includes('購屋'))
  const lendingCol = header.findIndex(
    (h) => h.includes('放款') && (h.includes('加權') || h.includes('平均')),
  )

  const out = { period: last[0] || '' }
  if (mortgageCol >= 0) {
    const v = num(last[mortgageCol])
    if (plausibleRate(v)) out.mortgage_avg = v
  }
  if (lendingCol >= 0) {
    const v = num(last[lendingCol])
    if (plausibleRate(v)) out.five_bank_lending_avg = v
  }
  if (out.mortgage_avg == null && out.five_bank_lending_avg == null) {
    console.log('[diag] CSV 找不到「購屋」或「放款加權/平均」欄位，請依上方標題列調整')
    return null
  }
  console.log('[update-rates] CSV 解析到：', out)
  return out
}

async function main() {
  const current = JSON.parse(await readFile(DATA_PATH, 'utf-8'))
  const updates = {}
  let period = ''

  const redis = await fetchRediscount()
  if (redis) updates.cbc_rediscount = redis.value

  const gov = await fetchGovMortgage()
  if (gov) {
    if (gov.mortgage_avg != null) updates.mortgage_avg = gov.mortgage_avg
    if (gov.five_bank_lending_avg != null)
      updates.five_bank_lending_avg = gov.five_bank_lending_avg
    if (gov.period) period = gov.period
  }

  if (Object.keys(updates).length === 0) {
    console.warn('[update-rates] 本次未取得任何有效利率，保留現有資料（見上方 [diag]）')
    return // fail-safe
  }

  const rates = current.rates.map((r) => {
    if (updates[r.key] == null) return r
    const next = { ...r, value: updates[r.key] }
    if (period && (r.key === 'mortgage_avg' || r.key === 'five_bank_lending_avg'))
      next.period = period
    return next
  })

  const today = new Date().toISOString().slice(0, 10)
  const next = { ...current, updated: today, auto: true, rates }

  if (JSON.stringify(next) === JSON.stringify(current)) {
    console.log('[update-rates] 利率無變化，不需更新')
    return
  }

  await writeFile(DATA_PATH, JSON.stringify(next, null, 2) + '\n', 'utf-8')
  console.log(
    `[update-rates] 已更新 ${Object.keys(updates).join(', ')}` +
      (period ? `（期別 ${period}）` : ''),
  )
}

main().catch((err) => {
  console.warn('[update-rates] 非預期錯誤，保留現有資料：', err)
})
