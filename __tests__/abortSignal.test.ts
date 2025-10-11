import { timeoutSignal } from '../utils/abortSignal';

describe('timeoutSignal helper', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Ensure native AbortSignal.timeout is not present by default in this environment
    // (some Node versions may provide it) - delete if present to test fallback.
    // We'll restore any original value after tests that mock it.
    if ((global as any).AbortSignal && (AbortSignal as any).timeout) {
      // stash and delete for fallback tests
      (global as any).__origAbortSignalTimeout = (AbortSignal as any).timeout;
      delete (AbortSignal as any).timeout;
    }
  });

  afterEach(() => {
    jest.useRealTimers();
    if ((global as any).__origAbortSignalTimeout) {
      (AbortSignal as any).timeout = (global as any).__origAbortSignalTimeout;
      delete (global as any).__origAbortSignalTimeout;
    }
    jest.restoreAllMocks();
  });

  test('fallback aborts after given ms', async () => {
    const sig = timeoutSignal(1000);
    const onAbort = jest.fn();
    sig.addEventListener('abort', onAbort);

    // not yet aborted
    expect(sig.aborted).toBe(false);

    // advance time to trigger abort
    jest.advanceTimersByTime(1000);

    expect(onAbort).toHaveBeenCalled();
    expect(sig.aborted).toBe(true);
  });

  test('uses native AbortSignal.timeout when available', () => {
    // mock native AbortSignal.timeout to verify we take that branch
    const orig = (AbortSignal as any).timeout;
    const mockTimeout = jest.fn((ms: number) => ({ fake: true, ms }));
    (AbortSignal as any).timeout = mockTimeout;

    const sig = timeoutSignal(5000) as unknown as { fake?: boolean; ms?: number };
    expect(mockTimeout).toHaveBeenCalledWith(5000);
    expect(sig.fake).toBe(true);

    // restore
    (AbortSignal as any).timeout = orig;
  });
});
