import { RegionConfig } from '@/types/region';

export const sanFranciscoConfig: RegionConfig = {
  id: 'sf',
  name: 'San Francisco',
  country: 'United States',
  timezone: 'America/Los_Angeles',
  currency: 'USD',
  language: 'en',
  coordinates: {
    latitude: 37.7749,
    longitude: -122.4194,
  },
  transitSystems: [
    {
      id: 'muni',
      name: 'Muni',
      type: 'bus',
      color: '#E31837',
    },
    {
      id: 'muni-metro',
      name: 'Muni Metro',
      type: 'subway',
      color: '#00A651',
      routes: ['J', 'K', 'L', 'M', 'N', 'T'],
    },
    {
      id: 'cable-car',
      name: 'Cable Car',
      type: 'tram',
      color: '#8B4513',
      routes: ['Powell-Hyde', 'Powell-Mason', 'California'],
    },
    {
      id: 'bart',
      name: 'BART',
      type: 'train',
      color: '#0099CC',
    },
  ],
  emergencyNumber: '911',
  safetyTips: [
    'Always stay with a trusted adult when using public transportation',
    'Keep your Clipper card in a safe place',
    'Hold on tight when riding cable cars - they can be bumpy!',
    'Be careful on steep hills and stairs',
    'Stay seated while the vehicle is moving',
  ],
  funFacts: [
    "San Francisco's cable cars are the only moving National Historic Landmark!",
    "The Golden Gate Bridge is painted in a color called 'International Orange'.",
    "Lombard Street is known as the 'crookedest street in the world'!",
    'San Francisco has more than 50 hills throughout the city.',
    "Alcatraz Island was once a famous prison but now it's a museum!",
  ],
  popularPlaces: [
    {
      name: 'Golden Gate Park',
      category: 'park',
      description: 'Large park with gardens, museums, and playgrounds',
    },
    {
      name: "Fisherman's Wharf",
      category: 'landmark',
      description: 'Waterfront area with shops, restaurants, and sea lions',
    },
    {
      name: 'Crissy Field',
      category: 'park',
      description: 'Waterfront park with Golden Gate Bridge views',
    },
  ],
  transitApiEndpoint: 'https://api.511.org/',
  mapStyle: 'standard',
};
