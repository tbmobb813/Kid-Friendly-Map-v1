import { useState, useEffect } from "react";
import * as Location from "expo-location";
import { Platform, Alert } from "react-native";

type LocationData = {
  latitude: number;
  longitude: number;
  error: string | null;
};

export default function useLocation() {
  const [location, setLocation] = useState<LocationData>({
    latitude: 40.7128,
    longitude: -74.0060,
    error: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        
        if (Platform.OS === "web") {
          // Web geolocation API
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                setLocation({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  error: null,
                });
                setLoading(false);
              },
              (error) => {
                setLocation(prev => ({
                  ...prev,
                  error: "Could not get your location"
                }));
                setLoading(false);
              }
            );
          }
          return;
        }

        // Request permissions for mobile platforms
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== "granted") {
          // Android-specific permission handling
          if (Platform.OS === 'android') {
            Alert.alert(
              "Location Permission",
              "This app needs location access to show you nearby places and directions. Please enable location in your device settings.",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Settings", onPress: () => {
                  // On Android, we can't directly open settings, but we can guide the user
                  Alert.alert("Enable Location", "Go to Settings > Apps > KidMap > Permissions > Location");
                }}
              ]
            );
          }
          
          setLocation(prev => ({
            ...prev,
            error: "Permission to access location was denied"
          }));
          setLoading(false);
          return;
        }

        // Get current location with Android-optimized settings
        const locationOptions = Platform.OS === 'android' 
          ? {
              accuracy: Location.Accuracy.Balanced,
              timeout: 15000,
              maximumAge: 10000,
            }
          : {
              accuracy: Location.Accuracy.Balanced,
            };

        const currentLocation = await Location.getCurrentPositionAsync(locationOptions);

        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          error: null,
        });
      } catch (error) {
        console.log("Location error:", error);
        setLocation(prev => ({
          ...prev,
          error: "Could not get your location"
        }));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { location, loading };
}
