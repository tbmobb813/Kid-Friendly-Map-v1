/**
 * Enhanced Navigation Store with ORS and OTP2 Integration
 * Integrates unified routing services with existing navigation state
 */

import { create } from 'zustand';
import {
  Place,
  Route,
  PhotoCheckIn,
  TravelMode,
  RouteOptions,
  TransitStep,
  TransitMode,
} from '@/types/navigation';
import { favoriteLocations } from '@/mocks/places';
import { verifyLocationProximity } from '@/utils/locationUtils';
import {
  unifiedRoutingService,
  UnifiedRoute,
  UnifiedRouteRequest,
} from '@/utils/unifiedRoutingService';
import { monitoring } from '@/utils/monitoring';
import { offlineManager } from '@/utils/offlineManager';

// Enhanced Route type that includes metadata from routing services
export interface EnhancedRoute extends Route {
  origin?: string;
  destination?: string;
  mode?: TravelMode;
  accessibility?: {
    isAccessible: boolean;
    hasElevator: boolean;
    hasRamps: boolean;
  };
  metadata?: {
    safetyScore?: number;
    kidFriendlyScore?: number;
    accessibilityScore?: number;
    source?: string;
    geometry?: any;
    alerts?: string[];
  };
}

type AccessibilitySettings = {
  largeText: boolean;
  highContrast: boolean;
  voiceDescriptions: boolean;
  simplifiedMode: boolean;
};

type WeatherInfo = {
  temperature: number;
  condition: string;
  humidity: number;
};

type RoutingPreferences = {
  childAge?: number;
  wheelchair: boolean;
  prioritizeSafety: boolean;
  maxWalkDistance: number;
  maxTransfers: number;
  avoidTolls: boolean;
  avoidHighways: boolean;
};

type NavigationState = {
  favorites: Place[];
  recentSearches: Place[];
  origin: Place | null;
  destination: Place | null;
  availableRoutes: Route[];
  unifiedRoutes: UnifiedRoute[];
  selectedRoute: Route | null;
  selectedUnifiedRoute: UnifiedRoute | null;
  searchQuery: string;
  accessibilitySettings: AccessibilitySettings;
  photoCheckIns: PhotoCheckIn[];
  weatherInfo: WeatherInfo | null;
  selectedTravelMode: TravelMode;
  routeOptions: RouteOptions;
  routingPreferences: RoutingPreferences;
  isLoadingRoutes: boolean;
  routingError: string | null;
  useAdvancedRouting: boolean;

  // Actions
  setOrigin: (place: Place | null) => void;
  setDestination: (place: Place | null) => void;
  addToFavorites: (place: Place) => void;
  removeFromFavorites: (placeId: string) => void;
  addToRecentSearches: (place: Place) => void;
  clearRecentSearches: () => void;
  setSearchQuery: (query: string) => void;
  findRoutes: () => Promise<void>;
  findAdvancedRoutes: () => Promise<void>;
  selectRoute: (route: EnhancedRoute) => void;
  selectUnifiedRoute: (route: UnifiedRoute) => void;
  clearRoute: () => void;
  updateAccessibilitySettings: (settings: Partial<AccessibilitySettings>) => void;
  addPhotoCheckIn: (checkIn: Omit<PhotoCheckIn, 'id'>) => void;
  setWeatherInfo: (weather: WeatherInfo) => void;
  setTravelMode: (mode: TravelMode) => void;
  updateRouteOptions: (options: Partial<RouteOptions>) => void;
  updateRoutingPreferences: (preferences: Partial<RoutingPreferences>) => void;
  toggleAdvancedRouting: (enabled: boolean) => void;
  addLocationVerifiedPhotoCheckIn: (
    checkIn: Omit<PhotoCheckIn, 'id'>,
    currentLocation: { latitude: number; longitude: number },
    placeLocation: { latitude: number; longitude: number },
  ) => { isWithinRadius: boolean; distance: number };
};

