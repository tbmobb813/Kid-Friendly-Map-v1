import { useQuery } from '@tanstack/react-query';
import { fetchWeather, NormalizedWeather } from '@/utils/weather';

export function useWeather(params: { lat?: number; lon?: number; units: 'imperial' | 'metric' }) {
  const { lat, lon, units } = params;

  const query = useQuery<NormalizedWeather | undefined>({
    queryKey: ['weather', lat, lon, units],
    queryFn: async () => {
      if (typeof lat !== 'number' || typeof lon !== 'number') return undefined;
      return fetchWeather(lat, lon, units);
    },
    enabled: typeof lat === 'number' && typeof lon === 'number',
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    retry: 1,
  });

  return query;
}
