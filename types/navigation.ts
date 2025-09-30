export type Place = {
  id: string;
  name: string;
  address: string;
  category: PlaceCategory;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  isFavorite?: boolean;
};

export type PlaceCategory = 
  | "home" 
  | "school" 
  | "park" 
  | "library" 
  | "store" 
  | "restaurant" 
  | "friend" 
  | "family" 
  | "other";

export type CustomCategory = {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
  createdBy: 'parent' | 'child';
  isApproved: boolean;
  createdAt: number;
};

export type CategoryManagementSettings = {
  allowChildToCreateCategories: boolean;
  requireParentApproval: boolean;
  maxCustomCategories: number;
};

export type TransitMode = "subway" | "train" | "bus" | "walk" | "bike" | "car";

export type TransitStep = {
  id: string;
  type: TransitMode;
  name?: string;
  line?: string;
  color?: string;
  from: string;
  to: string;
  duration: number; // in minutes
  departureTime?: string;
  arrivalTime?: string;
  stops?: number;
};

export type Route = {
  id: string;
  steps: TransitStep[];
  totalDuration: number;
  departureTime: string;
  arrivalTime: string;
};

export type AccessibilitySettings = {
  largeText: boolean;
  highContrast: boolean;
  voiceDescriptions: boolean;
  simplifiedMode: boolean;
};

export type WeatherInfo = {
  condition: string;
  temperature: number;
  recommendation: string;
};

export type PhotoCheckIn = {
  id: string;
  placeId: string;
  placeName: string;
  photoUrl: string;
  timestamp: number; // Changed from Date to number for consistency
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  isLocationVerified?: boolean;
  distanceFromPlace?: number; // in meters
};

export type TravelMode = "transit" | "walking" | "biking" | "driving";

export type RouteOptions = {
  travelMode: TravelMode;
  avoidTolls?: boolean;
  avoidHighways?: boolean;
  accessibilityMode?: boolean;
};
