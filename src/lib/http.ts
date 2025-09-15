export async function withTimeout<T>(p: Promise<T>, ms = 8000, abort?: AbortController) {
  return await Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => {
      abort?.abort();
      rej(new Error(`İstek zaman aşımına uğradı (${ms}ms)`));
    }, ms))
  ]);
}

export async function retry<T>(
  fn: (signal?: AbortSignal) => Promise<T>,
  { retries = 3, baseDelay = 400 }: { retries?: number; baseDelay?: number } = {}
): Promise<T> {
  let lastErr: any;
  for (let i = 0; i <= retries; i++) {
    const ctrl = new AbortController();
    try {
      return await withTimeout(fn(ctrl.signal), 8000 + i * 1000, ctrl);
    } catch (e) {
      lastErr = e;
      if (i < retries) await new Promise(r => setTimeout(r, baseDelay * 2 ** i));
    }
  }
  throw lastErr;
}
