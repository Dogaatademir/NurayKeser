const KEY = 'featured-cache-v1';

export function saveFeaturedCache(payload: unknown) {
  try { localStorage.setItem(KEY, JSON.stringify(payload)); } catch {}
}
export function loadFeaturedCache<T>() : T | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) as T : null;
  } catch { return null; }
}
