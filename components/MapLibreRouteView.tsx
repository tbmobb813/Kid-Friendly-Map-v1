import React, { useCallback, useMemo } from 'react';
import type { Feature, FeatureCollection, Geometry, LineString, Position } from 'geojson';
import Colors from '@/constants/colors';
import { nycStations } from '@/config/transit/nyc-stations';
import type { Place } from '@/types/navigation';
import MapLibreMap, { MapLibreGL, isMapLibreAvailable } from '@/components/MapLibreMap';
import Config from '@/utils/config';

export type MapLibreRouteViewProps = {
  origin?: Place;
  destination?: Place;
  routeGeoJSON?: FeatureCollection<Geometry> | null;
  onStationPress?: (stationId: string) => void;
  showTransitStations?: boolean;
  testID?: string;
};

const asLngLat = (place?: Place): [number, number] | null => {
  if (!place) return null;
  const { latitude, longitude } = place.coordinates ?? {};
  if (typeof latitude === 'number' && typeof longitude === 'number') {
    return [longitude, latitude];
  }
  return null;
};

const collectPositions = (geometry: Geometry | undefined): Position[] => {
  if (!geometry) return [];

  switch (geometry.type) {
    case 'LineString':
      return geometry.coordinates;
    case 'MultiLineString':
      return geometry.coordinates.flat();
    case 'GeometryCollection':
      return geometry.geometries.flatMap(collectPositions);
    default:
      return [];
  }
};

const computeCenter = (coordinates: Position[]): [number, number] => {
  if (coordinates.length === 0) {
    return [Config.MAP.DEFAULT_CENTER.longitude, Config.MAP.DEFAULT_CENTER.latitude];
  }

  let minLng = Number.POSITIVE_INFINITY;
  let maxLng = Number.NEGATIVE_INFINITY;
  let minLat = Number.POSITIVE_INFINITY;
  let maxLat = Number.NEGATIVE_INFINITY;

  coordinates.forEach(([lng, lat]) => {
    if (Number.isFinite(lng) && Number.isFinite(lat)) {
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    }
  });

  if (
    !Number.isFinite(minLng) ||
    !Number.isFinite(maxLng) ||
    !Number.isFinite(minLat) ||
    !Number.isFinite(maxLat)
  ) {
    return [Config.MAP.DEFAULT_CENTER.longitude, Config.MAP.DEFAULT_CENTER.latitude];
  }

  return [(minLng + maxLng) / 2, (minLat + maxLat) / 2];
};

const buildFallbackRoute = (
  originCoord: [number, number] | null,
  destinationCoord: [number, number] | null,
): FeatureCollection<LineString> | null => {
  if (!originCoord || !destinationCoord) {
    return null;
  }

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        id: 'fallback-route',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [originCoord, destinationCoord],
        },
      },
    ],
  };
};

const buildEndpointFeatures = (
  originCoord: [number, number] | null,
  destinationCoord: [number, number] | null,
  originName?: string,
  destinationName?: string,
): FeatureCollection => {
  const features: Feature[] = [];

  if (originCoord) {
    features.push({
      type: 'Feature',
      id: 'origin-marker',
      properties: {
        type: 'origin',
        name: originName ?? 'Origin',
      },
      geometry: {
        type: 'Point',
        coordinates: originCoord,
      },
    });
  }

  if (destinationCoord) {
    features.push({
      type: 'Feature',
      id: 'destination-marker',
      properties: {
        type: 'destination',
        name: destinationName ?? 'Destination',
      },
      geometry: {
        type: 'Point',
        coordinates: destinationCoord,
      },
    });
  }

  return {
    type: 'FeatureCollection',
    features,
  };
};

const buildStationFeatures = (): FeatureCollection => ({
  type: 'FeatureCollection',
  features: nycStations.map((station) => ({
    type: 'Feature',
    id: station.id,
    properties: {
      id: station.id,
      name: station.name,
      safetyRating: station.kidFriendly.safetyRating,
    },
    geometry: {
      type: 'Point',
      coordinates: [station.coordinates.longitude, station.coordinates.latitude],
    },
  })),
});

