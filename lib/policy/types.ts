export type JobType = "مدني" | "عسكري" | "قطاع خاص";
export type EmploymentStatus = "active" | "retired";

export type Commitment = {
  id: string;
  entity: string; // جهة الالتزام
  name: string;   // اسم الالتزام
  amount: number; // قيمة الالتزام (SAR)
};

export type Suspension = {
  id: string;
  bondAmount: number;   // قيمة سند الإيقاف
  beneficiary: string;  // لصالح من
  actualAmount: number; // المبلغ المستحق الفعلي
  reason: string;       // سبب الإيقاف
};

export type CalculationInput = {
  customerName?: string;
  mobile?: string;
  birthYear: number;
  hireYear: number;
  currentYear: number;
  jobType: JobType;
  employmentStatus: EmploymentStatus;

  basicSalary: number;
  netSalary: number;
  personalDiscountRate?: number;
  conversionFactor: number;

  ownerSalePrice: number;
  financingValuation: number;
  propertyValue?: number;

  targetFinancing?: number | "";
  targetInstallment?: number | "";
  targetDuration?: number | "";
  targetFirstPayment?: number | "";

  commitments?: Commitment[];

  hasSuspension?: boolean;
  suspensions?: Suspension[];

  mode?: "customer_driven";
};

export type Stage1 = {
  exists: boolean;
  reason: string;
  mergedYears: number;
  mergedMonths: number;
  personalRate: number;
  personalInstallment: number;
  personalGrossTotal: number;
  personalNetFinance: number;
  personalBankProfits: number;
  personalTotalWithProfits: number;
  mortgageRate: number;
  mortgageInstallment: number;
  mortgageTotal: number;
};

export type Stage2 = {
  exists: boolean;
  reason: string;
  years: number;
  months: number;
  rate: number;
  installment: number;
  total: number;
};

export type Stage3 = {
  exists: boolean;
  reason: string;
  years: number;
  months: number;
  rate: number;
  installment: number;
  total: number;
  retirementSalary: number;
};

export type CalculationResult = {
  inputs: CalculationInput;

  errors: string[];
  warnings: string[];
  notes: string[];

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

  stage1: Stage1;
  stage2: Stage2;
  stage3: Stage3;

  finalMortgageInstallmentsTotal: number;
  conversionFactor: number;
  finalFinancingAmount: number;
  totalDurationYears: number;
  totalStagesCount: number;

  commitmentsTotal: number;
  commitmentsCount: number;

  hasSuspension: boolean;
  suspensionsActualTotal: number;
  suspensionsBondsTotal: number;
  suspensionPayoffProfit: number;
  suspensionTotalRequirement: number;

  ownerSalePrice: number;
  financingValuation: number;
  propertyValue: number;
  theoreticalSurplus: number;
  hasDeficit: boolean;
  displaySurplus: number;
  usableSurplus: number;

  coversActual: boolean;
  coversWithProfit: boolean;
  remainingAfterSuspension: number;
  shortfallActual: number;
  shortfallWithProfit: number;

  firstPayment: number;
  firstPaymentRate: number;
};
