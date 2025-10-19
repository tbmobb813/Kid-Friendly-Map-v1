# MapLibre & OpenRouteService Integration Guide

This document provides a quick reference for configuring and using the MapLibre GL Native integration with OpenRouteService routing in the Kid-Friendly Map application.

## Environment Configuration

### Required Environment Variables

Create or update your `.env` file with the following variables:

```bash
# OpenRouteService API Configuration
EXPO_PUBLIC_ORS_API_KEY=your_openrouteservice_api_key_here

# Optional Map Configuration
EXPO_PUBLIC_MAP_STYLE_URL=https://your-style-provider.com/style.json
EXPO_PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_token_here
EXPO_PUBLIC_MAP_DEFAULT_LAT=40.7128
EXPO_PUBLIC_MAP_DEFAULT_LNG=-74.006
EXPO_PUBLIC_MAP_DEFAULT_ZOOM=13

# Optional Routing Configuration
EXPO_PUBLIC_ORS_BASE_URL=https://api.openrouteservice.org
EXPO_PUBLIC_ORS_PROFILE=foot-walking
EXPO_PUBLIC_ORS_TIMEOUT=15000
```

### Getting an OpenRouteService API Key

1. Visit [OpenRouteService.org](https://openrouteservice.org/)
2. Sign up for a free account
3. Generate an API key in your dashboard
4. Add it to your environment as `EXPO_PUBLIC_ORS_API_KEY`

**Free tier limits:** 2,000 requests/day, 40 requests/minute

## Platform Support

| Platform | Map Implementation | Route Visualization        |
| -------- | ------------------ | -------------------------- |
| iOS      | MapLibre GL Native | OpenRouteService + GeoJSON |
| Android  | MapLibre GL Native | OpenRouteService + GeoJSON |
| Web      | Leaflet (fallback) | Direct line fallback       |

## Usage Examples

### Basic Route Hook

```tsx
import { useRouteORS } from '@/hooks/useRouteORS';

function MyComponent() {
  const start: [number, number] = [-74.006, 40.7128]; // [lng, lat]
  const end: [number, number] = [-74.004, 40.7142];

  const { geojson, summary, loading, error } = useRouteORS(start, end);

  if (loading) return <Text>Loading route...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <Text>
      Route duration: {summary.durationSeconds}s Distance: {summary.distanceMeters}m
    </Text>
  );
}
```

### Custom Route Options

```tsx
const { geojson, loading, error } = useRouteORS(start, end, {
  profile: 'cycling-regular', // foot-walking, driving-car, cycling-regular
  enabled: true, // disable when coordinates not ready
  includeEta: true, // parse duration/distance from response
});
```

### Map Component with Route

```tsx
import MapLibreRouteView from '@/components/MapLibreRouteView';

function RouteScreen() {
  const { geojson } = useRouteORS(startCoord, endCoord);

  return (
    <MapLibreRouteView
      origin={originPlace}
      destination={destinationPlace}
      routeGeoJSON={geojson}
      onStationPress={(stationId) => console.log('Station:', stationId)}
      showTransitStations={true}
    />
  );
}
```

## Routing Profiles

| Profile           | Use Case              | Speed    | Restrictions        |
| ----------------- | --------------------- | -------- | ------------------- |
| `foot-walking`    | Pedestrian navigation | ~5 km/h  | Walkways, sidewalks |
| `cycling-regular` | Bicycle routing       | ~15 km/h | Bike lanes, roads   |
| `driving-car`     | Car navigation        | Variable | Roads, highways     |

## Troubleshooting

### Common Issues

**"Missing OpenRouteService API key"**

- Ensure `EXPO_PUBLIC_ORS_API_KEY` is set in your environment
- Restart your Expo development server after adding the key

**Route not displaying on map**

- Check that coordinates are in `[longitude, latitude]` order (not lat/lng)
- Verify the API key has sufficient quota remaining
- Check network connectivity and API response in developer tools

**Map not loading**

- Confirm MapLibre style URL is valid and accessible
- On web, the app falls back to Leaflet-based InteractiveMap
- Check that required permissions are granted on mobile

### Performance Tips

- Use the `enabled` option to avoid unnecessary API calls
- Cache route results when possible for repeated requests
- Consider using lower-resolution routing profiles for overview maps

### Rate Limiting

The free OpenRouteService tier allows:

- 2,000 requests per day
- 40 requests per minute

For production apps, consider:

- Implementing client-side caching
- Upgrading to a paid plan
- Using request debouncing for interactive route selection

## Configuration Reference

### Config.ROUTING Properties

| Property          | Default                            | Description                            |
| ----------------- | ---------------------------------- | -------------------------------------- |
| `BASE_URL`        | `https://api.openrouteservice.org` | ORS API base URL                       |
| `ORS_API_KEY`     | `''`                               | Your ORS API key                       |
| `DEFAULT_PROFILE` | `foot-walking`                     | Default routing profile                |
| `REQUEST_TIMEOUT` | `15000`                            | Request timeout in milliseconds        |
| `INCLUDE_ETA`     | `true`                             | Parse duration/distance from responses |

### Config.MAP Properties

| Property             | Default                                     | Description              |
| -------------------- | ------------------------------------------- | ------------------------ |
| `STYLE_URL`          | `undefined`                                 | Custom map style URL     |
| `FALLBACK_STYLE_URL` | `https://demotiles.maplibre.org/style.json` | Default style            |
| `DEFAULT_CENTER`     | `{lat: 40.7128, lng: -74.006}`              | Default map center (NYC) |
| `DEFAULT_ZOOM`       | `15`                                        | Default zoom level       |
| `ACCESS_TOKEN`       | `null`                                      | Optional Mapbox token    |

## Testing

Run the routing hook tests:

```bash
npm test -- useRouteORS
```

Run the map component tests:

```bash
npm test -- MapLibreRouteView
```

## Development Workflow

1. **Set up environment**: Add ORS API key to `.env`
2. **Start development server**: `npx expo start`
3. **Test on device**: Use Expo Go or development build
4. **Debug routing**: Check network tab for API requests/responses
5. **Iterate on map styling**: Update style URL and refresh
6. **Run tests and open PR**: Run tests locally, commit, push, and open a pull request for review

For additional help, see the [OpenRouteService documentation](https://openrouteservice.org/dev/#/api-docs) or the project's main README.
