/**
 * OpenRouteService (ORS) Integration
 * Provides powerful routing capabilities with multiple profiles and optimization
 */

import { log } from './logger';
import { monitoring } from './monitoring';
import { offlineStorage } from './api';
import { timeoutSignal } from './abortSignal';

// ORS Configuration
export interface ORSConfig {
  apiKey: string;
  baseUrl: string;
  timeout: number;
}

// Route Profiles supported by ORS
export type ORSProfile =
  | 'driving-car'
  | 'driving-hgv'
  | 'cycling-regular'
  | 'cycling-road'
  | 'cycling-mountain'
  | 'cycling-electric'
  | 'foot-walking'
  | 'foot-hiking'
  | 'wheelchair';

// ORS Route Request
export interface ORSRouteRequest {
  coordinates: [number, number][]; // [lng, lat] format
  profile: ORSProfile;
  format?: 'json' | 'geojson';
  preference?: 'fastest' | 'shortest' | 'recommended';
  units?: 'km' | 'mi' | 'm';
  language?: string;
  geometry?: boolean;
  instructions?: boolean;
  elevation?: boolean;
  extra_info?: string[];
  options?: {
    avoid_features?: string[];
    avoid_borders?: 'all' | 'controlled';
    avoid_countries?: string[];
    profile_params?: {
      restrictions?: {
        maximum_speed?: number;
        hazmat?: boolean;
        weight?: number;
        height?: number;
        width?: number;
        length?: number;
      };
      weightings?: {
        steepness_difficulty?: number;
        green?: number;
        quiet?: number;
      };
    };
  };
}

// ORS Route Response
export interface ORSRouteResponse {
  routes: ORSRoute[];
  bbox: [number, number, number, number];
  info: {
    attribution: string;
    service: string;
    timestamp: number;
    query: {
      coordinates: [number, number][];
      profile: string;
      format: string;
    };
    engine: {
      version: string;
      build_date: string;
      graph_date: string;
    };
  };
}

export interface ORSRoute {
  summary: {
    distance: number; // meters
    duration: number; // seconds
  };
  geometry: string; // encoded polyline
  bbox: [number, number, number, number];
  segments: ORSSegment[];
  way_points: number[];
  extras?: {
    surface?: {
      values: [number, number, number][];
      summary: Array<{ value: number; distance: number; amount: number }>;
    };
    steepness?: {
      values: [number, number, number][];
      summary: Array<{ value: number; distance: number; amount: number }>;
    };
    waytype?: {
      values: [number, number, number][];
      summary: Array<{ value: number; distance: number; amount: number }>;
    };
  };
}

export interface ORSSegment {
  distance: number;
  duration: number;
  steps: ORSStep[];
}

export interface ORSStep {
  distance: number;
  duration: number;
  type: number;
  instruction: string;
  name: string;
  way_points: [number, number];
  maneuver?: {
    bearing_before: number;
    bearing_after: number;
    location: [number, number];
  };
}