// Convert UnifiedRoute to enhanced legacy Route format for compatibility
const convertUnifiedRouteToLegacyRoute = (
  unifiedRoute: UnifiedRoute,
  request: UnifiedRouteRequest,
): EnhancedRoute => {
  // Map unified route type to TransitMode
  const getTransitMode = (type: string): TransitMode => {
    switch (type) {
      case 'walking':
        return 'walk';
      case 'cycling':
        return 'bike';
      case 'transit':
        return 'subway'; // Default to subway for transit
      case 'multimodal':
        return 'subway'; // Default to subway for multimodal
      default:
        return 'walk';
    }
  };

  // Map unified route type to TravelMode
  const getTravelMode = (type: string): TravelMode => {
    switch (type) {
      case 'walking':
        return 'walking';
      case 'cycling':
        return 'biking';
      case 'transit':
        return 'transit';
      case 'multimodal':
        return 'transit';
      default:
        return 'walking';
    }
  };

  // Create a basic transit step from the unified route
  const createTransitStep = (): TransitStep => ({
    id: `${unifiedRoute.id}_step`,
    type: getTransitMode(unifiedRoute.type),
    from: request.from.name || 'Start',
    to: request.to.name || 'End',
    duration: unifiedRoute.summary.duration,
    // Add optional properties if available
    departureTime: new Date().toLocaleTimeString(),
    arrivalTime: new Date(Date.now() + unifiedRoute.summary.duration * 60000).toLocaleTimeString(),
  });

  return {
    id: unifiedRoute.id,
    origin: request.from.name || 'Start Location',
    destination: request.to.name || 'End Location',
    totalDuration: unifiedRoute.summary.duration,
    steps: [createTransitStep()],
    mode: getTravelMode(unifiedRoute.type),
    departureTime: new Date().toLocaleTimeString(),
    arrivalTime: new Date(Date.now() + unifiedRoute.summary.duration * 60000).toLocaleTimeString(),
    accessibility: {
      isAccessible: unifiedRoute.accessibilityScore > 70,
      hasElevator: unifiedRoute.type === 'transit' || unifiedRoute.type === 'multimodal',
      hasRamps: unifiedRoute.accessibilityScore > 60,
    },
    // Add metadata for enhanced features
    metadata: {
      safetyScore: unifiedRoute.safetyScore,
      kidFriendlyScore: unifiedRoute.kidFriendlyScore,
      accessibilityScore: unifiedRoute.accessibilityScore,
      source: unifiedRoute.source,
      geometry: unifiedRoute.geometry,
      alerts: unifiedRoute.alerts,
    },
  };
};

// Generate travel mode mapping
const getTravelModeMapping = (travelMode: TravelMode): ('WALK' | 'BIKE' | 'TRANSIT' | 'CAR')[] => {
  switch (travelMode) {
    case 'walking':
      return ['WALK'];
    case 'biking':
      return ['BIKE'];
    case 'driving':
      return ['CAR'];
    case 'transit':
      return ['WALK', 'TRANSIT'];
    default:
      return ['WALK', 'TRANSIT'];
  }
};

