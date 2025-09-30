import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { log } from './logger';
import React from 'react';
import { View, Text, Pressable } from 'react-native';

// Enhanced error handling utilities for safety-critical operations

export type RetryOptions = {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: Error, attempt: number) => boolean;
};

export type StorageOperation<T> = {
  key: string;
  operation: 'get' | 'set' | 'remove';
  value?: T;
};

export type ErrorRecoveryStrategy = {
  strategy: 'retry' | 'fallback' | 'ignore' | 'escalate';
  fallbackValue?: any;
  onError?: (error: Error) => void;
};

// Default retry configuration for different operation types
export const DEFAULT_RETRY_CONFIG: Record<string, RetryOptions> = {
  storage: {
    maxAttempts: 3,
    delayMs: 100,
    backoffMultiplier: 2,
    maxDelayMs: 1000,
    shouldRetry: (error: Error) => !error.message.includes('quota')
  },
  network: {
    maxAttempts: 3,
    delayMs: 1000,
    backoffMultiplier: 2,
    maxDelayMs: 5000,
    shouldRetry: (error: Error) => !error.message.includes('404')
  },
  location: {
    maxAttempts: 2,
    delayMs: 500,
    backoffMultiplier: 1.5,
    maxDelayMs: 2000
  },
  critical: {
    maxAttempts: 5,
    delayMs: 200,
    backoffMultiplier: 1.5,
    maxDelayMs: 3000
  }
};

// Generic retry mechanism with exponential backoff
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions,
  context: string = 'operation'
): Promise<T> {
  let lastError: Error;
  let delay = options.delayMs;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      log.debug(`Attempting ${context} (attempt ${attempt}/${options.maxAttempts})`);
      const result = await operation();
      
      if (attempt > 1) {
        log.info(`${context} succeeded after ${attempt} attempts`);
      }
      
      return result;
    } catch (error) {
      lastError = error as Error;
      
      log.warn(`${context} failed on attempt ${attempt}`, { 
        error: lastError.message,
        attempt,
        maxAttempts: options.maxAttempts
      });

      // Check if we should retry this error
      if (options.shouldRetry && !options.shouldRetry(lastError, attempt)) {
        log.error(`${context} failed with non-retryable error`, lastError);
        throw lastError;
      }

      // Don't wait after the last attempt
      if (attempt < options.maxAttempts) {
        log.debug(`Waiting ${delay}ms before retry`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Apply backoff multiplier
        if (options.backoffMultiplier) {
          delay = Math.min(
            delay * options.backoffMultiplier,
            options.maxDelayMs || delay * options.backoffMultiplier
          );
        }
      }
    }
  }

  log.error(`${context} failed after ${options.maxAttempts} attempts`, lastError!);
  throw lastError!;
}

// Enhanced AsyncStorage operations with retry and error recovery
export class SafeAsyncStorage {
  private static async performOperation<T>(
    operation: StorageOperation<T>,
    recovery: ErrorRecoveryStrategy = { strategy: 'retry' }
  ): Promise<T | null> {
    const retryOptions = DEFAULT_RETRY_CONFIG.storage;
    
    try {
      return await withRetry(async () => {
        switch (operation.operation) {
          case 'get':
            const stored = await AsyncStorage.getItem(operation.key);
            return stored ? JSON.parse(stored) : null;
          
          case 'set':
            await AsyncStorage.setItem(operation.key, JSON.stringify(operation.value));
            return operation.value;
          
          case 'remove':
            await AsyncStorage.removeItem(operation.key);
            return null;
          
          default:
            throw new Error(`Unknown storage operation: ${operation.operation}`);
        }
      }, retryOptions, `AsyncStorage ${operation.operation} ${operation.key}`);
      
    } catch (error) {
      const err = error as Error;
      log.error(`Storage operation failed: ${operation.operation} ${operation.key}`, err);
      
      // Apply recovery strategy
      switch (recovery.strategy) {
        case 'fallback':
          log.info(`Using fallback value for ${operation.key}`);
          return recovery.fallbackValue || null;
        
        case 'ignore':
          log.info(`Ignoring storage error for ${operation.key}`);
          return null;
        
        case 'escalate':
          if (recovery.onError) {
            recovery.onError(err);
          }
          throw err;
        
        case 'retry':
        default:
          throw err;
      }
    }
  }

