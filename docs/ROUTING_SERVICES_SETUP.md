# ORS and OTP2 Routing Services Configuration Guide

## Overview

This guide covers setting up OpenRouteService (ORS) and OpenTripPlanner 2 (OTP2) for the Kid-Friendly Map application. These services provide comprehensive routing capabilities including walking, cycling, driving, and transit directions with kid-friendly optimizations.

## Quick Start

### 1. Environment Variables

Add these to your `.env` file:

```bash
# OpenRouteService Configuration
ORS_API_KEY=your_ors_api_key_here
ORS_BASE_URL=https://api.openrouteservice.org
ORS_RATE_LIMIT=40
ORS_TIMEOUT=10000

# OpenTripPlanner 2 Configuration
OTP2_BASE_URL=http://localhost:8080
OTP2_ROUTER_ID=default
OTP2_TIMEOUT=10000

# Optional: Custom endpoints
ORS_CUSTOM_ENDPOINT=https://your-custom-ors-instance.com
OTP2_CUSTOM_ENDPOINT=https://your-custom-otp2-instance.com
```

### 2. Get OpenRouteService API Key

1. Visit [OpenRouteService](https://openrouteservice.org/)
2. Sign up for a free account
3. Navigate to your dashboard
4. Create a new API token
5. Copy the token to your `.env` file

**Free tier limits:**

- 2,000 requests per day
- 40 requests per minute
- For production, consider upgrading to a paid plan

### 3. Set up OpenTripPlanner 2

#### Option A: Use Public Instance

Some cities provide public OTP2 instances:

- **New York**: `https://otp.mta.info/otp`
- **Portland**: `https://maps.trimet.org/otp`
- **Helsinki**: `https://reittiopas.hsl.fi/otp`

#### Option B: Local Development Instance

```bash
# Download OTP2
wget https://repo1.maven.org/maven2/org/opentripplanner/otp/2.4.0/otp-2.4.0-shaded.jar

# Download GTFS data for your region
# Example for NYC MTA:
wget http://web.mta.info/developers/data/nyct/subway/google_transit.zip

# Download OpenStreetMap data
wget https://download.geofabrik.de/north-america/us/new-york-latest.osm.pbf

# Build graph
java -Xmx4G -jar otp-2.4.0-shaded.jar --build --save .

# Start server
java -Xmx4G -jar otp-2.4.0-shaded.jar --load .
```

## Service Capabilities

### OpenRouteService (ORS)

#### Supported Profiles

- **foot-walking**: Regular walking routes
- **foot-hiking**: Hiking and trail routes
- **cycling-regular**: Standard cycling routes
- **cycling-road**: Road cycling optimized
- **cycling-safe**: Family-friendly cycling
- **cycling-mountain**: Mountain biking
- **cycling-electric**: E-bike routes
- **driving-car**: Car routing
- **wheelchair**: Wheelchair accessible routes

#### ORS Features

- **Isochrone Analysis**: Reachability maps
- **Matrix Calculations**: Distance/time matrices
- **POI Search**: Points of interest
- **Elevation Profiles**: Route elevation data
- **Kid-Friendly Routing**: Safety-optimized paths
- **Accessibility Support**: Wheelchair routing

### OpenTripPlanner 2 (OTP2)

#### Supported Modes

- **WALK**: Walking
- **BIKE**: Cycling
- **TRANSIT**: Public transportation
- **CAR**: Driving
- **Combined**: Multimodal trips

#### OTP2 Features

- **Real-time Data**: Live transit updates
- **Trip Planning**: Multi-modal journey planning
- **Stop Information**: Transit stop details
- **Service Alerts**: Disruption notifications
- **Accessibility**: Wheelchair accessible routes
- **Kid-Friendly Transit**: Family-optimized options

## Kid-Friendly Features

### Safety Optimizations

#### Walking Routes

- Avoid busy highways and main roads
- Prefer routes through parks and quiet streets
- Prioritize well-lit areas
- Include crosswalks and traffic lights
- Avoid construction zones

#### Cycling Routes

- Use protected bike lanes when available
- Avoid high-traffic roads
- Prefer dedicated cycling paths
- Include bike-friendly intersections

#### Transit Routes

- Minimize transfers for younger children
- Prefer direct routes
- Include accessible stations
- Provide clear step-by-step directions

### Age-Based Adjustments

```typescript
// Age 3-5: Stroller-friendly
{
  maxWalkDistance: 200,
  avoidStairs: true,
  preferElevators: true,
  maxTransfers: 0,
}

// Age 6-8: Short walks
{
  maxWalkDistance: 400,
  preferSaferRoutes: true,
  maxTransfers: 1,
}

// Age 9-12: More independence
{
  maxWalkDistance: 800,
  includeBikeRoutes: true,
  maxTransfers: 2,
}
```

## API Usage Examples

### Basic Walking Route

```typescript
import { orsService } from './utils/orsService';

const route = await orsService.getRoute({
  coordinates: [
    [-74.006, 40.7128], // NYC City Hall
    [-73.9934, 40.7505], // Times Square
  ],
  profile: 'foot-walking',
  geometry: true,
  instructions: true,
});

console.log(`Duration: ${route.routes[0].summary.duration}s`);
console.log(`Distance: ${route.routes[0].summary.distance}m`);
```

### Kid-Friendly Route

```typescript
import { orsService } from './utils/orsService';

const kidRoute = await orsService.getKidFriendlyRoute(
  [
    [-74.006, 40.7128],
    [-73.9934, 40.7505],
  ],
  8, // Child age
);

// Route optimized for 8-year-old safety
```

### Transit Planning

```typescript
import { otp2Service } from './utils/otp2Service';

const trip = await otp2Service.planTrip({
  fromPlace: '40.7128,-74.0060',
  toPlace: '40.7505,-73.9934',
  mode: 'TRANSIT,WALK',
  maxWalkDistance: 800,
});

console.log(`Transfers: ${trip.plan.itineraries[0].transfers}`);
```

### Unified Routing

```typescript
import { unifiedRoutingService } from './utils/unifiedRoutingService';

const routes = await unifiedRoutingService.getRoutes({
  from: { lat: 40.7128, lng: -74.006, name: 'Start' },
  to: { lat: 40.7505, lng: -73.9934, name: 'End' },
  preferences: {
    modes: ['WALK', 'TRANSIT'],
    childAge: 8,
    wheelchair: false,
    prioritizeSafety: true,
  },
});

// Returns ranked routes from all services
routes.forEach((route) => {
  console.log(`${route.type}: ${route.summary.duration}min, Safety: ${route.safetyScore}/100`);
});
```

## Testing Configuration

### Integration Tests

```bash
# Run routing integration tests
npm test -- __tests__/routing-integration.test.ts

# Test with real APIs (requires valid API keys)
npm test -- __tests__/routing-integration.test.ts --env=production
```

### Demo Component

```bash
# Start Expo with routing demo
expo start

# Navigate to RoutingDemo component to test live routing
```

## Monitoring and Analytics

### Error Tracking

```typescript
import { monitoring } from './utils/monitoring';

// Errors are automatically captured
// Configure Sentry for production error tracking
```

### Performance Monitoring

```typescript
// API response times are tracked automatically
const timer = monitoring.trackPerformance('ors_route_request');
const route = await orsService.getRoute(params);
timer.end();
```

### Usage Analytics

```typescript
// User actions are tracked for analytics
monitoring.trackUserAction({
  action: 'route_requested',
  screen: 'navigation',
  metadata: { mode: 'walking', distance: 1200 },
});
```

## Production Deployment

### Environment Configuration

```bash
# Production .env
ORS_API_KEY=prod_api_key_with_higher_limits
ORS_BASE_URL=https://api.openrouteservice.org
OTP2_BASE_URL=https://your-production-otp2-server.com
OTP2_ROUTER_ID=your_city_router

# Enable monitoring
SENTRY_DSN=your_sentry_dsn
ENABLE_ANALYTICS=true
```

### Rate Limiting

```typescript
// Built-in rate limiting for ORS
const config = {
  rateLimit: 40, // requests per minute
  retryAttempts: 3,
  retryDelay: 1000,
};
```

### Caching Strategy

```typescript
// Routes are cached for performance
const cacheConfig = {
  routeCacheDuration: 300, // 5 minutes
  stopInfoCacheDuration: 3600, // 1 hour
  maxCacheSize: 100, // entries
};
```

## Troubleshooting

### Common Issues

#### ORS API Key Issues

```bash
Error: ORS API error: 403 Forbidden
```

**Solution**: Check API key validity and rate limits

#### OTP2 Connection Issues

```bash
Error: OTP2 server unavailable
```

**Solution**: Verify OTP2_BASE_URL and server status

#### No Routes Found

```bash
No routes available between locations
```

**Solution**: Check coordinate format and routing distance limits

### Debug Mode

```typescript
// Enable debug logging
process.env.DEBUG_ROUTING = 'true';

// Logs will show API requests and responses
```

### Health Checks

```typescript
import { orsService, otp2Service } from './utils/routingServices';

// Check service health
const orsHealth = await orsService.healthCheck();
const otp2Health = await otp2Service.healthCheck();

console.log('ORS Status:', orsHealth);
console.log('OTP2 Status:', otp2Health);
```

## API Reference

### OpenRouteService API

**Documentation**: <https://openrouteservice.org/dev/#/api-docs>

**Rate Limits**:

- Free: 2,000 requests/day, 40/minute
- Standard: 100,000 requests/day, 300/minute
- Premium: Custom limits

### OpenTripPlanner 2 API

**Documentation**: <http://docs.opentripplanner.org/en/latest/>

**Public Instances**:

- Check [OTP Public Instances](https://github.com/opentripplanner/OpenTripPlanner/wiki/Public-OTP-instances)

## Support

### Getting Help

1. **Documentation**: Check service-specific docs
2. **Community**: OpenRouteService and OTP2 forums
3. **Issues**: Report bugs in respective GitHub repos
4. **API Support**: Contact service providers for API issues

### Contributing

1. **Bug Reports**: Use GitHub issues
2. **Feature Requests**: Propose enhancements
3. **Code Contributions**: Submit pull requests
4. **Documentation**: Help improve guides

## License and Attribution

### OpenRouteService

- **License**: MIT
- **Attribution**: Required for public apps
- **Data**: OpenStreetMap contributors

### OpenTripPlanner 2

- **License**: LGPL
- **Attribution**: Recommended
- **Data**: GTFS providers and OpenStreetMap

### Usage in App

```typescript
// Include attribution in your app
const attribution = {
  ors: 'Powered by OpenRouteService',
  otp2: 'Transit data from [Your GTFS Provider]',
  osm: '© OpenStreetMap contributors',
};
```
