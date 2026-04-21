// Formatters follow prospect spec §7: English digits, thousands separators,
// wrap in LTR span for RTL pages. We expose both the new API (fmt, fmtSAR,
// fmtPct) and the old API (formatSAR, formatPercent) as aliases, so any
// lingering imports keep working.

export function fmt(n: number | null | undefined, digits = 0): string {
  if (n === null || n === undefined || !Number.isFinite(Number(n))) return "—";
  return Number(n).toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function fmtSAR(n: number | null | undefined, digits = 0): string {
  if (n === null || n === undefined || !Number.isFinite(Number(n))) return "—";
  return `${fmt(n, digits)} ر.س`;
}

export function fmtPct(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(Number(n))) return "—";
  return `${(Number(n) * 100).toFixed(1)}%`;
}

// Legacy aliases
export function formatSAR(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return fmt(Math.round(n));
}

export function formatPercent(n: number): string {
  return fmtPct(n);
}

export function formatDecimal(n: number, digits = 2): string {
  return fmt(n, digits);
}
