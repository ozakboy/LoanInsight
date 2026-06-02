// 房貸轉貸試算的核心型別定義

export interface RefinanceInput {
  // ---- 目前貸款狀況 ----
  /** 原始貸款金額（萬元） */
  originalAmountWan: number
  /** 原始貸款年限（年） */
  originalYears: number
  /** 目前適用的年利率（%） */
  currentRate: number
  /** 已繳期數（月） */
  paidMonths: number

  // ---- 新貸款方案 ----
  /** 新貸款年利率（%） */
  newRate: number
  /** 新貸款年限（年） */
  newYears: number

  // ---- 轉貸成本 ----
  /** 轉貸相關費用：代書費、塗銷設定費、火險、估價費等（元） */
  refinanceFees: number
  /** 原貸款提前清償違約金（元，若無填 0） */
  penalty: number
}

export interface RefinanceResult {
  // 目前狀態
  currentBalance: number
  remainingMonths: number
  oldMonthlyPayment: number
  oldRemainingInterest: number

  // 新方案
  newMonthlyPayment: number
  newTotalInterest: number

  // 轉貸成本
  upfrontCost: number

  // 比較
  monthlyPaymentDiff: number // 正值＝月付變輕；負值＝月付變重
  interestSaved: number // 利息省下多少（負值代表更多）
  netSaving: number // interestSaved - upfrontCost
  breakEvenMonths: number // -1 表示永遠不會回本（月付沒變輕或變更貴）

  // 結論
  worthIt: boolean
}
