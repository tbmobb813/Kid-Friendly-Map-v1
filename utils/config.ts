import { Platform } from 'react-native';

// Use a dynamic require with a safe fallback so Jest (running in Node) doesn't
// attempt to parse ESM files from node_modules (expo-constants ships an ESM
// build). This keeps tests fast and stable without needing to reconfigure
// Jest transforms for all Expo packages.
let Constants: any;
try {
  // Prefer using require so this will work under CommonJS test runner.

  Constants = require('expo-constants');
} catch (e) {
  // Fallback shape used by the app; kept small and stable for tests.
  Constants = {
    expoConfig: { version: '1.0.0', name: 'Transit Navigator', extra: {} },
    statusBarHeight: 20,
  };
}

const expoConfig = Constants.expoConfig ?? {};
const expoExtra = expoConfig.extra ?? {};
const monitoringExtra = expoExtra.monitoring ?? {};
const analyticsExtra = expoExtra.analytics ?? {};
const plausibleExtra = analyticsExtra.plausible ?? {};
const privacyExtra = analyticsExtra.privacy ?? {};
const mapsExtra = expoExtra.maps ?? {};
const routingExtra = expoExtra.routing ?? {};

const ensureNumber = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
};

const ensureCoordinate = (value: unknown, fallback: { latitude: number; longitude: number }) => {
  if (
    value &&
    typeof value === 'object' &&
    'latitude' in value &&
    'longitude' in value &&
    typeof (value as any).latitude === 'number' &&
    typeof (value as any).longitude === 'number'
  ) {
    return {
      latitude: (value as any).latitude,
      longitude: (value as any).longitude,
    };
  }

  return fallback;
};

const mapDefaults = {
  styleUrl:
    typeof mapsExtra.styleUrl === 'string' && mapsExtra.styleUrl.length > 0
      ? mapsExtra.styleUrl
      : undefined,
  defaultCenter: ensureCoordinate(mapsExtra.defaultCenter, {
    latitude: 40.7128,
    longitude: -74.006,
  }),
  defaultZoom: ensureNumber(mapsExtra.defaultZoom, 15),
  minZoom: ensureNumber(mapsExtra.minZoom, 10),
  maxZoom: ensureNumber(mapsExtra.maxZoom, 20),
  animationDuration: ensureNumber(mapsExtra.animationDuration, 1000),
  accessToken:
    typeof mapsExtra.token === 'string' && mapsExtra.token.length > 0 ? mapsExtra.token : null,
};

const routingSettings = {
  BASE_URL:
    typeof routingExtra.baseUrl === 'string' && routingExtra.baseUrl.length > 0
      ? routingExtra.baseUrl
      : 'https://api.openrouteservice.org',
  ORS_API_KEY: typeof routingExtra.orsApiKey === 'string' ? routingExtra.orsApiKey : '',
  DEFAULT_PROFILE:
    typeof routingExtra.defaultProfile === 'string' && routingExtra.defaultProfile.length > 0
      ? routingExtra.defaultProfile
      : 'foot-walking',
  REQUEST_TIMEOUT: ensureNumber(routingExtra.requestTimeout, 15000),
  INCLUDE_ETA: typeof routingExtra.includeEta === 'boolean' ? routingExtra.includeEta : true,
};

const monitoringSettings = {
  enabled: typeof monitoringExtra.enabled === 'boolean' ? monitoringExtra.enabled : !__DEV__,
  sentryDsn: typeof monitoringExtra.sentryDsn === 'string' ? monitoringExtra.sentryDsn : '',
  environment:
    typeof monitoringExtra.environment === 'string'
      ? monitoringExtra.environment
      : __DEV__
        ? 'development'
        : 'production',
  tracesSampleRate:
    typeof monitoringExtra.tracesSampleRate === 'number' ? monitoringExtra.tracesSampleRate : 0.2,
  autoSessionTracking:
    typeof monitoringExtra.autoSessionTracking === 'boolean'
      ? monitoringExtra.autoSessionTracking
      : true,
  profileSampleRate:
    typeof monitoringExtra.profileSampleRate === 'number' ? monitoringExtra.profileSampleRate : 0,
};