  static async getItem<T>(
    key: string, 
    fallbackValue?: T,
    recovery: ErrorRecoveryStrategy = { strategy: 'fallback', fallbackValue }
  ): Promise<T | null> {
    return this.performOperation({ key, operation: 'get' }, recovery);
  }

  static async setItem<T>(
    key: string, 
    value: T,
    recovery: ErrorRecoveryStrategy = { strategy: 'retry' }
  ): Promise<T | null> {
    return this.performOperation({ key, operation: 'set', value }, recovery);
  }

  static async removeItem(
    key: string,
    recovery: ErrorRecoveryStrategy = { strategy: 'ignore' }
  ): Promise<null> {
    return this.performOperation({ key, operation: 'remove' }, recovery);
  }

  // Batch operations with transaction-like behavior
  static async batchOperation<T>(
    operations: StorageOperation<any>[],
    recovery: ErrorRecoveryStrategy = { strategy: 'retry' }
  ): Promise<(T | null)[]> {
    const results: (T | null)[] = [];
    const completedOperations: StorageOperation<any>[] = [];
    
    try {
      for (const operation of operations) {
        const result = await this.performOperation(operation, recovery);
        results.push(result);
        completedOperations.push(operation);
      }
      
      return results;
    } catch (error) {
      // Rollback completed operations if possible
      log.warn('Batch operation failed, attempting rollback', { 
        completed: completedOperations.length,
        total: operations.length
      });
      
      // For set operations, we can't easily rollback, but we can log
      for (const op of completedOperations) {
        if (op.operation === 'set') {
          log.warn(`Cannot rollback set operation for ${op.key}`);
        }
      }
      
      throw error;
    }
  }
}

// Error boundary for safety components
export function createSafetyErrorBoundary(
  componentName: string,
  fallbackComponent?: React.ComponentType<{ error: Error; retry: () => void }>
) {
  return class SafetyErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error: Error | null; errorId: string }
  > {
    constructor(props: { children: React.ReactNode }) {
      super(props);
      this.state = { 
        hasError: false, 
        error: null, 
        errorId: `${componentName}_${Date.now()}`
      };
    }

    static getDerivedStateFromError(error: Error) {
      return { 
        hasError: true, 
        error,
        errorId: `error_${Date.now()}`
      };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      log.error(`Safety component error in ${componentName}`, error, {
        componentStack: errorInfo.componentStack,
        errorBoundary: componentName,
        errorId: this.state.errorId
      });

      // Report to crash analytics in production
      if (Platform.OS !== 'web' && !__DEV__) {
        this.reportToAnalytics(error, errorInfo);
      }
    }

    private async reportToAnalytics(error: Error, errorInfo: React.ErrorInfo) {
      try {
        // In a real app, send to crash reporting service
        await SafeAsyncStorage.setItem(
          `crash_report_${this.state.errorId}`,
          {
            error: {
              message: error.message,
              stack: error.stack,
              name: error.name
            },
            errorInfo,
            timestamp: Date.now(),
            component: componentName,
            platform: Platform.OS,
            version: Platform.Version
          },
          { strategy: 'ignore' } // Don't fail if we can't save crash report
        );
      } catch (reportError) {
        log.error('Failed to save crash report', reportError as Error);
      }
    }

    retry = () => {
      log.info(`Retrying ${componentName} after error`);
      this.setState({ 
        hasError: false, 
        error: null,
        errorId: `${componentName}_${Date.now()}`
      });
    };

    render() {
      if (this.state.hasError) {
        if (fallbackComponent) {
          const FallbackComponent = fallbackComponent;
          return React.createElement(FallbackComponent, { error: this.state.error!, retry: this.retry });
        }

        // Default safety fallback
        return React.createElement(View, {
          style: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
            backgroundColor: '#FFF5F5'
          }
        }, [
          React.createElement(Text, {
            key: 'title',
            style: { fontSize: 18, fontWeight: 'bold', color: '#E53E3E', marginBottom: 10 }
          }, 'Safety Feature Unavailable'),
          React.createElement(Text, {
            key: 'description',
            style: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 }
          }, `The ${componentName} feature encountered an error. This doesn't affect other safety features.`),
          React.createElement(Pressable, {
            key: 'retry-button',
            style: {
              backgroundColor: '#3182CE',
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 8
            },
            onPress: this.retry
          }, React.createElement(Text, {
            style: { color: 'white', fontWeight: '600' }
          }, 'Try Again'))
        ]);
      }

      return this.props.children;
    }
  };
}

