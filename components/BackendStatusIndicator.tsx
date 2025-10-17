import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { backendHealthMonitor } from '@/utils/api';
import Colors from '@/constants/colors';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react-native';

type HealthStatus = 'healthy' | 'degraded' | 'down';

export default function BackendStatusIndicator() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>('healthy');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = backendHealthMonitor.addListener((status) => {
      setHealthStatus(status);
      setIsVisible(status !== 'healthy');
    });

    // Initial health check
    backendHealthMonitor.checkHealth().then(setHealthStatus);

    return unsubscribe;
  }, []);

  if (!isVisible) {
    return null;
  }

  const getStatusConfig = (status: HealthStatus) => {
    switch (status) {
      case 'degraded':
        return {
          icon: AlertTriangle,
          color: Colors.warning,
          backgroundColor: Colors.warning + '20',
          text: 'Slow connection',
        };
      case 'down':
        return {
          icon: WifiOff,
          color: Colors.error,
          backgroundColor: Colors.error + '20',
          text: 'Connection issues',
        };
      default:
        return {
          icon: Wifi,
          color: Colors.success,
          backgroundColor: Colors.success + '20',
          text: 'Connected',
        };
    }
  };

  const config = getStatusConfig(healthStatus);
  const IconComponent = config.icon;

  return (
    <View style={[styles.container, { backgroundColor: config.backgroundColor }]}>
      <IconComponent size={16} color={config.color} />
      <Text style={[styles.text, { color: config.color }]}>{config.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
});
