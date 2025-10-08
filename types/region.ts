export type TransitSystem = {
  id: string;
  name: string;
  type: 'subway' | 'train' | 'bus' | 'tram' | 'ferry';
  color: string;
  routes?: string[];
  feedUrl?: string; // GTFS-RT feed URL for this system
  feedUrls?: string[]; // Multiple GTFS-RT feed URLs for systems with multiple feeds
  agencyId?: string; // optional agency identifier
  // Optional API key configuration for this system. Prefer env var names for security.
  apiKey?: string; // rarely used; prefer using apiKeyEnv so keys aren't committed
  apiKeyEnv?: string; // name of environment variable that holds the API key
  apiKeyHeader?: string; // header name to send the key under, default 'x-api-key'
  status?: 'operational' | 'delayed' | 'suspended';
  lastUpdated?: string;
  // Kid-friendly features
  kidFriendlyName?: string; // Simple name kids can understand
  educationalInfo?: {
    funFacts: string[]; // Interesting facts about this transit system
    safetyTips: string[]; // Safety tips specific to this system
    howItWorks: string[]; // Simple explanations of how the system operates
  };
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
    transitInfo?: string; // How to get there using public transit
  }[];
  weatherApiKey?: string;
  transitApiEndpoint?: string;
  transitApiKey?: string; // prefer env var access: process.env.MTA_API_KEY
  mapStyle?: 'standard' | 'satellite' | 'hybrid';
  lastUpdated?: string;
};

export type UserRegionPreferences = {
  selectedRegion: string;
  preferredLanguage: string;
  preferredUnits: 'metric' | 'imperial';
  accessibilityMode: boolean;
  parentalControls: boolean;
};
