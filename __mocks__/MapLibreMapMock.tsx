import React from 'react';
import { View } from 'react-native';

// Provide both named and default exports so different import styles used across the
// codebase and tests resolve correctly. Render a plain React Native View so
// @testing-library/react-native can query elements by testID.
export const MapLibreGL = {
  MapView: (props: any) =>
    React.createElement(
      View as any,
      { testID: props.testID || 'mock-maplibre-map', ...props },
      props.children,
    ),
  Camera: (props: any) => React.createElement(View as any, { testID: 'mock-camera', ...props }),
  ShapeSource: (props: any) =>
    React.createElement(
      View as any,
      { testID: `mock-shapesource-${props.id}`, ...props },
      props.children,
    ),
  LineLayer: (props: any) =>
    React.createElement(View as any, { testID: `mock-linelayer-${props.id}`, ...props }),
  CircleLayer: (props: any) =>
    React.createElement(View as any, { testID: `mock-circlelayer-${props.id}`, ...props }),
};

const MapLibreMap = (props: any) =>
  React.createElement(
    View as any,
    { testID: props.testID || 'mock-maplibre-map', ...props },
    props.children,
  );

export const isMapLibreAvailable = true;

// Default export mirrors named export style: a component for MapLibreMap and
// attached properties for compatibility with import * as MapLibreMap or default imports.
const defaultExport: any = MapLibreMap;
defaultExport.MapLibreGL = MapLibreGL;
defaultExport.isMapLibreAvailable = isMapLibreAvailable;

export default defaultExport;