class OpenRouteService {
  private config: ORSConfig;
  private cache = new Map<string, { data: ORSRouteResponse; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private pendingRequests = new Map<string, Promise<ORSRouteResponse>>();

  constructor(config: ORSConfig) {
    this.config = config;
  }

  /**
   * Get route between coordinates
   */
  async getRoute(request: ORSRouteRequest): Promise<ORSRouteResponse> {
    const endTimer = monitoring.startPerformanceTimer('ors_route_request');

    try {
      // Create cache key
      const cacheKey = this.createCacheKey(request);

      // Check in-memory cache first (fast, avoids AsyncStorage race/failures)
      const local = this.cache.get(cacheKey);
      if (local && Date.now() - local.timestamp <= this.cacheTimeout) {
        endTimer({ source: 'memory-cache' });
        return local.data;
      }

      // Then check persistent/offline cache
      const cached = await this.getCachedRoute(cacheKey);
      if (cached) {
        // Mirror persistent cache into in-memory cache for faster subsequent reads
        try {
          this.cache.set(cacheKey, { data: cached, timestamp: Date.now() });
        } catch (e) {
          // ignore memory cache set failures
        }

        endTimer({ source: 'cache' });
        return cached;
      }

      // Check if request is already pending (request deduplication)
      const pending = this.pendingRequests.get(cacheKey);
      if (pending) {
        endTimer({ source: 'pending' });
        return pending;
      }

      // Make API request and store as pending
      const requestPromise = this.makeRouteRequest(request)
        .then(async (response) => {
          // Cache response in persistent storage
          await this.cacheRoute(cacheKey, response);

          // Also update in-memory cache for immediate availability
          try {
            this.cache.set(cacheKey, { data: response, timestamp: Date.now() });
          } catch (e) {
            // ignore
          }

          // Clear pending
          this.pendingRequests.delete(cacheKey);
          return response;
        })
        .catch((error) => {
          // Clear pending on error
          this.pendingRequests.delete(cacheKey);
          throw error;
        });

      this.pendingRequests.set(cacheKey, requestPromise);
      const response = await requestPromise;

      endTimer({ source: 'api' });
      return response;
    } catch (error) {
      endTimer({ error: true });
      monitoring.captureError({
        error: error as Error,
        context: 'ORS Route Request',
        severity: 'high',
        metadata: { profile: request.profile, coordinates: request.coordinates.length },
      });
      throw error;
    }
  }

  /**
   * Get multiple route options
   */
  async getRouteAlternatives(
    coordinates: [number, number][],
    profiles: ORSProfile[] = ['foot-walking', 'cycling-regular'],
    options?: Partial<ORSRouteRequest>,
  ): Promise<{ profile: ORSProfile; route: ORSRouteResponse }[]> {
    const results = await Promise.allSettled(
      profiles.map(async (profile) => {
        const request: ORSRouteRequest = {
          coordinates,
          profile,
          format: 'json',
          geometry: true,
          instructions: true,
          elevation: true,
          extra_info: ['surface', 'steepness', 'waytype'],
          ...options,
        };

        const route = await this.getRoute(request);
        return { profile, route };
      }),
    );

    return results
      .filter(
        (
          result,
        ): result is PromiseFulfilledResult<{ profile: ORSProfile; route: ORSRouteResponse }> =>
          result.status === 'fulfilled',
      )
      .map((result) => result.value);
  }

  /**
   * Get kid-friendly route with safety optimizations
   */
  async getKidFriendlyRoute(
    coordinates: [number, number][],
    childAge: number,
  ): Promise<ORSRouteResponse> {
    const request: ORSRouteRequest = {
      coordinates,
      profile: 'foot-walking',
      format: 'json',
      preference: 'recommended',
      geometry: true,
      instructions: true,
      elevation: true,
      extra_info: ['surface', 'steepness', 'waytype'],
      options: {
        avoid_features: ['highways', 'ferries'],
        profile_params: {
          weightings: {
            steepness_difficulty: childAge < 8 ? 5 : 3, // Avoid steep areas for younger kids
            green: 3, // Prefer green areas (parks)
            quiet: 4, // Prefer quiet streets
          },
        },
      },
    };

    return this.getRoute(request);
  }

  /**
   * Get accessibility-optimized route
   */
  async getAccessibleRoute(
    coordinates: [number, number][],
    wheelchairAccessible = true,
  ): Promise<ORSRouteResponse> {
    const profile: ORSProfile = wheelchairAccessible ? 'wheelchair' : 'foot-walking';

    const request: ORSRouteRequest = {
      coordinates,
      profile,
      format: 'json',
      preference: 'recommended',
      geometry: true,
      instructions: true,
      elevation: true,
      extra_info: ['surface', 'steepness'],
      options: {
        avoid_features: ['steps', 'ferries'],
        profile_params: {
          weightings: {
            steepness_difficulty: 5, // Strongly avoid steep areas
          },
        },
      },
    };

    return this.getRoute(request);
  }

  /**
   * Get isochrone (reachability area)
   */
  async getIsochrone(
    location: [number, number],
    range: number[], // time in seconds or distance in meters
    profile: ORSProfile = 'foot-walking',
    rangeType: 'time' | 'distance' = 'time',
  ): Promise<any> {
    const endTimer = monitoring.startPerformanceTimer('ors_isochrone_request');

    try {
      const url = `${this.config.baseUrl}/v2/isochrones/${profile}`;

      const body = {
        locations: [location],
        range: range,
        range_type: rangeType,
        format: 'geojson',
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json, application/geo+json',
          'Content-Type': 'application/json',
          Authorization: this.config.apiKey,
        },
        body: JSON.stringify(body),
        signal: timeoutSignal(this.config.timeout),
      });

      if (!response.ok) {
        throw new Error(`ORS Isochrone API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      endTimer({ rangeType, profile });
      return data;
    } catch (error) {
      endTimer({ error: true });
      monitoring.captureError({
        error: error as Error,
        context: 'ORS Isochrone Request',
        severity: 'medium',
        metadata: { profile, rangeType, range },
      });
      throw error;
    }
  }

  /**
   * Get Points of Interest near a location
   */
  async getPOIs(
    location: [number, number],
    categories: string[],
    radius = 1000, // meters
  ): Promise<any> {
    const endTimer = monitoring.startPerformanceTimer('ors_poi_request');

    try {
      const url = `${this.config.baseUrl}/pois`;

      const params = new URLSearchParams({
        request: 'pois',
        geometry: `${location[0]},${location[1]}`,
        buffer: radius.toString(),
        category_ids: categories.join(','),
        format: 'geojson',
      });

      const response = await fetch(`${url}?${params}`, {
        headers: {
          Accept: 'application/json',
          Authorization: this.config.apiKey,
        },
        signal: timeoutSignal(this.config.timeout),
      });

      if (!response.ok) {
        throw new Error(`ORS POI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      endTimer({ categories: categories.length, radius });
      return data;
    } catch (error) {
      endTimer({ error: true });
      monitoring.captureError({
        error: error as Error,
        context: 'ORS POI Request',
        severity: 'low',
        metadata: { categories, radius },
      });
      throw error;
    }
  }

  /**
   * Calculate route matrix (multiple origins to multiple destinations)
   */
  async getMatrix(
    locations: [number, number][],
    profile: ORSProfile = 'foot-walking',
    metrics: ('distance' | 'duration')[] = ['duration', 'distance'],
  ): Promise<any> {
    const endTimer = monitoring.startPerformanceTimer('ors_matrix_request');

    try {
      const url = `${this.config.baseUrl}/v2/matrix/${profile}`;

      const body = {
        locations,
        metrics,
        resolve_locations: true,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: this.config.apiKey,
        },
        body: JSON.stringify(body),
        signal: timeoutSignal(this.config.timeout),
      });

      if (!response.ok) {
        throw new Error(`ORS Matrix API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      endTimer({ locations: locations.length, metrics });
      return data;
    } catch (error) {
      endTimer({ error: true });
      monitoring.captureError({
        error: error as Error,
        context: 'ORS Matrix Request',
        severity: 'medium',
        metadata: { locations: locations.length, metrics },
      });
      throw error;
    }
  }

  /**
   * Clear in-memory caches to keep tests deterministic
   */
  resetForTests(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Make route request to ORS API with retry logic
   */
  private async makeRouteRequest(request: ORSRouteRequest, retries = 3): Promise<ORSRouteResponse> {
    const url = `${this.config.baseUrl}/v2/directions/${request.profile}`;

    const body = {
      coordinates: request.coordinates,
      format: request.format || 'json',
      preference: request.preference || 'recommended',
      units: request.units || 'm',
      language: request.language || 'en',
      geometry: request.geometry !== false,
      instructions: request.instructions !== false,
      elevation: request.elevation || false,
      extra_info: request.extra_info || [],
      options: request.options || {},
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            Accept: 'application/json, application/geo+json',
            'Content-Type': 'application/json',
            Authorization: this.config.apiKey,
          },
          body: JSON.stringify(body),
          signal: timeoutSignal(this.config.timeout),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`ORS API error: ${response.status} ${response.statusText}\n${errorText}`);
        }

        return response.json();
      } catch (error) {
        lastError = error as Error;

        // Don't retry on HTTP errors, only network errors
        if (error instanceof Error && error.message.includes('ORS API error')) {
          throw error;
        }

        // Log retry attempt
        if (attempt < retries - 1) {
          log.warn(`ORS request failed, retrying (${attempt + 1}/${retries})`, error as Error);
        }
      }
    }

    throw lastError || new Error('ORS request failed after retries');
  }

  /**
   * Create cache key for route request
   */
  private createCacheKey(request: ORSRouteRequest): string {
    const coords = request.coordinates.map((c) => `${c[0]},${c[1]}`).join('|');
    const options = JSON.stringify(request.options || {});
    return `ors_${request.profile}_${coords}_${request.preference || 'default'}_${options}`;
  }

  /**
   * Get cached route if available and not expired
   */
  private async getCachedRoute(cacheKey: string): Promise<ORSRouteResponse | null> {
    try {
      return await offlineStorage.getCachedResponse<ORSRouteResponse>(cacheKey, this.cacheTimeout);
    } catch (error) {
      log.warn('Failed to get cached ORS route', error as Error);
      return null;
    }
  }

  /**
   * Cache route response
   */
  private async cacheRoute(cacheKey: string, response: ORSRouteResponse): Promise<void> {
    try {
      await offlineStorage.cacheResponse(cacheKey, response);
    } catch (error) {
      log.warn('Failed to cache ORS route', error as Error);
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ORSConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    try {
      await offlineStorage.clearCache();
      this.cache.clear();
      log.info('ORS cache cleared');
    } catch (error) {
      log.error('Failed to clear ORS cache', error as Error);
    }
  }
}

// Export singleton instance
export const orsService = new OpenRouteService({
  apiKey: process.env.ORS_API_KEY || '',
  baseUrl: process.env.ORS_BASE_URL || 'https://api.openrouteservice.org',
  timeout: 15000,
});

export default orsService;
