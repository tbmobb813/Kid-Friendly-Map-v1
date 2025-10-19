import React from 'react';
import { render, act } from '@testing-library/react-native';
import MapViewWrapper from '@/components/MapViewWrapper';

// Mock MapLibre native package similar to other tests
jest.mock('@maplibre/maplibre-react-native', () => ({
  __esModule: true,
  default: {
    MapView: ({ children }: any) =>
      React.createElement('MapView', { testID: 'mock-mapview' }, children),
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

// Mock MapLibreMap to forward ref and expose setCamera
jest.mock('@/components/MapLibreMap', () => {
  const ReactLocal = require('react');
  return ReactLocal.forwardRef(function MockMapLibreMap(props: any, ref: any) {
    ReactLocal.useImperativeHandle(ref, () => ({
      setCamera: jest.fn(),
    }));
    return ReactLocal.createElement(
      'MockMapLibreMap',
      { testID: props.testID || 'mock-maplibre-map' },
      props.children,
    );
  });
});

// Minimal config and colors mocks to avoid requiring project setup
jest.mock('@/utils/config', () => ({
  MAP: { DEFAULT_CENTER: { latitude: 40.7128, longitude: -74.006 } },
}));

jest.mock('@/constants/colors', () => ({ primary: '#007AFF', secondary: '#FF9500' }));

describe('MapViewWrapper forwarding ref', () => {
  it('forwards cameraRef and exposes setCamera', () => {
    const cameraRef = React.createRef<any>();

    // Render the wrapper with the ref
    render((<MapViewWrapper cameraRef={cameraRef} testId="map-wrapper-ref" />) as any);

    // After render, the forwarded ref should be populated and have setCamera
    expect(cameraRef.current).toBeDefined();
    expect(typeof cameraRef.current.setCamera).toBe('function');
  });
});
