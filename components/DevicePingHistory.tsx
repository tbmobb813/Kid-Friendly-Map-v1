import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Phone, MapPin, MessageCircle, CheckCircle, X, Clock } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useParentalStore } from '@/stores/parentalStore';
import { DevicePingRequest } from '@/types/parental';

type DevicePingHistoryProps = {
  testId?: string;
};

const DevicePingHistory: React.FC<DevicePingHistoryProps> = ({ testId }) => {
  const { devicePings } = useParentalStore();

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getPingIcon = (type: DevicePingRequest['type']) => {
    switch (type) {
      case 'ring':
        return <Phone size={20} color={Colors.primary} />;
      case 'location':
        return <MapPin size={20} color={Colors.primary} />;
      case 'message':
        return <MessageCircle size={20} color={Colors.primary} />;
      default:
        return <Phone size={20} color={Colors.primary} />;
    }
  };

  const getStatusIcon = (status: DevicePingRequest['status']) => {
    switch (status) {
      case 'acknowledged':
        return <CheckCircle size={16} color={Colors.success} />;
      case 'failed':
        return <X size={16} color={Colors.error} />;
      case 'pending':
        return <Clock size={16} color={Colors.warning} />;
      default:
        return <Clock size={16} color={Colors.textLight} />;
    }
  };

  const getStatusText = (status: DevicePingRequest['status']) => {
    switch (status) {
      case 'acknowledged':
        return 'Acknowledged';
      case 'failed':
        return 'Failed';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  const getPingTypeText = (type: DevicePingRequest['type']) => {
    switch (type) {
      case 'ring':
        return 'Device Ring';
      case 'location':
        return 'Location Request';
      case 'message':
        return 'Message';
      default:
        return 'Ping';
    }
  };

  // Sort pings by most recent first
  const sortedPings = [...devicePings].sort((a, b) => b.requestedAt - a.requestedAt);

  if (sortedPings.length === 0) {
    return (
      <View style={styles.emptyContainer} testID={testId}>
        <Phone size={48} color={Colors.textLight} />
        <Text style={styles.emptyTitle}>No Device Pings</Text>
        <Text style={styles.emptySubtitle}>
          Device ping history will appear here when you send location requests or ring the device
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} testID={testId}>
      <Text style={styles.title}>Device Ping History</Text>
      
      {sortedPings.map((ping) => (
        <View key={ping.id} style={styles.pingCard}>
          <View style={styles.pingHeader}>
            <View style={styles.pingIconContainer}>
              {getPingIcon(ping.type)}
            </View>
            <View style={styles.pingInfo}>
              <Text style={styles.pingType}>{getPingTypeText(ping.type)}</Text>
              <Text style={styles.pingDate}>
                {formatDate(ping.requestedAt)} at {formatTime(ping.requestedAt)}
              </Text>
            </View>
            <View style={styles.statusContainer}>
              {getStatusIcon(ping.status)}
              <Text style={[
                styles.statusText,
                ping.status === 'acknowledged' && styles.successText,
                ping.status === 'failed' && styles.errorText,
                ping.status === 'pending' && styles.warningText,
              ]}>
                {getStatusText(ping.status)}
              </Text>
            </View>
          </View>

          {ping.message && (
            <Text style={styles.pingMessage}>{ping.message}</Text>
          )}

          {ping.response && (
            <View style={styles.responseContainer}>
              <Text style={styles.responseTitle}>Response:</Text>
              <Text style={styles.responseTime}>
                Acknowledged at {formatTime(ping.response.timestamp)}
              </Text>
              
              {ping.response.location && (
                <View style={styles.locationContainer}>
                  <MapPin size={14} color={Colors.success} />
                  <Text style={styles.locationText}>
                    Location shared: {ping.response.location.latitude.toFixed(4)}, {ping.response.location.longitude.toFixed(4)}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  pingCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.androidRipple,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pingInfo: {
    flex: 1,
  },
  pingType: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  pingDate: {
    fontSize: 12,
    color: Colors.textLight,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textLight,
  },
  successText: {
    color: Colors.success,
  },
  errorText: {
    color: Colors.error,
  },
  warningText: {
    color: Colors.warning,
  },
  pingMessage: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  responseContainer: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  responseTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  responseTime: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    color: Colors.success,
    flex: 1,
  },
});

export default DevicePingHistory;
