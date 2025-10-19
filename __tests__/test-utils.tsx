/* Shared test utilities and hoisted mocks for Jest
   Place common jest.mock calls here so they are evaluated/hoisted
   before modules that import native/Expo packages. Import this file
   at the top of tests that need these mocks. */

// --- expo-location mock (configurable via setters below) ---
let _expoLocationStatus: string = 'granted';
let _expoLocationCoords = { latitude: 40.7128, longitude: -74.006, accuracy: 5 };
const _requestMock = jest.fn(() => Promise.resolve({ status: _expoLocationStatus }));
const _getCurrentMock = jest.fn(() => Promise.resolve({ coords: _expoLocationCoords }));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: () => _requestMock(),
  getCurrentPositionAsync: () => _getCurrentMock(),
  Accuracy: { Balanced: 0 },
}));

export function setExpoLocationStatus(status: string) {
  _expoLocationStatus = status;
  _requestMock.mockImplementation(() => Promise.resolve({ status }));
}

export function setExpoLocationCoords(coords: { latitude: number; longitude: number }) {
  _expoLocationCoords = coords as any;
  _getCurrentMock.mockImplementation(() => Promise.resolve({ coords: _expoLocationCoords }));
}

export function resetExpoLocationMocks() {
  _expoLocationStatus = 'granted';
  _expoLocationCoords = { latitude: 40.7128, longitude: -74.006, accuracy: 5 };
  _requestMock.mockReset();
  _getCurrentMock.mockReset();
  _requestMock.mockImplementation(() => Promise.resolve({ status: _expoLocationStatus }));
  _getCurrentMock.mockImplementation(() => Promise.resolve({ coords: _expoLocationCoords }));
}

// --- config helper ---
import Config from '@/utils/config';
export function setORSApiKey(key: string) {
  Config.ROUTING.ORS_API_KEY = key;
}

// --- Map component mocks for UI tests ---
const mockMapViewWrapper = jest.fn((props: any) => {
  const React = require('react');
  if (props && props.cameraRef) {
    props.cameraRef.current = props.cameraRef.current ?? { setCamera: jest.fn() };
  }
  return React.createElement('MapViewWrapper', props || {});
});
jest.mock('@/components/MapViewWrapper', () => mockMapViewWrapper);

export function getMapViewWrapperMock() {
  return mockMapViewWrapper;
}

// FloatingMenu capture
let lastFloatingMenuProps: any = {};
jest.mock('@/components/FloatingMenu', () => ({
  __esModule: true,
  default: (props: any) => {
    lastFloatingMenuProps = props || {};
    const React = require('react');
    return React.createElement('FloatingMenu', props, null);
  },
}));

// Mock LiveArrivalsCard to avoid react-query dependency during tests
jest.mock('@/components/LiveArrivalsCard', () => (props: any) => {
  const React = require('react');
  return React.createElement('LiveArrivalsCard', { testID: 'live-arrivals', ...props });
});

export function getLastFloatingMenuProps() {
  return lastFloatingMenuProps;
}

// Minimal mock for MapLibre native lib so UI tests don't require native modules
jest.mock('@maplibre/maplibre-react-native', () => {
  const React = require('react');
  const DummyComp = (props: any) => React.createElement('View', props, props.children);
  DummyComp.MapView = DummyComp;
  DummyComp.Camera = (props: any) => React.createElement('Camera', props, null);
  DummyComp.PointAnnotation = (props: any) =>
    React.createElement('PointAnnotation', props, props.children);
  DummyComp.ShapeSource = (props: any) => React.createElement('ShapeSource', props, props.children);
  DummyComp.LineLayer = (props: any) => React.createElement('LineLayer', props, null);
  return DummyComp;
});

// Minimal gesture handler mock
jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  return {
    GestureHandlerRootView: ({ children }: any) =>
      React.createElement(React.Fragment, null, children),
  };
});

// expo-router minimal mock
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));

// expose helper to reset commonly modified globals
export function resetAll() {
  resetExpoLocationMocks();
  setORSApiKey('');
  (global as any).fetch = undefined;
}

// --- TestMapHost: minimal host component that mimics MapScreen behavior used in tests ---
export const TestMapHost = (() => {
  const React = require('react');
  return function TestMapHost() {
    const mapLibreCameraRef = React.useRef(null);
    const { origin, destination, findRoutes } =
      require('@/stores/enhancedNavigationStore').useNavigationStore?.() ??
      require('@/stores/enhancedNavigationStore').default?.useNavigationStore?.();

    React.useEffect(() => {
      if (origin && destination) {
        findRoutes();
      }
    }, [origin, destination]);

    return React.createElement(
      React.Fragment,
      null,
      React.createElement(require('@/components/MapViewWrapper'), { cameraRef: mapLibreCameraRef }),
      React.createElement(require('@/components/FloatingMenu').default, {
        onRecenter: () => {
          if (mapLibreCameraRef?.current?.setCamera) {
            try {
              mapLibreCameraRef.current.setCamera({
                centerCoordinate: [origin?.coordinates?.longitude, origin?.coordinates?.latitude],
                zoomLevel: 15,
              });
            } catch (e) {
              // ignore
            }
          }
        },
      }),
    );
  };
})();

export function getTestMapHost() {
  return TestMapHost;
}

// --- Backwards-compat exports for legacy test helpers ---
// Some older tests import './test-utils' (the JS file). Re-export
// simpleRender and helpers if that module exists so imports keep working.
try {
  const legacy = require('./test-utils.js');
  if (legacy) {
    // Re-export named helpers to match older imports
    module.exports.simpleRender = legacy.simpleRender;
    module.exports.getByTestId = legacy.getByTestId;
    module.exports.queryByTestId = legacy.queryByTestId;
    module.exports.fireEvent = legacy.fireEvent;
    module.exports.act = legacy.act;
    // Also attach to global to satisfy tests that access them globally
    global.simpleRender = legacy.simpleRender;
    global.getByTestId = legacy.getByTestId;
    global.queryByTestId = legacy.queryByTestId;
    global.fireEvent = legacy.fireEvent;
    global.act = legacy.act;
  }
} catch (e) {
  // ignore if legacy helper not present
}

// --- Mock NetInfo (native bridge) used by offline manager tests ---
jest.mock('@react-native-community/netinfo', () => {
  return {
    __esModule: true,
    default: {
      addEventListener: jest.fn(() => jest.fn()),
      fetch: jest.fn(() => Promise.resolve({ isConnected: true, isInternetReachable: true })),
    },
  };
});
