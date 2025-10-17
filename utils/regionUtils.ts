import { RegionConfig } from '@/types/region';

export const formatCurrency = (amount: number, currency: string): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
};

export const formatDistance = (meters: number, units: 'metric' | 'imperial'): string => {
  if (units === 'imperial') {
    const feet = meters * 3.28084;
    if (feet < 1000) {
      return `${Math.round(feet)} ft`;
    }
    const miles = feet / 5280;
    return `${miles.toFixed(1)} mi`;
  } else {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    const kilometers = meters / 1000;
    return `${kilometers.toFixed(1)} km`;
  }
};

export const formatTemperature = (celsius: number, units: 'metric' | 'imperial'): string => {
  if (units === 'imperial') {
    const fahrenheit = (celsius * 9) / 5 + 32;
    return `${Math.round(fahrenheit)}°F`;
  }
  return `${Math.round(celsius)}°C`;
};

export const getLocalizedTime = (date: Date, timezone: string): string => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return date.toLocaleTimeString();
  }
};

export const validateRegionConfig = (config: RegionConfig): boolean => {
  const required = [
    'id',
    'name',
    'country',
    'timezone',
    'currency',
    'language',
    'coordinates',
    'transitSystems',
    'emergencyNumber',
  ];

  return required.every((field) => {
    const value = (config as any)[field];
    return value !== undefined && value !== null && value !== '';
  });
};

export const generateRegionFromTemplate = (
  name: string,
  country: string,
  coordinates: { latitude: number; longitude: number },
  customizations: Partial<RegionConfig> = {},
): RegionConfig => {
  const baseConfig: RegionConfig = {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    country,
    timezone: 'UTC',
    currency: 'USD',
    language: 'en',
    coordinates,
    transitSystems: [
      {
        id: 'local-bus',
        name: 'Local Bus',
        type: 'bus',
        color: '#4285F4',
      },
    ],
    emergencyNumber: '911',
    safetyTips: [
      'Always stay with a trusted adult when using public transportation',
      'Keep your transit card or payment method safe',
      'Be aware of your surroundings',
      'Know your route before you travel',
    ],
    funFacts: [
      `Welcome to ${name}!`,
      'Public transportation helps reduce traffic and pollution.',
      'Always be courteous to other passengers.',
    ],
    popularPlaces: [],
    mapStyle: 'standard',
    ...customizations,
  };

  return baseConfig;
};
