/**
 * Safe AbortSignal timeout helper.
 * Some Node/JSDOM environments may not implement AbortSignal.timeout.
 * Provide a small polyfill that returns an AbortSignal which aborts after the given ms.
 */
export function timeoutSignal(ms: number): AbortSignal {
  // Use built-in when available (Node 18+ / modern runtimes)
  // Cast to any to avoid TS complaining when lib.dom types don't include timeout.
  const native: any = (AbortSignal as unknown) as any;
  if (native && typeof native.timeout === 'function') {
    try {
      return native.timeout(ms);
    } catch (e) {
      // fall through to polyfill
    }
  }

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);

  // Clear timer if signal is aborted (cleanup)
  controller.signal.addEventListener(
    'abort',
    () => {
      clearTimeout(id);
    },
    { once: true },
  );

  return controller.signal;
}
