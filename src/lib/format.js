// Shared formatting helpers used across dashboard, project, and table views.

export function formatCurrency(value) {
  const n = value ?? 0;
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

export function formatNumber(value, digits = 0) {
  const n = value ?? 0;
  return n.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value.length <= 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatPercent(value) {
  const n = value ?? 0;
  return `${Math.round(n)}%`;
}

// For <input type="date"> values, which need YYYY-MM-DD exactly.
export function toDateInputValue(value) {
  if (!value) return "";
  return value.slice(0, 10);
}
