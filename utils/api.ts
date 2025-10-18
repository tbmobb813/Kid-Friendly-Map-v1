import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = __DEV__ ? 'http://localhost:3000/api' : 'https://your-production-api.com/api';

const API_TIMEOUT = 10000; // 10 seconds

type ApiResponse<T> = {
  data: T;
  success: boolean;
  message?: string;
};

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private authToken: string | null = null;

  constructor(baseURL: string, timeout: number = API_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
    this.loadAuthToken();
  }

  private async loadAuthToken() {
    try {
      this.authToken = await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.warn('Failed to load auth token:', error);
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }

      throw new Error('Unknown error occurred');
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  setAuthToken(token: string) {
    this.authToken = token;
    AsyncStorage.setItem('auth_token', token);
  }

  clearAuthToken() {
    this.authToken = null;
    AsyncStorage.removeItem('auth_token');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Specific API functions
export const transitApi = {
  getRoutes: (from: string, to: string) =>
    apiClient.get(`/transit/routes?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),

  getLiveArrivals: (stopId: string) => apiClient.get(`/transit/arrivals/${stopId}`),

  getStops: (lat: number, lng: number, radius: number = 500) =>
    apiClient.get(`/transit/stops?lat=${lat}&lng=${lng}&radius=${radius}`),
};

export const placesApi = {
  search: (query: string, location?: { lat: number; lng: number }) =>
    apiClient.get(
      `/places/search?q=${encodeURIComponent(query)}${
        location ? `&lat=${location.lat}&lng=${location.lng}` : ''
      }`,
    ),

  getDetails: (placeId: string) => apiClient.get(`/places/${placeId}`),

  getNearby: (lat: number, lng: number, type?: string) =>
    apiClient.get(`/places/nearby?lat=${lat}&lng=${lng}${type ? `&type=${type}` : ''}`),
};

export const userApi = {
  getProfile: () => apiClient.get('/user/profile'),
  updateProfile: (data: any) => apiClient.put('/user/profile', data),
  getAchievements: () => apiClient.get('/user/achievements'),
  checkIn: (placeId: string, photo?: string) => apiClient.post('/user/checkin', { placeId, photo }),
};

export type SmartSuggestionDTO = {
  id: string;
  type: 'fastest' | 'safest' | 'scenic' | 'covered' | 'quiet';
  title: string;
  description: string;
  estimatedTime: string;
  reason: string;
  priority: number;
  liked?: boolean;
};

export const smartRoutesApi = {
  getSuggestions: (params: {
    destId?: string;
    destLat: number;
    destLng: number;
    curLat: number;
    curLng: number;
    weather?: string;
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  }) =>
    apiClient.get<SmartSuggestionDTO[]>(
      `/routes/smart?destId=${encodeURIComponent(params.destId ?? '')}&destLat=${
        params.destLat
      }&destLng=${params.destLng}&curLat=${params.curLat}&curLng=${
        params.curLng
      }&weather=${encodeURIComponent(params.weather ?? '')}&timeOfDay=${params.timeOfDay}`,
    ),
  likeSuggestion: (id: string, liked: boolean) =>
    apiClient.post<{ id: string; liked: boolean }>(`/routes/suggestions/${id}/like`, { liked }),
};

// Offline support
export const offlineStorage = {
  // In-memory fallback cache used when AsyncStorage operations fail (useful in tests)
  _memoryCache: new Map<string, { data: any; timestamp: number }>(),

  async cacheResponse<T>(key: string, data: T): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `cache_${key}`,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        }),
      );
      // Also update memory cache for immediate consistency
      try {
        offlineStorage._memoryCache.set(key, { data, timestamp: Date.now() });
      } catch (e) {
        // ignore memory cache failures
      }
    } catch (error) {
      // AsyncStorage failed (e.g., storage full). Use in-memory cache as a fallback so
      // tests and offline behaviour remain functional.
      try {
        offlineStorage._memoryCache.set(key, { data, timestamp: Date.now() });
      } catch (e) {
        // ignore
      }
      console.warn('Failed to cache response (AsyncStorage), falling back to memory cache:', error);
    }
  },

  async getCachedResponse<T>(key: string, maxAge: number = 5 * 60 * 1000): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(`cache_${key}`);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > maxAge) {
        await AsyncStorage.removeItem(`cache_${key}`);
        return null;
      }

      return data;
    } catch (error) {
      // If AsyncStorage fails or parsing fails, fall back to in-memory cache if available
      try {
        const mem = offlineStorage._memoryCache.get(key);
        if (!mem) return null;
        if (Date.now() - mem.timestamp > maxAge) {
          offlineStorage._memoryCache.delete(key);
          return null;
        }
        return mem.data as T;
      } catch (e) {
        console.warn('Failed to get cached response (AsyncStorage+memory):', error, e);
        return null;
      }
    }
  },

  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
      // Clear in-memory fallback as well
      try {
        offlineStorage._memoryCache.clear();
      } catch (e) {
        // ignore
      }
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  },
};

// Enhanced error handling for API responses
export const handleApiError = (
  error: any,
): { message: string; code?: string; isNetworkError: boolean } => {
  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return {
        message: 'Request timed out. Please check your connection and try again.',
        code: 'TIMEOUT',
        isNetworkError: true,
      };
    }

    if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
      return {
        message: 'Unable to connect to server. Please check your internet connection.',
        code: 'NETWORK_ERROR',
        isNetworkError: true,
      };
    }

    if (error.message.includes('HTTP 401')) {
      return {
        message: 'Your session has expired. Please sign in again.',
        code: 'UNAUTHORIZED',
        isNetworkError: false,
      };
    }

    if (error.message.includes('HTTP 403')) {
      return {
        message: 'You do not have permission to access this feature.',
        code: 'FORBIDDEN',
        isNetworkError: false,
      };
    }

    if (error.message.includes('HTTP 404')) {
      return {
        message: 'The requested information could not be found.',
        code: 'NOT_FOUND',
        isNetworkError: false,
      };
    }

    if (error.message.includes('HTTP 500')) {
      return {
        message: 'Server error. Please try again later.',
        code: 'SERVER_ERROR',
        isNetworkError: false,
      };
    }

    return {
      message: error.message,
      isNetworkError: false,
    };
  }

  return {
    message: 'An unexpected error occurred. Please try again.',
    code: 'UNKNOWN_ERROR',
    isNetworkError: false,
  };
};

// Backend health monitoring
export class BackendHealthMonitor {
  private static instance: BackendHealthMonitor;
  private healthStatus: 'healthy' | 'degraded' | 'down' = 'healthy';
  private lastHealthCheck = 0;
  private healthCheckInterval = 30000; // 30 seconds
  private listeners: ((status: 'healthy' | 'degraded' | 'down') => void)[] = [];

  static getInstance(): BackendHealthMonitor {
    if (!BackendHealthMonitor.instance) {
      BackendHealthMonitor.instance = new BackendHealthMonitor();
    }
    return BackendHealthMonitor.instance;
  }

  async checkHealth(): Promise<'healthy' | 'degraded' | 'down'> {
    try {
      const startTime = Date.now();
      const response = await apiClient.get('/health');
      const responseTime = Date.now() - startTime;

      if (response.success) {
        if (responseTime > 5000) {
          this.setHealthStatus('degraded');
        } else {
          this.setHealthStatus('healthy');
        }
      } else {
        this.setHealthStatus('down');
      }
    } catch (error) {
      console.warn('Health check failed:', error);
      this.setHealthStatus('down');
    }

    this.lastHealthCheck = Date.now();
    return this.healthStatus;
  }

  private setHealthStatus(status: 'healthy' | 'degraded' | 'down') {
    if (this.healthStatus !== status) {
      this.healthStatus = status;
      this.notifyListeners(status);
    }
  }

  private notifyListeners(status: 'healthy' | 'degraded' | 'down') {
    this.listeners.forEach((listener) => {
      try {
        listener(status);
      } catch (error) {
        console.warn('Health status listener error:', error);
      }
    });
  }

  addListener(callback: (status: 'healthy' | 'degraded' | 'down') => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  getHealthStatus(): 'healthy' | 'degraded' | 'down' {
    return this.healthStatus;
  }

  shouldCheckHealth(): boolean {
    return Date.now() - this.lastHealthCheck > this.healthCheckInterval;
  }
}

export const backendHealthMonitor = BackendHealthMonitor.getInstance();

// Network-aware API wrapper with enhanced error handling
export const createNetworkAwareApi = <T extends any[], R>(
  apiFunction: (...args: T) => Promise<ApiResponse<R>>,
  cacheKey: string,
  maxAge?: number,
) => {
  return async (...args: T): Promise<ApiResponse<R>> => {
    // If a fresh cached response exists, return it immediately (cache-first).
    try {
      const cached = await offlineStorage.getCachedResponse<ApiResponse<R>>(cacheKey, maxAge);
      if (cached) {
        return {
          ...cached,
          message: 'Showing cached data (from cache)',
        };
      }
    } catch (cacheErr) {
      // If cache read fails, continue to network request path.
      console.warn('Error reading cache before network request:', cacheErr);
    }

    try {
      // Check backend health if needed (non-blocking)
      if (backendHealthMonitor.shouldCheckHealth()) {
        // don't await to avoid delaying the request path
        backendHealthMonitor.checkHealth().catch(() => {});
      }

      // Make the network request
      const response = await apiFunction(...args);

      // Cache successful response
      if (response && (response as any).success) {
        // Fire-and-forget cache write; don't block the response
        offlineStorage.cacheResponse(cacheKey, response).catch(() => {});
      }

      return response;
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.warn('Network request failed, trying cache:', errorInfo.message);

      // Try cache fallback for network errors
      const cached = await offlineStorage.getCachedResponse<ApiResponse<R>>(cacheKey, maxAge);
      if (cached) {
        return {
          ...cached,
          message: 'Showing cached data (offline)',
        };
      }

      // Return user-friendly error
      throw new Error(errorInfo.message);
    }
  };
};
