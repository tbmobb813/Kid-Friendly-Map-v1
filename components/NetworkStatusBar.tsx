import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import Colors from "@/constants/colors";
import { WifiOff, Wifi, RefreshCw } from "lucide-react-native";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

type NetworkStatusBarProps = {
  onRetry?: () => void;
};

const NetworkStatusBar: React.FC<NetworkStatusBarProps> = ({ onRetry }) => {
  const { isConnected, isInternetReachable } = useNetworkStatus();

  if (isConnected && isInternetReachable) return null;

  return (
    <View style={styles.container}>
      <WifiOff size={16} color="#FFFFFF" />
      <Text style={styles.text}>
        {!isConnected ? "No connection" : "Limited connectivity"}
      </Text>
      {onRetry && (
        <Pressable style={styles.retryButton} onPress={onRetry}>
          <RefreshCw size={14} color="#FFFFFF" />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.error,
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
    flex: 1,
    textAlign: "center",
  },
  retryButton: {
    padding: 4,
  },
});

export default NetworkStatusBar;
