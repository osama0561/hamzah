export const POLICY = {
  RETIREMENT_AGE: 60,
  DIRECT_RETIREMENT_THRESHOLD_MONTHS: 18,
  MAX_MERGED_YEARS: 5,
  MAX_TOTAL_YEARS: 25,

  PERSONAL_DEDUCTION_RATE_ACTIVE: 0.33,
  PERSONAL_DEDUCTION_RATE_RETIRED: 0.25,

  REAL_ESTATE_CEILING_HIGH_SALARY: 0.65,
  REAL_ESTATE_CEILING_LOW_SALARY: 0.55,
  SALARY_CEILING_BREAKPOINT: 15000,

  // Per prospect spec §3: default personal discount rate.
  // CEO's original hand-calculated case uses 0.17 — callers must pass
  // personalDiscountRate: 0.17 explicitly to reproduce that sheet.
  DEFAULT_PERSONAL_DISCOUNT: 0.30,

  PENSION_DIVISOR: 480,

  // Bank fee added on top of suspension payoff (25%). Spec §3.
  SUSPENSION_PROFIT_RATE: 0.25,

  DEFAULT_CONVERSION_FACTOR: 2.16,
} as const;
