import { create } from "zustand";
import { Place, Route, PhotoCheckIn, TravelMode, RouteOptions } from "@/types/navigation";
import { favoriteLocations } from "@/mocks/places";
import { sampleRoutes } from "@/mocks/transit";
import { verifyLocationProximity } from "@/utils/locationUtils";

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

type NavigationState = {
  favorites: Place[];
  recentSearches: Place[];
  origin: Place | null;
  destination: Place | null;
  availableRoutes: Route[];
  selectedRoute: Route | null;
  searchQuery: string;
  accessibilitySettings: AccessibilitySettings;
  photoCheckIns: PhotoCheckIn[];
  weatherInfo: WeatherInfo | null;
  selectedTravelMode: TravelMode;
  routeOptions: RouteOptions;
  
  // Actions
  setOrigin: (place: Place | null) => void;
  setDestination: (place: Place | null) => void;
  addToFavorites: (place: Place) => void;
  removeFromFavorites: (placeId: string) => void;
  addToRecentSearches: (place: Place) => void;
  clearRecentSearches: () => void;
  setSearchQuery: (query: string) => void;
  findRoutes: () => void;
  selectRoute: (route: Route) => void;
  clearRoute: () => void;
  updateAccessibilitySettings: (settings: Partial<AccessibilitySettings>) => void;
  addPhotoCheckIn: (checkIn: Omit<PhotoCheckIn, 'id'>) => void;
  setWeatherInfo: (weather: WeatherInfo) => void;
  setTravelMode: (mode: TravelMode) => void;
  updateRouteOptions: (options: Partial<RouteOptions>) => void;
  addLocationVerifiedPhotoCheckIn: (checkIn: Omit<PhotoCheckIn, 'id'>, currentLocation: { latitude: number; longitude: number }, placeLocation: { latitude: number; longitude: number }) => { isWithinRadius: boolean; distance: number };
};

export const useNavigationStore = create<NavigationState>((set, get) => ({
  favorites: favoriteLocations,
  recentSearches: [],
  origin: null,
  destination: null,
  availableRoutes: [],
  selectedRoute: null,
  searchQuery: "",
  accessibilitySettings: {
    largeText: false,
    highContrast: false,
    voiceDescriptions: false,
    simplifiedMode: false,
  },
  photoCheckIns: [],
  weatherInfo: null,
  selectedTravelMode: "transit",
  routeOptions: {
    travelMode: "transit",
    avoidTolls: false,
    avoidHighways: false,
    accessibilityMode: false,
  },
  
  setOrigin: (place) => set({ origin: place }),
  
  setDestination: (place) => set({ destination: place }),
  
  addToFavorites: (place) => set((state) => {
    // Check if already in favorites
    if (state.favorites.some(fav => fav.id === place.id)) {
      return state;
    }
    
    const updatedPlace = { ...place, isFavorite: true };
    return { favorites: [...state.favorites, updatedPlace] };
  }),
  
  removeFromFavorites: (placeId) => set((state) => ({
    favorites: state.favorites.filter(place => place.id !== placeId)
  })),
  
  addToRecentSearches: (place) => set((state) => {
    // Remove if already exists to avoid duplicates
    const filteredSearches = state.recentSearches.filter(p => p.id !== place.id);
    
    // Add to beginning of array, limit to 5 recent searches
    return { 
      recentSearches: [place, ...filteredSearches].slice(0, 5) 
    };
  }),
  
  clearRecentSearches: () => set({ recentSearches: [] }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  findRoutes: () => {
    const { origin, destination, selectedTravelMode, routeOptions } = get();
    
    if (!origin || !destination) {
      set({ availableRoutes: [], selectedRoute: null });
      return;
    }
    
    // In a real app, this would call an API to get routes based on travel mode
    // For now, we'll filter sample data based on travel mode
    let filteredRoutes = sampleRoutes;
    
    if (selectedTravelMode === "walking") {
      // Generate walking routes (simplified)
      filteredRoutes = sampleRoutes.map(route => ({
        ...route,
        id: `walk_${route.id}`,
        steps: [{
          id: "walk_step",
          type: "walk" as const,
          from: origin.name,
          to: destination.name,
          duration: Math.ceil(route.totalDuration * 1.5), // Walking takes longer
        }],
        totalDuration: Math.ceil(route.totalDuration * 1.5),
      }));
    } else if (selectedTravelMode === "biking") {
      // Generate biking routes (simplified)
      filteredRoutes = sampleRoutes.map(route => ({
        ...route,
        id: `bike_${route.id}`,
        steps: [{
          id: "bike_step",
          type: "bike" as const,
          from: origin.name,
          to: destination.name,
          duration: Math.ceil(route.totalDuration * 0.7), // Biking is faster than walking
        }],
        totalDuration: Math.ceil(route.totalDuration * 0.7),
      }));
    } else if (selectedTravelMode === "driving") {
      // Generate driving routes (simplified)
      filteredRoutes = sampleRoutes.map(route => ({
        ...route,
        id: `drive_${route.id}`,
        steps: [{
          id: "drive_step",
          type: "car" as const,
          from: origin.name,
          to: destination.name,
          duration: Math.ceil(route.totalDuration * 0.4), // Driving is fastest
        }],
        totalDuration: Math.ceil(route.totalDuration * 0.4),
      }));
    }
    
    set({ 
      availableRoutes: filteredRoutes,
      selectedRoute: filteredRoutes[0] 
    });
  },
  
  selectRoute: (route) => set({ selectedRoute: route }),
  
  clearRoute: () => set({ 
    origin: null,
    destination: null,
    availableRoutes: [],
    selectedRoute: null,
    searchQuery: ""
  }),
  
  updateAccessibilitySettings: (settings) => set((state) => ({
    accessibilitySettings: { ...state.accessibilitySettings, ...settings }
  })),
  
  addPhotoCheckIn: (checkIn) => set((state) => ({
    photoCheckIns: [...state.photoCheckIns, { ...checkIn, id: Date.now().toString() }]
  })),
  
  setWeatherInfo: (weather) => set({ weatherInfo: weather }),
  
  setTravelMode: (mode) => {
    set({ selectedTravelMode: mode });
    // Automatically update route options and refind routes
    const { findRoutes } = get();
    set((state) => ({
      routeOptions: { ...state.routeOptions, travelMode: mode }
    }));
    findRoutes();
  },
  
  updateRouteOptions: (options) => {
    set((state) => ({
      routeOptions: { ...state.routeOptions, ...options }
    }));
    // Refind routes with new options
    const { findRoutes } = get();
    findRoutes();
  },
  
  addLocationVerifiedPhotoCheckIn: (checkIn, currentLocation, placeLocation) => {
    const verification = verifyLocationProximity(
      currentLocation.latitude,
      currentLocation.longitude,
      placeLocation.latitude,
      placeLocation.longitude,
      100 // 100 meter radius
    );
    
    const verifiedCheckIn = {
      ...checkIn,
      id: Date.now().toString(),
      location: currentLocation,
      isLocationVerified: verification.isWithinRadius,
      distanceFromPlace: verification.distance,
    };
    
    set((state) => ({
      photoCheckIns: [...state.photoCheckIns, verifiedCheckIn]
    }));
    
    return verification;
  }
}));
