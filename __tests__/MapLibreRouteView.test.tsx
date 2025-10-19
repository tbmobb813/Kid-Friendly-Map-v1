import { render } from '@testing-library/react-native';
import MapLibreRouteView from '@/components/MapLibreRouteView';
import React from 'react';
import type { FeatureCollection, LineString } from 'geojson';

// Mock MapLibre
jest.mock('@maplibre/maplibre-react-native', () => ({
  __esModule: true,
  default: {
    setAccessToken: jest.fn(),
    requestAndroidPermissionsIfNeeded: jest.fn(),
    MapView: ({ children, onPress, onDidFinishRenderingMapFully, ...props }: any) => {
      return React.createElement(
        'MapView',
        {
          testID: 'mock-mapview',
          onPress,
          onDidFinishRenderingMapFully,
          ...props,
        },
        children,
      );
    },
    Camera: (props: any) => React.createElement('Camera', { testID: 'mock-camera', ...props }),
    ShapeSource: ({ children, onPress, ...props }: any) => {
      return React.createElement(
        'ShapeSource',
        {
          testID: `mock-shapesource-${props.id}`,
          onPress,
          ...props,
        },
        children,
      );
    },
    LineLayer: (props: any) =>
      React.createElement('LineLayer', { testID: `mock-linelayer-${props.id}`, ...props }),
    CircleLayer: (props: any) =>
      React.createElement('CircleLayer', { testID: `mock-circlelayer-${props.id}`, ...props }),
  },
}));

// Mock MapLibreMap
jest.mock('@/components/MapLibreMap', () => {
  return function MockMapLibreMap({ children, testID, ...props }: any) {
    return React.createElement(
      'MockMapLibreMap',
      { testID: testID || 'mock-maplibre-map', ...props },
      children,
    );
  };
});

// Mock the config
jest.mock('@/utils/config', () => ({
  MAP: {
    DEFAULT_CENTER: {
      latitude: 40.7128,
      longitude: -74.006,
    },
  },
  ROUTING: {
    BASE_URL: 'https://api.openrouteservice.org',
    ORS_API_KEY: 'test-api-key',
    DEFAULT_PROFILE: 'foot-walking',
    REQUEST_TIMEOUT: 15000,
    INCLUDE_ETA: true,
  },
}));

// Mock Colors
jest.mock('@/constants/colors', () => ({
  primary: '#007AFF',
  secondary: '#FF9500',
}));

const mockRouteGeoJSON: FeatureCollection<LineString> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'route-1',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [-74.006, 40.7128],
          [-74.005, 40.7135],
          [-74.004, 40.7142],
        ],
      },
    },
  ],
};

const mockOrigin = {
  id: 'origin-1',
  name: 'Origin Place',
  address: '123 Start St',
  category: 'home' as const,
  coordinates: { latitude: 40.7128, longitude: -74.006 },
};

const mockDestination = {
  id: 'dest-1',
  name: 'Destination Place',
  address: '456 End Ave',
  category: 'school' as const,
  coordinates: { latitude: 40.7142, longitude: -74.004 },
};

describe('MapLibreRouteView', () => {
  it('should render without crashing', () => {
    const { getByTestId } = render((<MapLibreRouteView />) as any);
    expect(getByTestId('mock-maplibre-map')).toBeTruthy();
  });

  it('should render with route data', () => {
    const { getByTestId } = render(
      (
        <MapLibreRouteView
          origin={mockOrigin}
          destination={mockDestination}
          routeGeoJSON={mockRouteGeoJSON}
        />
      ) as any,
    );

    expect(getByTestId('mock-shapesource-route')).toBeTruthy();
  });

  it('should render origin and destination markers', () => {
    const { getByTestId } = render(
      (<MapLibreRouteView origin={mockOrigin} destination={mockDestination} />) as any,
    );

    expect(getByTestId('mock-shapesource-endpoints')).toBeTruthy();
    expect(getByTestId('mock-circlelayer-endpoint-layer')).toBeTruthy();
  });

  it('should render transit stations when enabled', () => {
    const { getByTestId } = render((<MapLibreRouteView showTransitStations={true} />) as any);

    expect(getByTestId('mock-shapesource-stations')).toBeTruthy();
    expect(getByTestId('mock-circlelayer-stations-layer')).toBeTruthy();
  });

  it('should not render transit stations when disabled', () => {
    const { queryByTestId } = render((<MapLibreRouteView showTransitStations={false} />) as any);

    expect(queryByTestId('mock-shapesource-stations')).toBeNull();
    expect(queryByTestId('mock-circlelayer-stations-layer')).toBeNull();
  });

  it('should create fallback route when no route data provided', () => {
    const { getByTestId } = render(
      (
        <MapLibreRouteView origin={mockOrigin} destination={mockDestination} routeGeoJSON={null} />
      ) as any,
    );

    // Should still render route elements (fallback route)
    expect(getByTestId('mock-shapesource-route')).toBeTruthy();
    expect(getByTestId('mock-linelayer-route-line')).toBeTruthy();
  });

  it('should not render route when no origin or destination', () => {
    const { queryByTestId } = render((<MapLibreRouteView routeGeoJSON={null} />) as any);

    expect(queryByTestId('mock-shapesource-route')).toBeNull();
    expect(queryByTestId('mock-linelayer-route-line')).toBeNull();
  });

  it('should handle station press events', () => {
    const mockOnStationPress = jest.fn();

    const { getByTestId } = render(
      (<MapLibreRouteView onStationPress={mockOnStationPress} showTransitStations={true} />) as any,
    );

    const stationsSource = getByTestId('mock-shapesource-stations');
    expect(stationsSource).toBeTruthy();

    // Mock press event
    const mockEvent = {
      features: [
        {
          properties: { id: 'test-station-1' },
          id: 'test-station-1',
        },
      ],
    } as any;

    // Simulate station press
    if (stationsSource.props.onPress) {
      stationsSource.props.onPress(mockEvent);
    }

    expect(mockOnStationPress).toHaveBeenCalledWith('test-station-1');
  });

  it('should use custom testID when provided', () => {
    const { getByTestId } = render((<MapLibreRouteView testID="custom-map-view" />) as any);

    expect(getByTestId('custom-map-view')).toBeTruthy();
  });

  it('should compute center correctly with route data', () => {
    const { getByTestId } = render(
      (
        <MapLibreRouteView
          origin={mockOrigin}
          destination={mockDestination}
          routeGeoJSON={mockRouteGeoJSON}
        />
      ) as any,
    );

    const mapView = getByTestId('mock-maplibre-map');

    // Should have centerCoordinate prop set
    expect(mapView.props.centerCoordinate).toBeDefined();
    expect(Array.isArray(mapView.props.centerCoordinate)).toBe(true);
    expect(mapView.props.centerCoordinate).toHaveLength(2);
  });

  it('should handle empty route features gracefully', () => {
    const emptyRouteGeoJSON: FeatureCollection<LineString> = {
      type: 'FeatureCollection',
      features: [],
    };

    const { getByTestId } = render(
      (
        <MapLibreRouteView
          origin={mockOrigin}
          destination={mockDestination}
          routeGeoJSON={emptyRouteGeoJSON}
        />
      ) as any,
    );

    // Should still render the map
    expect(getByTestId('mock-maplibre-map')).toBeTruthy();
  });
});
