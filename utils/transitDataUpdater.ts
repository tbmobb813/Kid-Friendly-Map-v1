import { RegionConfig } from "@/types/region";
import { useRegionStore } from "@/stores/regionStore";

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
        message: "Update already in progress for this region",
        lastUpdated: new Date()
      };
    }

    this.updateInProgress.add(regionId);

    try {
      const { availableRegions, updateRegionTransitData } = useRegionStore.getState();
      const region = availableRegions.find(r => r.id === regionId);

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
        lastUpdated: new Date().toISOString()
      };

      updateRegionTransitData(regionId, updatedRegion);

      return {
        success: true,
        regionId,
        message: `Successfully updated transit data for ${region.name}`,
        lastUpdated: new Date()
      };

    } catch (error) {
      console.error(`Failed to update transit data for ${regionId}:`, error);
      return {
        success: false,
        regionId,
        message: `Failed to update: ${error instanceof Error ? error.message : 'Unknown error'}`,
        lastUpdated: new Date()
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
      const batchPromises = batch.map(region => this.updateRegionTransitData(region.id));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Add delay between batches
      if (i + batchSize < availableRegions.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  private async fetchTransitData(region: RegionConfig): Promise<TransitApiResponse> {
    // In a real app, this would make actual API calls to the transit system
    // For now, we'll simulate the API response
    
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Simulate different API responses based on region
    const mockResponse: TransitApiResponse = {
      routes: this.generateMockRoutes(region),
      schedules: this.generateMockSchedules(region),
      alerts: this.generateMockAlerts(region),
      lastModified: new Date().toISOString()
    };

    return mockResponse;
  }

  private processTransitSystems(transitData: TransitApiResponse, region: RegionConfig) {
    // Process the API response and update transit systems
    // In a real app, this would parse the actual API response format
    
    return region.transitSystems.map(system => ({
      ...system,
      // Add real-time status
      status: Math.random() > 0.1 ? 'operational' as const : 'delayed' as const,
      lastUpdated: new Date().toISOString(),
      // Add route updates if available
      routes: transitData.routes ? 
        transitData.routes.filter((route: any) => route.systemId === system.id) :
        system.routes
    }));
  }

  private generateMockRoutes(region: RegionConfig) {
    // Generate mock route data
    return region.transitSystems.flatMap(system => 
      (system.routes || []).map(route => ({
        id: `${system.id}-${route}`,
        name: route,
        systemId: system.id,
        status: Math.random() > 0.1 ? 'on-time' : 'delayed',
        nextArrival: Math.floor(Math.random() * 15) + 1 // 1-15 minutes
      }))
    );
  }

  private generateMockSchedules(region: RegionConfig) {
    // Generate mock schedule data
    return [{
      systemId: region.transitSystems[0]?.id,
      schedules: Array.from({ length: 10 }, (_, i) => ({
        time: new Date(Date.now() + (i + 1) * 5 * 60 * 1000).toISOString(),
        route: region.transitSystems[0]?.routes?.[0] || 'Route 1',
        destination: 'Downtown'
      }))
    }];
  }

  private generateMockAlerts(region: RegionConfig) {
    // Generate mock alert data
    const alerts = [];
    
    if (Math.random() > 0.7) {
      alerts.push({
        id: `alert-${Date.now()}`,
        type: 'delay',
        message: `Minor delays on ${region.transitSystems[0]?.name} due to signal problems`,
        severity: 'low',
        affectedRoutes: region.transitSystems[0]?.routes?.slice(0, 2) || []
      });
    }

    return alerts;
  }

  isUpdateInProgress(regionId: string): boolean {
    return this.updateInProgress.has(regionId);
  }

  getUpdateStatus(): { [regionId: string]: boolean } {
    const status: { [regionId: string]: boolean } = {};
    this.updateInProgress.forEach(regionId => {
      status[regionId] = true;
    });
    return status;
  }
}

// Export singleton instance
export const transitDataUpdater = TransitDataUpdater.getInstance();
