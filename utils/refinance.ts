import type { RefinanceInput, RefinanceResult } from '~/types/refinance'
import { annuityPayment } from '~/utils/finance'

const WAN = 10_000

/**
 * 房貸轉貸試算。
 *
 * 模型：
 * - 算出目前剩餘本金（已繳 N 期後的 outstanding balance）
 * - 「不轉貸」場景：剩餘月數 × 原月付 − 剩餘本金 ≈ 剩餘要繳的總利息
 * - 「轉貸」場景：新本金（= 目前剩餘本金）× 新利率 × 新年限的總利息
 * - 比較利息差 vs 轉貸前置費用（代書、塗銷、違約金）
 * - 計算損益平衡點（多少月後省下的月付差能 cover 前置成本）
 */
export function calculateRefinance(input: RefinanceInput): RefinanceResult {
  const oldPrincipal = input.originalAmountWan * WAN
  const oldMonthlyRate = input.currentRate / 100 / 12
  const oldTotalMonths = Math.round(input.originalYears * 12)
  const paidMonths = Math.max(0, Math.min(input.paidMonths, oldTotalMonths))

  const oldMonthlyPayment =
    oldPrincipal > 0 && oldTotalMonths > 0
      ? annuityPayment(oldPrincipal, oldMonthlyRate, oldTotalMonths)
      : 0

  // 已繳 N 期後的剩餘本金
  let balance = oldPrincipal
  for (let m = 0; m < paidMonths; m++) {
    const interest = balance * oldMonthlyRate
    const principal = oldMonthlyPayment - interest
    balance -= principal
    if (balance < 0) balance = 0
  }
  const currentBalance = Math.max(0, balance)
  const remainingMonths = oldTotalMonths - paidMonths

  // 不轉貸的話，未來預計還要繳的利息
  const oldRemainingInterest =
    oldMonthlyPayment * remainingMonths - currentBalance

  // 新方案
  const newMonthlyRate = input.newRate / 100 / 12
  const newTotalMonths = Math.round(input.newYears * 12)
  const newMonthlyPayment =
    currentBalance > 0 && newTotalMonths > 0
      ? annuityPayment(currentBalance, newMonthlyRate, newTotalMonths)
      : 0
  const newTotalInterest = newMonthlyPayment * newTotalMonths - currentBalance

  // 成本與省下
  const upfrontCost = Math.max(0, input.refinanceFees) + Math.max(0, input.penalty)
  const monthlyPaymentDiff = oldMonthlyPayment - newMonthlyPayment
  const interestSaved = oldRemainingInterest - newTotalInterest
  const netSaving = interestSaved - upfrontCost

  // 損益平衡：月付差 × N 個月 = 前置成本
  let breakEvenMonths = -1
  if (monthlyPaymentDiff > 0) {
    breakEvenMonths = Math.ceil(upfrontCost / monthlyPaymentDiff)
  }

  return {
    currentBalance,
    remainingMonths,
    oldMonthlyPayment,
    oldRemainingInterest,
    newMonthlyPayment,
    newTotalInterest,
    upfrontCost,
    monthlyPaymentDiff,
    interestSaved,
    netSaving,
    breakEvenMonths,
    worthIt: netSaving > 0,
  }
}
