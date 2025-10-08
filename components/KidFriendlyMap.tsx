/**
 * Enhanced Map Component using react-native-maps
 * Kid-friendly map with safety zones, journey tracking, and voice integration
 */

import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Pressable, Platform, StyleSheet } from 'react-native';
import MapView, {
  Marker,
  Polyline,
  Circle,
  PROVIDER_GOOGLE,
  Region,
  MapMarker,
} from 'react-native-maps';
import * as Location from 'expo-location';
import { voiceManager, speakNavigation, KidFriendlyPhrases } from '../utils/voice';
import { log } from '../utils/logger';

export interface MapLocation {
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
}

export interface SafeZone {
  id: string;
  center: MapLocation;
  radius: number; // in meters
  name: string;
  color?: string;
}

export interface RoutePoint {
  latitude: number;
  longitude: number;
  instruction?: string;
}

interface KidFriendlyMapProps {
  initialLocation?: MapLocation;
  safeZones?: SafeZone[];
  route?: RoutePoint[];
  showUserLocation?: boolean;
  onLocationChange?: (location: Location.LocationObject) => void;
  onSafeZoneEnter?: (zone: SafeZone) => void;
  onSafeZoneExit?: (zone: SafeZone) => void;
  enableVoiceGuidance?: boolean;
  style?: any;
}

export default function KidFriendlyMap({
  initialLocation,
  safeZones = [],
  route = [],
  showUserLocation = true,
  onLocationChange,
  onSafeZoneEnter,
  onSafeZoneExit,
  enableVoiceGuidance = true,
  style,
}: KidFriendlyMapProps) {
  const mapRef = useRef<MapView>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [currentRegion, setCurrentRegion] = useState<Region | undefined>(
    initialLocation
      ? {
          latitude: initialLocation.latitude,
          longitude: initialLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }
      : undefined,
  );
  const [insideSafeZones, setInsideSafeZones] = useState<Set<string>>(new Set());

  useEffect(() => {
    setupLocationTracking();
  }, []);

  useEffect(() => {
    if (userLocation && safeZones.length > 0) {
      checkSafeZones();
    }
  }, [userLocation, safeZones]);

  const setupLocationTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        log.warn('Location permission not granted');
        if (enableVoiceGuidance) {
          await voiceManager.speak(KidFriendlyPhrases.errors.locationError);
        }
        return;
      }

      // Get initial location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserLocation(location);
      onLocationChange?.(location);

      // Center map on user location
      if (mapRef.current && !initialLocation) {
        mapRef.current.animateToRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }

      // Watch location for updates
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (newLocation) => {
          setUserLocation(newLocation);
          onLocationChange?.(newLocation);
        },
      );
    } catch (error) {
      log.error('Failed to setup location tracking', error as Error);
    }
  };

  const checkSafeZones = () => {
    if (!userLocation) return;

    const currentLoc = {
      latitude: userLocation.coords.latitude,
      longitude: userLocation.coords.longitude,
    };

    safeZones.forEach((zone) => {
      const distance = calculateDistance(currentLoc, zone.center);
      const isInside = distance <= zone.radius;
      const wasInside = insideSafeZones.has(zone.id);

      if (isInside && !wasInside) {
        // Entered safe zone
        setInsideSafeZones((prev) => new Set(prev).add(zone.id));
        onSafeZoneEnter?.(zone);

        if (enableVoiceGuidance) {
          voiceManager.speak(KidFriendlyPhrases.safety.safeZone);
        }
      } else if (!isInside && wasInside) {
        // Exited safe zone
        setInsideSafeZones((prev) => {
          const newSet = new Set(prev);
          newSet.delete(zone.id);
          return newSet;
        });
        onSafeZoneExit?.(zone);
      }
    });
  };

  const calculateDistance = (loc1: MapLocation, loc2: MapLocation): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (loc1.latitude * Math.PI) / 180;
    const φ2 = (loc2.latitude * Math.PI) / 180;
    const Δφ = ((loc2.latitude - loc1.latitude) * Math.PI) / 180;
    const Δλ = ((loc2.longitude - loc1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const fitToRoute = () => {
    if (route.length > 0 && mapRef.current) {
      mapRef.current.fitToCoordinates(route, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  };

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={currentRegion}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        {/* Safe Zones */}
        {safeZones.map((zone) => (
          <Circle
            key={zone.id}
            center={zone.center}
            radius={zone.radius}
            fillColor={zone.color ? `${zone.color}30` : 'rgba(0, 200, 0, 0.2)'}
            strokeColor={zone.color || '#00C800'}
            strokeWidth={2}
          />
        ))}

        {/* Route Polyline */}
        {route.length > 1 && (
          <Polyline
            coordinates={route}
            strokeColor="#2563EB"
            strokeWidth={4}
            lineDashPattern={[1]}
          />
        )}

        {/* Route Markers */}
        {route.map((point, index) => (
          <Marker
            key={`route-${index}`}
            coordinate={point}
            title={point.instruction || `Point ${index + 1}`}
            pinColor={index === 0 ? 'green' : index === route.length - 1 ? 'red' : 'blue'}
          />
        ))}
      </MapView>

      {/* Control Buttons */}
      <View style={styles.controls}>
        <Pressable onPress={centerOnUser} style={styles.controlButton}>
          <Text style={styles.buttonText}>📍 My Location</Text>
        </Pressable>

        {route.length > 0 && (
          <Pressable onPress={fitToRoute} style={styles.controlButton}>
            <Text style={styles.buttonText}>🗺️ Show Route</Text>
          </Pressable>
        )}
      </View>

      {/* Safe Zone Indicator */}
      {insideSafeZones.size > 0 && (
        <View style={styles.safeZoneIndicator}>
          <Text style={styles.safeZoneText}>✅ You're in a safe zone!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    gap: 10,
  },
  controlButton: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  safeZoneIndicator: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  safeZoneText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