export const useNavigationStore = create<NavigationState>((set, get) => ({
  favorites: favoriteLocations,
  recentSearches: [],
  origin: null,
  destination: null,
  availableRoutes: [],
  unifiedRoutes: [],
  selectedRoute: null,
  selectedUnifiedRoute: null,
  searchQuery: '',
  accessibilitySettings: {
    largeText: false,
    highContrast: false,
    voiceDescriptions: false,
    simplifiedMode: false,
  },
  photoCheckIns: [],
  weatherInfo: null,
  selectedTravelMode: 'transit',
  routeOptions: {
    travelMode: 'transit',
    avoidTolls: false,
    avoidHighways: false,
    accessibilityMode: false,
  },
  routingPreferences: {
    wheelchair: false,
    prioritizeSafety: true,
    maxWalkDistance: 800,
    maxTransfers: 2,
    avoidTolls: false,
    avoidHighways: false,
  },
  isLoadingRoutes: false,
  routingError: null,
  useAdvancedRouting: true, // Default to new routing services

  setOrigin: (place) => set({ origin: place }),

  setDestination: (place) => set({ destination: place }),

  addToFavorites: (place) =>
    set((state) => {
      if (state.favorites.some((fav) => fav.id === place.id)) {
        return state;
      }

      const updatedPlace = { ...place, isFavorite: true };
      return { favorites: [...state.favorites, updatedPlace] };
    }),

  removeFromFavorites: (placeId) =>
    set((state) => ({
      favorites: state.favorites.filter((place) => place.id !== placeId),
    })),

  addToRecentSearches: (place) =>
    set((state) => {
      const filteredSearches = state.recentSearches.filter((p) => p.id !== place.id);
      return {
        recentSearches: [place, ...filteredSearches].slice(0, 5),
      };
    }),

  clearRecentSearches: () => set({ recentSearches: [] }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  findRoutes: async () => {
    const state = get();

    if (state.useAdvancedRouting) {
      await state.findAdvancedRoutes();
    } else {
      // Fallback to legacy routing logic
      await state.findAdvancedRoutes(); // Use advanced routing as fallback
    }
  },

  findAdvancedRoutes: async () => {
    const { origin, destination, selectedTravelMode, routingPreferences, accessibilitySettings } =
      get();

    if (!origin || !destination) {
      set({
        availableRoutes: [],
        unifiedRoutes: [],
        selectedRoute: null,
        selectedUnifiedRoute: null,
      });
      return;
    }

    set({ isLoadingRoutes: true, routingError: null });

    try {
      monitoring.trackUserAction({
        action: 'route_search_started',
        screen: 'map',
        metadata: {
          travelMode: selectedTravelMode,
          hasChildAge: !!routingPreferences.childAge,
          wheelchair: routingPreferences.wheelchair,
        },
      });

      const routeRequest: UnifiedRouteRequest = {
        from: {
          lat: origin.coordinates.latitude,
          lng: origin.coordinates.longitude,
          name: origin.name,
        },
        to: {
          lat: destination.coordinates.latitude,
          lng: destination.coordinates.longitude,
          name: destination.name,
        },
        preferences: {
          modes: getTravelModeMapping(selectedTravelMode),
          childAge: routingPreferences.childAge,
          wheelchair: routingPreferences.wheelchair || accessibilitySettings.simplifiedMode,
          prioritizeSafety: routingPreferences.prioritizeSafety,
          maxWalkDistance: routingPreferences.maxWalkDistance,
          maxTransfers: routingPreferences.maxTransfers,
        },
      };

      const unifiedRoutes = await unifiedRoutingService.getRoutes(routeRequest);

      // Convert to legacy format for compatibility
      const legacyRoutes = unifiedRoutes.map((route) =>
        convertUnifiedRouteToLegacyRoute(route, routeRequest),
      );

      // Cache routes for offline access (simplified for now)
      try {
        // Note: cacheData method would need to be implemented in offlineManager
        // await offlineManager.cacheData(
        //   `routes_${origin.id}_${destination.id}_${selectedTravelMode}`,
        //   { unifiedRoutes, legacyRoutes },
        //   300 // 5 minutes cache
        // );
      } catch (cacheError) {
        console.warn('Failed to cache routes:', cacheError);
      }

      set({
        availableRoutes: legacyRoutes,
        unifiedRoutes,
        selectedRoute: legacyRoutes[0] || null,
        selectedUnifiedRoute: unifiedRoutes[0] || null,
        isLoadingRoutes: false,
        routingError: null,
      });

      monitoring.trackUserAction({
        action: 'route_search_completed',
        screen: 'map',
        metadata: {
          routesFound: unifiedRoutes.length,
          averageSafetyScore:
            unifiedRoutes.reduce((sum, r) => sum + r.safetyScore, 0) / unifiedRoutes.length,
        },
      });
    } catch (error) {
      console.error('Advanced routing failed:', error);

      const errorMessage = error instanceof Error ? error.message : 'Failed to find routes';

      set({
        availableRoutes: [],
        unifiedRoutes: [],
        selectedRoute: null,
        selectedUnifiedRoute: null,
        isLoadingRoutes: false,
        routingError: errorMessage,
      });

      monitoring.captureError({
        error: error as Error,
        context: 'Enhanced Navigation Store - Find Advanced Routes',
        severity: 'medium',
      });

      // Try to load cached routes as fallback (simplified for now)
      try {
        // Note: getCachedData method would need to be implemented in offlineManager
        // const cachedData = await offlineManager.getCachedData(
        //   `routes_${origin.id}_${destination.id}_${selectedTravelMode}`
        // );
        // if (cachedData) {
        //   set({
        //     availableRoutes: cachedData.legacyRoutes || [],
        //     unifiedRoutes: cachedData.unifiedRoutes || [],
        //     selectedRoute: cachedData.legacyRoutes?.[0] || null,
        //     selectedUnifiedRoute: cachedData.unifiedRoutes?.[0] || null,
        //     routingError: 'Using cached routes (offline)',
        //   });
        // }
      } catch (cacheError) {
        console.warn('Failed to load cached routes:', cacheError);
      }
    }
  },

  selectRoute: (route: EnhancedRoute) => {
    set({ selectedRoute: route });

    // Also select corresponding unified route if available
    const { unifiedRoutes } = get();
    const matchingUnifiedRoute = unifiedRoutes.find((ur) => ur.id === route.id);
    if (matchingUnifiedRoute) {
      set({ selectedUnifiedRoute: matchingUnifiedRoute });
    }

    monitoring.trackUserAction({
      action: 'route_selected',
      screen: 'map',
      metadata: {
        routeId: route.id,
        routeMode: route.mode,
        duration: route.totalDuration,
        safetyScore: route.metadata?.safetyScore,
      },
    });
  },

  selectUnifiedRoute: (route) => {
    // Create a mock request for conversion (this could be improved by storing the original request)
    const mockRequest: UnifiedRouteRequest = {
      from: { lat: 0, lng: 0, name: route.description.split(' to ')[0] || 'Start' },
      to: { lat: 0, lng: 0, name: route.description.split(' to ')[1] || 'End' },
      preferences: { modes: ['WALK'] },
    };

    const legacyRoute = convertUnifiedRouteToLegacyRoute(route, mockRequest);
    set({
      selectedUnifiedRoute: route,
      selectedRoute: legacyRoute,
    });

    monitoring.trackUserAction({
      action: 'unified_route_selected',
      screen: 'map',
      metadata: {
        routeId: route.id,
        routeType: route.type,
        source: route.source,
        safetyScore: route.safetyScore,
        kidFriendlyScore: route.kidFriendlyScore,
      },
    });
  },

  clearRoute: () =>
    set({
      origin: null,
      destination: null,
      availableRoutes: [],
      unifiedRoutes: [],
      selectedRoute: null,
      selectedUnifiedRoute: null,
      searchQuery: '',
      routingError: null,
    }),

  updateAccessibilitySettings: (settings) =>
    set((state) => ({
      accessibilitySettings: { ...state.accessibilitySettings, ...settings },
    })),

  addPhotoCheckIn: (checkIn) =>
    set((state) => ({
      photoCheckIns: [...state.photoCheckIns, { ...checkIn, id: Date.now().toString() }],
    })),

  setWeatherInfo: (weather) => set({ weatherInfo: weather }),

  setTravelMode: (mode) => {
    set({ selectedTravelMode: mode });

    // Update route options and refind routes
    const { findRoutes, routeOptions } = get();
    set({ routeOptions: { ...routeOptions, travelMode: mode } });
    findRoutes();
  },

  updateRouteOptions: (options) => {
    set((state) => ({
      routeOptions: { ...state.routeOptions, ...options },
    }));

    // Refind routes with new options
    const { findRoutes } = get();
    findRoutes();
  },

  updateRoutingPreferences: (preferences) => {
    set((state) => ({
      routingPreferences: { ...state.routingPreferences, ...preferences },
    }));

    // Refind routes with new preferences
    const { findRoutes } = get();
    findRoutes();
  },

  toggleAdvancedRouting: (enabled) => {
    set({ useAdvancedRouting: enabled });

    monitoring.trackUserAction({
      action: 'advanced_routing_toggled',
      screen: 'settings',
      metadata: { enabled },
    });

    // Refind routes with new routing method
    const { findRoutes } = get();
    findRoutes();
  },

  addLocationVerifiedPhotoCheckIn: (checkIn, currentLocation, placeLocation) => {
    const verification = verifyLocationProximity(
      currentLocation.latitude,
      currentLocation.longitude,
      placeLocation.latitude,
      placeLocation.longitude,
      100, // 100 meter radius
    );

    const verifiedCheckIn = {
      ...checkIn,
      id: Date.now().toString(),
      location: currentLocation,
      isLocationVerified: verification.isWithinRadius,
      distanceFromPlace: verification.distance,
    };

    set((state) => ({
      photoCheckIns: [...state.photoCheckIns, verifiedCheckIn],
    }));

    return verification;
  },
}));

export default useNavigationStore;
