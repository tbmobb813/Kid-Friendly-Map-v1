import React, { useRef, useState } from 'react';
import { View, StyleSheet, Platform, Pressable, Text } from 'react-native';
import Colors from '@/constants/colors';
import { Place, Route } from '@/types/navigation';
import { nycStations } from '@/config/transit/nyc-stations';
import { Crosshair } from 'lucide-react-native';

// Check for expo-maps availability without importing
let isExpoMapsAvailable = false;
try {
  const ExpoModulesCore = require('expo-modules-core');
  isExpoMapsAvailable = ExpoModulesCore.NativeModulesProxy?.ExpoMaps != null;
} catch (error) {
  console.log('expo-modules-core not available');
  isExpoMapsAvailable = false;
}

type LatLng = { latitude: number; longitude: number };

type ExpoMapViewProps = {
  origin?: Place;
  destination?: Place;
  route?: Route & { geometry?: { coordinates: LatLng[] } };
  onMapReady?: () => void;
  onSelectLocation?: (coords: LatLng) => void;
  onStationPress?: (stationId: string) => void;
  showTransitStations?: boolean;
  testId?: string;
};

export default function ExpoMapView({
  origin,
  destination,
  route,
  onMapReady,
  onSelectLocation,
  onStationPress,
  showTransitStations = false,
  testId,
}: ExpoMapViewProps) {
  // Immediately return fallback if expo-maps is not available
  if (!isExpoMapsAvailable || Platform.OS !== 'android') {
    return (
      <View style={styles.container} testID={testId}>
        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackText}>
            {!isExpoMapsAvailable
              ? 'Expo Maps requires a development build.\nCurrently showing OpenStreetMap fallback.\n\nTo use native Google/Apple Maps:\n• Build a development build with "npx expo run:android"'
              : 'Expo Maps is only supported on Android in this implementation.\nSwitch to the OpenStreetMap view for iOS compatibility.'}
          </Text>
        </View>
      </View>
    );
  }

  // Only import expo-maps if we've confirmed it's available
  const ExpoMaps = require('expo-maps');
  const GoogleMaps = ExpoMaps.GoogleMaps;
  const AppleMaps = ExpoMaps.AppleMaps;

  const mapRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);

  // Default center (NYC)
  const defaultCenter = { latitude: 40.7128, longitude: -74.006 };

  // Determine map center
  const center = origin?.coordinates || destination?.coordinates || defaultCenter;

  const cameraPosition = {
    coordinates: center,
    zoom: 12,
  };

  // Convert route coordinates if available
  const routeCoordinates =
    route?.geometry?.coordinates?.map((coord) => ({
      latitude: coord.latitude,
      longitude: coord.longitude,
    })) || [];

  // Filter nearby transit stations
  const nearbyStations = showTransitStations
    ? nycStations.filter((station) => {
        const distance = getDistance(center, {
          latitude: station.coordinates[1],
          longitude: station.coordinates[0],
        });
        return distance < 2000; // Within 2km
      })
    : [];

  // Simple distance calculation
  function getDistance(point1: LatLng, point2: LatLng): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  const handleMapClick = (event: { coordinates: { latitude?: number; longitude?: number } }) => {
    const { latitude, longitude } = event.coordinates;
    if (latitude !== undefined && longitude !== undefined) {
      onSelectLocation?.({ latitude, longitude });
    }
  };

  const handleStationPress = (stationId: string) => {
    onStationPress?.(stationId);
  };

  const handleMapLoaded = () => {
    setMapReady(true);
    onMapReady?.();
  };

  const recenterMap = () => {
    if (mapRef.current && Platform.OS === 'android') {
      // Android GoogleMaps API
      mapRef.current.setCameraPosition({
        coordinates: center,
        zoom: 12,
        animated: true,
        duration: 1000,
      });
    }
  };

  // Prepare markers array for Android GoogleMaps
  const markers = [
    // Origin marker
    ...(origin
      ? [
          {
            id: 'origin',
            coordinates: origin.coordinates,
            title: 'Origin',
            snippet: origin.name,
            showCallout: true,
          },
        ]
      : []),

    // Destination marker
    ...(destination
      ? [
          {
            id: 'destination',
            coordinates: destination.coordinates,
            title: 'Destination',
            snippet: destination.name,
            showCallout: true,
          },
        ]
      : []),

    // Transit station markers
    ...nearbyStations.map((station) => ({
      id: `station-${station.id}`,
      coordinates: {
        latitude: station.coordinates[1],
        longitude: station.coordinates[0],
      },
      title: station.name,
      snippet: 'Transit Station',
      showCallout: true,
      zIndex: 1,
    })),
  ];

  // Prepare polylines array
  const polylines =
    routeCoordinates.length > 1
      ? [
          {
            id: 'route',
            coordinates: routeCoordinates,
            color: Colors.primary,
            width: 4,
          },
        ]
      : [];

  return (
    <View style={styles.container} testID={testId}>
      <GoogleMaps.View
        ref={mapRef}
        style={styles.map}
        cameraPosition={cameraPosition}
        markers={markers}
        polylines={polylines}
        onMapLoaded={handleMapLoaded}
        onMapClick={handleMapClick}
        onMarkerClick={(marker: any) => {
          if (marker.id?.startsWith('station-')) {
            const stationId = marker.id.replace('station-', '');
            handleStationPress(stationId);
          }
        }}
        uiSettings={{
          zoomControlsEnabled: false,
          myLocationButtonEnabled: false,
          compassEnabled: false,
        }}
        properties={{
          isMyLocationEnabled: false,
        }}
      />

      {/* Recenter Button */}
      <Pressable
        style={styles.recenterButton}
        onPress={recenterMap}
        accessibilityRole="button"
        accessibilityLabel="Recenter map"
      >
        <Crosshair size={20} color={Colors.text} />
      </Pressable>

      {/* Map Type Indicator */}
      <View style={styles.mapTypeIndicator}>
        <Text style={styles.mapTypeText}>Google Maps</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  fallbackText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  recenterButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  mapTypeIndicator: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  mapTypeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});
