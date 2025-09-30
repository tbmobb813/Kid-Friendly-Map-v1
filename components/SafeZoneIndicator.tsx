import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Shield } from 'lucide-react-native';
import { useSafeZoneMonitor } from '@/hooks/useSafeZoneMonitor';
import { useParentalStore } from '@/stores/parentalStore';

export const SafeZoneIndicator: React.FC = () => {
  const { isMonitoring, getCurrentSafeZoneStatus } = useSafeZoneMonitor();
  const { settings, safeZones } = useParentalStore();
  
  const status = getCurrentSafeZoneStatus();
  const activeSafeZones = safeZones.filter(zone => zone.isActive);

  // Don't show if safe zone alerts are disabled or no safe zones exist
  if (!settings.safeZoneAlerts || activeSafeZones.length === 0) {
    return null;
  }

  const getStatusColor = () => {
    if (!isMonitoring) return '#F59E0B'; // Orange for inactive
    if (status && status.inside.length > 0) return '#10B981'; // Green for inside safe zone
    return '#EF4444'; // Red for outside safe zones
  };

  const getStatusText = () => {
    if (!isMonitoring) return 'Safe zone monitoring inactive';
    if (!status) return 'Getting location...';
    if (status.inside.length > 0) {
      return `Inside ${status.inside[0].name}${status.inside.length > 1 ? ` +${status.inside.length - 1} more` : ''}`;
    }
    return 'Outside safe zones';
  };

  const statusColor = getStatusColor();

  return (
    <View style={[styles.container, { borderLeftColor: statusColor }]}>
      <View style={styles.content}>
        <Shield size={16} color={statusColor} />
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>
      <View style={[styles.indicator, { backgroundColor: statusColor }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    fontWeight: '500',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
