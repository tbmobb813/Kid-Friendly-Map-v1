import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

type NetworkStatus = {
  isConnected: boolean;
  isInternetReachable: boolean;
  connectionType: string;
};

export function useNetworkStatus(): NetworkStatus {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    connectionType: 'unknown',
  });

  useEffect(() => {
    if (Platform.OS === 'web') {
      const updateOnlineStatus = () => {
        setNetworkStatus({
          isConnected: navigator.onLine,
          isInternetReachable: navigator.onLine,
          connectionType: 'unknown',
        });
      };

      window.addEventListener('online', updateOnlineStatus);
      window.addEventListener('offline', updateOnlineStatus);
      updateOnlineStatus();

      return () => {
        window.removeEventListener('online', updateOnlineStatus);
        window.removeEventListener('offline', updateOnlineStatus);
      };
    }

    // For mobile, we'd use @react-native-community/netinfo
    // but since it's not available in Expo Go, we'll simulate
    const checkConnection = () => {
      setNetworkStatus({
        isConnected: Math.random() > 0.05, // 95% chance of being connected
        isInternetReachable: Math.random() > 0.1, // 90% chance of internet
        connectionType: 'cellular',
      });
    };

    const interval = setInterval(checkConnection, 5000);
    checkConnection();

    return () => clearInterval(interval);
  }, []);

  return networkStatus;
}
