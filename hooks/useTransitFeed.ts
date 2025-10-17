import { useQuery } from '@tanstack/react-query';

export type TransitRoute = {
  id: string;
  name: string;
  systemId: string;
  status: string;
  nextArrival: number | null;
  destination?: string;
  nextStopName?: string;
};

export type TransitAlert = {
  id: string;
  systemId: string;
  type: string;
  message: string;
  severity?: string;
  affectedRoutes?: string[];
};

export type TransitFeed = {
  routes: TransitRoute[];
  alerts: TransitAlert[];
  lastModified?: string;
};

type UseTransitFeedOpts = {
  region?: string;
  system?: string;
  /** base URL of the server proxy (default: http://localhost:3001) */
  baseUrl?: string;
  /** Use the server's mock feed (appends ?mock=1) */
  mock?: boolean;
  /** Poll interval in ms (default: 8000) */
  refetchInterval?: number | false;
  /** Enable querying */
  enabled?: boolean;
};

async function fetchFeed(baseUrl: string, region: string, system: string, mock: boolean) {
  const url = `${baseUrl.replace(/\/$/, '')}/feeds/${encodeURIComponent(
    region,
  )}/${encodeURIComponent(system)}.json${mock ? '?mock=1' : ''}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to fetch transit feed ${res.status} ${res.statusText} ${text}`);
  }
  const json = (await res.json()) as TransitFeed;
  return json;
}

export function useTransitFeed(opts?: UseTransitFeedOpts) {
  const {
    region = 'nyc',
    system = 'mta-subway',
    baseUrl = (typeof process !== 'undefined' &&
      (process.env as any).EXPO_PUBLIC_TRANSIT_BASE_URL) ||
      'http://localhost:3001',
    mock = false,
    refetchInterval = 8000,
    enabled = true,
  } = opts || {};

  return useQuery<TransitFeed, Error>({
    queryKey: ['transit', region, system, mock ? 'mock' : 'live'],
    queryFn: () => fetchFeed(baseUrl, region, system, mock),
    staleTime:
      typeof refetchInterval === 'number' ? Math.max(0, (refetchInterval as number) - 1000) : 0,
    refetchInterval: refetchInterval,
    retry: 1,
    enabled,
  });
}

export default useTransitFeed;
