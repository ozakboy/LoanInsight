import type { BuyVsRentInput, BuyVsRentResult } from '~/types/buyVsRent'
import { annuityPayment } from '~/utils/finance'

const WAN = 10_000

/**
 * 房貸 vs 租屋對照試算。
 *
 * 模型：
 * - 買方：T=0 付自備款，每月繳房貸 + 年稅 + 年維護。持有期結束時擁有「房價 - 剩餘貸款」的淨值。
 * - 租方：T=0 把自備款拿去投資（年化複利）。每月繳租金（每年漲）。
 *   若買方每年支出大於租方，把差額也加進投資。
 *
 * 「淨成本」= 現金流出 − 終局可變現資產。買方終局有房屋淨值，租方有投資累積。
 * 「買划算度」= 租方淨成本 − 買方淨成本。正值代表買比較划算。
 */
export function calculateBuyVsRent(input: BuyVsRentInput): BuyVsRentResult {
  const housePrice = input.housePriceWan * WAN
  const downPayment = housePrice * (input.downPaymentPercent / 100)
  const loanAmount = housePrice - downPayment
  const monthlyRate = input.loanRate / 100 / 12
  const totalLoanMonths = Math.round(input.loanYears * 12)
  const monthlyMortgage =
    loanAmount > 0 ? annuityPayment(loanAmount, monthlyRate, totalLoanMonths) : 0

  const annualMaint = housePrice * (input.annualMaintenancePercent / 100)
  const annualTax = housePrice * (input.annualTaxPercent / 100)
  const investAnnual = input.investmentReturn / 100
  const rentGrowthAnnual = input.rentGrowth / 100

  let mortgageBalance = loanAmount
  let totalMortgagePaid = 0
  let totalRentPaid = 0
  let renterWealth = downPayment // 自備款投資
  let currentRent = input.monthlyRent

  for (let year = 1; year <= input.holdYears; year++) {
    // 買方：本年繳房貸
    let yearMortgagePayment = 0
    for (let m = 0; m < 12 && mortgageBalance > 0.005; m++) {
      const interest = mortgageBalance * monthlyRate
      let principal = Math.min(monthlyMortgage - interest, mortgageBalance)
      if (principal < 0) principal = 0
      const payment = principal + interest
      yearMortgagePayment += payment
      mortgageBalance -= principal
      if (mortgageBalance < 0.005) mortgageBalance = 0
    }
    totalMortgagePaid += yearMortgagePayment
    const buyerYearCost = yearMortgagePayment + annualMaint + annualTax

    // 租方：本年付租金
    const renterYearCost = currentRent * 12
    totalRentPaid += renterYearCost

    // 機會成本：先讓既有資產複利一年
    renterWealth = renterWealth * (1 + investAnnual)
    // 若買方支出較多，租方把差額投入投資
    const diff = buyerYearCost - renterYearCost
    if (diff > 0) renterWealth += diff

    // 租金下一年漲幅
    currentRent = currentRent * (1 + rentGrowthAnnual)
  }

  const finalHomeValue =
    housePrice * Math.pow(1 + input.housePriceGrowth / 100, input.holdYears)
  const buyerEquity = finalHomeValue - mortgageBalance
  const totalTaxAndMaintenance = (annualMaint + annualTax) * input.holdYears
  const totalBuyCashOut = downPayment + totalMortgagePaid + totalTaxAndMaintenance
  const buyNetCost = totalBuyCashOut - buyerEquity

  const renterInvestmentGain = renterWealth - downPayment
  const rentNetCost = totalRentPaid - renterInvestmentGain

  return {
    downPayment,
    loanAmount,
    monthlyMortgage,
    totalMortgagePaid,
    totalTaxAndMaintenance,
    totalBuyCashOut,
    finalHomeValue,
    remainingLoanBalance: mortgageBalance,
    buyerEquity,
    buyNetCost,
    totalRentPaid,
    renterFinalWealth: renterWealth,
    renterInvestmentGain,
    rentNetCost,
    buyAdvantage: rentNetCost - buyNetCost,
  }
}
