import { computed, reactive, type ComputedRef } from 'vue'
import type {
  LoanInput,
  FinanceProfile,
  LoanResult,
  DsrDiagnosis,
} from '~/types/loan'
import { calculateLoan, diagnoseDsr } from '~/utils/finance'

export interface ScenarioDiagnosis {
  result: LoanResult
  disposableIncome: number
  stage1Dsr: DsrDiagnosis
  stage2Dsr: DsrDiagnosis
}

/** 建立一個可響應的貸款方案狀態與其衍生試算結果 */
export function useLoanScenario(initial: LoanInput) {
  const input = reactive<LoanInput>({ ...initial })
  const result = computed<LoanResult>(() => calculateLoan(input))
  return { input, result }
}

/**
 * 結合方案結果與個人財務狀況，產出分階段 DSR 診斷。
 */
export function useDiagnosis(
  result: ComputedRef<LoanResult>,
  profile: FinanceProfile,
): ComputedRef<ScenarioDiagnosis> {
  return computed(() => {
    const disposableIncome = Math.max(
      0,
      profile.monthlyIncome - profile.existingExpenses,
    )
    return {
      result: result.value,
      disposableIncome,
      stage1Dsr: diagnoseDsr(result.value.stage1Payment, disposableIncome),
      stage2Dsr: diagnoseDsr(result.value.stage2Payment, disposableIncome),
    }
  })
}