const MapLibreRouteView: React.FC<MapLibreRouteViewProps> = ({
  origin,
  destination,
  routeGeoJSON,
  onStationPress,
  showTransitStations = true,
  testID,
}) => {
  // Normalize imported mocks/exports — some module resolution in Jest/ts-jest can place
  // named exports on the default export; be defensive so tests using moduleNameMapper
  // mocks still render. Only bail out when the module explicitly indicates MapLibre is
  // unavailable or when we can't find the MapLibreGL API surface.
  const resolvedModule: any = (MapLibreMap as any) || {};
  const resolvedMapLibreGL =
    (MapLibreGL as any) ||
    resolvedModule.MapLibreGL ||
    (resolvedModule.default && resolvedModule.default.MapLibreGL);
  const resolvedIsAvailable =
    typeof isMapLibreAvailable !== 'undefined'
      ? isMapLibreAvailable
      : (resolvedModule.isMapLibreAvailable ??
        (resolvedModule.default && resolvedModule.default.isMapLibreAvailable) ??
        true);

  // If the module explicitly indicates MapLibre is unavailable, bail out.
  // Otherwise continue — tests provide mocks that may not expose the full
  // MapLibreGL API but still render a MapLibreMap wrapper component.
  if (resolvedIsAvailable === false) {
    return null;
  }

  const MapLibre = resolvedMapLibreGL as any;
  const originCoord = useMemo(
    () => asLngLat(origin),
    [origin?.coordinates.latitude, origin?.coordinates.longitude],
  );
  const destinationCoord = useMemo(
    () => asLngLat(destination),
    [destination?.coordinates.latitude, destination?.coordinates.longitude],
  );

  const routeShape = useMemo(() => {
    if (routeGeoJSON && routeGeoJSON.features?.length) {
      return routeGeoJSON;
    }
    return buildFallbackRoute(originCoord, destinationCoord);
  }, [routeGeoJSON, originCoord, destinationCoord]);

  const centerCoordinate = useMemo(() => {
    const coords: Position[] = [];
    if (routeShape) {
      routeShape.features?.forEach((feature) => {
        coords.push(...collectPositions(feature.geometry));
      });
    }
    if (originCoord) coords.push(originCoord);
    if (destinationCoord) coords.push(destinationCoord);
    return computeCenter(coords);
  }, [routeShape, originCoord, destinationCoord]);

  const endpointFeatures = useMemo(
    () => buildEndpointFeatures(originCoord, destinationCoord, origin?.name, destination?.name),
    [originCoord, destinationCoord, origin?.name, destination?.name],
  );

  const stationFeatures = useMemo(
    () => (showTransitStations ? buildStationFeatures() : null),
    [showTransitStations],
  );

  const handleStationPress = useCallback(
    (event: any) => {
      if (!onStationPress) return;
      const feature = event?.features?.[0];
      const stationId = feature?.properties?.id ?? feature?.id;
      if (typeof stationId === 'string') {
        onStationPress(stationId);
      }
    },
    [onStationPress],
  );

  return (
    <MapLibreMap centerCoordinate={centerCoordinate} testID={testID ?? 'mock-maplibre-map'}>
      {routeShape && MapLibre && (
        <MapLibre.ShapeSource id="route" shape={routeShape}>
          <MapLibre.LineLayer
            id="route-line"
            style={{
              lineColor: Colors.primary,
              lineWidth: 4,
              lineOpacity: 0.9,
            }}
          />
        </MapLibre.ShapeSource>
      )}

      {endpointFeatures.features.length > 0 && MapLibre && (
        <MapLibre.ShapeSource id="endpoints" shape={endpointFeatures}>
          <MapLibre.CircleLayer
            id="endpoint-layer"
            style={{
              circleRadius: 6,
              circleOpacity: 0.95,
              circleStrokeWidth: 2,
              circleStrokeColor: '#FFFFFF',
              circleColor: [
                'case',
                ['==', ['get', 'type'], 'origin'],
                Colors.primary,
                Colors.secondary,
              ],
            }}
          />
        </MapLibre.ShapeSource>
      )}

      {stationFeatures && MapLibre && (
        <MapLibre.ShapeSource id="stations" shape={stationFeatures} onPress={handleStationPress}>
          <MapLibre.CircleLayer
            id="stations-layer"
            style={{
              circleRadius: 5,
              circleColor: '#FF6B35',
              circleOpacity: 0.8,
              circleStrokeColor: '#FFFFFF',
              circleStrokeWidth: 1.5,
            }}
          />
        </MapLibre.ShapeSource>
      )}
    </MapLibreMap>
  );
};

export default MapLibreRouteView;
