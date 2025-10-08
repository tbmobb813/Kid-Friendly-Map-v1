import type { ExpoConfig } from '@expo/config';
import appJson from './app.json';

const baseConfig = (appJson as { expo?: ExpoConfig }).expo ?? ({} as ExpoConfig);

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
      : (baseConfig.extra as any)?.routing?.baseUrl ?? 'https://api.openrouteservice.org',
  orsApiKey:
    typeof orsApiKeyFromEnv === 'string' && orsApiKeyFromEnv.length > 0
      ? orsApiKeyFromEnv
      : (baseConfig.extra as any)?.routing?.orsApiKey ?? '',
  defaultProfile:
    typeof orsProfileFromEnv === 'string' && orsProfileFromEnv.length > 0
      ? orsProfileFromEnv
      : (baseConfig.extra as any)?.routing?.defaultProfile ?? 'foot-walking',
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
  extra: {
    ...(baseConfig.extra ?? {}),
    maps: mapExtras,
    routing: routingExtras,
  },
};

export default config;
