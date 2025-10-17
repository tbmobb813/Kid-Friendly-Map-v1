/**
 * Kid-friendly map using MapLibre (native)
 * Replaces previous react-native-maps usage. This component keeps location tracking,
 * safe-zone detection and basic route controls. Rendering of shapes/lines using
 * MapLibre should be implemented in a follow-up (ShapeSource/Layer or annotations).
 */

import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import MapLibreMap from './MapLibreMap';
// Lazy require MapLibre native module for ShapeSource/Layer rendering
function getMapLibreModule() {
  try {
    const imported = require('@maplibre/maplibre-react-native');
    return imported?.default ?? imported;
  } catch {
    return null;
  }
}
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
  const mapRef = useRef<any>(null);
  const mapLibreModule = getMapLibreModule();
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  // Using a lightweight region shape here — we no longer depend on react-native-maps' Region type.
  const [currentRegion, setCurrentRegion] = useState<any>(
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

      // Centering for MapLibre will be implemented using an imperative Camera API.
      // For now we update currentRegion and leave actual camera movement to the MapLibre wrapper.
      if (!initialLocation) {
        setCurrentRegion({
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

  // Check user location against configured safe zones and trigger enter/exit events
  function checkSafeZones() {
    if (!userLocation || safeZones.length === 0) return;

    const newSet = new Set(insideSafeZones);

    safeZones.forEach((zone) => {
      const userLoc: MapLocation = {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
      };

      const distance = calculateDistance(userLoc, zone.center);
      const isInside = distance <= zone.radius;

      if (isInside && !newSet.has(zone.id)) {
        newSet.add(zone.id);
        onSafeZoneEnter?.(zone);
        if (enableVoiceGuidance) {
          void voiceManager.speak(KidFriendlyPhrases.safety.safeZone).catch(() => {});
        }
      } else if (!isInside && newSet.has(zone.id)) {
        newSet.delete(zone.id);
        onSafeZoneExit?.(zone);
      }
    });

    setInsideSafeZones(newSet);
  }

  // Generate a polygon approximating a circle (GeoJSON Polygon) around a center point
  const circleToPolygon = (center: MapLocation, radiusMeters: number, points = 64) => {
    const coords: [number, number][] = [];
    const { latitude: lat, longitude: lng } = center;
    const R = 6371e3; // meters

    for (let i = 0; i < points; i++) {
      const theta = (i / points) * 2 * Math.PI;
      // destination point given distance and bearing
      const δ = radiusMeters / R; // angular distance in radians
      const bearing = theta; // radians

      const φ1 = (lat * Math.PI) / 180;
      const λ1 = (lng * Math.PI) / 180;

      const φ2 = Math.asin(
        Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(bearing),
      );
      const λ2 =
        λ1 +
        Math.atan2(
          Math.sin(bearing) * Math.sin(δ) * Math.cos(φ1),
          Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2),
        );

      const lat2 = (φ2 * 180) / Math.PI;
      const lng2 = (λ2 * 180) / Math.PI;
      coords.push([lng2, lat2]);
    }

    // close polygon by repeating first coordinate
    if (coords.length > 0) coords.push(coords[0]);

    return {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [coords] },
      properties: {},
    };
  };

  const centerOnUser = () => {
    if (userLocation) {
      const lngLat: [number, number] = [
        userLocation.coords.longitude,
        userLocation.coords.latitude,
      ];
      // If MapLibre Camera ref or API is available, call it
      try {
        if (mapRef.current && typeof mapRef.current.setCamera === 'function') {
          mapRef.current.setCamera({
            centerCoordinate: lngLat,
            zoomLevel: 15,
            animationDuration: 700,
          });
          return;
        }
        if (mapLibreModule && mapLibreModule.Camera && mapRef.current?.getMap) {
          const map = mapRef.current.getMap?.();
          map?.setCamera?.({ centerCoordinate: lngLat, zoomLevel: 15, animationDuration: 700 });
          return;
        }
      } catch (e) {
        // fallback to updating region state
      }

      setCurrentRegion({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const fitToRoute = () => {
    if (route.length > 0) {
      // Build bounds from route coordinates
      const lats = route.map((r) => r.latitude).filter((n) => Number.isFinite(n));
      const lngs = route.map((r) => r.longitude).filter((n) => Number.isFinite(n));
      if (lats.length === 0 || lngs.length === 0) return;
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);

      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;

      try {
        if (mapRef.current && typeof mapRef.current.fitBounds === 'function') {
          mapRef.current.fitBounds([minLng, minLat], [maxLng, maxLat], {
            padding: 50,
            animationDuration: 700,
          });
          return;
        }
        if (mapRef.current && typeof mapRef.current.setCamera === 'function') {
          mapRef.current.setCamera({
            centerCoordinate: [centerLng, centerLat],
            zoomLevel: 12,
            animationDuration: 700,
          });
          return;
        }
      } catch (e) {
        // fallback to region update
      }

      setCurrentRegion({
        latitude: centerLat,
        longitude: centerLng,
        latitudeDelta: Math.max(0.05, (maxLat - minLat) * 1.5),
        longitudeDelta: Math.max(0.05, (maxLng - minLng) * 1.5),
      });
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Render MapLibreMap — children rendering for shapes/markers needs MapLibre implementations
          (ShapeSource / Layers / SymbolLayer or native annotations). For now we pass a centerCoordinate
          and zoomLevel derived from currentRegion or initialLocation. */}
      <MapLibreMap
        // @ts-ignore - MapLibreMap accepts centerCoordinate/zoomLevel but not typed as ref props
        ref={mapRef}
        testID="kidfriendly-map"
        centerCoordinate={
          currentRegion
            ? [currentRegion.longitude, currentRegion.latitude]
            : initialLocation
            ? [initialLocation.longitude, initialLocation.latitude]
            : undefined
        }
        zoomLevel={12}
      >
        {/* Render safe zones as GeoJSON circles (approximate) */}
        {mapLibreModule &&
          safeZones.length > 0 &&
          (() => {
            const features = safeZones.map((z) => ({
              ...circleToPolygon(z.center, z.radius, 64),
              id: z.id,
              properties: { id: z.id, name: z.name, color: z.color || '#00C800' },
            }));

            const geo = { type: 'FeatureCollection', features };

            return (
              <mapLibreModule.ShapeSource id="safezones" shape={geo}>
                <mapLibreModule.FillLayer
                  id="safezones-fill"
                  style={{ fillColor: ['get', 'color'], fillOpacity: 0.12 }}
                />
                <mapLibreModule.LineLayer
                  id="safezones-stroke"
                  style={{ lineColor: ['get', 'color'], lineWidth: 2, lineOpacity: 0.9 }}
                />
              </mapLibreModule.ShapeSource>
            );
          })()}

        {/* Render route as a LineLayer */}
        {mapLibreModule &&
          route.length > 1 &&
          (() => {
            const coords = route.map((p) => [p.longitude, p.latitude]);
            const geojson = {
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  id: 'route',
                  properties: {},
                  geometry: { type: 'LineString', coordinates: coords },
                },
              ],
            };
            return (
              <mapLibreModule.ShapeSource id="route" shape={geojson}>
                <mapLibreModule.LineLayer
                  id="route-line"
                  style={{ lineColor: '#2563EB', lineWidth: 4, lineOpacity: 0.95 }}
                />
              </mapLibreModule.ShapeSource>
            );
          })()}

        {/* Route markers */}
        {mapLibreModule &&
          route.length > 0 &&
          (() => {
            const features = route.map((p, i) => ({
              type: 'Feature',
              id: `route-${i}`,
              properties: { index: i },
              geometry: { type: 'Point', coordinates: [p.longitude, p.latitude] },
            }));
            const geo = { type: 'FeatureCollection', features };
            return (
              <mapLibreModule.ShapeSource id="route-points" shape={geo}>
                <mapLibreModule.CircleLayer
                  id="route-points-layer"
                  style={{
                    circleRadius: 6,
                    circleColor: '#2563EB',
                    circleStrokeColor: '#fff',
                    circleStrokeWidth: 2,
                  }}
                />
              </mapLibreModule.ShapeSource>
            );
          })()}
      </MapLibreMap>

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
