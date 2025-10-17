import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Config from '@/utils/config';
import Colors from '@/constants/colors';

type LatLng = { latitude: number; longitude: number };

type Place = {
  name?: string;
  coordinates?: LatLng;
};

type MapViewWrapperProps = {
  origin?: Place;
  destination?: Place;
  // route metadata (geojson-like) or any fallback shape
  route?: any;
  onMapReady?: () => void;
  onSelectLocation?: (coords: LatLng) => void;
  onStationPress?: (stationId: string) => void;
  showTransitStations?: boolean;
  testId?: string;
};

// Helper: lazy-require MapLibre native module (keeps tests/mockability)
function getMapLibreModule() {
  try {
    const imported = require('@maplibre/maplibre-react-native');
    return imported?.default ?? imported;
  } catch (e) {
    return null;
  }
}

// Reuse some of the logic from MapLibreRouteView to build features
const buildEndpointFeatures = (
  originCoord: [number, number] | null,
  destinationCoord: [number, number] | null,
  originName?: string,
  destinationName?: string,
) => {
  const features: any[] = [];

  if (originCoord) {
    features.push({
      type: 'Feature',
      id: 'origin-marker',
      properties: { type: 'origin', name: originName ?? 'Origin' },
      geometry: { type: 'Point', coordinates: originCoord },
    });
  }

  if (destinationCoord) {
    features.push({
      type: 'Feature',
      id: 'destination-marker',
      properties: { type: 'destination', name: destinationName ?? 'Destination' },
      geometry: { type: 'Point', coordinates: destinationCoord },
    });
  }

  return { type: 'FeatureCollection', features };
};

const MapViewWrapper: React.FC<MapViewWrapperProps> = ({
  origin,
  destination,
  route,
  onMapReady,
  onSelectLocation,
  onStationPress,
  showTransitStations = false,
  testId,
}) => {
  const centerCoordinate = origin?.coordinates
    ? ([origin.coordinates.longitude, origin.coordinates.latitude] as [number, number])
    : undefined;

  // Lazy-load MapLibre and MapLibreMap component so tests can mock them
  const MapLibreModule: any = useMemo(() => getMapLibreModule(), []);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const MapLibreMapComp = useMemo(() => {
    try {
      const required = require('@/components/MapLibreMap');
      return required?.default ?? required;
    } catch (e) {
      return null;
    }
  }, []);

  // Compute simple geojson features for endpoints; keep it light to avoid heavy deps
  const originCoord = origin?.coordinates
    ? ([origin.coordinates.longitude, origin.coordinates.latitude] as [number, number])
    : null;
  const destinationCoord = destination?.coordinates
    ? ([destination.coordinates.longitude, destination.coordinates.latitude] as [number, number])
    : null;

  const endpointFeatures = useMemo(
    () => buildEndpointFeatures(originCoord, destinationCoord, origin?.name, destination?.name),
    [originCoord?.[0], originCoord?.[1], destinationCoord?.[0], destinationCoord?.[1], origin?.name, destination?.name],
  );

  const handleStationPress = useCallback(
    (event: any) => {
      if (!onStationPress) return;
      const feature = event?.features?.[0];
      const stationId = feature?.properties?.id ?? feature?.id;
      if (typeof stationId === 'string') onStationPress(stationId);
    },
    [onStationPress],
  );

  return (
    <View style={styles.container} testID={testId}>
      {/* If MapLibre or MapLibreMapComp not available, render MapLibreMapComp will handle fallback */}
      <MapLibreMapComp
        centerCoordinate={centerCoordinate}
        zoomLevel={12}
        onMapReady={onMapReady}
        testID={testId ? `${testId}-maplibre` : undefined}
      >
        {/* Render route shape if present (route expected to be GeoJSON-like) */}
        {route && MapLibreModule && (
          // @ts-ignore - runtime MapLibre component shape
          <MapLibreModule.ShapeSource id="route" shape={route}>
            {/* @ts-ignore */}
            <MapLibreModule.LineLayer
              id="route-line"
              style={{
                lineColor: Colors.primary,
                lineWidth: 4,
                lineOpacity: 0.9,
              }}
            />
          </MapLibreModule.ShapeSource>
        )}

        {/* Render endpoints */}
        {endpointFeatures?.features?.length > 0 && MapLibreModule && (
          // @ts-ignore
          <MapLibreModule.ShapeSource id="endpoints" shape={endpointFeatures}>
            {/* @ts-ignore */}
            <MapLibreModule.CircleLayer
              id="endpoint-layer"
              style={{
                circleRadius: 6,
                circleOpacity: 0.95,
                circleStrokeWidth: 2,
                circleStrokeColor: '#FFFFFF',
                circleColor: ['case', ['==', ['get', 'type'], 'origin'], Colors.primary, Colors.secondary],
              }}
            />
          </MapLibreModule.ShapeSource>
        )}

        {/* Transit stations rendering (data kept in config) */}
        {showTransitStations && MapLibreModule && (
          (() => {
            // lazy build station features to avoid importing data at top-level
            try {
              // eslint-disable-next-line @typescript-eslint/no-var-requires
              const { nycStations } = require('@/config/transit/nyc-stations');
              const stationFeatures = {
                type: 'FeatureCollection',
                features: nycStations.map((s: any) => ({
                  type: 'Feature',
                  id: s.id,
                  properties: { id: s.id, name: s.name, safetyRating: s.kidFriendly?.safetyRating },
                  geometry: { type: 'Point', coordinates: [s.coordinates.longitude, s.coordinates.latitude] },
                })),
              };

              // @ts-ignore
              return (
                <MapLibreModule.ShapeSource id="stations" shape={stationFeatures} onPress={handleStationPress}>
                  {/* @ts-ignore */}
                  <MapLibreModule.CircleLayer
                    id="stations-layer"
                    style={{
                      circleRadius: 5,
                      circleColor: '#FF6B35',
                      circleOpacity: 0.8,
                      circleStrokeColor: '#FFFFFF',
                      circleStrokeWidth: 1.5,
                    }}
                  />
                </MapLibreModule.ShapeSource>
              );
            } catch (e) {
              return null;
            }
          })()
        )}
      </MapLibreMapComp>

      <View style={styles.mapTypeIndicator} pointerEvents="none">
        <Text style={styles.mapTypeText}>MapLibre</Text>
      </View>
    </View>
  );
};

export default MapViewWrapper;

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapTypeIndicator: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  mapTypeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
