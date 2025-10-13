import React, { useMemo, useRef, useState, useCallback } from 'react';
import { Animated, Easing } from 'react-native';
import { View, StyleSheet, Platform, Pressable, Text } from 'react-native';
import Colors from '@/constants/colors';
import { Place, Route } from '@/types/navigation';
import { nycStations } from '@/config/transit/nyc-stations';
import MapPlaceholder from './MapPlaceholder';
import { Crosshair, Train } from 'lucide-react-native';
import MapViewWrapper from './MapViewWrapper';
import { isMapLibreAvailable } from './MapLibreMap';

type LatLng = { latitude: number; longitude: number };

export interface InteractiveMapProps {
  origin?: Place;
  destination?: Place;
  route?: Route;
  showTransitStations?: boolean;
  // make mascot props optional so callers that don't use mascot can skip them
  mascotHint?: string;
  setMascotHint?: React.Dispatch<React.SetStateAction<string>>;
  onMapReady?: () => void;
  onSelectLocation?: (coords: LatLng) => void;
  onStationPress?: (stationId: string) => void;
  testId?: string;
  onTouchStateChange?: (active: boolean) => void;
  preferNative?: boolean;
  clusterRadiusMeters?: number;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  origin,
  destination,
  route,
  onMapReady,
  onSelectLocation,
  onStationPress,
  showTransitStations = false,
  testId = 'interactive-map',
  onTouchStateChange,
  preferNative = true,
  clusterRadiusMeters = 100,
  mascotHint,
  setMascotHint,
}) => {
  const [mapReady, setMapReady] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const shouldUseNative = useMemo(() => {
    if (Platform.OS === 'web') return false;
    if (!preferNative) return false;
    return false; // Simplified for now
  }, [preferNative]);

  const handleMapReady = useCallback(() => {
    setMapReady(true);
    onMapReady?.();

    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [animatedValue, onMapReady]);

  const handleLocationSelect = useCallback(
    (coords: LatLng) => {
      onSelectLocation?.(coords);
      onTouchStateChange?.(false);
    },
    [onSelectLocation, onTouchStateChange],
  );

  const handleStationPress = useCallback(
    (stationId: string) => {
      onStationPress?.(stationId);
      if (setMascotHint) {
        const station = nycStations.find((s) => s.id === stationId);
        if (station) {
          setMascotHint(`You selected ${station.name} station!`);
        }
      }
    },
    [onStationPress, setMascotHint],
  );

  const stations = useMemo(() => {
    if (!showTransitStations) return [];
    return nycStations.filter(
      (station) => station.coordinates?.latitude && station.coordinates?.longitude,
    );
  }, [showTransitStations]);

  const routeCoords = useMemo(() => {
    if (!route?.metadata?.geometry?.coordinates) return [];
    return route.metadata.geometry.coordinates;
  }, [route]);

  const handleMessage = (event: any) => {
    try {
      const data = typeof event?.nativeEvent?.data === 'string' ? JSON.parse(event.nativeEvent.data) : null;
      if (data?.type === 'tap' && typeof data.lat === 'number' && typeof data.lng === 'number') {
        onSelectLocation?.({ latitude: data.lat, longitude: data.lng });
      }
    } catch (e) {
      // ignore parse errors in tests
    }
  };

  return (
    <Animated.View
      style={[styles.container, { opacity: animatedValue }]}
      testID={testId}
      // Web fallback: accept messages containing tap events
      // @ts-ignore allow onMessage in test environment
      onMessage={handleMessage}
    >
      <MapViewWrapper
        origin={origin}
        destination={destination}
        route={route}
        onMapReady={handleMapReady}
        onSelectLocation={handleLocationSelect}
        onStationPress={handleStationPress}
        showTransitStations={showTransitStations}
      />

      <View style={styles.controlsOverlay}>
        {showTransitStations && (
          <Pressable style={styles.stationToggle} testID="station-toggle">
            <Train size={20} color={Colors.primary} />
            <Text style={styles.stationToggleText}>Stations</Text>
          </Pressable>
        )}

        <Pressable style={styles.crosshairButton} testID="recenter-button">
          <Crosshair size={24} color={Colors.primary} />
        </Pressable>
      </View>

      {!mapReady && (
        <View style={styles.loadingOverlay}>
          <MapPlaceholder />
        </View>
      )}

      {/* Removed placeholder message for transit stations */}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: Colors.background,
    borderRadius: 12,
    overflow: 'hidden',
  },
  controlsOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'column',
    gap: 8,
    zIndex: 1000,
  },
  stationToggle: {
    backgroundColor: Colors.background,
    padding: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  stationToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  crosshairButton: {
    backgroundColor: Colors.background,
    padding: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    zIndex: 999,
  },
});

export default InteractiveMap;
