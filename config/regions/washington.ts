import { RegionConfig } from '@/types/region';

export const washingtonConfig: RegionConfig = {
  id: 'dc',
  name: 'Washington, D.C.',
  country: 'United States',
  timezone: 'America/New_York',
  currency: 'USD',
  language: 'en',
  coordinates: {
    latitude: 38.9072,
    longitude: -77.0369,
  },
  transitSystems: [
    {
      id: 'wmata-metro',
      name: 'Metro',
      type: 'subway',
      color: '#0066CC',
      routes: ['Red', 'Blue', 'Orange', 'Silver', 'Green', 'Yellow'],
    },
    {
      id: 'wmata-bus',
      name: 'Metrobus',
      type: 'bus',
      color: '#E31837',
    },
    {
      id: 'dc-circulator',
      name: 'DC Circulator',
      type: 'bus',
      color: '#34A853',
    },
  ],
  emergencyNumber: '911',
  safetyTips: [
    'Always stay with a trusted adult when using public transportation',
    'Keep your SmarTrip card in a safe place',
    'Stand right, walk left on Metro escalators',
    'Let passengers exit before boarding',
    'Keep bags and backpacks in front of you',
  ],
  funFacts: [
    'The Washington Metro has the second-busiest rail system in the US!',
    'Metro stations are known for their distinctive concrete arch design.',
    'The Smithsonian has 19 museums and the National Zoo!',
    'The Washington Monument is 555 feet tall.',
    'The Library of Congress is the largest library in the world!',
  ],
  popularPlaces: [
    {
      name: 'National Mall',
      category: 'landmark',
      description: 'Historic area with monuments and Smithsonian museums',
    },
    {
      name: 'Smithsonian National Zoo',
      category: 'attraction',
      description: 'Free zoo famous for its giant pandas and other animals',
    },
    {
      name: 'Rock Creek Park',
      category: 'park',
      description: 'Large urban park with trails and nature center',
    },
  ],
  transitApiEndpoint: 'https://api.wmata.com/',
  mapStyle: 'standard',
};
