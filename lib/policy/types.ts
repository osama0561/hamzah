export type EmploymentType = "civilian" | "military" | "private" | "semi-gov";
export type EmployeeStatus = "active" | "retired";

export type CalculationInput = {
  birthYear: number;
  hireYear: number;
  currentYear: number;
  basicSalary: number;
  netSalary: number;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  conversionFactor: number;
};

export type PhaseResult = {
  exists: boolean;
  months: number;
  years: number;
  deductionRate?: number;
  installment?: number;
  totalInstallments: number;
  reason: string;
};

export type DerivedFields = {
  age: number;
  currentServiceYears: number;
  remainingYearsToRetirement: number;
  currentServiceMonths: number;
  remainingMonthsToRetirement: number;
  totalServiceMonthsAtRetirement: number;
  estimatedPensionSalary: number;
};

export type PersonalLoanBreakdown = {
  deductionRate: number;
  installment: number;
  grossTotal: number;
  netToCustomer: number;
  bankProfit: number;
};

export type CalculationResult = {
  inputs: CalculationInput;
  derived: DerivedFields;
  personal: PersonalLoanBreakdown;
  phases: {
    merged: PhaseResult;
    preRetirement: PhaseResult;
    postRetirement: PhaseResult;
  };
  totals: {
    totalRealEstateInstallments: number;
    finalFinancingValue: number;
    totalMonths: number;
    totalYears: number;
  };
  validation: {
    ok: boolean;
    errors: string[];
    warnings: string[];
  };
  explanations: string[];
};
