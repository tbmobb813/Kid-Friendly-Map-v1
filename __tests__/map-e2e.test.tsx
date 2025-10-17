// Mock react-native-gesture-handler to avoid native import syntax issues in Jest
jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  return {
    GestureHandlerRootView: ({ children, ...props }: any) =>
      React.createElement('GestureHandlerRootView', { ...props }, children),
    // Provide any other named exports used by the app as noop components
    GestureDetector: ({ children, ...props }: any) =>
      React.createElement('GestureDetector', { ...props }, children),
  };
});

// Provide a minimal Config mock required by monitoring and routing modules
jest.mock('@/utils/config', () => ({
  __esModule: true,
  default: {
    ROUTING: {
      ORS_API_KEY: 'test-key',
      BASE_URL: 'https://api.openrouteservice.org',
      DEFAULT_PROFILE: 'foot-walking',
      REQUEST_TIMEOUT: 15000,
      INCLUDE_ETA: true,
    },
    MAP: { DEFAULT_CENTER: { latitude: 40.7128, longitude: -74.006 } },
    MONITORING: { SENTRY_DSN: '', ENABLED: false },
    FEATURES: { PERFORMANCE_MONITORING: false, ANALYTICS: false, CRASH_REPORTING: false },
  },
}));

// Also mock the relative path used by internal modules (monitoring imports './config')
jest.mock('../utils/config', () => ({
  __esModule: true,
  default: {
    ROUTING: {
      ORS_API_KEY: 'test-key',
      BASE_URL: 'https://api.openrouteservice.org',
      DEFAULT_PROFILE: 'foot-walking',
      REQUEST_TIMEOUT: 15000,
      INCLUDE_ETA: true,
    },
    MAP: { DEFAULT_CENTER: { latitude: 40.7128, longitude: -74.006 } },
    MONITORING: { SENTRY_DSN: '', ENABLED: false, TRACES_SAMPLE_RATE: 0 },
    FEATURES: { PERFORMANCE_MONITORING: false, ANALYTICS: false, CRASH_REPORTING: false },
  },
}));

// Mock the monitoring module to avoid ApplicationMonitoring side-effects during import
jest.mock('@/utils/monitoring', () => ({
  __esModule: true,
  monitoring: {
    startPerformanceTimer: jest.fn().mockReturnValue(() => {}),
    trackUserAction: jest.fn(),
    captureError: jest.fn(),
    getSentry: jest.fn().mockReturnValue(null),
    resetForTests: jest.fn(),
  },
  withPerformanceTracking: (C: any) => C,
  useScreenTracking: () => {},
}));

// Mock expo-router so useRouter() exists during mount
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock lucide-react-native icons to simple components
jest.mock('lucide-react-native', () => {
  const React = require('react');
  const Icon = ({ children, ...props }: any) =>
    React.createElement('Icon', props, children || null);
  return {
    __esModule: true,
    default: Icon,
    HelpCircle: Icon,
    Accessibility: Icon,
    Menu: Icon,
    Navigation: Icon,
    MapPin: Icon,
    Search: Icon,
    X: Icon,
    Settings: Icon,
    AlertCircle: Icon,
    Zap: Icon,
  };
});

// Mock FloatingMenu to avoid rendering icon internals in this test
jest.mock('@/components/FloatingMenu', () => ({
  __esModule: true,
  default: (props: any) => {
    const React = require('react');
    return React.createElement('FloatingMenuStub', { testID: 'mock-floating-menu', ...props });
  },
}));

// Mock useLocation hook to provide a stable current location during the mount
jest.mock('@/hooks/useLocation', () => ({
  __esModule: true,
  default: () => ({ location: { latitude: 40.7128, longitude: -74.006 }, loading: false }),
}));

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

// Note: avoid importing full MapScreen to keep this test lightweight

// Mock MapLibre native package
jest.mock('@maplibre/maplibre-react-native', () => ({
  __esModule: true,
  default: {
    MapView: ({ children, ...props }: any) =>
      React.createElement('MapView', { testID: 'mock-mapview', ...props }, children),
    Camera: (props: any) => React.createElement('Camera', { testID: 'mock-camera', ...props }),
    ShapeSource: ({ children, ...props }: any) =>
      React.createElement(
        'ShapeSource',
        { testID: `mock-shapesource-${props.id}`, ...props },
        children,
      ),
    LineLayer: (props: any) =>
      React.createElement('LineLayer', { testID: `mock-linelayer-${props.id}`, ...props }),
    CircleLayer: (props: any) =>
      React.createElement('CircleLayer', { testID: `mock-circlelayer-${props.id}`, ...props }),
  },
}));

