export function formatSAR(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("ar-SA", {
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

export function formatPercent(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return `${(n * 100).toFixed(1)}٪`;
}

export function formatDecimal(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("ar-SA", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(n);
}
