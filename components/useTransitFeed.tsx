import { useEffect, useState } from 'react';

type RouteInfo = {
  id: string;
  tripId?: string;
  name: string;
  systemId: string;
  status?: string;
  nextArrival?: number;
  destination?: string;
  nextStopName?: string;
};

export function useTransitFeed(
  region: string,
  system: string,
  opts: { pollIntervalMs?: number; mock?: boolean } = {},
) {
  const [routes, setRoutes] = useState<RouteInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const pollInterval = opts.pollIntervalMs ?? 10000;

    async function fetchOnce() {
      setLoading(true);
      setError(null);
      try {
        const q = opts.mock ? '?mock=1' : '';
        const res = await fetch(`/feeds/${region}/${system}.json${q}`);
        if (!res.ok) throw new Error(`fetch failed ${res.status}`);
        const body = await res.json();
        if (!cancelled) setRoutes(body.routes || []);
      } catch (e: any) {
        if (!cancelled) setError(String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchOnce();
    const t = setInterval(fetchOnce, pollInterval);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [region, system, opts.pollIntervalMs, opts.mock]);

  return { routes, loading, error };
}

export type { RouteInfo };
