import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { Platform, Alert } from 'react-native';
import { useParentalStore } from '@/stores/parentalStore';
import { SafeZone } from '@/types/parental';
import { showNotification, requestNotificationPermission } from '@/utils/notifications';

type SafeZoneEvent = {
  safeZone: SafeZone;
  type: 'entry' | 'exit';
  timestamp: number;
  location: {
    latitude: number;
    longitude: number;
  };
};

type LocationState = {
  latitude: number;
  longitude: number;
  timestamp: number;
};

// Calculate distance between two points in meters
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const useSafeZoneMonitor = () => {
  const { safeZones, settings, dashboardData, saveDashboardData } = useParentalStore();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationState | null>(null);
  const [safeZoneStates, setSafeZoneStates] = useState<Record<string, boolean>>({});
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const lastNotificationTime = useRef<Record<string, number>>({});

  // Initialize safe zone states
  useEffect(() => {
    if (currentLocation && safeZones.length > 0) {
      const initialStates: Record<string, boolean> = {};
      safeZones.forEach(zone => {
        if (zone.isActive) {
          const distance = calculateDistance(
            currentLocation.latitude,
            currentLocation.longitude,
            zone.latitude,
            zone.longitude
          );
          initialStates[zone.id] = distance <= zone.radius;
        }
      });
      setSafeZoneStates(initialStates);
    }
  }, [currentLocation, safeZones]);

  // Send notification for safe zone events
  const sendSafeZoneNotification = async (event: SafeZoneEvent) => {
    if (!settings.safeZoneAlerts) return;

    const { safeZone, type } = event;
    const shouldNotify = type === 'entry' ? safeZone.notifications.onEntry : safeZone.notifications.onExit;
    
    if (!shouldNotify) return;

    // Prevent spam notifications (minimum 5 minutes between same zone notifications)
    const lastTime = lastNotificationTime.current[`${safeZone.id}_${type}`] || 0;
    const now = Date.now();
    if (now - lastTime < 5 * 60 * 1000) return;

    lastNotificationTime.current[`${safeZone.id}_${type}`] = now;

    const title = type === 'entry' ? '🟢 Safe Zone Entry' : '🔴 Safe Zone Exit';
    const body = type === 'entry' 
      ? `Child has entered ${safeZone.name}` 
      : `Child has left ${safeZone.name}`;

    await showNotification({ title, body, priority: 'high' });

    // Add to dashboard activity
    const updatedDashboard = {
      ...dashboardData,
      safeZoneActivity: [
        {
          id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          safeZoneId: safeZone.id,
          safeZoneName: safeZone.name,
          type,
          timestamp: now,
        },
        ...dashboardData.safeZoneActivity,
      ].slice(0, 50), // Keep last 50 activities
    };

    await saveDashboardData(updatedDashboard);
  };

  // Check safe zone status for current location
  const checkSafeZones = async (location: LocationState) => {
    const newStates: Record<string, boolean> = {};
    const events: SafeZoneEvent[] = [];

    safeZones.forEach(zone => {
      if (!zone.isActive) return;

      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        zone.latitude,
        zone.longitude
      );

      const isInside = distance <= zone.radius;
      const wasInside = safeZoneStates[zone.id] || false;

      newStates[zone.id] = isInside;

      // Detect entry/exit events
      if (isInside && !wasInside) {
        events.push({
          safeZone: zone,
          type: 'entry',
          timestamp: location.timestamp,
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
        });
      } else if (!isInside && wasInside) {
        events.push({
          safeZone: zone,
          type: 'exit',
          timestamp: location.timestamp,
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
        });
      }
    });

    setSafeZoneStates(newStates);

    // Send notifications for events
    for (const event of events) {
      await sendSafeZoneNotification(event);
    }
  };

  // Start monitoring
  const startMonitoring = async () => {
    if (isMonitoring) return;

    try {
      // Request permissions
      if (Platform.OS !== 'web') {
        const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
        if (foregroundStatus !== 'granted') {
          Alert.alert(
            'Location Permission Required',
            'Safe zone monitoring requires location access to work properly.',
            [{ text: 'OK' }]
          );
          return;
        }

        // Request background permissions for better monitoring
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
          console.log('Background location permission not granted, monitoring will be limited');
        }

        // Request notification permissions
        await requestNotificationPermission();
      } else {
        // Web notification permission
        await requestNotificationPermission();
      }

      // Get initial location
      const initialLocation = Platform.OS === 'web'
        ? await new Promise<LocationState>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              (position) => resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                timestamp: Date.now(),
              }),
              reject
            );
          })
        : await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          }).then(loc => ({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            timestamp: Date.now(),
          }));

      setCurrentLocation(initialLocation);
      await checkSafeZones(initialLocation);

      // Start location subscription
      if (Platform.OS !== 'web') {
        locationSubscription.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 30000, // Check every 30 seconds
            distanceInterval: 50, // Or when moved 50 meters
          },
          (location) => {
            const newLocation: LocationState = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              timestamp: Date.now(),
            };
            setCurrentLocation(newLocation);
            checkSafeZones(newLocation);
          }
        );
      } else {
        // Web: Use periodic checking
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const newLocation: LocationState = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              timestamp: Date.now(),
            };
            setCurrentLocation(newLocation);
            checkSafeZones(newLocation);
          },
          (error) => console.error('Location watch error:', error),
          {
            enableHighAccuracy: false,
            timeout: 30000,
            maximumAge: 60000,
          }
        );

        locationSubscription.current = {
          remove: () => navigator.geolocation.clearWatch(watchId),
        } as Location.LocationSubscription;
      }

      setIsMonitoring(true);
      console.log('Safe zone monitoring started');
    } catch (error) {
      console.error('Failed to start safe zone monitoring:', error);
      Alert.alert('Error', 'Failed to start safe zone monitoring');
    }
  };

  // Stop monitoring
  const stopMonitoring = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    setIsMonitoring(false);
    console.log('Safe zone monitoring stopped');
  };

  // Get current safe zone status
  const getCurrentSafeZoneStatus = () => {
    if (!currentLocation) return null;

    const activeSafeZones = safeZones.filter(zone => zone.isActive);
    const insideZones = activeSafeZones.filter(zone => safeZoneStates[zone.id]);
    const outsideZones = activeSafeZones.filter(zone => !safeZoneStates[zone.id]);

    return {
      totalActive: activeSafeZones.length,
      inside: insideZones,
      outside: outsideZones,
      currentLocation,
    };
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, []);

  // Auto-start monitoring when safe zones are available and settings allow
  useEffect(() => {
    if (settings.safeZoneAlerts && safeZones.length > 0 && !isMonitoring) {
      startMonitoring();
    } else if ((!settings.safeZoneAlerts || safeZones.length === 0) && isMonitoring) {
      stopMonitoring();
    }
  }, [settings.safeZoneAlerts, safeZones.length]);

  return {
    isMonitoring,
    currentLocation,
    safeZoneStates,
    startMonitoring,
    stopMonitoring,
    getCurrentSafeZoneStatus,
  };
};
