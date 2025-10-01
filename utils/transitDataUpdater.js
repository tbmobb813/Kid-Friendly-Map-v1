import { useRegionStore } from "@/stores/regionStore";
export class TransitDataUpdater {
    constructor() {
        this.updateInProgress = new Set();
    }
    static getInstance() {
        if (!TransitDataUpdater.instance) {
            TransitDataUpdater.instance = new TransitDataUpdater();
        }
        return TransitDataUpdater.instance;
    }
    async updateRegionTransitData(regionId) {
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
            const updatedRegion = {
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
        }
        catch (error) {
            console.error(`Failed to update transit data for ${regionId}:`, error);
            return {
                success: false,
                regionId,
                message: `Failed to update: ${error instanceof Error ? error.message : 'Unknown error'}`,
                lastUpdated: new Date()
            };
        }
        finally {
            this.updateInProgress.delete(regionId);
        }
    }
    async updateAllRegions() {
        const { availableRegions } = useRegionStore.getState();
        const results = [];
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
    async fetchTransitData(region) {
        // If region has transitSystems with feedUrl set, fetch those feeds and normalize.
        const allRoutes = [];
        const allSchedules = [];
        const allAlerts = [];
        for (const system of region.transitSystems) {
            try {
                if (!system.feedUrl)
                    continue;
                // Mock feed loader: feedUrl starting with mock://<id> will load from config/mock-feeds/<id>.json
                if (system.feedUrl.startsWith('mock://')) {
                    const id = system.feedUrl.replace('mock://', '');
                    // eslint-disable-next-line @typescript-eslint/no-var-requires
                    const mock = require(`@/config/mock-feeds/${id}.json`);
                    if (mock.routes)
                        allRoutes.push(...mock.routes);
                    if (mock.schedules)
                        allSchedules.push(...mock.schedules);
                    if (mock.alerts)
                        allAlerts.push(...mock.alerts);
                    continue;
                }
                // If feedUrl looks like a JSON endpoint, fetch and try to normalize
                if (system.feedUrl.startsWith('http')) {
                    try {
                        // Determine API key precedence: system.apiKey -> env[system.apiKeyEnv] -> region.transitApiKey
                        const resolvedKey = system.apiKey || (system.apiKeyEnv ? process.env[system.apiKeyEnv] : undefined) || region.transitApiKey;
                        const keyHeader = system.apiKeyHeader || 'x-api-key';
                        // Use global fetch if available, otherwise fall back to node-fetch when installed
                        const fetchFn = (typeof fetch !== 'undefined') ? fetch : require('node-fetch');
                        const headers = resolvedKey ? { [keyHeader]: resolvedKey } : undefined;
                        const res = await fetchFn(system.feedUrl, { headers });
                        // If response is JSON, parse and attempt to normalize
                        const contentType = res.headers && res.headers.get ? res.headers.get('content-type') : null;
                        if (contentType && contentType.includes('application/json')) {
                            const json = await res.json();
                            // Expect JSON to follow the simple mock shape { routes, schedules, alerts }
                            if (json.routes)
                                allRoutes.push(...json.routes);
                            if (json.schedules)
                                allSchedules.push(...json.schedules);
                            if (json.alerts)
                                allAlerts.push(...json.alerts);
                            continue;
                        }
                        // TODO: If endpoint returns GTFS-RT protobuf, use gtfs-realtime-bindings to decode.
                        // Guarded example (uncomment after installing gtfs-realtime-bindings):
                        // const buffer = await res.arrayBuffer();
                        // const GtfsRealtimeBindings = require('gtfs-realtime-bindings');
                        // const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer));
                        // parse feed.entity for trip_update and alerts
                    }
                    catch (err) {
                        console.warn(`Failed to fetch/parse feed for ${system.id}:`, err);
                    }
                }
            }
            catch (e) {
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
            lastModified: new Date().toISOString()
        };
    }
    processTransitSystems(transitData, region) {
        // Process the API response and update transit systems
        // In a real app, this would parse the actual API response format
        return region.transitSystems.map(system => ({
            ...system,
            // Add real-time status
            status: Math.random() > 0.1 ? 'operational' : 'delayed',
            lastUpdated: new Date().toISOString(),
            // Add route updates if available
            routes: transitData.routes ?
                transitData.routes.filter((route) => route.systemId === system.id) :
                system.routes
        }));
    }
    generateMockRoutes(region) {
        // Generate mock route data
        return region.transitSystems.flatMap(system => (system.routes || []).map(route => ({
            id: `${system.id}-${route}`,
            name: route,
            systemId: system.id,
            status: Math.random() > 0.1 ? 'on-time' : 'delayed',
            nextArrival: Math.floor(Math.random() * 15) + 1 // 1-15 minutes
        })));
    }
    generateMockSchedules(region) {
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
    generateMockAlerts(region) {
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
    isUpdateInProgress(regionId) {
        return this.updateInProgress.has(regionId);
    }
    getUpdateStatus() {
        const status = {};
        this.updateInProgress.forEach(regionId => {
            status[regionId] = true;
        });
        return status;
    }
}
// Export singleton instance
export const transitDataUpdater = TransitDataUpdater.getInstance();
