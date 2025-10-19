import { useEffect, useMemo, useRef, useState } from 'react';
import type { FeatureCollection, Geometry } from 'geojson';
import Config from '@/utils/config';

export type RouteGeoJSON = FeatureCollection<Geometry>;

export type RouteSummary = {
  durationSeconds: number | null;
  distanceMeters: number | null;
};

export type UseRouteORSOptions = {
  /** Override the routing profile, e.g. `foot-walking`, `driving-car`, `cycling-regular`. */
  profile?: string;
  /** When false the hook will reset state and skip fetching. */
  enabled?: boolean;
  /** When true (default) duration is read from the ORS summary. */
  includeEta?: boolean;
};

export type UseRouteORSResult = {
  geojson: RouteGeoJSON | null;
  summary: RouteSummary;
  loading: boolean;
  error: Error | null;
  /**
   * Force a refetch using the last known arguments. Returns a promise that resolves
   * when the request completes or rejects if it fails.
   */
  refetch: () => Promise<RouteGeoJSON | null>;
};

const DEFAULT_PROFILE = Config.ROUTING.DEFAULT_PROFILE;
const BASE_URL = Config.ROUTING.BASE_URL.replace(/\/$/, '');
const DEFAULT_TIMEOUT = Config.ROUTING.REQUEST_TIMEOUT;
const INCLUDE_ETA = Config.ROUTING.INCLUDE_ETA;

const buildRouteUrl = (profile: string, start: [number, number], end: [number, number]): string => {
  const url = new URL(`${BASE_URL}/v2/directions/${profile}/geojson`);
  url.searchParams.set('start', `${start[0]},${start[1]}`);
  url.searchParams.set('end', `${end[0]},${end[1]}`);
  return url.toString();
};

const normaliseCoordinate = (value?: [number, number] | null): [number, number] | null => {
  if (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number' &&
    Number.isFinite(value[0]) &&
    Number.isFinite(value[1])
  ) {
    return value;
  }
  return null;
};

const deriveSummary = (featureCollection: FeatureCollection | null) => {
  if (!featureCollection) {
    return { durationSeconds: null, distanceMeters: null } as RouteSummary;
  }

  const firstFeature: any = featureCollection.features?.[0];
  const summary = firstFeature?.properties?.summary ?? {};

  const durationSeconds =
    typeof summary?.duration === 'number' ? Math.round(summary.duration) : null;
  const distanceMeters =
    typeof summary?.distance === 'number' ? Math.round(summary.distance) : null;

  return { durationSeconds, distanceMeters } as RouteSummary;
};

export function useRouteORS(
  rawStart?: [number, number],
  rawEnd?: [number, number],
  options: UseRouteORSOptions = {},
): UseRouteORSResult {
  const start = useMemo(() => normaliseCoordinate(rawStart), [rawStart?.[0], rawStart?.[1]]);
  const end = useMemo(() => normaliseCoordinate(rawEnd), [rawEnd?.[0], rawEnd?.[1]]);
  const profile = options.profile ?? DEFAULT_PROFILE;
  const includeEta = options.includeEta ?? INCLUDE_ETA;
  const enabled = options.enabled ?? true;

  const [geojson, setGeojson] = useState<RouteGeoJSON | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const lastArgs = useRef({ start, end, profile, includeEta, enabled });
  const abortRef = useRef<AbortController | null>(null);

  const fetchRoute = async (
    startCoord: [number, number],
    endCoord: [number, number],
    profileName: string,
  ): Promise<RouteGeoJSON | null> => {
    // Debug logging for CI/test investigation

    console.debug('[useRouteORS] fetchRoute called', { startCoord, endCoord, profileName });
    if (!Config.ROUTING.ORS_API_KEY) {
      throw new Error(
        'Missing OpenRouteService API key. Set EXPO_PUBLIC_ORS_API_KEY or configure extra.routing.',
      );
    }

    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;

    const routeUrl = buildRouteUrl(profileName, startCoord, endCoord);
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, DEFAULT_TIMEOUT);

    try {
      console.debug('[useRouteORS] performing fetch', { routeUrl });
      const response = await fetch(routeUrl, {
        method: 'GET',
        headers: {
          Authorization: Config.ROUTING.ORS_API_KEY,
        },
        signal: controller.signal,
      });
      // If the controller was aborted while the mocked fetch resolved, ignore the result.

      console.debug('[useRouteORS] fetch resolved, aborted?', (controller.signal as any).aborted);
      if (controller.signal && (controller.signal as any).aborted) {
        // Treat as aborted
        const abortErr: any = new Error('Aborted');
        abortErr.name = 'AbortError';
        throw abortErr;
      }

      if (!response.ok) {
        const message = await response.text();
        throw new Error(`OpenRouteService request failed (${response.status}): ${message}`);
      }

      const data = (await response.json()) as RouteGeoJSON;
      setGeojson(data);
      return data;
    } finally {
      clearTimeout(timeoutId);
      abortRef.current = null;

      console.debug('[useRouteORS] fetchRoute finally, cleared timeout');
    }
  };

  const refetch = async () => {
    if (!start || !end || !enabled) {
      setGeojson(null);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchRoute(start, end, profile);
      return result;
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') {
        return null;
      }
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    lastArgs.current = { start, end, profile, includeEta, enabled };
  }, [start, end, profile, includeEta, enabled]);

  useEffect(() => {
    if (!start || !end || !enabled) {
      setGeojson(null);
      setError(null);
      setLoading(false);
      abortRef.current?.abort();
      return;
    }

    setLoading(true);
    setError(null);

    fetchRoute(start, end, profile)
      .catch((err) => {
        if ((err as Error)?.name === 'AbortError') {
          return;
        }
        setError(err as Error);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      abortRef.current?.abort();
    };
  }, [start?.[0], start?.[1], end?.[0], end?.[1], profile, enabled]);

  const summary = useMemo(
    () => (includeEta ? deriveSummary(geojson) : { durationSeconds: null, distanceMeters: null }),
    [geojson, includeEta],
  );

  return {
    geojson,
    summary,
    loading,
    error,
    refetch,
  };
}
