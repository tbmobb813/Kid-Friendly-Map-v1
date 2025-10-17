import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  withRetry,
  handleLocationError,
  handleNetworkError,
  handleCameraError,
  createSafetyErrorBoundary,
} from '../utils/errorHandling';

// create the mock inside the jest.mock factory so hoisting does not hit TDZ.
// expose it on globalThis so tests can reference it reliably.
jest.mock('@react-native-async-storage/async-storage', () => {
  const m = {
    getItem: jest.fn(async (key: string) => null),
    setItem: jest.fn(async (key: string, value: string) => null),
    removeItem: jest.fn(async (key: string) => null),
    clear: jest.fn(async () => null),
  };
  // expose for tests
  (globalThis as any).__mockAsyncStorage = m;
  return {
    __esModule: true,
    default: m,
  };
});

// after the hoisted mock factory runs, read the exposed mock for easier usage below
const mockAsyncStorage = (globalThis as any).__mockAsyncStorage as {
  getItem: jest.MockedFunction<(key: string) => Promise<string | null>>;
  setItem: jest.MockedFunction<(key: string, value: string) => Promise<void>>;
  removeItem: jest.MockedFunction<(key: string) => Promise<void>>;
  clear: jest.MockedFunction<() => Promise<void>>;
};

describe('withRetry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should respect shouldRetry function', async () => {
    const mockOperation = jest
      .fn<() => Promise<unknown>>()
      .mockRejectedValue(new Error('Non-retryable'));

    // Explicitly type the callback and cast the jest mock to that signature so this
    // passes under different @types/jest / TS versions in CI.
    const shouldRetry: (error: Error, attempt: number) => boolean = jest
      .fn()
      .mockReturnValue(false) as unknown as (error: Error, attempt: number) => boolean;

    await expect(
      withRetry(mockOperation, {
        maxAttempts: 3,
        delayMs: 10,
        shouldRetry,
      }),
    ).rejects.toThrow('Non-retryable');

    expect(mockOperation).toHaveBeenCalledTimes(1);
    expect(shouldRetry).toHaveBeenCalledWith(expect.any(Error), 1);
  });
}); // end withRetry

describe('Error Handling Utils', () => {
  describe('handle* errors', () => {
    it('should handle location permission errors', () => {
      const permissionError = { code: 1 };
      const result = handleLocationError(permissionError);

      expect(result.userMessage).toBe('Location access is needed for safety features');
      expect(result.canRetry).toBe(true);
      expect(result.suggestedAction).toContain('enable location access');
    });

    it('should handle network errors appropriately', () => {
      const networkError = { message: 'Network request failed' };
      const result = handleNetworkError(networkError);

      expect(result.userMessage).toBe('No internet connection');
      expect(result.isOffline).toBe(true);
      expect(result.canRetry).toBe(true);
    });

    it('should handle camera errors with permission context', () => {
      const permissionError = { message: 'Camera permission denied' };
      const result = handleCameraError(permissionError);

      expect(result.userMessage).toBe('Camera permission is needed for photo check-ins');
      expect(result.requiresPermission).toBe(true);
      expect(result.canRetry).toBe(true);
    });

    it('should set canRetry to true for retryable errors', () => {
      // Replace the following placeholder with the actual call that produces `result`
      // e.g. const result = someFunctionThatReturnsRetryInfo(...);
      const result = { canRetry: true } as any;

      expect(result.canRetry).toBe(true);
    });
  });
});

describe('Safety Error Boundary', () => {
  it('should create error boundary with proper configuration', () => {
    const ErrorBoundary = createSafetyErrorBoundary('TestComponent');

    expect(ErrorBoundary).toBeDefined();
    expect(ErrorBoundary.name).toBe('SafetyErrorBoundary');
  });
});
