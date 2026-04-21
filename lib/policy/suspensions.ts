import { POLICY } from "./constants";
import type { Suspension } from "./types";

export type SuspensionsAggregate = {
  hasSuspension: boolean;
  suspensionsActualTotal: number;
  suspensionsBondsTotal: number;
  suspensionPayoffProfit: number;
  suspensionTotalRequirement: number;
};

export function aggregateSuspensions(
  hasSuspension: boolean,
  suspensions: Suspension[] | undefined,
): SuspensionsAggregate {
  const list = hasSuspension ? suspensions || [] : [];

  const suspensionsActualTotal = list.reduce(
    (s, x) => s + (Number(x.actualAmount) || 0),
    0,
  );
  const suspensionsBondsTotal = list.reduce(
    (s, x) => s + (Number(x.bondAmount) || 0),
    0,
  );
  const suspensionPayoffProfit =
    suspensionsActualTotal * POLICY.SUSPENSION_PROFIT_RATE;
  const suspensionTotalRequirement =
    suspensionsActualTotal + suspensionPayoffProfit;

  return {
    hasSuspension: !!hasSuspension,
    suspensionsActualTotal,
    suspensionsBondsTotal,
    suspensionPayoffProfit,
    suspensionTotalRequirement,
  };
}

export type SuspensionCoverage = {
  coversActual: boolean;
  coversWithProfit: boolean;
  remainingAfterSuspension: number;
  shortfallActual: number;
  shortfallWithProfit: number;
};

export function computeCoverage(
  displaySurplus: number,
  agg: SuspensionsAggregate,
): SuspensionCoverage {
  const coversActual = displaySurplus >= agg.suspensionsActualTotal;
  const coversWithProfit = displaySurplus >= agg.suspensionTotalRequirement;
  const remainingAfterSuspension = coversWithProfit
    ? displaySurplus - agg.suspensionTotalRequirement
    : 0;
  const shortfallActual = coversActual
    ? 0
    : agg.suspensionsActualTotal - displaySurplus;
  const shortfallWithProfit = coversWithProfit
    ? 0
    : agg.suspensionTotalRequirement - displaySurplus;

  return {
    coversActual,
    coversWithProfit,
    remainingAfterSuspension,
    shortfallActual,
    shortfallWithProfit,
  };
}
