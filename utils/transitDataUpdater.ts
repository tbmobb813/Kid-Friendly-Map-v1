import { RegionConfig } from '@/types/region';
import { useRegionStore } from '@/stores/regionStore';

export type TransitDataUpdateResult = {
  success: boolean;
  regionId: string;
  message: string;
  lastUpdated: Date;
};

export type TransitApiResponse = {
  routes?: any[];
  schedules?: any[];
  alerts?: any[];
  lastModified: string;
};

export class TransitDataUpdater {
  private static instance: TransitDataUpdater;
  private updateInProgress = new Set<string>();

  static getInstance(): TransitDataUpdater {
    if (!TransitDataUpdater.instance) {
      TransitDataUpdater.instance = new TransitDataUpdater();
    }
    return TransitDataUpdater.instance;
  }

  async updateRegionTransitData(regionId: string): Promise<TransitDataUpdateResult> {
    if (this.updateInProgress.has(regionId)) {
      return {
        success: false,
        regionId,
        message: 'Update already in progress for this region',
        lastUpdated: new Date(),
      };
    }

    this.updateInProgress.add(regionId);

    try {
      const { availableRegions, updateRegionTransitData } = useRegionStore.getState();
      const region = availableRegions.find((r) => r.id === regionId);

      if (!region) {
        throw new Error(`Region ${regionId} not found`);
      }

      console.log(`Updating transit data for ${region.name}...`);

      // Simulate API call to transit system
      const transitData = await this.fetchTransitData(region);

      // Update the region with new transit data
      const updatedRegion: Partial<RegionConfig> = {
        ...region,
        transitSystems: this.processTransitSystems(transitData, region),
        // Add timestamp for last update
        lastUpdated: new Date().toISOString(),
      };

      updateRegionTransitData(regionId, updatedRegion);

      return {
        success: true,
        regionId,
        message: `Successfully updated transit data for ${region.name}`,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error(`Failed to update transit data for ${regionId}:`, error);
      return {
        success: false,
        regionId,
        message: `Failed to update: ${error instanceof Error ? error.message : 'Unknown error'}`,
        lastUpdated: new Date(),
      };
    } finally {
      this.updateInProgress.delete(regionId);
    }
  }

  async updateAllRegions(): Promise<TransitDataUpdateResult[]> {
    const { availableRegions } = useRegionStore.getState();
    const results: TransitDataUpdateResult[] = [];

    // Update regions in batches to avoid overwhelming APIs
    const batchSize = 3;
    for (let i = 0; i < availableRegions.length; i += batchSize) {
      const batch = availableRegions.slice(i, i + batchSize);
      const batchPromises = batch.map((region) => this.updateRegionTransitData(region.id));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Add delay between batches
      if (i + batchSize < availableRegions.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  private async fetchTransitData(region: RegionConfig): Promise<TransitApiResponse> {
    // If a server-side transit adapter is configured, call it to get normalized JSON feeds.
    const adapterBase = process.env.TRANSIT_ADAPTER_URL;
    if (adapterBase) {
      const allRoutes: any[] = [];
      const allSchedules: any[] = [];
      const allAlerts: any[] = [];

      for (const system of region.transitSystems) {
        try {
          const url = `${adapterBase.replace(/\/$/, '')}/feeds/${region.id}/${system.id}.json`;
          // Use node-fetch if necessary
          const fetchFn = typeof fetch !== 'undefined' ? fetch : require('node-fetch');
          const res = await fetchFn(url);
          if (!res.ok) {
            console.warn(`Adapter fetch failed for ${system.id}: ${res.status}`);
            continue;
          }
          const json = await res.json();
          if (json.routes) allRoutes.push(...json.routes);
          if (json.schedules) allSchedules.push(...json.schedules);
          if (json.alerts) allAlerts.push(...json.alerts);
        } catch (err) {
          console.warn(`Failed to fetch from adapter for ${system.id}:`, err);
        }
      }

      return {
        routes: allRoutes.length ? allRoutes : this.generateMockRoutes(region),
        schedules: allSchedules.length ? allSchedules : this.generateMockSchedules(region),
        alerts: allAlerts.length ? allAlerts : this.generateMockAlerts(region),
        lastModified: new Date().toISOString(),
      };
    }

    // If region has transitSystems with feedUrl set, fetch those feeds and normalize.
    const allRoutes: any[] = [];
    const allSchedules: any[] = [];
    const allAlerts: any[] = [];

    for (const system of region.transitSystems) {
      try {
        if (!system.feedUrl) continue;

        // Mock feed loader: feedUrl starting with mock://<id> will load from config/mock-feeds/<id>.json
        if (system.feedUrl.startsWith('mock://')) {
          const id = system.feedUrl.replace('mock://', '');
          // TODO: Fix dynamic import for web builds

          // const mock = require(`@/config/mock-feeds/${id}.json`);
          console.log(`Mock feed ${id} loading disabled for web builds`);
          // if (mock.routes) allRoutes.push(...mock.routes);
          // if (mock.schedules) allSchedules.push(...mock.schedules);
          // if (mock.alerts) allAlerts.push(...mock.alerts);
          continue;
        }

        // If feedUrl looks like a JSON endpoint, fetch and try to normalize
        if (system.feedUrl.startsWith('http')) {
          try {
            // Determine API key precedence: system.apiKey -> env[system.apiKeyEnv] -> region.transitApiKey
            const resolvedKey =
              system.apiKey ||
              (system.apiKeyEnv ? process.env[system.apiKeyEnv] : undefined) ||
              region.transitApiKey;
            const keyHeader = system.apiKeyHeader || 'x-api-key';

            // Use global fetch (available in React Native and modern browsers)
            if (typeof fetch === 'undefined') {
              throw new Error('fetch is not available in this environment');
            }
            const headers: Record<string, string> | undefined = resolvedKey
              ? { [keyHeader]: resolvedKey }
              : undefined;

            const res = await fetch(system.feedUrl, { headers });

            // If response is JSON, parse and attempt to normalize
            const contentType =
              res.headers && res.headers.get ? res.headers.get('content-type') : null;
            if (contentType && contentType.includes('application/json')) {
              const json = await res.json();
              // Expect JSON to follow the simple mock shape { routes, schedules, alerts }
              if (json.routes) allRoutes.push(...json.routes);
              if (json.schedules) allSchedules.push(...json.schedules);
              if (json.alerts) allAlerts.push(...json.alerts);
              continue;
            }

            // TODO: If endpoint returns GTFS-RT protobuf, use gtfs-realtime-bindings to decode.
            // Guarded example (uncomment after installing gtfs-realtime-bindings):
            // const buffer = await res.arrayBuffer();
            // const GtfsRealtimeBindings = require('gtfs-realtime-bindings');
            // const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer));
            // parse feed.entity for trip_update and alerts
          } catch (err) {
            console.warn(`Failed to fetch/parse feed for ${system.id}:`, err);
          }
        }
      } catch (e) {
        console.warn(`Error processing feed for system ${system.id}:`, e);
      }
    }

    // If we didn't get any real routes, fall back to the existing mock generator for coverage
    const routes = allRoutes.length ? allRoutes : this.generateMockRoutes(region);
    const schedules = allSchedules.length ? allSchedules : this.generateMockSchedules(region);
    const alerts = allAlerts.length ? allAlerts : this.generateMockAlerts(region);

    return {
      routes,
      schedules,
      alerts,
      lastModified: new Date().toISOString(),
    };
  }

  private processTransitSystems(transitData: TransitApiResponse, region: RegionConfig) {
    // Process the API response and update transit systems
    // In a real app, this would parse the actual API response format

    return region.transitSystems.map((system) => ({
      ...system,
      // Add real-time status
      status: Math.random() > 0.1 ? ('operational' as const) : ('delayed' as const),
      lastUpdated: new Date().toISOString(),
      // Add route updates if available
      routes: transitData.routes
        ? transitData.routes.filter((route: any) => route.systemId === system.id)
        : system.routes,
    }));
  }

  private generateMockRoutes(region: RegionConfig) {
    // Generate mock route data
    return region.transitSystems.flatMap((system) =>
      (system.routes || []).map((route) => ({
        id: `${system.id}-${route}`,
        name: route,
        systemId: system.id,
        status: Math.random() > 0.1 ? 'on-time' : 'delayed',
        nextArrival: Math.floor(Math.random() * 15) + 1, // 1-15 minutes
      })),
    );
  }

  private generateMockSchedules(region: RegionConfig) {
    // Generate mock schedule data
    return [
      {
        systemId: region.transitSystems[0]?.id,
        schedules: Array.from({ length: 10 }, (_, i) => ({
          time: new Date(Date.now() + (i + 1) * 5 * 60 * 1000).toISOString(),
          route: region.transitSystems[0]?.routes?.[0] || 'Route 1',
          destination: 'Downtown',
        })),
      },
    ];
  }

  private generateMockAlerts(region: RegionConfig) {
    // Generate mock alert data
    const alerts: any[] = [];

    if (Math.random() > 0.7) {
      alerts.push({
        id: `alert-${Date.now()}`,
        type: 'delay',
        message: `Minor delays on ${region.transitSystems[0]?.name} due to signal problems`,
        severity: 'low',
        affectedRoutes: region.transitSystems[0]?.routes?.slice(0, 2) || [],
      });
    }

    return alerts;
  }

  isUpdateInProgress(regionId: string): boolean {
    return this.updateInProgress.has(regionId);
  }

  getUpdateStatus(): { [regionId: string]: boolean } {
    const status: { [regionId: string]: boolean } = {};
    this.updateInProgress.forEach((regionId) => {
      status[regionId] = true;
    });
    return status;
  }
}

// Export singleton instance
export const transitDataUpdater = TransitDataUpdater.getInstance();
