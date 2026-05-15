/** Format milliseconds as mm:ss.t (where t = tenths of a second). */
export function formatTime(ms: number): string {
  if (ms < 0) ms = 0;
  const totalSec = Math.floor(ms / 1000);
  const mm = String(Math.floor(totalSec / 60)).padStart(2, "0");
  const ss = String(totalSec % 60).padStart(2, "0");
  const tenth = Math.floor((ms % 1000) / 100);
  return `${mm}:${ss}.${tenth}`;
}

/** Pad to width with leading zeroes — Minesweeper-classic 3-digit counter. */
export function pad3(n: number): string {
  const v = Math.max(-99, Math.min(999, n));
  if (v < 0) return `-${String(Math.abs(v)).padStart(2, "0")}`;
  return String(v).padStart(3, "0");
}

export function formatPrice(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}