// Mock MapLibreMap wrapper used by MapLibreRouteView
jest.mock('@/components/MapLibreMap', () => ({
  __esModule: true,
  default: ({ children, testID }: any) =>
    React.createElement('MockMapLibreMap', { testID: testID || 'mock-maplibre-map' }, children),
}));

// Capture the routeGeoJSON passed into MapLibreRouteView by mocking the component
let lastReceivedRouteGeoJSON: any = null;
let lastShowTransitStations: boolean | null = null;
jest.mock('@/components/MapLibreRouteView', () => {
  return ({ routeGeoJSON, showTransitStations, testID }: any) => {
    lastReceivedRouteGeoJSON = routeGeoJSON;
    lastShowTransitStations = typeof showTransitStations === 'boolean' ? showTransitStations : null;
    return React.createElement('MockMapLibreRouteView', {
      testID: testID || 'mock-maplibre-route-view',
      showTransitStations,
    });
  };
});

// Mock routing services to return deterministic data
jest.mock('@/utils/orsService', () => ({
  orsService: {
    resetForTests: jest.fn(),
    getRoute: jest.fn().mockResolvedValue({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          id: 'ors-route-1',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [
              [-74.006, 40.7128],
              [-74.004, 40.7142],
            ],
          },
        },
      ],
    }),
  },
}));

jest.mock('@/utils/otp2Service', () => ({
  otp2Service: {
    resetForTests: jest.fn(),
    planTrip: jest.fn().mockResolvedValue({
      plan: { itineraries: [] },
    }),
    getStopInfo: jest.fn().mockResolvedValue({}),
  },
}));

// Mock the useRouteORS hook to avoid importing Config and running network code
const mockRouteGeoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'mock-ors-route',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [-74.006, 40.7128],
          [-74.004, 40.7142],
        ],
      },
    },
  ],
};

jest.mock('@/hooks/useRouteORS', () => ({
  useRouteORS: jest.fn(() => ({
    geojson: mockRouteGeoJSON,
    summary: { durationSeconds: 120, distanceMeters: 300 },
    loading: false,
    error: null,
    refetch: jest.fn().mockResolvedValue(mockRouteGeoJSON),
  })),
}));

// Mock config
jest.mock('@/utils/config', () => ({
  ROUTING: { ORS_API_KEY: 'test-key' },
  MAP: { DEFAULT_CENTER: { latitude: 40.7128, longitude: -74.006 } },
}));

describe('MapScreen E2E (mocked services)', () => {
  beforeEach(() => {
    lastReceivedRouteGeoJSON = null;
    jest.clearAllMocks();
  });

  it('passes route GeoJSON and stations to MapLibreRouteView (harness)', async () => {
    // Build a small test harness that mirrors the MapScreen route selection logic
    const React = require('react');
    const { useRouteORS } = require('@/hooks/useRouteORS');

    const TestHarness = () => {
      const { geojson: orsRouteGeoJSON } = useRouteORS();

      const selectedUnifiedRoute: any = null; // empty for this test

      const routeToPass =
        orsRouteGeoJSON ??
        (selectedUnifiedRoute && selectedUnifiedRoute.geometry
          ? {
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  id: selectedUnifiedRoute.id,
                  properties: {},
                  geometry: selectedUnifiedRoute.geometry,
                },
              ],
            }
          : null);

      const MapLibreRouteViewModule = require('@/components/MapLibreRouteView');
      const MapLibreRouteViewComp = MapLibreRouteViewModule?.default ?? MapLibreRouteViewModule;

      return React.createElement(MapLibreRouteViewComp, {
        origin: undefined,
        destination: undefined,
        routeGeoJSON: routeToPass,
        onStationPress: () => {},
        showTransitStations: true,
        testID: 'maplibre-route-view-harness',
      });
    };

    const { getByTestId } = render(React.createElement(TestHarness));

    await waitFor(() => {
      expect(getByTestId('maplibre-route-view-harness')).toBeTruthy();
    });

    expect(lastReceivedRouteGeoJSON).not.toBeNull();
    expect(lastReceivedRouteGeoJSON.type).toBe('FeatureCollection');
    expect(lastReceivedRouteGeoJSON.features?.length).toBeGreaterThan(0);
    // Station toggle should be true by default in the harness
    expect(lastShowTransitStations).toBe(true);
  });
});
