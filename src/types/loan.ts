// 貸款試算的核心型別定義

/** 使用者輸入的貸款參數（單一銀行方案） */
export interface LoanInput {
  /** 方案名稱（例：銀行 A） */
  name: string
  /** 貸款總金額（萬元） */
  amountWan: number
  /** 貸款總年限（年） */
  years: number
  /** 寬限期（月）— 此期間只繳息不還本 */
  gracePeriodMonths: number
  /** 第一階段月數（如前 24 個月） */
  stage1Months: number
  /** 第一階段年利率（%） */
  stage1Rate: number
  /** 第二階段年利率（%）— 第一階段結束後適用至合約結束 */
  stage2Rate: number
  /** 開辦費用總額（元）— 信用查詢費、銀行手續費、代書費等一次性支出 */
  originationFee: number
}

/** 個人財務狀況（用於 DSR 診斷，雙方案共用） */
export interface FinanceProfile {
  /** 月收入（元） */
  monthlyIncome: number
  /** 既有固定支出（元，不含本貸款） */
  existingExpenses: number
}

/** 單期攤還明細 */
export interface ScheduleRow {
  /** 期數（第幾個月） */
  month: number
  /** 當期還款總額（本金 + 利息） */
  payment: number
  /** 當期利息 */
  interest: number
  /** 當期償還本金 */
  principal: number
  /** 期末剩餘本金 */
  balance: number
  /** 適用的年利率（%） */
  annualRate: number
  /** 所屬階段（1 或 2） */
  stage: 1 | 2
  /** 是否為寬限期 */
  isGrace: boolean
}

/** DSR 風險等級 */
export type RiskLevel = 'safe' | 'warning' | 'danger'

/** DSR 診斷結果 */
export interface DsrDiagnosis {
  /** 月還款金額 */
  payment: number
  /** 佔可支配收入比例（0~1） */
  ratio: number
  /** 風險等級 */
  level: RiskLevel
}

/** 單一方案的完整試算結果 */
export interface LoanResult {
  /** 攤還明細表 */
  schedule: ScheduleRow[]
  /** 貸款本金（元） */
  principal: number
  /** 開辦費用（元） */
  originationFee: number
  /** 總期數 */
  totalMonths: number
  /** 累積總利息 */
  totalInterest: number
  /** 總還款金額（不含開辦費） */
  totalPayment: number
  /** 總成本（總還款 + 開辦費） */
  totalCost: number
  /** 第一階段代表月還款額（取該階段最高一期） */
  stage1Payment: number
  /** 第二階段代表月還款額 */
  stage2Payment: number
  /** 全期最高月還款額 */
  maxMonthlyPayment: number
  /** 牌告（名目）加權平均利率（%） */
  nominalRate: number
  /** 真實 APR 總費用年百分率（%）— 含開辦費，牛頓迭代法求得 */
  apr: number
}
