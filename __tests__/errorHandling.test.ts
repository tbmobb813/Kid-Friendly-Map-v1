import { beforeEach, describe, expect, it, jest } from '@jest/globals';

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
  getItem: jest.Mock<Promise<string | null>, [string]>;
  setItem: jest.Mock<Promise<void>, [string, string]>;
  removeItem: jest.Mock<Promise<void>, [string]>;
  clear: jest.Mock<Promise<void>, []>;
};

import {
  SafeAsyncStorage,
  withRetry,
  DEFAULT_RETRY_CONFIG,
  handleLocationError,
  handleNetworkError,
  handleCameraError,
  createSafetyErrorBoundary,
} from '@/utils/errorHandling';

describe('Error Handling Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('withRetry', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should succeed on first attempt', async () => {
      const mockOperation = jest.fn<() => Promise<string>>().mockResolvedValue('success'); // Specify return type
      const result = await withRetry(() => mockOperation(), DEFAULT_RETRY_CONFIG.storage);

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const mockOperation = jest
        .fn<() => Promise<string>>() // Specify return type
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValue('success');

      const result = await withRetry(mockOperation, DEFAULT_RETRY_CONFIG.storage);

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(3);
    });

    it('should fail after max attempts', async () => {
      const mockOperation = jest
        .fn<() => Promise<any>>()
        .mockRejectedValue(new Error('Persistent failure'));

      await expect(
        withRetry(() => mockOperation(), { maxAttempts: 2, delayMs: 10 }),
      ).rejects.toThrow('Persistent failure');

      expect(mockOperation).toHaveBeenCalledTimes(2);
    });

    it('should respect shouldRetry function', async () => {
      const mockOperation = jest
        .fn<() => Promise<Error>>()
        .mockRejectedValue(new Error('Non-retryable'));

      // Correctly type the shouldRetry function
      const shouldRetry: (error: Error, attempt: number) => boolean = jest.fn((error, attempt) => {
        return attempt < 3; // Example logic for retrying
      });

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
  });

  describe('SafeAsyncStorage', () => {
    beforeEach(() => {
      // Reset the mock before each test
      jest.clearAllMocks();
    });

    it('should get item successfully', async () => {
      const testData = { test: 'data' };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(testData)); // Ensure correct type

      const result = await SafeAsyncStorage.getItem('test-key');

      expect(result).toEqual(testData);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('test-key');
    });

    it('should return fallback value on get failure', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
      const fallback = { fallback: 'value' };

      const result = await SafeAsyncStorage.getItem('test-key', fallback);

      expect(result).toEqual(fallback);
    });

    it('should handle storage errors', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error')); // Ensure correct type

      await expect(SafeAsyncStorage.getItem('test-key')).rejects.toThrow('Storage error');
    });

    it('should set item successfully', async () => {
      mockAsyncStorage.setItem.mockResolvedValue(undefined); // Ensure correct type

      await SafeAsyncStorage.setItem('test-key', 'test-value');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('test-key', 'test-value');
    });

    it('should handle batch operations', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('{"test":"data"}');
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      const operations = [
        { key: 'key1', operation: 'get' as const },
        { key: 'key2', operation: 'set' as const, value: { new: 'data' } },
      ];

      const results = await SafeAsyncStorage.batchOperation(operations);

      expect(results).toHaveLength(2);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('key1');
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'key2',
        JSON.stringify({ new: 'data' }),
      );
    });
  });

  describe('Error message handling', () => {
    it('should provide user-friendly location error messages', () => {
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
  });

  describe('Safety Error Boundary', () => {
    it('should create error boundary with proper configuration', () => {
      const ErrorBoundary = createSafetyErrorBoundary('TestComponent');

      expect(ErrorBoundary).toBeDefined();
      expect(ErrorBoundary.name).toBe('SafetyErrorBoundary');
    });
  });
});
