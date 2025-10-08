// Mocks and minimal tests for MapLibreRouteView

jest.mock('@/components/MapLibreMap', () => {
  const React = require('react');
  const { View } = require('react-native');

  const Base = ({ children, testID, ...rest }: any) =>
    React.createElement(View, { testID: testID || 'mock-maplibre-map', ...rest }, children);

  const ShapeSource = ({ children, id, ...rest }: any) =>
    React.createElement(View, { testID: `mock-shapesource-${id || 'unknown'}`, ...rest }, children);

  const LineLayer = ({ id, ...rest }: any) =>
    React.createElement(View, { testID: `mock-linelayer-${id || 'unknown'}`, ...rest });

  const CircleLayer = ({ id, ...rest }: any) =>
    React.createElement(View, { testID: `mock-circlelayer-${id || 'unknown'}`, ...rest });

  const MapLibreGL = { ShapeSource, LineLayer, CircleLayer };

  // Attach properties to the Base component for compatibility
  Base.MapLibreGL = MapLibreGL;
  Base.isMapLibreAvailable = true;

  return {
    __esModule: true,
    default: Base,
    MapLibreGL: MapLibreGL,
    isMapLibreAvailable: true,
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

  it('renders base component', () => {
    expect(() => simpleRender(<MapLibreRouteView />)).not.toThrow();
    const tree = simpleRender(<MapLibreRouteView />);
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders route shapesource when origin/destination and route provided', () => {
    const r = simpleRender(
      <MapLibreRouteView origin={origin} destination={dest} routeGeoJSON={mockRouteGeoJSON} />,
    );
    expect(getByTestId(r, 'mock-shapesource-route')).toBeTruthy();
  });

  it('omits route shapesource when no origin/destination', () => {
    const r = simpleRender(<MapLibreRouteView routeGeoJSON={null} />);
    const found = r.root.findAll((n) => n.props && n.props.testID === 'mock-shapesource-route');
    expect(found.length).toBe(0);
  });
});
