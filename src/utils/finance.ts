import type {
  LoanInput,
  LoanResult,
  ScheduleRow,
  RiskLevel,
  DsrDiagnosis,
} from '../types/loan'

const WAN = 10_000

/**
 * 等額本息（年金）月付金公式。
 * @param balance 當前剩餘本金
 * @param monthlyRate 月利率（小數，如 0.0025）
 * @param months 剩餘期數
 */
export function annuityPayment(
  balance: number,
  monthlyRate: number,
  months: number,
): number {
  if (months <= 0) return balance
  if (monthlyRate === 0) return balance / months
  const factor = Math.pow(1 + monthlyRate, months)
  return (balance * monthlyRate * factor) / (factor - 1)
}

/**
 * 建立完整攤還明細表，支援寬限期與兩段式利率。
 *
 * 規則：
 * - 每一期依「期數」判斷適用第一或第二階段利率。
 * - 寬限期內（期數 <= 寬限月數）只繳息不還本，本金維持不變。
 * - 寬限期結束後以當期適用利率、剩餘期數重算等額本息月付金。
 * - 當利率在攤還期間切換階段時，重新計算月付金。
 */
export function buildSchedule(input: LoanInput): ScheduleRow[] {
  const principal = input.amountWan * WAN
  const totalMonths = Math.round(input.years * 12)
  const grace = Math.min(Math.max(0, Math.round(input.gracePeriodMonths)), totalMonths)
  const stage1Months = Math.min(Math.max(0, Math.round(input.stage1Months)), totalMonths)
  const i1 = input.stage1Rate / 100 / 12
  const i2 = input.stage2Rate / 100 / 12

  const rows: ScheduleRow[] = []
  let balance = principal
  let levelPayment = 0
  let prevRate = Number.NaN
  let prevWasGrace = true

  for (let month = 1; month <= totalMonths; month++) {
    const inStage1 = month <= stage1Months
    const monthlyRate = inStage1 ? i1 : i2
    const annualRate = inStage1 ? input.stage1Rate : input.stage2Rate
    const isGrace = month <= grace

    const interest = balance * monthlyRate
    let payment: number
    let principalPaid: number

    if (isGrace) {
      // 寬限期：只繳息
      payment = interest
      principalPaid = 0
    } else {
      const remaining = totalMonths - month + 1
      // 進入攤還期、或利率切換階段時，重算月付金
      if (prevWasGrace || monthlyRate !== prevRate) {
        levelPayment = annuityPayment(balance, monthlyRate, remaining)
      }
      payment = levelPayment
      principalPaid = payment - interest
      // 末期或浮點誤差防護：不可償還超過剩餘本金
      if (principalPaid > balance) {
        principalPaid = balance
        payment = principalPaid + interest
      }
    }

    balance -= principalPaid
    if (Math.abs(balance) < 0.005) balance = 0

    rows.push({
      month,
      payment,
      interest,
      principal: principalPaid,
      balance,
      annualRate,
      stage: inStage1 ? 1 : 2,
      isGrace,
    })

    prevRate = monthlyRate
    prevWasGrace = isGrace
  }

  return rows
}

/**
 * 以牛頓迭代法 (Newton-Raphson) 求解真實 APR（總費用年百分率）。
 *
 * 借款人實拿金額 = 本金 - 開辦費（淨現值 PV）。
 * 未來各期還款為現金流出。求月內部報酬率 x 使得：
 *   Σ payment_m / (1+x)^m = PV
 * 再以名目年化 (x * 12) 表示 APR。
 *
 * @returns APR 百分比；無法收斂時回傳 NaN
 */
export function computeApr(payments: number[], netPresentValue: number): number {
  if (netPresentValue <= 0 || payments.length === 0) return Number.NaN

  let x = 0.005 // 初始猜測：約年化 6%
  for (let iter = 0; iter < 200; iter++) {
    let f = -netPresentValue
    let df = 0
    for (let m = 1; m <= payments.length; m++) {
      const pmt = payments[m - 1]
      const denom = Math.pow(1 + x, m)
      f += pmt / denom
      df += (-m * pmt) / (denom * (1 + x))
    }
    if (df === 0 || !Number.isFinite(df)) break
    const next = x - f / df
    if (!Number.isFinite(next)) break
    // 防止落入無效區間
    const clamped = next <= -0.999 ? -0.999 + 1e-6 : next
    if (Math.abs(clamped - x) < 1e-10) {
      x = clamped
      break
    }
    x = clamped
  }

  return x * 12 * 100
}

/** 判斷 DSR 風險等級：安全 ≤30%、警戒 31–45%、紅線 >45% */
export function riskLevel(ratio: number): RiskLevel {
  if (ratio <= 0.3) return 'safe'
  if (ratio <= 0.45) return 'warning'
  return 'danger'
}

/** 計算單一月付金對應的 DSR 診斷 */
export function diagnoseDsr(payment: number, disposableIncome: number): DsrDiagnosis {
  const ratio =
    disposableIncome > 0 ? payment / disposableIncome : Number.POSITIVE_INFINITY
  return {
    payment,
    ratio,
    level: Number.isFinite(ratio) ? riskLevel(ratio) : 'danger',
  }
}

/** 由輸入參數計算完整試算結果 */
export function calculateLoan(input: LoanInput): LoanResult {
  const schedule = buildSchedule(input)
  const principal = input.amountWan * WAN
  const totalMonths = schedule.length

  const totalInterest = schedule.reduce((sum, r) => sum + r.interest, 0)
  const totalPayment = schedule.reduce((sum, r) => sum + r.payment, 0)
  const totalCost = totalPayment + input.originationFee

  const stage1Rows = schedule.filter((r) => r.stage === 1)
  const stage2Rows = schedule.filter((r) => r.stage === 2)
  const maxIn = (rows: ScheduleRow[]) =>
    rows.length ? Math.max(...rows.map((r) => r.payment)) : 0

  const stage1Payment = maxIn(stage1Rows)
  const stage2Payment = maxIn(stage2Rows)
  const maxMonthlyPayment = Math.max(stage1Payment, stage2Payment)

  // 名目加權平均利率（依各階段期數加權）
  const nominalRate =
    totalMonths > 0
      ? (stage1Rows.length * input.stage1Rate +
          stage2Rows.length * input.stage2Rate) /
        totalMonths
      : 0

  const apr = computeApr(
    schedule.map((r) => r.payment),
    principal - input.originationFee,
  )

  return {
    schedule,
    principal,
    originationFee: input.originationFee,
    totalMonths,
    totalInterest,
    totalPayment,
    totalCost,
    stage1Payment,
    stage2Payment,
    maxMonthlyPayment,
    nominalRate,
    apr,
  }
}

/** 千分位金額格式化（無小數） */
export function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return Math.round(value).toLocaleString('zh-TW')
}

/** 百分比格式化 */
export function formatPercent(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return '—'
  return `${value.toFixed(digits)}%`
}
