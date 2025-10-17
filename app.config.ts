import type { ExpoConfig } from '@expo/config';

// Inlined values from app.json -> expo to make app.config.ts the single source of truth
const baseConfig: ExpoConfig = {
  name: 'Kid-Friendly Map & Transit Navigator',
  slug: 'kid-friendly-map-transit-navigator',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'myapp',
  userInterfaceStyle: 'automatic',
  // Keep experiment/newArch flags as in app.json
  newArchEnabled: true,
  splash: {
    image: './assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'app.rork.kid-friendly-map-transit-navigator',
    infoPlist: {
      NSLocationAlwaysAndWhenInUseUsageDescription: 'Allow $(PRODUCT_NAME) to use your location.',
      NSLocationAlwaysUsageDescription: 'Allow $(PRODUCT_NAME) to use your location.',
      NSLocationWhenInUseUsageDescription: 'Allow $(PRODUCT_NAME) to use your location.',
      UIBackgroundModes: ['location', 'audio'],
      NSPhotoLibraryUsageDescription: 'Allow $(PRODUCT_NAME) to access your photos',
      NSCameraUsageDescription: 'Allow $(PRODUCT_NAME) to access your camera',
      NSMicrophoneUsageDescription: 'Allow $(PRODUCT_NAME) to access your microphone',
    },
    entitlements: {
      com: {
        apple: {
          developer: {
            networking: {
              'wifi-info': true,
            },
          },
        },
      },
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'app.rork.kid_friendly_map_transit_navigator',
    permissions: [
      'ACCESS_COARSE_LOCATION',
      'ACCESS_FINE_LOCATION',
      'FOREGROUND_SERVICE',
      'FOREGROUND_SERVICE_LOCATION',
      'ACCESS_BACKGROUND_LOCATION',
      'CAMERA',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.SCHEDULE_EXACT_ALARM',
      'RECORD_AUDIO',
    ],
  },
  web: {
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    [
      'expo-router',
      {
        origin: 'https://rork.com/',
      },
    ],
    [
      'expo-location',
      {
        isAndroidForegroundServiceEnabled: true,
        isAndroidBackgroundLocationEnabled: true,
        isIosBackgroundLocationEnabled: true,
        locationAlwaysAndWhenInUsePermission: 'Allow $(PRODUCT_NAME) to use your location.',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'The app accesses your photos to let you share them with your friends.',
      },
    ],
    [
      'expo-notifications',
      {
        icon: './local/assets/notification_icon.png',
        color: '#ffffff',
        defaultChannel: 'default',
        sounds: ['./local/assets/notification_sound.wav'],
        enableBackgroundRemoteNotifications: false,
      },
    ],
    [
      'expo-audio',
      {
        microphonePermission: 'Allow $(PRODUCT_NAME) to access your microphone',
      },
    ],
  'expo-font',
  'expo-web-browser',
  ],
  experiments: {
    typedRoutes: false,
  },
  extra: {
    monitoring: {
      enabled: true,
      sentryDsn: '',
      environment: 'development',
      tracesSampleRate: 0.2,
      autoSessionTracking: true,
      profileSampleRate: 0,
    },
    analytics: {
      enabled: false,
      batchSize: 10,
      flushInterval: 30000,
      plausible: {
        enabled: false,
        endpoint: '',
        siteId: '',
        sharedKey: '',
        defaultUrl: 'https://app.kidfriendlymap.example',
        source: 'kid-map-app',
      },
      privacy: {
        defaultOptIn: false,
      },
    },
  },
};

const ensureNumber = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  const parsed = typeof value === 'string' ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
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

const DEFAULT_CENTER = {
  latitude: 40.7128,
  longitude: -74.006,
};

const mapStyleFromEnv = process.env.EXPO_PUBLIC_MAP_STYLE_URL;
const mapboxTokenFromEnv = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
const orsApiKeyFromEnv = process.env.EXPO_PUBLIC_ORS_API_KEY;
const orsBaseUrlFromEnv = process.env.EXPO_PUBLIC_ORS_BASE_URL;
const orsProfileFromEnv = process.env.EXPO_PUBLIC_ORS_PROFILE;
const orsTimeoutFromEnv = process.env.EXPO_PUBLIC_ORS_TIMEOUT;

const baseCenter = ensureCoordinate((baseConfig.extra as any)?.maps?.defaultCenter, DEFAULT_CENTER);

const overrideCenter = {
  latitude: ensureNumber(process.env.EXPO_PUBLIC_MAP_DEFAULT_LAT, baseCenter.latitude),
  longitude: ensureNumber(process.env.EXPO_PUBLIC_MAP_DEFAULT_LNG, baseCenter.longitude),
};

const mapExtras = {
  styleUrl:
    typeof mapStyleFromEnv === 'string' && mapStyleFromEnv.length > 0
      ? mapStyleFromEnv
      : (baseConfig.extra as any)?.maps?.styleUrl,
  defaultCenter: overrideCenter,
  defaultZoom: ensureNumber(
    (baseConfig.extra as any)?.maps?.defaultZoom,
    ensureNumber(process.env.EXPO_PUBLIC_MAP_DEFAULT_ZOOM, 13),
  ),
  minZoom: ensureNumber(
    (baseConfig.extra as any)?.maps?.minZoom,
    ensureNumber(process.env.EXPO_PUBLIC_MAP_MIN_ZOOM, 10),
  ),
  maxZoom: ensureNumber(
    (baseConfig.extra as any)?.maps?.maxZoom,
    ensureNumber(process.env.EXPO_PUBLIC_MAP_MAX_ZOOM, 20),
  ),
  animationDuration: ensureNumber(
    (baseConfig.extra as any)?.maps?.animationDuration,
    ensureNumber(process.env.EXPO_PUBLIC_MAP_ANIMATION_DURATION, 1000),
  ),
  token: mapboxTokenFromEnv ?? (baseConfig.extra as any)?.maps?.token ?? null,
};

const routingExtras = {
  baseUrl:
    typeof orsBaseUrlFromEnv === 'string' && orsBaseUrlFromEnv.length > 0
      ? orsBaseUrlFromEnv
      : ((baseConfig.extra as any)?.routing?.baseUrl ?? 'https://api.openrouteservice.org'),
  orsApiKey:
    typeof orsApiKeyFromEnv === 'string' && orsApiKeyFromEnv.length > 0
      ? orsApiKeyFromEnv
      : ((baseConfig.extra as any)?.routing?.orsApiKey ?? ''),
  defaultProfile:
    typeof orsProfileFromEnv === 'string' && orsProfileFromEnv.length > 0
      ? orsProfileFromEnv
      : ((baseConfig.extra as any)?.routing?.defaultProfile ?? 'foot-walking'),
  requestTimeout: ensureNumber(
    (baseConfig.extra as any)?.routing?.requestTimeout,
    ensureNumber(orsTimeoutFromEnv, 15000),
  ),
  includeEta:
    typeof (baseConfig.extra as any)?.routing?.includeEta === 'boolean'
      ? (baseConfig.extra as any)?.routing?.includeEta
      : true,
};

const iosInfoPlist = {
  ...(baseConfig.ios?.infoPlist ?? {}),
  NSLocationWhenInUseUsageDescription:
    'This app uses your location for safety and navigation purposes, including showing nearby transit options.',
};

const androidPermissions = Array.from(
  new Set(
    [
      ...(baseConfig.android?.permissions ?? []),
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION',
    ].filter(Boolean),
  ),
);

const config: ExpoConfig = {
  ...baseConfig,
  ios: {
    ...baseConfig.ios,
    infoPlist: iosInfoPlist,
  },
  android: {
    ...baseConfig.android,
    permissions: androidPermissions,
  },
  // Merge extras while ensuring EAS projectId is present
  extra: {
    ...(baseConfig.extra ?? {}),
    eas: {
      projectId: 'f4810f40-266e-4717-953d-125f348a01ae',
    },
    maps: mapExtras,
    routing: routingExtras,
  },
  // Merge plugins from app.json (baseConfig.plugins) with any programmatic additions
  plugins: Array.isArray(baseConfig.plugins) ? [...baseConfig.plugins] : [],
  // Ensure fields that are not otherwise derived are present so EAS can read them
  orientation: baseConfig.orientation ?? 'portrait',
  icon: baseConfig.icon ?? baseConfig.icon,
  scheme: baseConfig.scheme ?? baseConfig.scheme,
  userInterfaceStyle: baseConfig.userInterfaceStyle ?? baseConfig.userInterfaceStyle,
  splash: baseConfig.splash ?? baseConfig.splash,
};

export default config;
