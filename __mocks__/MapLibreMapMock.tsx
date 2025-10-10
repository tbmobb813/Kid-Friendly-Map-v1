import React from 'react';

// Mock components for MapLibre GL components
const MockShapeSource = ({ children, ...props }: any) => (
  <div data-testid="mock-shape-source" {...props}>
    {children}
  </div>
);

const MockLineLayer = (props: any) => <div data-testid="mock-line-layer" {...props} />;

const MockCircleLayer = (props: any) => <div data-testid="mock-circle-layer" {...props} />;

// Main MapLibre Map component mock
const MockMapLibreMap = ({ children, ...props }: any) => (
  <div data-testid="mock-maplibre-map" {...props}>
    {children}
  </div>
);

// MapLibreGL object with all the required components
export const MapLibreGL = {
  ShapeSource: MockShapeSource,
  LineLayer: MockLineLayer,
  CircleLayer: MockCircleLayer,
};

export const isMapLibreAvailable = () => true;
// also export a boolean for backwards compatibility
export const isMapLibreAvailableBoolean = true;

// Attach properties to the main component for compatibility
MockMapLibreMap.ShapeSource = MockShapeSource;
MockMapLibreMap.LineLayer = MockLineLayer;
MockMapLibreMap.CircleLayer = MockCircleLayer;
MockMapLibreMap.MapLibreGL = MapLibreGL;
MockMapLibreMap.isMapLibreAvailable = isMapLibreAvailable;

export default MockMapLibreMap;
