import { useState, useCallback } from 'react';
import { handleApiError } from '@/utils/api';
import { useToast } from '@/hooks/useToast';
import { log } from '@/utils/logger';

type ApiState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  isNetworkError: boolean;
};

type ApiOptions = {
  showToastOnError?: boolean;
  showToastOnSuccess?: boolean;
  successMessage?: string;
  retryable?: boolean;
};

export function useApiWithErrorHandling<T>(
  initialData: T | null = null,
  options: ApiOptions = {}
) {
  const [state, setState] = useState<ApiState<T>>({
    data: initialData,
    loading: false,
    error: null,
    isNetworkError: false
  });

  const { showToast } = useToast();
  const {
    showToastOnError = true,
    showToastOnSuccess = false,
    successMessage = 'Operation completed successfully',
    retryable = true
  } = options;

  const execute = useCallback(async <R>(
    apiCall: () => Promise<{ success: boolean; data?: R; message?: string }>,
    customSuccessMessage?: string
  ): Promise<{ success: boolean; data?: R }> => {
    setState(prev => ({ ...prev, loading: true, error: null, isNetworkError: false }));

    try {
      log.debug('Executing API call');
      const response = await apiCall();

      if (response.success) {
        setState(prev => ({
          ...prev,
          data: response.data as T,
          loading: false,
          error: null,
          isNetworkError: false
        }));

        if (showToastOnSuccess) {
          showToast({
            type: 'success',
            message: customSuccessMessage || response.message || successMessage
          });
        }

        log.info('API call successful');
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.message || 'Operation failed';
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
          isNetworkError: false
        }));

        if (showToastOnError) {
          showToast({
            type: 'error',
            message: errorMessage
          });
        }

        log.warn('API call failed', { error: errorMessage });
        return { success: false };
      }
    } catch (error) {
      const errorInfo = handleApiError(error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorInfo.message,
        isNetworkError: errorInfo.isNetworkError
      }));

      if (showToastOnError) {
        showToast({
          type: 'error',
          message: errorInfo.message,
          action: errorInfo.isNetworkError && retryable ? {
            label: 'Retry',
            onPress: () => execute(apiCall, customSuccessMessage)
          } : undefined
        });
      }

      log.error('API call error', error as Error, {
        isNetworkError: errorInfo.isNetworkError,
        code: errorInfo.code
      });
      
      return { success: false };
    }
  }, [showToast, showToastOnError, showToastOnSuccess, successMessage, retryable]);

  const retry = useCallback(() => {
    // This would need to store the last API call to retry
    // For now, just clear the error state
    setState(prev => ({ ...prev, error: null, isNetworkError: false }));
  }, []);

  const reset = useCallback(() => {
    setState({
      data: initialData,
      loading: false,
      error: null,
      isNetworkError: false
    });
  }, [initialData]);

  const setData = useCallback((data: T) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null, isNetworkError: false }));
  }, []);

  return {
    ...state,
    execute,
    retry,
    reset,
    setData,
    clearError,
    hasError: !!state.error,
    canRetry: state.isNetworkError && retryable
  };
}

// Specialized hook for paginated API calls
export function usePaginatedApiWithErrorHandling<T>(
  options: ApiOptions = {}
) {
  const [paginationState, setPaginationState] = useState({
    page: 1,
    hasMore: true,
    totalCount: 0
  });

  const apiState = useApiWithErrorHandling<T[]>([], options);

  const loadMore = useCallback(async (
    apiCall: (page: number) => Promise<{ 
      success: boolean; 
      data?: T[]; 
      hasMore?: boolean;
      totalCount?: number;
      message?: string;
    }>
  ) => {
    if (!paginationState.hasMore || apiState.loading) {
      return { success: false };
    }

    const result = await apiState.execute(async () => {
      const response = await apiCall(paginationState.page);
      
      if (response.success && response.data) {
        // Append new data to existing data
        const newData = paginationState.page === 1 
          ? response.data 
          : [...(apiState.data || []), ...response.data];
        
        setPaginationState(prev => ({
          page: prev.page + 1,
          hasMore: response.hasMore ?? response.data!.length > 0,
          totalCount: response.totalCount ?? prev.totalCount
        }));
        
        return {
          success: true,
          data: newData,
          message: response.message
        };
      }
      
      return response;
    });

    return result;
  }, [paginationState, apiState]);

  const refresh = useCallback(async (
    apiCall: (page: number) => Promise<{ 
      success: boolean; 
      data?: T[]; 
      hasMore?: boolean;
      totalCount?: number;
      message?: string;
    }>
  ) => {
    setPaginationState({ page: 1, hasMore: true, totalCount: 0 });
    return loadMore(apiCall);
  }, [loadMore]);

  const reset = useCallback(() => {
    apiState.reset();
    setPaginationState({ page: 1, hasMore: true, totalCount: 0 });
  }, [apiState]);

  return {
    ...apiState,
    ...paginationState,
    loadMore,
    refresh,
    reset: reset,
    isFirstPage: paginationState.page === 1
  };
}
