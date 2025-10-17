import { RegionConfig } from '@/types/region';

export const miamiConfig: RegionConfig = {
  id: 'miami',
  name: 'Miami',
  country: 'United States',
  timezone: 'America/New_York',
  currency: 'USD',
  language: 'en',
  coordinates: {
    latitude: 25.7617,
    longitude: -80.1918,
  },
  transitSystems: [
    {
      id: 'metrorail',
      name: 'Metrorail',
      type: 'subway',
      color: '#0066CC',
      routes: ['Orange', 'Green'],
    },
    {
      id: 'metrobus',
      name: 'Metrobus',
      type: 'bus',
      color: '#E31837',
    },
    {
      id: 'metromover',
      name: 'Metromover',
      type: 'tram',
      color: '#34A853',
      routes: ['Downtown', 'Omni', 'Brickell'],
    },
  ],
  emergencyNumber: '911',
  safetyTips: [
    'Always stay with a trusted adult when using public transportation',
    'Keep your EASY Card in a safe place',
    'Stay hydrated in the hot Miami weather',
    'Let passengers exit before boarding',
    'Be careful around water areas and docks',
  ],
  funFacts: [
    "Miami's Metromover is completely free to ride!",
    'The city has the largest cruise port in the world.',
    "Miami Beach's Art Deco District has over 800 historic buildings.",
    'The Everglades National Park is just outside the city!',
    'Miami is the only major US city founded by a woman!',
  ],
  popularPlaces: [
    {
      name: 'Miami Beach',
      category: 'landmark',
      description: 'Famous beach with white sand and Art Deco architecture',
    },
    {
      name: 'Jungle Island',
      category: 'attraction',
      description: 'Interactive zoological park with exotic animals and shows',
    },
    {
      name: 'Bayfront Park',
      category: 'park',
      description: 'Waterfront park with playgrounds and bay views',
    },
  ],
  transitApiEndpoint: 'https://api.miamidade.gov/',
  mapStyle: 'standard',
};
