import AsyncStorage from '@react-native-async-storage/async-storage';
const API_BASE_URL = __DEV__
    ? 'http://localhost:3000/api'
    : 'https://your-production-api.com/api';
const API_TIMEOUT = 10000; // 10 seconds
class ApiClient {
    constructor(baseURL, timeout = API_TIMEOUT) {
        this.authToken = null;
        this.baseURL = baseURL;
        this.timeout = timeout;
        this.loadAuthToken();
    }
    async loadAuthToken() {
        try {
            this.authToken = await AsyncStorage.getItem('auth_token');
        }
        catch (error) {
            console.warn('Failed to load auth token:', error);
        }
    }
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
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
        }
        catch (error) {
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
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
    setAuthToken(token) {
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
    getRoutes: (from, to) => apiClient.get(`/transit/routes?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
    getLiveArrivals: (stopId) => apiClient.get(`/transit/arrivals/${stopId}`),
    getStops: (lat, lng, radius = 500) => apiClient.get(`/transit/stops?lat=${lat}&lng=${lng}&radius=${radius}`),
};
export const placesApi = {
    search: (query, location) => apiClient.get(`/places/search?q=${encodeURIComponent(query)}${location ? `&lat=${location.lat}&lng=${location.lng}` : ''}`),
    getDetails: (placeId) => apiClient.get(`/places/${placeId}`),
    getNearby: (lat, lng, type) => apiClient.get(`/places/nearby?lat=${lat}&lng=${lng}${type ? `&type=${type}` : ''}`),
};
export const userApi = {
    getProfile: () => apiClient.get('/user/profile'),
    updateProfile: (data) => apiClient.put('/user/profile', data),
    getAchievements: () => apiClient.get('/user/achievements'),
    checkIn: (placeId, photo) => apiClient.post('/user/checkin', { placeId, photo }),
};
export const smartRoutesApi = {
    getSuggestions: (params) => apiClient.get(`/routes/smart?destId=${encodeURIComponent(params.destId ?? '')}&destLat=${params.destLat}&destLng=${params.destLng}&curLat=${params.curLat}&curLng=${params.curLng}&weather=${encodeURIComponent(params.weather ?? '')}&timeOfDay=${params.timeOfDay}`),
    likeSuggestion: (id, liked) => apiClient.post(`/routes/suggestions/${id}/like`, { liked }),
};
// Offline support
export const offlineStorage = {
    async cacheResponse(key, data) {
        try {
            await AsyncStorage.setItem(`cache_${key}`, JSON.stringify({
                data,
                timestamp: Date.now(),
            }));
        }
        catch (error) {
            console.warn('Failed to cache response:', error);
        }
    },
    async getCachedResponse(key, maxAge = 5 * 60 * 1000) {
        try {
            const cached = await AsyncStorage.getItem(`cache_${key}`);
            if (!cached)
                return null;
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp > maxAge) {
                await AsyncStorage.removeItem(`cache_${key}`);
                return null;
            }
            return data;
        }
        catch (error) {
            console.warn('Failed to get cached response:', error);
            return null;
        }
    },
    async clearCache() {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const cacheKeys = keys.filter(key => key.startsWith('cache_'));
            await AsyncStorage.multiRemove(cacheKeys);
        }
        catch (error) {
            console.warn('Failed to clear cache:', error);
        }
    },
};
// Enhanced error handling for API responses
export const handleApiError = (error) => {
    if (error instanceof Error) {
        if (error.name === 'AbortError') {
            return {
                message: 'Request timed out. Please check your connection and try again.',
                code: 'TIMEOUT',
                isNetworkError: true
            };
        }
        if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
            return {
                message: 'Unable to connect to server. Please check your internet connection.',
                code: 'NETWORK_ERROR',
                isNetworkError: true
            };
        }
        if (error.message.includes('HTTP 401')) {
            return {
                message: 'Your session has expired. Please sign in again.',
                code: 'UNAUTHORIZED',
                isNetworkError: false
            };
        }
        if (error.message.includes('HTTP 403')) {
            return {
                message: 'You do not have permission to access this feature.',
                code: 'FORBIDDEN',
                isNetworkError: false
            };
        }
        if (error.message.includes('HTTP 404')) {
            return {
                message: 'The requested information could not be found.',
                code: 'NOT_FOUND',
                isNetworkError: false
            };
        }
        if (error.message.includes('HTTP 500')) {
            return {
                message: 'Server error. Please try again later.',
                code: 'SERVER_ERROR',
                isNetworkError: false
            };
        }
        return {
            message: error.message,
            isNetworkError: false
        };
    }
    return {
        message: 'An unexpected error occurred. Please try again.',
        code: 'UNKNOWN_ERROR',
        isNetworkError: false
    };
};
// Backend health monitoring
export class BackendHealthMonitor {
    constructor() {
        this.healthStatus = 'healthy';
        this.lastHealthCheck = 0;
        this.healthCheckInterval = 30000; // 30 seconds
        this.listeners = [];
    }
    static getInstance() {
        if (!BackendHealthMonitor.instance) {
            BackendHealthMonitor.instance = new BackendHealthMonitor();
        }
        return BackendHealthMonitor.instance;
    }
    async checkHealth() {
        try {
            const startTime = Date.now();
            const response = await apiClient.get('/health');
            const responseTime = Date.now() - startTime;
            if (response.success) {
                if (responseTime > 5000) {
                    this.setHealthStatus('degraded');
                }
                else {
                    this.setHealthStatus('healthy');
                }
            }
            else {
                this.setHealthStatus('down');
            }
        }
        catch (error) {
            console.warn('Health check failed:', error);
            this.setHealthStatus('down');
        }
        this.lastHealthCheck = Date.now();
        return this.healthStatus;
    }
    setHealthStatus(status) {
        if (this.healthStatus !== status) {
            this.healthStatus = status;
            this.notifyListeners(status);
        }
    }
    notifyListeners(status) {
        this.listeners.forEach(listener => {
            try {
                listener(status);
            }
            catch (error) {
                console.warn('Health status listener error:', error);
            }
        });
    }
    addListener(callback) {
        this.listeners.push(callback);
        return () => {
            const index = this.listeners.indexOf(callback);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }
    getHealthStatus() {
        return this.healthStatus;
    }
    shouldCheckHealth() {
        return Date.now() - this.lastHealthCheck > this.healthCheckInterval;
    }
}
export const backendHealthMonitor = BackendHealthMonitor.getInstance();
// Network-aware API wrapper with enhanced error handling
export const createNetworkAwareApi = (apiFunction, cacheKey, maxAge) => {
    return async (...args) => {
        try {
            // Check backend health if needed
            if (backendHealthMonitor.shouldCheckHealth()) {
                backendHealthMonitor.checkHealth();
            }
            // Try network request first
            const response = await apiFunction(...args);
            // Cache successful response
            if (response.success) {
                await offlineStorage.cacheResponse(cacheKey, response);
            }
            return response;
        }
        catch (error) {
            const errorInfo = handleApiError(error);
            console.warn('Network request failed, trying cache:', errorInfo.message);
            // Try cache fallback for network errors
            if (errorInfo.isNetworkError) {
                const cached = await offlineStorage.getCachedResponse(cacheKey, maxAge);
                if (cached) {
                    return {
                        ...cached,
                        message: 'Showing cached data (offline)',
                    };
                }
            }
            // Return user-friendly error
            throw new Error(errorInfo.message);
        }
    };
};
