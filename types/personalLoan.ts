// 信貸（個人無擔保貸款）試算的核心型別定義

export interface PersonalLoanInput {
  /** 信貸金額（萬元） */
  amountWan: number
  /** 貸款年限（年）— 信貸常見 1-7 年 */
  years: number
  /** 年利率（%）— 信貸常見 4-15% */
  rate: number
  /** 開辦費（元）— 含信用查詢費、帳管費等 */
  originationFee: number
  /** 月收入（元）— 用於 DBR 22 倍規範檢查 */
  monthlyIncome: number
  /** 既有無擔保負債餘額（元）— 含其他信貸、信用卡循環、現金卡 */
  existingUnsecuredDebt: number
}

export interface PersonalLoanResult {
  /** 借款本金（元） */
  principal: number
  /** 開辦費（元） */
  originationFee: number
  /** 總期數（月） */
  totalMonths: number
  /** 每月還款金額 */
  monthlyPayment: number
  /** 累積總利息 */
  totalInterest: number
  /** 總成本（本金 + 利息 + 開辦費） */
  totalCost: number
  /** 真實 APR（%）— 含開辦費，牛頓迭代法求得 */
  apr: number

  /** DBR 規範相關 */
  /** 總無擔保負債 = 本次申請 + 既有負債（元） */
  totalUnsecuredDebt: number
  /** 22 倍上限金額 = 月收入 × 22 */
  dbrLimitAmount: number
  /** 月收入倍數 = 總無擔保 / 月收入（與 22 倍規範比較） */
  dbrTimes: number
  /** 已用上限比例（0-1+） */
  dbrUsageRatio: number
  /** DBR 風險等級 */
  dbrLevel: 'safe' | 'warning' | 'exceeded'
}
