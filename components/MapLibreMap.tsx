import React, { useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import Config from '@/utils/config';

type MapLibreMapProps = {
  /** Optional override for the map style URL. */
  styleURL?: string;
  /** Center coordinate as [longitude, latitude]. */
  centerCoordinate?: [number, number];
  /** Initial zoom level. */
  zoomLevel?: number;
  /** Called when the map has finished rendering. */
  onMapReady?: () => void;
  /** Called when the user taps the map; receives [longitude, latitude]. */
  onPress?: (coordinate: [number, number]) => void;
  children?: React.ReactNode;
  testID?: string;
};

MapLibreGL.setAccessToken(Config.MAP.ACCESS_TOKEN ?? null);

const fallbackStyleUrl = Config.MAP.FALLBACK_STYLE_URL ?? 'https://demotiles.maplibre.org/style.json';

const defaultCenter: [number, number] = [
  Config.MAP.DEFAULT_CENTER.longitude,
  Config.MAP.DEFAULT_CENTER.latitude,
];

const defaultZoomLevel = Config.MAP.DEFAULT_ZOOM ?? 12;

const MapLibreMap: React.FC<MapLibreMapProps> = ({
  styleURL,
  centerCoordinate,
  zoomLevel,
  onMapReady,
  onPress,
  children,
  testID,
}) => {
  useEffect(() => {
    (MapLibreGL as any).requestAndroidPermissionsIfNeeded?.();
  }, []);

  const mapStyleURL = useMemo(() => {
    if (styleURL && typeof styleURL === 'string') {
      return styleURL;
    }

    if (Config.MAP.STYLE_URL) {
      return Config.MAP.STYLE_URL;
    }

    return fallbackStyleUrl;
  }, [styleURL]);

  const resolvedCenter = useMemo<[number, number]>(() => {
    if (
      Array.isArray(centerCoordinate) &&
      centerCoordinate.length === 2 &&
      typeof centerCoordinate[0] === 'number' &&
      typeof centerCoordinate[1] === 'number'
    ) {
      return centerCoordinate;
    }

    return defaultCenter;
  }, [centerCoordinate]);

  const resolvedZoom = useMemo(() => {
    if (typeof zoomLevel === 'number' && Number.isFinite(zoomLevel)) {
      return zoomLevel;
    }

    return defaultZoomLevel;
  }, [zoomLevel]);

  const handlePress = useCallback(
    (event: any) => {
      if (!onPress) {
        return;
      }

      const [longitude, latitude] = event?.geometry?.coordinates ?? [];
      if (typeof longitude === 'number' && typeof latitude === 'number') {
        onPress([longitude, latitude]);
      }
    },
    [onPress],
  );

  const handleMapReady = useCallback(() => {
    onMapReady?.();
  }, [onMapReady]);

  return (
    <View style={styles.container} testID={testID ?? 'maplibre-map'}>
      <MapLibreGL.MapView
        style={styles.map}
        {...({ styleURL: mapStyleURL } as any)}
        onDidFinishRenderingMapFully={handleMapReady}
        onPress={onPress ? handlePress : undefined}
      >
        <MapLibreGL.Camera
          zoomLevel={resolvedZoom}
          centerCoordinate={resolvedCenter}
          minZoomLevel={Config.MAP.MIN_ZOOM}
          maxZoomLevel={Config.MAP.MAX_ZOOM}
        />
        {children}
      </MapLibreGL.MapView>
    </View>
  );
};

export default MapLibreMap;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});