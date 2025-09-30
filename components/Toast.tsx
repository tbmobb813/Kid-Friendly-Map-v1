import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, View, Animated, Platform } from "react-native";
import Colors from "@/constants/colors";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react-native";

type ToastType = "success" | "error" | "info" | "warning";

type ToastProps = {
  message: string;
  type: ToastType;
  visible: boolean;
  onHide: () => void;
  duration?: number;
};

const Toast: React.FC<ToastProps> = ({
  message,
  type,
  visible,
  onHide,
  duration = 3000,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();

      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      onHide();
    });
  };

  const getIcon = () => {
    switch (type) {
      case "success": return <CheckCircle size={20} color={Colors.success} />;
      case "error": return <X size={20} color={Colors.error} />;
      case "warning": return <AlertCircle size={20} color={Colors.warning} />;
      case "info": return <Info size={20} color={Colors.primary} />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "success": return "#F0FFF4";
      case "error": return "#FFF5F5";
      case "warning": return "#FFFBF0";
      case "info": return "#F0F4FF";
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          backgroundColor: getBackgroundColor(),
        },
      ]}
    >
      {getIcon()}
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
    gap: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500",
  },
});

export default Toast;
