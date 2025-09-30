import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { WifiOff, Wifi } from "lucide-react-native";

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);

  // Simulate network status checking
  useEffect(() => {
    // In a real app, you'd use NetInfo or similar
    const checkConnection = () => {
      // Mock offline detection
      setIsOnline(Math.random() > 0.1); // 90% chance of being online
    };

    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  if (isOnline) return null;

  return (
    <View style={styles.container}>
      <WifiOff size={16} color="#FFFFFF" />
      <Text style={styles.text}>Offline Mode - Limited features available</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.warning,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default OfflineIndicator;
