// 房貸 vs 租屋試算的核心型別定義

export interface BuyVsRentInput {
  // ---- 房屋條件 ----
  /** 房屋總價（萬元） */
  housePriceWan: number
  /** 自備款比例（%） */
  downPaymentPercent: number
  /** 房貸利率（年利率 %） */
  loanRate: number
  /** 房貸年限（年） */
  loanYears: number

  // ---- 持有成本 ----
  /** 房屋稅+地價稅占房價的年比例（%）— 估算用 */
  annualTaxPercent: number
  /** 維護費占房價的年比例（%）— 火險、社區管理費、修繕 */
  annualMaintenancePercent: number

  // ---- 租屋條件 ----
  /** 同等房屋的月租金（元） */
  monthlyRent: number
  /** 租金年漲幅（%） */
  rentGrowth: number

  // ---- 市場假設 ----
  /** 房價年漲幅（%） */
  housePriceGrowth: number
  /** 投資年化報酬率（%）— 若自備款拿去投資的機會成本 */
  investmentReturn: number

  // ---- 比較期 ----
  /** 持有/比較年數（年） */
  holdYears: number
}

export interface BuyVsRentResult {
  // 買房
  downPayment: number
  loanAmount: number
  monthlyMortgage: number
  totalMortgagePaid: number
  totalTaxAndMaintenance: number
  totalBuyCashOut: number
  finalHomeValue: number
  remainingLoanBalance: number
  buyerEquity: number
  buyNetCost: number

  // 租屋
  totalRentPaid: number
  renterFinalWealth: number
  renterInvestmentGain: number
  rentNetCost: number

  // 結論
  buyAdvantage: number // 正值＝買比租划算；負值＝租比買划算
}
