import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Shield, MapPin, Clock, AlertTriangle } from 'lucide-react-native';
import { useSafeZoneMonitor } from '@/hooks/useSafeZoneMonitor';
import { useParentalStore } from '@/stores/parentalStore';

export const SafeZoneStatusCard: React.FC = () => {
  const { isMonitoring, getCurrentSafeZoneStatus, startMonitoring, stopMonitoring } = useSafeZoneMonitor();
  const { settings, safeZones } = useParentalStore();
  
  const status = getCurrentSafeZoneStatus();
  const activeSafeZones = safeZones.filter(zone => zone.isActive);

  if (!settings.safeZoneAlerts || activeSafeZones.length === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Shield size={24} color="#9CA3AF" />
          <Text style={styles.title}>Safe Zones</Text>
        </View>
        <Text style={styles.subtitle}>
          {activeSafeZones.length === 0 
            ? 'No safe zones configured' 
            : 'Safe zone alerts are disabled'
          }
        </Text>
      </View>
    );
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Shield 
          size={24} 
          color={isMonitoring ? '#10B981' : '#F59E0B'} 
        />
        <Text style={styles.title}>Safe Zone Status</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: isMonitoring ? '#10B981' : '#F59E0B' }
        ]}>
          <Text style={styles.statusText}>
            {isMonitoring ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      {status && (
        <View style={styles.content}>
          <View style={styles.locationInfo}>
            <MapPin size={16} color="#6B7280" />
            <Text style={styles.locationText}>
              Current location tracked
            </Text>
            <Clock size={16} color="#6B7280" />
            <Text style={styles.timeText}>
              {formatTime(status.currentLocation.timestamp)}
            </Text>
          </View>

          <View style={styles.zoneStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{status.inside.length}</Text>
              <Text style={styles.statLabel}>Inside Safe Zones</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{status.outside.length}</Text>
              <Text style={styles.statLabel}>Outside Safe Zones</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{status.totalActive}</Text>
              <Text style={styles.statLabel}>Total Active</Text>
            </View>
          </View>

          {status.inside.length > 0 && (
            <View style={styles.insideZones}>
              <Text style={styles.sectionTitle}>Currently Inside:</Text>
              {status.inside.map(zone => (
                <View key={zone.id} style={styles.zoneItem}>
                  <View style={[styles.zoneDot, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.zoneName}>{zone.name}</Text>
                </View>
              ))}
            </View>
          )}

          {status.outside.length > 0 && status.inside.length === 0 && (
            <View style={styles.outsideWarning}>
              <AlertTriangle size={16} color="#F59E0B" />
              <Text style={styles.warningText}>
                Not currently in any safe zone
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.controlButton,
            { backgroundColor: isMonitoring ? '#EF4444' : '#10B981' }
          ]}
          onPress={isMonitoring ? stopMonitoring : startMonitoring}
        >
          <Text style={styles.controlButtonText}>
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 12,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    marginBottom: 16,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  zoneStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  insideZones: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  zoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  zoneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  zoneName: {
    fontSize: 14,
    color: '#374151',
  },
  outsideWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
    marginLeft: 8,
  },
  controls: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  controlButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
