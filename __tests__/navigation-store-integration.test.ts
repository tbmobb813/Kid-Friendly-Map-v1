/**
 * Basic Integration Test for Navigation Store
 */

import { useNavigationStore } from '../stores/enhancedNavigationStore';

// Mock dependencies
jest.mock('../utils/monitoring', () => ({
  monitoring: {
    trackUserAction: jest.fn(),
    captureError: jest.fn(),
    startPerformanceTimer: jest.fn().mockReturnValue(jest.fn()),
  },
}));

jest.mock('../utils/offlineManager', () => ({
  offlineManager: {
    cacheData: jest.fn(),
    getCachedData: jest.fn(),
  },
}));

jest.mock('../utils/unifiedRoutingService', () => ({
  unifiedRoutingService: {
    getRoutes: jest.fn().mockResolvedValue([]),
  },
}));

describe('Enhanced Navigation Store', () => {
  it('should initialize with default values', () => {
    const store = useNavigationStore.getState();

    expect(store.origin).toBe(null);
    expect(store.destination).toBe(null);
    expect(store.availableRoutes).toEqual([]);
    expect(store.unifiedRoutes).toEqual([]);
    expect(store.useAdvancedRouting).toBe(true);
    expect(store.isLoadingRoutes).toBe(false);
  });

  it('should set origin and destination', () => {
    const { setOrigin, setDestination } = useNavigationStore.getState();

    const origin = {
      id: 'test-origin',
      name: 'Test Origin',
      address: 'Test Address',
      category: 'other' as const,
      coordinates: { latitude: 40.7128, longitude: -74.006 },
    };

    const destination = {
      id: 'test-destination',
      name: 'Test Destination',
      address: 'Test Destination Address',
      category: 'restaurant' as const,
      coordinates: { latitude: 40.7505, longitude: -73.9934 },
    };

    setOrigin(origin);
    setDestination(destination);

    const state = useNavigationStore.getState();
    expect(state.origin).toEqual(origin);
    expect(state.destination).toEqual(destination);
  });

  it('should update routing preferences', () => {
    const { updateRoutingPreferences } = useNavigationStore.getState();

    updateRoutingPreferences({
      childAge: 8,
      wheelchair: true,
      prioritizeSafety: true,
      maxWalkDistance: 400,
    });

    const state = useNavigationStore.getState();
    expect(state.routingPreferences.childAge).toBe(8);
    expect(state.routingPreferences.wheelchair).toBe(true);
    expect(state.routingPreferences.prioritizeSafety).toBe(true);
    expect(state.routingPreferences.maxWalkDistance).toBe(400);
  });

  it('should toggle advanced routing', () => {
    const { toggleAdvancedRouting } = useNavigationStore.getState();

    const initialState = useNavigationStore.getState().useAdvancedRouting;

    toggleAdvancedRouting(!initialState);

    const newState = useNavigationStore.getState().useAdvancedRouting;
    expect(newState).toBe(!initialState);
  });

  it('should update accessibility settings', () => {
    const { updateAccessibilitySettings } = useNavigationStore.getState();

    updateAccessibilitySettings({
      largeText: true,
      voiceDescriptions: true,
      simplifiedMode: true,
    });

    const state = useNavigationStore.getState();
    expect(state.accessibilitySettings.largeText).toBe(true);
    expect(state.accessibilitySettings.voiceDescriptions).toBe(true);
    expect(state.accessibilitySettings.simplifiedMode).toBe(true);
  });
});
