import type { PersonalLoanInput, PersonalLoanResult } from '~/types/personalLoan'
import { annuityPayment, computeApr } from '~/utils/finance'

const WAN = 10_000

/**
 * 信貸試算：簡化版本（無寬限、無兩段式、無加碼還本）。
 * 數學等同於房貸的等額本息攤還。
 *
 * 額外計算 DBR 22 倍規範指標：
 * - 金管會規定銀行給單一借款人的「無擔保負債總餘額」不得超過「月所得 22 倍」
 * - 包括：信貸、信用卡循環、現金卡（不含房貸/車貸這類有擔保）
 */
export function calculatePersonalLoan(input: PersonalLoanInput): PersonalLoanResult {
  const principal = input.amountWan * WAN
  const totalMonths = Math.round(input.years * 12)
  const monthlyRate = input.rate / 100 / 12

  const monthlyPayment =
    principal > 0 && totalMonths > 0
      ? annuityPayment(principal, monthlyRate, totalMonths)
      : 0
  const totalPayment = monthlyPayment * totalMonths
  const totalInterest = totalPayment - principal
  const totalCost = totalPayment + input.originationFee

  const apr = computeApr(
    Array.from({ length: totalMonths }, () => monthlyPayment),
    principal - input.originationFee,
  )

  // DBR 22 倍規範
  const totalUnsecuredDebt = principal + Math.max(0, input.existingUnsecuredDebt)
  const dbrLimitAmount = Math.max(0, input.monthlyIncome) * 22
  const dbrTimes =
    input.monthlyIncome > 0 ? totalUnsecuredDebt / input.monthlyIncome : Infinity
  const dbrUsageRatio = dbrLimitAmount > 0 ? totalUnsecuredDebt / dbrLimitAmount : Infinity

  let dbrLevel: PersonalLoanResult['dbrLevel']
  if (!Number.isFinite(dbrUsageRatio) || dbrUsageRatio > 1) dbrLevel = 'exceeded'
  else if (dbrUsageRatio > 0.7) dbrLevel = 'warning'
  else dbrLevel = 'safe'

  return {
    principal,
    originationFee: input.originationFee,
    totalMonths,
    monthlyPayment,
    totalInterest,
    totalCost,
    apr,
    totalUnsecuredDebt,
    dbrLimitAmount,
    dbrTimes,
    dbrUsageRatio,
    dbrLevel,
  }
}
