/**
 * OpenTripPlanner 2 (OTP2) Integration
 * Provides comprehensive multimodal transit planning with real-time data
 */

import { log } from './logger';
import { monitoring } from './monitoring';
import { offlineStorage } from './api';
import { timeoutSignal } from './abortSignal';

// OTP2 Configuration
export interface OTP2Config {
  baseUrl: string;
  routerId?: string;
  timeout: number;
}

// Transit Modes
export type TransitMode =
  | 'RAIL'
  | 'SUBWAY'
  | 'TRAM'
  | 'BUS'
  | 'FERRY'
  | 'CABLE_CAR'
  | 'GONDOLA'
  | 'FUNICULAR'
  | 'TROLLEYBUS'
  | 'MONORAIL'
  | 'AIRPLANE';

export type AccessMode = 'WALK' | 'BICYCLE' | 'CAR' | 'CAR_PARK' | 'CAR_PICKUP' | 'CAR_RENTAL';

// OTP2 Plan Request
export interface OTP2PlanRequest {
  fromPlace: string; // lat,lng format
  toPlace: string; // lat,lng format
  time?: string; // HH:MM
  date?: string; // MM-DD-YYYY
  mode?: string; // e.g., "TRANSIT,WALK"
  arriveBy?: boolean;
  wheelchair?: boolean;
  locale?: string;
  maxWalkDistance?: number;
  maxTransfers?: number;
  walkReluctance?: number;
  waitReluctance?: number;
  waitAtBeginningFactor?: number;
  walkSpeed?: number; // m/s
  bikeSpeed?: number; // m/s
  triangleWalkSafety?: number; // 0-1
  triangleWalkSlope?: number; // 0-1
  triangleWalkTime?: number; // 0-1
  intermediatePlaces?: string[];
  banned?: {
    routes?: string[];
    agencies?: string[];
    trips?: string[];
    stops?: string[];
    stopsHard?: string[];
  };
  preferred?: {
    routes?: string[];
    agencies?: string[];
    stops?: string[];
  };
  unpreferred?: {
    routes?: string[];
    agencies?: string[];
    stops?: string[];
  };
}

// OTP2 Plan Response
export interface OTP2PlanResponse {
  plan: {
    date: number;
    from: OTP2Place;
    to: OTP2Place;
    itineraries: OTP2Itinerary[];
  };
  requestParameters: Record<string, any>;
  debugOutput?: {
    precalculationTime: number;
    pathCalculationTime: number;
    pathTimes: number[];
    renderingTime: number;
    totalTime: number;
    directStreetRouterTime: number;
    transitRouterTime: number;
    filteringTime: number;
  };
  error?: {
    id: number;
    msg: string;
    message: string;
    noPath: boolean;
  };
}

export interface OTP2Place {
  name: string;
  lon: number;
  lat: number;
  orig?: string;
  vertexType?: string;
  stopId?: string;
  stopCode?: string;
  platformCode?: string;
  zoneId?: string;
  stopIndex?: number;
  cluster?: string;
}

export interface OTP2Itinerary {
  duration: number; // seconds
  startTime: number; // epoch milliseconds
  endTime: number; // epoch milliseconds
  walkTime: number; // seconds
  transitTime: number; // seconds
  waitingTime: number; // seconds
  walkDistance: number; // meters
  walkLimitExceeded: boolean;
  elevationLost: number; // meters
  elevationGained: number; // meters
  transfers: number;
  fare?: {
    fare: {
      regular: number;
      student?: number;
      senior?: number;
      youth?: number;
    };
    details: {
      regular: Array<{
        fareId: string;
        price: number;
        routes: string[];
      }>;
    };
  };
  legs: OTP2Leg[];
  tooSloped: boolean;
  arrivedAtDestinationWithRentedBicycle: boolean;
}

export interface OTP2Leg {
  startTime: number; // epoch milliseconds
  endTime: number; // epoch milliseconds
  departureDelay: number; // seconds
  arrivalDelay: number; // seconds
  realTime: boolean;
  distance: number; // meters
  pathway: boolean;
  mode: string;
  route?: string;
  routeColor?: string;
  routeTextColor?: string;
  routeId?: string;
  routeShortName?: string;
  routeLongName?: string;
  agencyName?: string;
  agencyId?: string;
  agencyUrl?: string;
  agencyTimeZoneOffset?: number;
  routeType?: number;
  tripId?: string;
  tripShortName?: string;
  tripBlockId?: string;
  headsign?: string;
  serviceDate?: string;
  from: OTP2Place;
  to: OTP2Place;
  legGeometry?: {
    points: string; // encoded polyline
    length: number;
  };
  steps?: OTP2Step[];
  alerts?: OTP2Alert[];
  rentedBike?: boolean;
  transitLeg: boolean;
  duration: number; // seconds
  interlineWithPreviousLeg: boolean;
}

