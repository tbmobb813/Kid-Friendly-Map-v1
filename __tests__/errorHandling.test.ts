import { SafeAsyncStorage, withRetry, DEFAULT_RETRY_CONFIG } from '@/utils/errorHandling';

describe('Error Handling Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
      const mockOperation = jest.fn().mockResolvedValue('success');
      const result = await withRetry(mockOperation, DEFAULT_RETRY_CONFIG.storage);
      
      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const mockOperation = jest.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValue('success');
      
      const result = await withRetry(mockOperation, DEFAULT_RETRY_CONFIG.storage);
      
      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(3);
    });

    it('should fail after max attempts', async () => {
      const mockOperation = jest.fn().mockRejectedValue(new Error('Persistent failure'));
      
      await expect(
        withRetry(mockOperation, { maxAttempts: 2, delayMs: 10 })
      ).rejects.toThrow('Persistent failure');
      
      expect(mockOperation).toHaveBeenCalledTimes(2);
    });

    it('should respect shouldRetry function', async () => {
      const mockOperation = jest.fn().mockRejectedValue(new Error('Non-retryable'));
      const shouldRetry = jest.fn().mockReturnValue(false);
      
      await expect(
        withRetry(mockOperation, { 
          maxAttempts: 3, 
          delayMs: 10, 
          shouldRetry 
        })
      ).rejects.toThrow('Non-retryable');
      
      expect(mockOperation).toHaveBeenCalledTimes(1);
      expect(shouldRetry).toHaveBeenCalledWith(expect.any(Error), 1);
    });
  });

  describe('SafeAsyncStorage', () => {
    const mockAsyncStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };

    beforeEach(() => {
      // Mock AsyncStorage
      jest.doMock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
    });

    it('should get item successfully', async () => {
      const testData = { test: 'data' };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(testData));
      
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

    it('should set item successfully', async () => {
      const testData = { test: 'data' };
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
      
      const result = await SafeAsyncStorage.setItem('test-key', testData);
      
      expect(result).toEqual(testData);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(testData));
    });

    it('should handle batch operations', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('{"test":"data"}');
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
      
      const operations = [
        { key: 'key1', operation: 'get' as const },
        { key: 'key2', operation: 'set' as const, value: { new: 'data' } }
      ];
      
      const results = await SafeAsyncStorage.batchOperation(operations);
      
      expect(results).toHaveLength(2);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('key1');
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('key2', JSON.stringify({ new: 'data' }));
    });
  });

  describe('Error message handling', () => {
    it('should provide user-friendly location error messages', async () => {
      const { handleLocationError } = await import('@/utils/errorHandling');
      
      const permissionError = { code: 1 };
      const result = handleLocationError(permissionError);
      
      expect(result.userMessage).toBe('Location access is needed for safety features');
      expect(result.canRetry).toBe(true);
      expect(result.suggestedAction).toContain('enable location access');
    });

    it('should handle network errors appropriately', async () => {
      const { handleNetworkError } = await import('@/utils/errorHandling');
      
      const networkError = { message: 'Network request failed' };
      const result = handleNetworkError(networkError);
      
      expect(result.userMessage).toBe('No internet connection');
      expect(result.isOffline).toBe(true);
      expect(result.canRetry).toBe(true);
    });

    it('should handle camera errors with permission context', async () => {
      const { handleCameraError } = await import('@/utils/errorHandling');
      
      const permissionError = { message: 'Camera permission denied' };
      const result = handleCameraError(permissionError);
      
      expect(result.userMessage).toBe('Camera permission is needed for photo check-ins');
      expect(result.requiresPermission).toBe(true);
      expect(result.canRetry).toBe(true);
    });
  });

  describe('Safety Error Boundary', () => {
    it('should create error boundary with proper configuration', async () => {
      const { createSafetyErrorBoundary } = await import('@/utils/errorHandling');
      
      const ErrorBoundary = createSafetyErrorBoundary('TestComponent');
      
      expect(ErrorBoundary).toBeDefined();
      expect(ErrorBoundary.name).toBe('SafetyErrorBoundary');
    });
  });
});