// Location error handling with user-friendly messages
export function handleLocationError(error: any): {
  userMessage: string;
  technicalMessage: string;
  canRetry: boolean;
  suggestedAction?: string;
} {
  const errorCode = error?.code || error?.PERMISSION_DENIED || 'UNKNOWN';
  
  switch (errorCode) {
    case 1: // PERMISSION_DENIED
    case 'PERMISSION_DENIED':
      return {
        userMessage: "Location access is needed for safety features",
        technicalMessage: "Location permission denied",
        canRetry: true,
        suggestedAction: "Please enable location access in your device settings"
      };
    
    case 2: // POSITION_UNAVAILABLE
    case 'POSITION_UNAVAILABLE':
      return {
        userMessage: "Can't find your location right now",
        technicalMessage: "GPS signal unavailable",
        canRetry: true,
        suggestedAction: "Try moving to an area with better GPS signal"
      };
    
    case 3: // TIMEOUT
    case 'TIMEOUT':
      return {
        userMessage: "Location is taking too long to find",
        technicalMessage: "Location request timeout",
        canRetry: true,
        suggestedAction: "Please try again in a moment"
      };
    
    default:
      return {
        userMessage: "Having trouble with location services",
        technicalMessage: error?.message || "Unknown location error",
        canRetry: true,
        suggestedAction: "Please check your device's location settings"
      };
  }
}

// Network error handling
export function handleNetworkError(error: any): {
  userMessage: string;
  technicalMessage: string;
  canRetry: boolean;
  isOffline: boolean;
} {
  const message = error?.message?.toLowerCase() || '';
  
  if (message.includes('network') || message.includes('offline') || message.includes('internet')) {
    return {
      userMessage: "No internet connection",
      technicalMessage: "Network unavailable",
      canRetry: true,
      isOffline: true
    };
  }
  
  if (message.includes('timeout')) {
    return {
      userMessage: "Connection is slow, please wait",
      technicalMessage: "Request timeout",
      canRetry: true,
      isOffline: false
    };
  }
  
  if (message.includes('404') || message.includes('not found')) {
    return {
      userMessage: "Service temporarily unavailable",
      technicalMessage: "Resource not found",
      canRetry: false,
      isOffline: false
    };
  }
  
  return {
    userMessage: "Connection problem, please try again",
    technicalMessage: error?.message || "Unknown network error",
    canRetry: true,
    isOffline: false
  };
}

// Camera/photo error handling
export function handleCameraError(error: any): {
  userMessage: string;
  technicalMessage: string;
  canRetry: boolean;
  requiresPermission: boolean;
} {
  const message = error?.message?.toLowerCase() || '';
  
  if (message.includes('permission') || message.includes('denied')) {
    return {
      userMessage: "Camera permission is needed for photo check-ins",
      technicalMessage: "Camera permission denied",
      canRetry: true,
      requiresPermission: true
    };
  }
  
  if (message.includes('unavailable') || message.includes('not available')) {
    return {
      userMessage: "Camera is not available on this device",
      technicalMessage: "Camera hardware unavailable",
      canRetry: false,
      requiresPermission: false
    };
  }
  
  if (message.includes('cancelled') || message.includes('canceled')) {
    return {
      userMessage: "Photo was cancelled",
      technicalMessage: "User cancelled camera",
      canRetry: true,
      requiresPermission: false
    };
  }
  
  return {
    userMessage: "Camera error, please try again",
    technicalMessage: error?.message || "Unknown camera error",
    canRetry: true,
    requiresPermission: false
  };
}

export default {
  withRetry,
  SafeAsyncStorage,
  createSafetyErrorBoundary,
  handleLocationError,
  handleNetworkError,
  handleCameraError,
  DEFAULT_RETRY_CONFIG
};