export interface OTP2Step {
  distance: number; // meters
  relativeDirection: string;
  streetName: string;
  absoluteDirection: string;
  stayOn: boolean;
  area: boolean;
  bogusName: boolean;
  lon: number;
  lat: number;
  elevation?: number[];
}

export interface OTP2Alert {
  alertDescriptionText: string;
  alertHeaderText?: string;
  alertUrl?: string;
  effectiveStartDate?: number;
  effectiveEndDate?: number;
}

class OpenTripPlanner2 {
  private config: OTP2Config;
  private cache = new Map<string, OTP2PlanResponse>();
  private cacheTimeout = 2 * 60 * 1000; // 2 minutes for transit data

  constructor(config: OTP2Config) {
    this.config = config;
  }

  /**
   * Clear in-memory caches to keep tests deterministic
   */
  resetForTests(): void {
    this.cache.clear();
  }
  /**
   * Plan a trip using OTP2
   */
  async planTrip(request: OTP2PlanRequest): Promise<OTP2PlanResponse> {
    const endTimer = monitoring.startPerformanceTimer('otp2_plan_request');

    try {
      // Create cache key
      const cacheKey = this.createCacheKey(request);

      // Check cache first (shorter cache for transit data)
      const cached = await this.getCachedPlan(cacheKey);
      if (cached) {
        endTimer({ source: 'cache' });
        return cached;
      }

      // Make API request
      const response = await this.makePlanRequest(request);

      // Cache response
      await this.cachePlan(cacheKey, response);

      endTimer({ source: 'api', itineraries: response.plan?.itineraries?.length || 0 });
      return response;
    } catch (error) {
      endTimer({ error: true });
      monitoring.captureError({
        error: error as Error,
        context: 'OTP2 Plan Request',
        severity: 'high',
        metadata: {
          from: request.fromPlace,
          to: request.toPlace,
          mode: request.mode,
        },
      });
      throw error;
    }
  }

  /**
   * Get kid-friendly transit options
   */
  async getKidFriendlyTrip(
    fromPlace: string,
    toPlace: string,
    childAge: number,
    options?: Partial<OTP2PlanRequest>,
  ): Promise<OTP2PlanResponse> {
    const request: OTP2PlanRequest = {
      fromPlace,
      toPlace,
      mode: 'TRANSIT,WALK',
      wheelchair: false,
      maxWalkDistance: childAge < 8 ? 400 : 800, // Shorter walks for younger kids
      maxTransfers: childAge < 10 ? 1 : 2, // Fewer transfers for younger kids
      walkReluctance: 3, // Strongly prefer transit over walking for kids
      waitReluctance: 1.2, // Slightly prefer less waiting
      walkSpeed: childAge < 8 ? 0.8 : 1.0, // Slower walking speed for kids
      triangleWalkSafety: 0.7, // Prioritize safety
      triangleWalkSlope: 0.1, // Minimize slopes
      triangleWalkTime: 0.2, // De-prioritize time vs safety
      ...options,
    };

    return this.planTrip(request);
  }

  /**
   * Get accessible transit options
   */
  async getAccessibleTrip(
    fromPlace: string,
    toPlace: string,
    requireWheelchair = true,
    options?: Partial<OTP2PlanRequest>,
  ): Promise<OTP2PlanResponse> {
    const request: OTP2PlanRequest = {
      fromPlace,
      toPlace,
      mode: 'TRANSIT,WALK',
      wheelchair: requireWheelchair,
      maxWalkDistance: 600, // Reasonable walking distance
      walkReluctance: 3.0, // Strong preference for transit
      triangleWalkSafety: 0.8, // High safety priority
      triangleWalkSlope: 0.05, // Minimize slopes strongly
      triangleWalkTime: 0.15, // Time is less important than accessibility
      ...options,
    };

    return this.planTrip(request);
  }

