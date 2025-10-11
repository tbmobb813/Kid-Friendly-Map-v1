import React, { useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Config from '@/utils/config';
import { log } from '@/utils/logger';

type MapLibreModule = typeof import('@maplibre/maplibre-react-native');

let mapLibreModule: any = null;

function getMapLibreModule() {
  if ((global as any).__maplibreLoadAttempted) return mapLibreModule;
  (global as any).__maplibreLoadAttempted = true;

  try {
    const imported = require('@maplibre/maplibre-react-native');
    mapLibreModule = imported?.default ?? imported;
  } catch (e) {
    mapLibreModule = null;
  }

  return mapLibreModule;
}

export const MapLibreGL: MapLibreModule | null = null; // placeholder for typing

export function isMapLibreAvailable(): boolean {
  try {
    const m = getMapLibreModule();
    return !!(m && typeof m === 'object' && 'MapView' in m);
  } catch {
    return false;
  }
}

type MapLibreMapProps = {
  styleURL?: string;
  centerCoordinate?: [number, number];
  zoomLevel?: number;
  onMapReady?: () => void;
  onPress?: (coordinate: [number, number]) => void;
  children?: React.ReactNode;
  testID?: string;
};

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
  const MapLibre: any = getMapLibreModule();

  if (!MapLibre || typeof MapLibre !== 'object' || !(MapLibre as any).MapView) {
    if (__DEV__) log.debug('MapLibre not available, rendering null');
    return null;
  }

  useEffect(() => {
    if (MapLibre && typeof (MapLibre as any).requestAndroidPermissionsIfNeeded === 'function') {
      (MapLibre as any).requestAndroidPermissionsIfNeeded();
    }

    if (MapLibre && typeof (MapLibre as any).setAccessToken === 'function') {
      try {
        (MapLibre as any).setAccessToken(Config.MAP.ACCESS_TOKEN ?? null);
      } catch (error) {
        log.warn('Unable to set MapLibre access token', {
          error: error instanceof Error ? { name: error.name, message: error.message } : { message: String(error) },
        });
      }
    }
  }, [MapLibre]);

  const mapStyleURL = useMemo(() => {
    if (styleURL && typeof styleURL === 'string') return styleURL;
    if (Config.MAP.STYLE_URL) return Config.MAP.STYLE_URL;
    return fallbackStyleUrl;
  }, [styleURL]);

  const resolvedCenter = useMemo<[number, number]>(() => {
    if (
      Array.isArray(centerCoordinate) &&
      centerCoordinate.length === 2 &&
      typeof centerCoordinate[0] === 'number' &&
      typeof centerCoordinate[1] === 'number'
    ) {
      return [centerCoordinate[0], centerCoordinate[1]];
    }
    return defaultCenter;
  }, [centerCoordinate]);

  const resolvedZoom = useMemo(() => {
    if (typeof zoomLevel === 'number' && Number.isFinite(zoomLevel)) return zoomLevel;
    return defaultZoomLevel;
  }, [zoomLevel]);

  const handlePress = useCallback(
    (event: any) => {
      if (!onPress) return;
      const [longitude, latitude] = event?.geometry?.coordinates ?? [];
      if (typeof longitude === 'number' && typeof latitude === 'number') onPress([longitude, latitude]);
    },
    [onPress],
  );

  const handleMapReady = useCallback(() => {
    onMapReady?.();
  }, [onMapReady]);

  return (
    <View style={styles.container} testID={testID ?? 'maplibre-map'}>
      <MapLibre.MapView
        style={styles.map}
        {...({ styleURL: mapStyleURL } as any)}
        onDidFinishRenderingMapFully={handleMapReady}
        onPress={onPress ? handlePress : undefined}
      >
        <MapLibre.Camera
          zoomLevel={resolvedZoom}
          centerCoordinate={resolvedCenter}
          minZoomLevel={Config.MAP.MIN_ZOOM}
          maxZoomLevel={Config.MAP.MAX_ZOOM}
        />
        {children}
      </MapLibre.MapView>
    </View>
  );
};

export default MapLibreMap;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
