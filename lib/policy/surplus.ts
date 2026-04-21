import type { CalculationInput } from "./types";

export type SurplusAggregate = {
  ownerSalePrice: number;
  financingValuation: number;
  propertyValue: number;
  theoreticalSurplus: number;
  hasDeficit: boolean;
  displaySurplus: number;
  usableSurplus: number;
  firstPayment: number;
  firstPaymentRate: number;
};

export function computeSurplus(
  input: CalculationInput,
  finalFinancingAmount: number,
): SurplusAggregate {
  const ownerSalePrice = Number(input.ownerSalePrice) || 0;
  const financingValuation = Number(input.financingValuation) || 0;
  const propertyValue =
    Number(input.propertyValue) || ownerSalePrice || 0;

  const theoreticalSurplus = financingValuation - ownerSalePrice;
  const hasDeficit = theoreticalSurplus < 0;
  const displaySurplus = Math.max(0, theoreticalSurplus);
  const usableSurplus = Math.max(
    0,
    Math.min(displaySurplus, finalFinancingAmount),
  );

  const firstPayment = Math.max(0, propertyValue - finalFinancingAmount);
  const firstPaymentRate =
    propertyValue > 0 ? firstPayment / propertyValue : 0;

  return {
    ownerSalePrice,
    financingValuation,
    propertyValue,
    theoreticalSurplus,
    hasDeficit,
    displaySurplus,
    usableSurplus,
    firstPayment,
    firstPaymentRate,
  };
}
