import { POLICY } from "./constants";
import type { CalculationInput, DerivedFields } from "./types";

export function computeDerived(input: CalculationInput): DerivedFields {
  const age = input.currentYear - input.birthYear;
  const currentServiceYears = input.currentYear - input.hireYear;
  const remainingYearsToRetirement = Math.max(0, POLICY.RETIREMENT_AGE - age);
  const currentServiceMonths = currentServiceYears * 12;
  const remainingMonthsToRetirement = remainingYearsToRetirement * 12;
  const totalServiceMonthsAtRetirement =
    currentServiceMonths + remainingMonthsToRetirement;
  const estimatedPensionSalary =
    (input.basicSalary * totalServiceMonthsAtRetirement) /
    POLICY.PENSION_DIVISOR;

  return {
    age,
    currentServiceYears,
    remainingYearsToRetirement,
    currentServiceMonths,
    remainingMonthsToRetirement,
    totalServiceMonthsAtRetirement,
    estimatedPensionSalary,
  };
}

export function realEstateCeilingFor(netOrPensionSalary: number): number {
  return netOrPensionSalary >= POLICY.SALARY_CEILING_BREAKPOINT
    ? POLICY.REAL_ESTATE_CEILING_HIGH_SALARY
    : POLICY.REAL_ESTATE_CEILING_LOW_SALARY;
}

export function personalDeductionRateFor(
  status: CalculationInput["status"],
): number {
  return status === "active"
    ? POLICY.PERSONAL_DEDUCTION_RATE_ACTIVE
    : POLICY.PERSONAL_DEDUCTION_RATE_RETIRED;
}
