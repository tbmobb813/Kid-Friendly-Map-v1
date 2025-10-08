import { useState, useEffect, useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { authManager, AuthState, LoginCredentials, RegisterData } from '@/utils/auth';
import { log } from '@/utils/logger';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    log.debug('Setting up auth context');

    // Listen to auth state changes
    const unsubscribe = authManager.addListener((state) => {
      log.debug('Auth state updated', {
        isAuthenticated: state.isAuthenticated,
        userId: state.user?.id,
      });
      setAuthState(state);

      if (!isInitialized) {
        setIsInitialized(true);
      }
    });

    // Get initial state
    setAuthState(authManager.authState);

    // Mark as initialized after a short delay to allow auth manager to initialize
    const initTimer = setTimeout(() => {
      if (!isInitialized) {
        setIsInitialized(true);
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    }, 1000);

    return () => {
      unsubscribe();
      clearTimeout(initTimer);
    };
  }, [isInitialized]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await authManager.login(credentials);

      if (!result.success) {
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: result.error || 'Login failed',
        }));
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await authManager.register(data);

      if (!result.success) {
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: result.error || 'Registration failed',
        }));
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await authManager.logout();
    } catch (error) {
      log.error('Logout error in context', error as Error);
    }
  }, []);

  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }));
  }, []);

  const updateProfile = useCallback(async (updates: any) => {
    return authManager.updateProfile(updates);
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    return authManager.changePassword(currentPassword, newPassword);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    return authManager.resetPassword(email);
  }, []);

  const verifyParentalPin = useCallback(async (pin: string) => {
    return authManager.verifyParentalPin(pin);
  }, []);

  const setParentalPin = useCallback(async (pin: string) => {
    return authManager.setParentalPin(pin);
  }, []);

  const extendSession = useCallback(async () => {
    return authManager.extendSession();
  }, []);

  const getSessionTimeRemaining = useCallback(() => {
    return authManager.getSessionTimeRemaining();
  }, []);

  return {
    // State
    ...authState,
    isInitialized,

    // Actions
    login,
    register,
    logout,
    clearError,
    updateProfile,
    changePassword,
    resetPassword,
    verifyParentalPin,
    setParentalPin,
    extendSession,
    getSessionTimeRemaining,

    // Smart routes profile wiring
    toggleLikedSuggestion: (id: string, liked: boolean) =>
      authManager.toggleLikedSuggestion(id, liked),
    saveRoute: (routeId: string, save: boolean) => authManager.saveRoute(routeId, save),

    // Utilities
    isParentUser: authState.user?.role === 'parent',
    isChildUser: authState.user?.role === 'child',
    hasParentalControls: authState.user?.parentalControls?.isEnabled || false,
    canAccessFeature: (feature: string) => {
      if (!authState.user?.parentalControls?.isEnabled) return true;
      return !authState.user.parentalControls.restrictions.includes(feature);
    },
  };
});

// Convenience hooks
export function useAuthUser() {
  const { user } = useAuth();
  return user;
}

export function useAuthActions() {
  const {
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    resetPassword,
    verifyParentalPin,
    setParentalPin,
  } = useAuth();

  return {
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    resetPassword,
    verifyParentalPin,
    setParentalPin,
  };
}

export function useParentalControls() {
  const {
    user,
    hasParentalControls,
    canAccessFeature,
    verifyParentalPin,
    setParentalPin,
    isParentUser,
    isChildUser,
  } = useAuth();

  return {
    hasParentalControls,
    canAccessFeature,
    verifyParentalPin,
    setParentalPin,
    isParentUser,
    isChildUser,
    parentalControls: user?.parentalControls,
  };
}
