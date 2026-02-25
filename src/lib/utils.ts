const CACHE_KEY = 'featured-cache-v1';

// Fiyat formatlama (TR standartları)
export function formatTRY(value: number | string): string {
  const n = typeof value === "string" ? parseInt(value.replace(/[^\d]/g, ""), 10) : value;
  if (!n || isNaN(n)) return "—";
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(n) + " TL";
}

// Basit LocalStorage Cache Mekanizması
export function saveFeaturedCache(payload: unknown) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(payload)); } catch {}
}

export function loadFeaturedCache<T>(): T | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) as T : null;
  } catch { return null; }
}