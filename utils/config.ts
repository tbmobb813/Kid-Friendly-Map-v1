import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const Config = {
  // Environment
  isDev: __DEV__,
  isProduction: !__DEV__,
  
  // API Configuration
  API_BASE_URL: __DEV__ 
    ? 'http://localhost:3000/api' 
    : 'https://your-production-api.com/api',
  
  API_TIMEOUT: 10000,
  
  // App Configuration
  APP_VERSION: Constants.expoConfig?.version || '1.0.0',
  APP_NAME: Constants.expoConfig?.name || 'Transit Navigator',
  
  // Feature Flags
  FEATURES: {
    VOICE_NAVIGATION: true,
    PHOTO_CHECKIN: true,
    OFFLINE_MODE: true,
    ANALYTICS: !__DEV__,
    CRASH_REPORTING: !__DEV__,
    PERFORMANCE_MONITORING: true,
    PUSH_NOTIFICATIONS: true,
  },
  
  // Cache Configuration
  CACHE: {
    DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
    PLACES_TTL: 30 * 60 * 1000, // 30 minutes
    ROUTES_TTL: 2 * 60 * 1000, // 2 minutes
    USER_DATA_TTL: 60 * 60 * 1000, // 1 hour
  },
  
  // Location Configuration
  LOCATION: {
    ACCURACY: 'high' as const,
    TIMEOUT: 15000,
    MAX_AGE: 60000,
    DISTANCE_FILTER: 10, // meters
  },
  
  // Map Configuration
  MAP: {
    DEFAULT_ZOOM: 15,
    MIN_ZOOM: 10,
    MAX_ZOOM: 20,
    ANIMATION_DURATION: 1000,
  },
  
  // Analytics
  ANALYTICS: {
    ENABLED: !__DEV__,
    BATCH_SIZE: 10,
    FLUSH_INTERVAL: 30000, // 30 seconds
  },
  
  // Performance
  PERFORMANCE: {
    ENABLE_FLIPPER: __DEV__,
    LOG_SLOW_RENDERS: __DEV__,
    RENDER_TIMEOUT: 16, // 60fps = 16ms per frame
  },
  
  // Platform-specific
  PLATFORM: {
    IS_IOS: Platform.OS === 'ios',
    IS_ANDROID: Platform.OS === 'android',
    IS_WEB: Platform.OS === 'web',
    HAS_NOTCH: Constants.statusBarHeight > 20,
  },
  
  // Regional Configuration
  REGIONS: {
    DEFAULT: 'new-york',
    SUPPORTED: ['new-york', 'london', 'tokyo'],
  },
  
  // Accessibility
  ACCESSIBILITY: {
    MINIMUM_TOUCH_SIZE: 44,
    FONT_SCALE_FACTOR: 1.2,
    HIGH_CONTRAST_THRESHOLD: 4.5,
  },
  
  // Security
  SECURITY: {
    ENABLE_SSL_PINNING: !__DEV__,
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    MAX_LOGIN_ATTEMPTS: 5,
  },
};

// Environment-specific overrides
if (Config.isProduction) {
  // Production-only configurations
  Config.CACHE.DEFAULT_TTL = 10 * 60 * 1000; // Longer cache in production
  Config.LOCATION.TIMEOUT = 10000; // Shorter timeout in production
}

export default Config;
