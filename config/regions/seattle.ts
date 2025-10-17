import { RegionConfig } from '@/types/region';

export const seattleConfig: RegionConfig = {
  id: 'seattle',
  name: 'Seattle',
  country: 'United States',
  timezone: 'America/Los_Angeles',
  currency: 'USD',
  language: 'en',
  coordinates: {
    latitude: 47.6062,
    longitude: -122.3321,
  },
  transitSystems: [
    {
      id: 'sound-transit',
      name: 'Sound Transit',
      type: 'train',
      color: '#0066CC',
    },
    {
      id: 'king-county-metro',
      name: 'King County Metro',
      type: 'bus',
      color: '#E31837',
    },
    {
      id: 'seattle-streetcar',
      name: 'Seattle Streetcar',
      type: 'tram',
      color: '#34A853',
    },
    {
      id: 'washington-state-ferries',
      name: 'Washington State Ferries',
      type: 'ferry',
      color: '#0099CC',
    },
  ],
  emergencyNumber: '911',
  safetyTips: [
    'Always stay with a trusted adult when using public transportation',
    'Keep your ORCA card in a safe place',
    'Be careful around ferry terminals and docks',
    'Let passengers exit before boarding',
    'Hold handrails on steep hills and stairs',
  ],
  funFacts: [
    'Seattle has the largest ferry system in the United States!',
    "The Space Needle was built for the 1962 World's Fair.",
    'Pike Place Market is one of the oldest farmers markets in the US.',
    'Seattle is home to the first Starbucks coffee shop!',
    'The city has more than 400 parks and green spaces!',
  ],
  popularPlaces: [
    {
      name: 'Pike Place Market',
      category: 'landmark',
      description: 'Historic market with fresh food, crafts, and street performers',
    },
    {
      name: 'Seattle Center',
      category: 'attraction',
      description: 'Cultural center with Space Needle, museums, and festivals',
    },
    {
      name: 'Discovery Park',
      category: 'park',
      description: 'Large park with trails, beaches, and lighthouse',
    },
  ],
  transitApiEndpoint: 'https://api.pugetsound.onebusaway.org/',
  mapStyle: 'standard',
};
