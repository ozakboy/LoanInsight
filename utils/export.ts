import type { LoanResult } from '~/types/loan'

/** 觸發瀏覽器下載一個文字檔（純前端，無後端、無第三方依賴） */
export function downloadTextFile(
  filename: string,
  content: string,
  mime = 'text/plain;charset=utf-8',
): void {
  if (typeof document === 'undefined') return
  // 前置 UTF-8 BOM，確保 Excel 開啟 CSV 時中文不亂碼
  const blob = new Blob(['﻿', content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function csvCell(value: string | number): string {
  const s = String(value)
  // 含逗號、引號或換行時以雙引號包覆並跳脫
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/**
 * 將完整攤還明細表轉為 CSV 字串（逐月本金/利息/餘額），可直接用 Excel 開啟。
 */
export function scheduleToCsv(name: string, result: LoanResult): string {
  const header = [
    '期數',
    '階段',
    '寬限期',
    '當期還款',
    '當期利息',
    '償還本金',
    '剩餘本金',
    '年利率(%)',
  ]

  const round = (n: number) => Math.round(n)

  const rows = result.schedule.map((r) =>
    [
      r.month,
      `第 ${r.stage} 階段`,
      r.isGrace ? '是' : '',
      round(r.payment),
      round(r.interest),
      round(r.principal),
      round(r.balance),
      r.annualRate,
    ]
      .map(csvCell)
      .join(','),
  )

  // 摘要列附在最後，方便對帳
  const summary = [
    '',
    ['# 方案', name].map(csvCell).join(','),
    ['# 貸款本金', round(result.principal)].map(csvCell).join(','),
    ['# 開辦費', round(result.originationFee)].map(csvCell).join(','),
    ['# 累積總利息', round(result.totalInterest)].map(csvCell).join(','),
    ['# 總成本(含開辦費)', round(result.totalCost)].map(csvCell).join(','),
    ['# 最高月付', round(result.maxMonthlyPayment)].map(csvCell).join(','),
    ['# 名目加權平均利率(%)', result.nominalRate.toFixed(3)].map(csvCell).join(','),
    ['# 真實 APR(%)', result.apr.toFixed(3)].map(csvCell).join(','),
  ]

  return [header.map(csvCell).join(','), ...rows, ...summary].join('\r\n')
}

/** 以方案名稱與日期組出安全的檔名 */
export function buildExportFilename(name: string, ext: string): string {
  const safe = name.replace(/[^\w一-龥-]+/g, '_').slice(0, 40) || 'loan'
  const d = new Date()
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  return `LoanInsight_${safe}_${stamp}.${ext}`
}