  /**
   * Get real-time trip updates
   */
  async getTripUpdates(fromPlace: string, toPlace: string, itineraryId?: string): Promise<any> {
    const endTimer = monitoring.startPerformanceTimer('otp2_trip_updates');

    try {
      const routerId = this.config.routerId || 'default';
      const url = `${this.config.baseUrl}/otp/routers/${routerId}/index/trips`;

      const params = new URLSearchParams({
        fromPlace,
        toPlace,
      });

      if (itineraryId) {
        params.append('itinerary', itineraryId);
      }

      const response = await fetch(`${url}?${params}`, {
        headers: {
          Accept: 'application/json',
        },
        signal: timeoutSignal(this.config.timeout),
      });

      if (!response.ok) {
        throw new Error(`OTP2 Trip Updates API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      endTimer();
      return data;
    } catch (error) {
      endTimer({ error: true });
      monitoring.captureError({
        error: error as Error,
        context: 'OTP2 Trip Updates',
        severity: 'medium',
        metadata: { fromPlace, toPlace, itineraryId },
      });
      throw error;
    }
  }

  /**
   * Get nearby stops
   */
  async getNearbyStops(
    lat: number,
    lng: number,
    radius = 500, // meters
  ): Promise<any> {
    const endTimer = monitoring.startPerformanceTimer('otp2_nearby_stops');

    try {
      const routerId = this.config.routerId || 'default';
      const url = `${this.config.baseUrl}/otp/routers/${routerId}/index/stops`;

      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lng.toString(),
        radius: radius.toString(),
      });

      const response = await fetch(`${url}?${params}`, {
        headers: {
          Accept: 'application/json',
        },
        signal: timeoutSignal(this.config.timeout),
      });

      if (!response.ok) {
        throw new Error(`OTP2 Nearby Stops API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      endTimer({ radius, stopsFound: data.length || 0 });
      return data;
    } catch (error) {
      endTimer({ error: true });
      monitoring.captureError({
        error: error as Error,
        context: 'OTP2 Nearby Stops',
        severity: 'low',
        metadata: { lat, lng, radius },
      });
      throw error;
    }
  }

  /**
   * Get stop information
   */
  async getStopInfo(stopId: string): Promise<any> {
    const endTimer = monitoring.startPerformanceTimer('otp2_stop_info');

    try {
      const routerId = this.config.routerId || 'default';
      const url = `${this.config.baseUrl}/otp/routers/${routerId}/index/stops/${encodeURIComponent(
        stopId,
      )}`;

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
        signal: timeoutSignal(this.config.timeout),
      });

      if (!response.ok) {
        throw new Error(`OTP2 Stop Info API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      endTimer({ stopId });
      return data;
    } catch (error) {
      endTimer({ error: true });
      monitoring.captureError({
        error: error as Error,
        context: 'OTP2 Stop Info',
        severity: 'low',
        metadata: { stopId },
      });
      throw error;
    }
  }

  /**
   * Get stop times for a specific stop
   */
  async getStopTimes(
    stopId: string,
    date?: string,
    startTime?: number,
    timeRange = 3600, // seconds
  ): Promise<any> {
    const endTimer = monitoring.startPerformanceTimer('otp2_stop_times');

    try {
      const routerId = this.config.routerId || 'default';
      const url = `${this.config.baseUrl}/otp/routers/${routerId}/index/stops/${encodeURIComponent(
        stopId,
      )}/stoptimes`;

      const params = new URLSearchParams({
        timeRange: timeRange.toString(),
      });

      if (date) params.append('date', date);
      if (startTime) params.append('startTime', startTime.toString());

      const response = await fetch(`${url}?${params}`, {
        headers: {
          Accept: 'application/json',
        },
        signal: timeoutSignal(this.config.timeout),
      });

      if (!response.ok) {
        throw new Error(`OTP2 Stop Times API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      endTimer({ stopId, timeRange });
      return data;
    } catch (error) {
      endTimer({ error: true });
      monitoring.captureError({
        error: error as Error,
        context: 'OTP2 Stop Times',
        severity: 'low',
        metadata: { stopId, timeRange },
      });
      throw error;
    }
  }

  /**
   * Get service alerts
   */
  async getAlerts(routeId?: string, stopId?: string, agencyId?: string): Promise<any> {
    const endTimer = monitoring.startPerformanceTimer('otp2_alerts');

    try {
      const routerId = this.config.routerId || 'default';
      const url = `${this.config.baseUrl}/otp/routers/${routerId}/index/alerts`;

      const params = new URLSearchParams();
      if (routeId) params.append('route', routeId);
      if (stopId) params.append('stop', stopId);
      if (agencyId) params.append('agency', agencyId);

      const response = await fetch(`${url}?${params}`, {
        headers: {
          Accept: 'application/json',
        },
        signal: timeoutSignal(this.config.timeout),
      });

      if (!response.ok) {
        throw new Error(`OTP2 Alerts API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      endTimer({ routeId, stopId, agencyId });
      return data;
    } catch (error) {
      endTimer({ error: true });
      monitoring.captureError({
        error: error as Error,
        context: 'OTP2 Alerts',
        severity: 'low',
        metadata: { routeId, stopId, agencyId },
      });
      throw error;
    }
  }

  /**
   * Make plan request to OTP2 API
   */
  private async makePlanRequest(request: OTP2PlanRequest): Promise<OTP2PlanResponse> {
    const routerId = this.config.routerId || 'default';
    const url = `${this.config.baseUrl}/otp/routers/${routerId}/plan`;

    const params = new URLSearchParams();

    // Required parameters
    params.append('fromPlace', request.fromPlace);
    params.append('toPlace', request.toPlace);

    // Optional parameters
    if (request.time) params.append('time', request.time);
    if (request.date) params.append('date', request.date);
    if (request.mode) params.append('mode', request.mode);
    if (request.arriveBy !== undefined) params.append('arriveBy', request.arriveBy.toString());
    if (request.wheelchair !== undefined)
      params.append('wheelchair', request.wheelchair.toString());
    if (request.locale) params.append('locale', request.locale);
    if (request.maxWalkDistance)
      params.append('maxWalkDistance', request.maxWalkDistance.toString());
    if (request.maxTransfers) params.append('maxTransfers', request.maxTransfers.toString());
    if (request.walkReluctance) params.append('walkReluctance', request.walkReluctance.toString());
    if (request.waitReluctance) params.append('waitReluctance', request.waitReluctance.toString());
    if (request.walkSpeed) params.append('walkSpeed', request.walkSpeed.toString());
    if (request.bikeSpeed) params.append('bikeSpeed', request.bikeSpeed.toString());

    // Triangle parameters
    if (request.triangleWalkSafety)
      params.append('triangleWalkSafety', request.triangleWalkSafety.toString());
    if (request.triangleWalkSlope)
      params.append('triangleWalkSlope', request.triangleWalkSlope.toString());
    if (request.triangleWalkTime)
      params.append('triangleWalkTime', request.triangleWalkTime.toString());

    // Intermediate places
    if (request.intermediatePlaces) {
      request.intermediatePlaces.forEach((place) => {
        params.append('intermediatePlaces', place);
      });
    }

    // Banned/preferred routes, agencies, etc.
    if (request.banned?.routes) {
      request.banned.routes.forEach((route) => params.append('bannedRoutes', route));
    }
    if (request.preferred?.routes) {
      request.preferred.routes.forEach((route) => params.append('preferredRoutes', route));
    }

    const response = await fetch(`${url}?${params}`, {
      headers: {
        Accept: 'application/json',
      },
      signal: timeoutSignal(this.config.timeout),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OTP2 API error: ${response.status} ${response.statusText}\n${errorText}`);
    }

    return response.json();
  }

  /**
   * Create cache key for plan request
   */
  private createCacheKey(request: OTP2PlanRequest): string {
    const key = `otp2_${request.fromPlace}_${request.toPlace}_${request.mode || 'default'}_${
      request.time || 'now'
    }_${request.date || 'today'}`;
    return key.replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  /**
   * Get cached plan if available and not expired
   */
  private async getCachedPlan(cacheKey: string): Promise<OTP2PlanResponse | null> {
    try {
      return await offlineStorage.getCachedResponse<OTP2PlanResponse>(cacheKey, this.cacheTimeout);
    } catch (error) {
      log.warn('Failed to get cached OTP2 plan', error as Error);
      return null;
    }
  }

  /**
   * Cache plan response
   */
  private async cachePlan(cacheKey: string, response: OTP2PlanResponse): Promise<void> {
    try {
      await offlineStorage.cacheResponse(cacheKey, response);
    } catch (error) {
      log.warn('Failed to cache OTP2 plan', error as Error);
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<OTP2Config>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    try {
      await offlineStorage.clearCache();
      this.cache.clear();
      log.info('OTP2 cache cleared');
    } catch (error) {
      log.error('Failed to clear OTP2 cache', error as Error);
    }
  }
}

// Export singleton instance
export const otp2Service = new OpenTripPlanner2({
  baseUrl: process.env.OTP2_BASE_URL || 'http://localhost:8080',
  routerId: process.env.OTP2_ROUTER_ID || 'default',
  timeout: 30000, // Longer timeout for complex transit planning
});

export default otp2Service;
