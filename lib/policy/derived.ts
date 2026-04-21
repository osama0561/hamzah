import { POLICY } from "./constants";
import type { CalculationInput, EmploymentStatus } from "./types";

export type DerivedBasics = {
  age: number;
  currentServiceYears: number;
  currentServiceMonths: number;
  yearsToRetirement: number;
  monthsToRetirement: number;
  totalRetirementServiceMonths: number;
  retirementSalary: number;
  isRetired: boolean;
  goesDirectToRetirement: boolean;
  personalRate: number;
  mortgageCap: number;
  retirementMortgageCap: number;
};

export function realEstateCeilingFor(netOrPensionSalary: number): number {
  return netOrPensionSalary >= POLICY.SALARY_CEILING_BREAKPOINT
    ? POLICY.REAL_ESTATE_CEILING_HIGH_SALARY
    : POLICY.REAL_ESTATE_CEILING_LOW_SALARY;
}

export function personalDeductionRateFor(
  status: EmploymentStatus,
): number {
  return status === "active"
    ? POLICY.PERSONAL_DEDUCTION_RATE_ACTIVE
    : POLICY.PERSONAL_DEDUCTION_RATE_RETIRED;
}

export function computeDerived(input: CalculationInput): DerivedBasics {
  const currentYear = Number(input.currentYear) || new Date().getFullYear();
  const birthYear = Number(input.birthYear) || 0;
  const hireYear = Number(input.hireYear) || 0;
  const basicSalary = Number(input.basicSalary) || 0;
  const netSalary = Number(input.netSalary) || 0;

  const age = Math.max(0, currentYear - birthYear);
  const currentServiceYears = Math.max(0, currentYear - hireYear);
  const currentServiceMonths = currentServiceYears * 12;
  const yearsToRetirement = Math.max(0, POLICY.RETIREMENT_AGE - age);
  const monthsToRetirement = yearsToRetirement * 12;
  const totalRetirementServiceMonths = currentServiceMonths + monthsToRetirement;

  const retirementSalary =
    (basicSalary * totalRetirementServiceMonths) / POLICY.PENSION_DIVISOR;

  const goesDirectToRetirement =
    input.employmentStatus !== "retired" &&
    monthsToRetirement > 0 &&
    monthsToRetirement <= POLICY.DIRECT_RETIREMENT_THRESHOLD_MONTHS;

  const isRetired =
    input.employmentStatus === "retired" ||
    goesDirectToRetirement ||
    yearsToRetirement === 0;

  const personalRate = isRetired
    ? POLICY.PERSONAL_DEDUCTION_RATE_RETIRED
    : POLICY.PERSONAL_DEDUCTION_RATE_ACTIVE;

  const mortgageCap = realEstateCeilingFor(netSalary);
  const retirementMortgageCap = realEstateCeilingFor(retirementSalary);

  return {
    age,
    currentServiceYears,
    currentServiceMonths,
    yearsToRetirement,
    monthsToRetirement,
    totalRetirementServiceMonths,
    retirementSalary,
    isRetired,
    goesDirectToRetirement,
    personalRate,
    mortgageCap,
    retirementMortgageCap,
  };
}
