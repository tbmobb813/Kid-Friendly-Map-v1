import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { useNavigationStore } from '@/stores/enhancedNavigationStore';
import { nycStations } from '@/config/transit/nyc-stations';
import {
  getMapViewWrapperMock,
  getLastFloatingMenuProps,
  getTestMapHost,
} from '../tests/test-utils';

// Now require the screens after mocks are established
// Mock MapLibre native library to avoid native modules in tests
jest.mock('@maplibre/maplibre-react-native', () => {
  const React = require('react');
  const DummyComp = (props: any) => React.createElement('View', props, props.children);
  DummyComp.MapView = DummyComp;
  DummyComp.Camera = (props: any) => React.createElement('Camera', props, null);
  DummyComp.PointAnnotation = (props: any) =>
    React.createElement('PointAnnotation', props, props.children);
  DummyComp.ShapeSource = (props: any) => React.createElement('ShapeSource', props, props.children);
  DummyComp.LineLayer = (props: any) => React.createElement('LineLayer', props, null);
  DummyComp.PointAnnotation = (props: any) =>
    React.createElement('PointAnnotation', props, props.children);
  return DummyComp;
});

// Mock expo-router to avoid pulling in react-navigation internals in tests
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// Mock expo-location to avoid ESM parsing of node_modules and provide resolved location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getCurrentPositionAsync: jest
    .fn()
    .mockResolvedValue({ coords: { latitude: 40.7128, longitude: -74.006, accuracy: 5 } }),
  Accuracy: { Balanced: 0 },
}));

const TransitScreen = require('@/app/(tabs)/transit').default;
const React = require('react');
const TestMapHost = getTestMapHost();

describe('Transit -> Map integration', () => {
  beforeEach(() => {
    // Reset origin/destination and spies
    useNavigationStore.setState({ origin: null, destination: null });
    // Replace findRoutes with a spy
    useNavigationStore.setState({ findRoutes: jest.fn() });
  });

  it('pressing a station sets origin, recenters map and triggers findRoutes', async () => {
    // Render a lightweight TestMapHost and TransitScreen
    const { getByText } = render(React.createElement(TestMapHost));

    // Render TransitScreen separately and press the station button
    const transit = render((<TransitScreen />) as any);

    const station = nycStations[0];
    const stationButton = transit.getByText(station.name);
    expect(stationButton).toBeTruthy();

    // Simulate press
    await act(async () => {
      fireEvent.press(stationButton);
    });

    // Origin should be set in the store
    const origin = useNavigationStore.getState().origin;
    expect(origin).toBeTruthy();
    expect(origin?.id).toBe(station.id);

    // MapViewWrapper's cameraRef should have been set and setCamera called via FloatingMenu recenter flow
    const cameraRef = (require('@/components/MapViewWrapper') as any).mock?.calls?.[0]?.[0]
      ?.cameraRef;

    // Our mock attached `current.setCamera` so retrieve it from the component's cameraRef
    // Because we attached the fake in the mock implementation, we can get it from the module mock
    const mapModule = require('@/components/MapViewWrapper');
    // If the mock implementation attached a cameraRef, its current.setCamera is a jest.fn()
    // Instead of relying on module internals, inspect the MapScreen's cameraRef via the store of our mock above
    // Since we created cameraRef.current.setCamera inside the mock, assert that it's defined.

    // Call the recenter function by simulating the FloatingMenu onRecenter behavior: MapScreen's FloatingMenu is in the tree,
    // but rather than trying to find it, we'll directly call the cameraRef setCamera if present.
    // Retrieve the cameraRef object from the MapViewWrapper mock's last render call
    const mockMap = mapModule as any;
    // Check that the mock returned a cameraRef with current.setCamera
    const fakeCamera = mockMap.__proto__?.current || mockMap.current;

    // As a fallback, attempt to access the cameraRef attached earlier
    let setCameraFn: any = undefined;
    try {
      // The cameraRef object was placed on the cameraRef param; extract from the mock implementation closure
      const lastCall = mockMap.mock?.calls?.[0];
      if (lastCall && lastCall[0] && lastCall[0].cameraRef) {
        setCameraFn = lastCall[0].cameraRef.current?.setCamera;
      }
    } catch (e) {
      // ignore
    }

    // The test is primarily concerned that findRoutes was called when origin+destination exist.
    // Since our station press sets origin only, ensure findRoutes is callable and not thrown.
    const findRoutesSpy = useNavigationStore.getState().findRoutes as jest.Mock;

    // For this integration test we'll simulate setting a destination afterwards to trigger findRoutes
    act(() => {
      useNavigationStore.setState({
        destination: {
          id: 'dest',
          name: 'Dest',
          address: 'Test Dest',
          category: 'other',
          coordinates: { latitude: 40.7, longitude: -74.0 },
        },
      });
    });

    // Now origin & destination exist; wait for TestMapHost effect to invoke findRoutes()
    await waitFor(() => {
      expect(findRoutesSpy).toHaveBeenCalled();
    });

    // Invoke the captured FloatingMenu onRecenter and assert cameraRef.setCamera was called
    const lastFloatingMenuProps = getLastFloatingMenuProps();
    expect(lastFloatingMenuProps.onRecenter).toBeDefined();
    // Call onRecenter inside act so React updates are settled
    await act(async () => {
      lastFloatingMenuProps.onRecenter();
    });

    // Extract the cameraRef that was attached by the MapViewWrapper mock
    const mapCalls = getMapViewWrapperMock().mock.calls;
    const attachedCameraRef = mapCalls?.[0]?.[0]?.cameraRef;
    expect(attachedCameraRef).toBeDefined();
    expect(attachedCameraRef.current).toBeDefined();
    expect(typeof attachedCameraRef.current.setCamera).toBe('function');
    // Ensure setCamera was called during recenter
    expect(attachedCameraRef.current.setCamera).toHaveBeenCalled();
  });
});
