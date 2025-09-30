export type TransitSystem = {
  id: string;
  name: string;
  type: "subway" | "train" | "bus" | "tram" | "ferry";
  color: string;
  routes?: string[];
  status?: "operational" | "delayed" | "suspended";
  lastUpdated?: string;
};

export type RegionConfig = {
  id: string;
  name: string;
  country: string;
  timezone: string;
  currency: string;
  language: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  transitSystems: TransitSystem[];
  emergencyNumber: string;
  safetyTips: string[];
  funFacts: string[];
  popularPlaces: {
    name: string;
    category: string;
    description: string;
  }[];
  weatherApiKey?: string;
  transitApiEndpoint?: string;
  mapStyle?: "standard" | "satellite" | "hybrid";
  lastUpdated?: string;
};

export type UserRegionPreferences = {
  selectedRegion: string;
  preferredLanguage: string;
  preferredUnits: "metric" | "imperial";
  accessibilityMode: boolean;
  parentalControls: boolean;
};
