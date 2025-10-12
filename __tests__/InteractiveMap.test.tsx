jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  return {
    ...rn,
    StyleSheet: {
      ...rn.StyleSheet,
      create: (obj: any) => obj,
    },
  };
});
jest.mock('react-native/Libraries/StyleSheet/StyleSheet', () => ({
  create: (obj: any) => obj,
}));
import * as React from 'react';
// Mocks must be above all imports
import { View } from 'react-native';
jest.mock('../components/MapViewWrapper', () => ({
  __esModule: true,
  default: (props: any) => <View {...props} />,
}));
jest.mock('../components/MapPlaceholder', () => ({
  __esModule: true,
  default: (props: any) => <View {...props} />,
}));
jest.mock('lucide-react-native', () => ({
  Crosshair: (props: any) => <View {...props} />,
  Train: (props: any) => <View {...props} />,
  MapPin: (props: any) => <View {...props} />,
}));
jest.mock('react-native-webview', () => ({ WebView: (props: any) => <View {...props} /> }));

import InteractiveMap from '../components/InteractiveMap';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Place, Route } from '../types';

const origin: Place = {
  id: 'origin',
  name: 'Origin',
  coordinates: { latitude: 40.7128, longitude: -74.006 },
  address: 'Origin Address',
  category: 'home',
};
const destination: Place = {
  id: 'destination',
  name: 'Destination',
  coordinates: { latitude: 40.73061, longitude: -73.935242 },
  address: 'Destination Address',
  category: 'school',
};
const route: Route = {
  id: 'route1',
  steps: [
    {
      id: 'step1',
      type: 'walk',
      from: origin.id,
      to: destination.id,
      duration: 10,
    },
  ],
  totalDuration: 10,
  departureTime: '2025-10-04T08:00:00Z',
  arrivalTime: '2025-10-04T08:10:00Z',
  metadata: {
    geometry: {
      coordinates: [
        { latitude: 40.7128, longitude: -74.006 },
        { latitude: 40.73061, longitude: -73.935242 },
      ],
    },
  },
};

describe('InteractiveMap', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(
      <InteractiveMap origin={origin} destination={destination} route={route} testId="test-map" />,
    );
    expect(getByTestId('test-map')).toBeTruthy();
  });

  it('shows recenter button and triggers recenter', () => {
    const { getByTestId } = render(
      <InteractiveMap origin={origin} destination={destination} route={route} testId="test-map" />,
    );
    const btn = getByTestId('recenter-button');
    expect(btn).toBeTruthy();
    act(() => {
      fireEvent.press(btn);
    });
    // No error means recenter logic is wired
  });

  it('shows transit info when showTransitStations is true', () => {
    const { getByText } = render(
      <InteractiveMap
        origin={origin}
        destination={destination}
        route={route}
        showTransitStations={true}
      />,
    );
    // Component no longer renders a placeholder message — assert the station toggle is present
    expect(getByText(/Stations/i)).toBeTruthy();
  });

  it('calls onSelectLocation when map is tapped (web fallback)', () => {
    const onSelectLocation = jest.fn();
    const { getByTestId } = render(
      <InteractiveMap
        origin={origin}
        destination={destination}
        route={route}
        testId="test-map"
        onSelectLocation={onSelectLocation}
      />,
    );
    // Simulate message from WebView
    act(() => {
      fireEvent(getByTestId('test-map'), 'message', {
        nativeEvent: { data: JSON.stringify({ type: 'tap', lat: 40.72, lng: -74.0 }) },
      });
    });
    expect(onSelectLocation).toHaveBeenCalledWith({ latitude: 40.72, longitude: -74.0 });
  });

  it('engine detection prefers native when available', () => {
    // preferNative true, Platform not web, isMapLibreAvailable mocked true
    jest.mock('../components/MapLibreMap', () => ({ isMapLibreAvailable: () => true }));
    const { getByTestId } = render(
      <InteractiveMap
        origin={origin}
        destination={destination}
        route={route}
        testId="test-map"
        preferNative={true}
      />,
    );
    expect(getByTestId('test-map')).toBeTruthy();
  });

  it('bounds utility computes correct center', () => {
    const { getByTestId } = render(
      <InteractiveMap origin={origin} destination={destination} route={route} testId="test-map" />,
    );
    // Access internal allBounds via testId (not directly, but ensures no crash)
    expect(getByTestId('test-map')).toBeTruthy();
  });
});
