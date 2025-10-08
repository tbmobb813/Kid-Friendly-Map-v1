import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { apiClient } from './api';
import { SafeAsyncStorage } from './errorHandling';
import { log } from './logger';
import { Config } from './config';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'parent' | 'child';
  parentalControls?: {
    isEnabled: boolean;
    parentId?: string;
    restrictions: string[];
  };
  preferences: {
    notifications: boolean;
    locationSharing: boolean;
    emergencyContacts: string[];
  };
  likedSuggestions?: string[];
  savedRoutes?: string[];
  createdAt: string;
  lastLoginAt: string;
};

export type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

export type LoginCredentials = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type RegisterData = {
  email: string;
  password: string;
  name: string;
  role?: 'user' | 'parent';
  parentalPin?: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

class AuthManager {
  private static instance: AuthManager;
  private currentUser: AuthUser | null = null;
  private tokens: AuthTokens | null = null;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private listeners: ((state: AuthState) => void)[] = [];

  private constructor() {
    this.initializeAuth();
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  private async initializeAuth() {
    try {
      log.debug('Initializing auth manager');

      // Load stored tokens
      const storedTokens = await SafeAsyncStorage.getItem<AuthTokens>('auth_tokens', undefined, {
        strategy: 'fallback',
        fallbackValue: undefined,
      });

      if (storedTokens && storedTokens.expiresAt > Date.now()) {
        this.tokens = storedTokens;
        apiClient.setAuthToken(storedTokens.accessToken);

        // Load user data
        await this.loadUserProfile();

        // Setup token refresh
        this.setupTokenRefresh();

        log.info('Auth restored from storage');
      } else if (storedTokens) {
        // Tokens expired, try to refresh
        log.info('Stored tokens expired, attempting refresh');
        await this.refreshTokens();
      }

      this.notifyListeners();
    } catch (error) {
      log.error('Failed to initialize auth', error as Error);
      await this.clearAuth();
    }
  }

  private async loadUserProfile() {
    try {
      const response = await apiClient.get<AuthUser>('/auth/profile');
      if (response.success) {
        this.currentUser = response.data;

        // Cache user data
        await SafeAsyncStorage.setItem('user_profile', response.data, { strategy: 'retry' });
      }
    } catch (error) {
      log.warn('Failed to load user profile', error as Error);

      // Try to load cached profile
      const cachedUser = await SafeAsyncStorage.getItem<AuthUser>('user_profile', undefined, {
        strategy: 'fallback',
        fallbackValue: undefined,
      });

      if (cachedUser) {
        this.currentUser = cachedUser;
        log.info('Using cached user profile');
      }
    }
  }

  private setupTokenRefresh() {
    if (!this.tokens) return;

    // Refresh 5 minutes before expiry
    const refreshTime = this.tokens.expiresAt - Date.now() - 5 * 60 * 1000;

    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshTokens();
      }, refreshTime);

      log.debug(`Token refresh scheduled in ${Math.round(refreshTime / 1000)}s`);
    }
  }

  private async refreshTokens(): Promise<boolean> {
    if (!this.tokens?.refreshToken) {
      log.warn('No refresh token available');
      return false;
    }

    try {
      log.debug('Refreshing auth tokens');

      const response = await apiClient.post<AuthTokens>('/auth/refresh', {
        refreshToken: this.tokens.refreshToken,
      });

      if (response.success) {
        this.tokens = response.data;
        apiClient.setAuthToken(response.data.accessToken);

        // Store new tokens
        await SafeAsyncStorage.setItem('auth_tokens', response.data, { strategy: 'retry' });

        // Setup next refresh
        this.setupTokenRefresh();

        log.info('Tokens refreshed successfully');
        this.notifyListeners();
        return true;
      }
    } catch (error) {
      log.error('Token refresh failed', error as Error);
      await this.clearAuth();
    }

    return false;
  }

  async login(credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> {
    try {
      log.info('Attempting login', { email: credentials.email });

      const response = await apiClient.post<{
        user: AuthUser;
        tokens: AuthTokens;
      }>('/auth/login', {
        email: credentials.email,
        password: credentials.password,
        platform: Platform.OS,
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version,
        },
      });

      if (response.success) {
        this.currentUser = response.data.user;
        this.tokens = response.data.tokens;

        // Set API token
        apiClient.setAuthToken(response.data.tokens.accessToken);

        // Store tokens and user data
        await Promise.all([
          SafeAsyncStorage.setItem('auth_tokens', response.data.tokens),
          SafeAsyncStorage.setItem('user_profile', response.data.user),
        ]);

        // Setup token refresh
        this.setupTokenRefresh();

        log.info('Login successful', { userId: response.data.user.id });
        this.notifyListeners();

        return { success: true };
      } else {
        return { success: false, error: response.message || 'Login failed' };
      }
    } catch (error) {
      const err = error as Error;
      log.error('Login error', err);
      return { success: false, error: err.message || 'Network error' };
    }
  }

  async register(data: RegisterData): Promise<{ success: boolean; error?: string }> {
    try {
      log.info('Attempting registration', { email: data.email, role: data.role });

      const response = await apiClient.post<{
        user: AuthUser;
        tokens: AuthTokens;
      }>('/auth/register', {
        ...data,
        platform: Platform.OS,
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version,
        },
      });

      if (response.success) {
        this.currentUser = response.data.user;
        this.tokens = response.data.tokens;

        // Set API token
        apiClient.setAuthToken(response.data.tokens.accessToken);

        // Store tokens and user data
        await Promise.all([
          SafeAsyncStorage.setItem('auth_tokens', response.data.tokens),
          SafeAsyncStorage.setItem('user_profile', response.data.user),
        ]);

        // Setup token refresh
        this.setupTokenRefresh();

        log.info('Registration successful', { userId: response.data.user.id });
        this.notifyListeners();

        return { success: true };
      } else {
        return { success: false, error: response.message || 'Registration failed' };
      }
    } catch (error) {
      const err = error as Error;
      log.error('Registration error', err);
      return { success: false, error: err.message || 'Network error' };
    }
  }

  async logout(): Promise<void> {
    try {
      log.info('Logging out user');

      // Notify server
      if (this.tokens) {
        try {
          await apiClient.post('/auth/logout', {
            refreshToken: this.tokens.refreshToken,
          });
        } catch (error) {
          log.warn('Server logout failed', error as Error);
        }
      }

      await this.clearAuth();
      log.info('Logout completed');
    } catch (error) {
      log.error('Logout error', error as Error);
      // Still clear local auth even if server call fails
      await this.clearAuth();
    }
  }

  private async clearAuth(): Promise<void> {
    // Clear timers
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    // Clear state
    this.currentUser = null;
    this.tokens = null;

    // Clear API token
    apiClient.clearAuthToken();

    // Clear storage
    try {
      await Promise.all([
        SafeAsyncStorage.removeItem('auth_tokens'),
        SafeAsyncStorage.removeItem('user_profile'),
      ]);
    } catch (error) {
      log.warn('Failed to clear auth storage', error as Error);
    }

    this.notifyListeners();
  }

  async updateProfile(updates: Partial<AuthUser>): Promise<{ success: boolean; error?: string }> {
    if (!this.currentUser) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await apiClient.put<AuthUser>('/auth/profile', updates);

      if (response.success) {
        this.currentUser = { ...this.currentUser, ...response.data };

        await SafeAsyncStorage.setItem('user_profile', this.currentUser);

        this.notifyListeners();
        return { success: true };
      } else {
        return { success: false, error: response.message || 'Update failed' };
      }
    } catch (error) {
      const err = error as Error;
      log.error('Profile update error', err);
      return { success: false, error: err.message || 'Network error' };
    }
  }

  async toggleLikedSuggestion(
    id: string,
    liked: boolean,
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.currentUser) {
      return { success: false, error: 'Not authenticated' };
    }
    const current = this.currentUser.likedSuggestions ?? [];
    const updated = liked ? Array.from(new Set([...current, id])) : current.filter((x) => x !== id);
    const result = await this.updateProfile({ likedSuggestions: updated });
    return result;
  }

  async saveRoute(routeId: string, save: boolean): Promise<{ success: boolean; error?: string }> {
    if (!this.currentUser) {
      return { success: false, error: 'Not authenticated' };
    }
    const current = this.currentUser.savedRoutes ?? [];
    const updated = save
      ? Array.from(new Set([...current, routeId]))
      : current.filter((x) => x !== routeId);
    const result = await this.updateProfile({ savedRoutes: updated });
    return result;
  }

  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      if (response.success) {
        log.info('Password changed successfully');
        return { success: true };
      } else {
        return { success: false, error: response.message || 'Password change failed' };
      }
    } catch (error) {
      const err = error as Error;
      log.error('Password change error', err);
      return { success: false, error: err.message || 'Network error' };
    }
  }

  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiClient.post('/auth/reset-password', { email });

      if (response.success) {
        log.info('Password reset requested', { email });
        return { success: true };
      } else {
        return { success: false, error: response.message || 'Reset request failed' };
      }
    } catch (error) {
      const err = error as Error;
      log.error('Password reset error', err);
      return { success: false, error: err.message || 'Network error' };
    }
  }

  // Parental controls
  async verifyParentalPin(pin: string): Promise<boolean> {
    if (!this.currentUser?.parentalControls?.isEnabled) {
      return true; // No parental controls
    }

    try {
      const response = await apiClient.post<{ valid: boolean }>('/auth/verify-pin', { pin });
      return response.success && response.data.valid;
    } catch (error) {
      log.error('PIN verification error', error as Error);
      return false;
    }
  }

  async setParentalPin(pin: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiClient.post('/auth/set-parental-pin', { pin });

      if (response.success) {
        // Update local user data
        if (this.currentUser) {
          this.currentUser.parentalControls = {
            ...this.currentUser.parentalControls,
            isEnabled: true,
            restrictions: this.currentUser.parentalControls?.restrictions ?? [],
          };
          await SafeAsyncStorage.setItem('user_profile', this.currentUser);
          this.notifyListeners();
        }

        return { success: true };
      } else {
        return { success: false, error: response.message || 'Failed to set PIN' };
      }
    } catch (error) {
      const err = error as Error;
      log.error('Set parental PIN error', err);
      return { success: false, error: err.message || 'Network error' };
    }
  }

  // Getters
  get user(): AuthUser | null {
    return this.currentUser;
  }

  get isAuthenticated(): boolean {
    return !!(this.currentUser && this.tokens && this.tokens.expiresAt > Date.now());
  }

  get authState(): AuthState {
    return {
      user: this.currentUser,
      token: this.tokens?.accessToken || null,
      isAuthenticated: this.isAuthenticated,
      isLoading: false,
      error: null,
    };
  }

  // Event listeners
  addListener(callback: (state: AuthState) => void): () => void {
    this.listeners.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    const state = this.authState;
    this.listeners.forEach((callback) => {
      try {
        callback(state);
      } catch (error) {
        log.error('Auth listener error', error as Error);
      }
    });
  }

  // Session management
  async extendSession(): Promise<void> {
    if (this.isAuthenticated) {
      try {
        await apiClient.post('/auth/extend-session');
        log.debug('Session extended');
      } catch (error) {
        log.warn('Failed to extend session', error as Error);
      }
    }
  }

  getSessionTimeRemaining(): number {
    if (!this.tokens) return 0;
    return Math.max(0, this.tokens.expiresAt - Date.now());
  }

  // Biometric authentication (if supported)
  async enableBiometricAuth(): Promise<{ success: boolean; error?: string }> {
    if (Platform.OS === 'web') {
      return { success: false, error: 'Biometric auth not supported on web' };
    }

    try {
      // This would integrate with expo-local-authentication
      // For now, just store the preference
      await SafeAsyncStorage.setItem('biometric_enabled', true);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to enable biometric auth' };
    }
  }
}

// Export singleton instance
export const authManager = AuthManager.getInstance();

// Utility functions
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
} {
  const errors: string[] = [];
  let strength: 'weak' | 'medium' | 'strong' = 'weak';

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letters');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain numbers');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain special characters');
  }

  // Determine strength
  if (errors.length === 0) {
    if (password.length >= 12 && /[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      strength = 'strong';
    } else {
      strength = 'medium';
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

export default authManager;
