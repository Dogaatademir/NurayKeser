export function formatTRY(value: number | string) {
  const n = typeof value === "string" ? parseInt(value.replace(/[^\d]/g, ""), 10) : value;
  if (!n || isNaN(n)) return "—";
  // TR biçemi: 2.150.000
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(n) + " TL";
}
