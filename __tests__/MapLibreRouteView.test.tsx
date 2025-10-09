// Mocks and minimal tests for MapLibreRouteView

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

jest.mock('@/utils/config', () => ({
  MAP: { DEFAULT_CENTER: { latitude: 0, longitude: 0 } },
  ROUTING: { INCLUDE_ETA: true },
}));
jest.mock('@/constants/colors', () => ({ primary: '#000', secondary: '#111' }));

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { describe, it, expect } from '@jest/globals';
import type { FeatureCollection, LineString } from 'geojson';

const mod = require('@/components/MapLibreRouteView');
console.log('MapLibreRouteView module keys:', Object.keys(mod)); // debug
console.log('MapLibreRouteView default export:', typeof mod.default); // debug
const MapLibreRouteView = mod.default || mod.MapLibreRouteView || mod;

// quick assertions to get clearer failures
if (!MapLibreRouteView) {
  throw new Error(
    'MapLibreRouteView import resolved to undefined. Check export (default vs named) and Jest moduleNameMapper for "@/".'
  );
}

if (typeof MapLibreRouteView !== 'function') {
  throw new Error(
    `MapLibreRouteView import resolved to ${typeof MapLibreRouteView}, expected function. This suggests an import issue.`
  );
}

const simpleRender = (el: React.ReactElement) => {
  let tree: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(el);
  });
  return tree!;
};
const getByTestId = (r: renderer.ReactTestRenderer, id: string) =>
  r.root.findAll((n) => n.props && n.props.testID === id)[0];
const queryByTestId = (r: renderer.ReactTestRenderer, id: string) => {
  const found = r.root.findAll((n) => n.props && n.props.testID === id);
  return found.length ? found[0] : undefined;
};

const mockRouteGeoJSON: FeatureCollection<LineString> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'r1',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [1, 1],
        ],
      },
    },
  ],
};

const origin = {
  id: 'o',
  name: 'O',
  address: 'A',
  category: 'home' as const,
  coordinates: { latitude: 0, longitude: 0 },
};
const dest = {
  id: 'd',
  name: 'D',
  address: 'B',
  category: 'school' as const,
  coordinates: { latitude: 1, longitude: 1 },
};

describe('MapLibreRouteView (minimal)', () => {
  it('imports correctly', () => {
    expect(MapLibreRouteView).toBeDefined();
    expect(typeof MapLibreRouteView).toBe('function');
  });

  it('should render with route data', () => {
    const { getByTestId } = render(
      <MapLibreRouteView
        origin={mockOrigin}
        destination={mockDestination}
        routeGeoJSON={mockRouteGeoJSON}
      />,
    );
    expect(getByTestId(r, 'mock-shapesource-route')).toBeTruthy();
  });

  it('should render origin and destination markers', () => {
    const { getByTestId } = render(
      <MapLibreRouteView origin={mockOrigin} destination={mockDestination} />,
    );

    expect(getByTestId('mock-shapesource-endpoints')).toBeTruthy();
    expect(getByTestId('mock-circlelayer-endpoint-layer')).toBeTruthy();
  });

  it('should render transit stations when enabled', () => {
    const { getByTestId } = render(<MapLibreRouteView showTransitStations={true} />);

    expect(getByTestId('mock-shapesource-stations')).toBeTruthy();
    expect(getByTestId('mock-circlelayer-stations-layer')).toBeTruthy();
  });

  it('should not render transit stations when disabled', () => {
    const { queryByTestId } = render(<MapLibreRouteView showTransitStations={false} />);

    expect(queryByTestId('mock-shapesource-stations')).toBeNull();
    expect(queryByTestId('mock-circlelayer-stations-layer')).toBeNull();
  });

  it('should create fallback route when no route data provided', () => {
    const { getByTestId } = render(
      <MapLibreRouteView origin={mockOrigin} destination={mockDestination} routeGeoJSON={null} />,
    );

    // Should still render route elements (fallback route)
    expect(getByTestId('mock-shapesource-route')).toBeTruthy();
    expect(getByTestId('mock-linelayer-route-line')).toBeTruthy();
  });

  it('should not render route when no origin or destination', () => {
    const { queryByTestId } = render(<MapLibreRouteView routeGeoJSON={null} />);

    expect(queryByTestId('mock-shapesource-route')).toBeNull();
    expect(queryByTestId('mock-linelayer-route-line')).toBeNull();
  });

  it('should handle station press events', () => {
    const mockOnStationPress = jest.fn();

    const { getByTestId } = render(
      <MapLibreRouteView onStationPress={mockOnStationPress} showTransitStations={true} />,
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
    };

    // Simulate station press
    if (stationsSource.props.onPress) {
      stationsSource.props.onPress(mockEvent);
    }

    expect(mockOnStationPress).toHaveBeenCalledWith('test-station-1');
  });

  it('should use custom testID when provided', () => {
    const { getByTestId } = render(<MapLibreRouteView testID="custom-map-view" />);

    expect(getByTestId('custom-map-view')).toBeTruthy();
  });

  it('should compute center correctly with route data', () => {
    const { getByTestId } = render(
      <MapLibreRouteView
        origin={mockOrigin}
        destination={mockDestination}
        routeGeoJSON={mockRouteGeoJSON}
      />,
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
      <MapLibreRouteView
        origin={mockOrigin}
        destination={mockDestination}
        routeGeoJSON={emptyRouteGeoJSON}
      />,
    );

    // Should still render the map
    expect(getByTestId('mock-maplibre-map')).toBeTruthy();
  });
});