const analyticsSettings = {
  enabled: typeof analyticsExtra.enabled === 'boolean' ? analyticsExtra.enabled : !__DEV__,
  batchSize: typeof analyticsExtra.batchSize === 'number' ? analyticsExtra.batchSize : 10,
  flushInterval:
    typeof analyticsExtra.flushInterval === 'number' ? analyticsExtra.flushInterval : 30000,
  plausible: {
    enabled: typeof plausibleExtra.enabled === 'boolean' ? plausibleExtra.enabled : !__DEV__,
    endpoint: typeof plausibleExtra.endpoint === 'string' ? plausibleExtra.endpoint : '',
    siteId: typeof plausibleExtra.siteId === 'string' ? plausibleExtra.siteId : '',
    sharedKey: typeof plausibleExtra.sharedKey === 'string' ? plausibleExtra.sharedKey : '',
    defaultUrl:
      typeof plausibleExtra.defaultUrl === 'string'
        ? plausibleExtra.defaultUrl
        : 'https://app.kidfriendlymap.example',
    source: typeof plausibleExtra.source === 'string' ? plausibleExtra.source : 'kid-map-app',
  },
  privacy: {
    defaultOptIn:
      typeof privacyExtra.defaultOptIn === 'boolean' ? privacyExtra.defaultOptIn : false,
  },
};
export const Config = {
  // Environment
  isDev: __DEV__,
  isProduction: !__DEV__,

  // API Configuration
  API_BASE_URL: __DEV__ ? 'http://localhost:3000/api' : 'https://your-production-api.com/api',

  API_TIMEOUT: 10000,

  // App Configuration
  APP_VERSION: Constants.expoConfig?.version || '1.0.0',
  APP_NAME: Constants.expoConfig?.name || 'Transit Navigator',

  // Feature Flags
  FEATURES: {
    VOICE_NAVIGATION: true,
    PHOTO_CHECKIN: true,
    OFFLINE_MODE: true,
    ANALYTICS: analyticsSettings.enabled,
    CRASH_REPORTING: monitoringSettings.enabled,
    PERFORMANCE_MONITORING: true,
    PUSH_NOTIFICATIONS: true,
    GEOFENCING: Platform.OS !== 'web',
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
    DEFAULT_ZOOM: mapDefaults.defaultZoom,
    MIN_ZOOM: mapDefaults.minZoom,
    MAX_ZOOM: mapDefaults.maxZoom,
    ANIMATION_DURATION: mapDefaults.animationDuration,
    DEFAULT_CENTER: mapDefaults.defaultCenter,
    STYLE_URL: mapDefaults.styleUrl,
    FALLBACK_STYLE_URL: 'https://demotiles.maplibre.org/style.json',
    ACCESS_TOKEN: mapDefaults.accessToken,
  },

  ROUTING: routingSettings,

  // Analytics
  ANALYTICS: {
    ENABLED: analyticsSettings.enabled,
    BATCH_SIZE: analyticsSettings.batchSize,
    FLUSH_INTERVAL: analyticsSettings.flushInterval, // 30 seconds
    PLAUSIBLE: {
      ENABLED: analyticsSettings.plausible.enabled,
      ENDPOINT: analyticsSettings.plausible.endpoint,
      SITE_ID: analyticsSettings.plausible.siteId,
      SHARED_KEY: analyticsSettings.plausible.sharedKey,
      DEFAULT_URL: analyticsSettings.plausible.defaultUrl,
      SOURCE: analyticsSettings.plausible.source,
    },
    PRIVACY: {
      DEFAULT_OPT_IN: analyticsSettings.privacy.defaultOptIn,
    },
  },

  MONITORING: {
    ENABLED: monitoringSettings.enabled,
    SENTRY_DSN: monitoringSettings.sentryDsn,
    ENVIRONMENT: monitoringSettings.environment,
    TRACES_SAMPLE_RATE: monitoringSettings.tracesSampleRate,
    AUTO_SESSION_TRACKING: monitoringSettings.autoSessionTracking,
    PROFILE_SAMPLE_RATE: monitoringSettings.profileSampleRate,
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
