// Minimal Sentry initialization wrapper. Add @sentry/react-native in production

export function initSentry(dsn?: string) {
  if (!dsn) {
    // No-op when SENTRY_DSN is not provided
    return { captureException: (e: any) => console.error('Sentry not configured', e) };
  }

  try {
    // Lazy-import so local dev without Sentry dependency won't fail
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require('@sentry/react-native');

    Sentry.init({ dsn });

    return Sentry;
  } catch (err) {
    // Fallback - log and continue
    // eslint-disable-next-line no-console
    console.warn('Sentry dependency not installed or failed to initialize', err);
    return { captureException: (e: any) => console.error('Sentry fallback', e) };
  }
}
