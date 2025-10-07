import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, Text, View, FlatList, Pressable } from 'react-native';
import Colors from '@/constants/colors';
import TransitStepIndicator from './TransitStepIndicator';
import { Clock, MapPin, RefreshCw, Bell, AlertCircle } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { transitApi, handleApiError } from '@/utils/api';

export type LiveArrival = {
  id: string;
  line: string;
  color: string;
  destination: string;
  arrivalTime: number; // minutes
  platform?: string;
  type: 'subway' | 'train' | 'bus';
};

type LiveArrivalsCardProps = {
  stationName: string;
  stationId: string;
  arrivals?: LiveArrival[]; // Optional for backward compatibility
  lastUpdated?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  enablePolling?: boolean;
};

const LiveArrivalsCard: React.FC<LiveArrivalsCardProps> = ({
  stationName,
  stationId,
  arrivals: propArrivals,
  lastUpdated,
  onRefresh,
  isRefreshing = false,
  enablePolling = true,
}) => {
  const [alertedArrivals, setAlertedArrivals] = useState<Set<string>>(new Set());

  // Fetch live arrivals from API
  const arrivalsQuery = useQuery({
    queryKey: ['liveArrivals', stationId],
    queryFn: async () => {
      try {
        const response = await transitApi.getLiveArrivals(stationId);
        if (!response.success) {
          throw new Error(response.message || 'Failed to fetch arrivals');
        }
        return response.data as LiveArrival[];
      } catch (error) {
        const errorInfo = handleApiError(error);
        throw new Error(errorInfo.message);
      }
    },
    refetchInterval: enablePolling ? 30000 : false, // Poll every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
    retry: (failureCount, error) => {
      // Don't retry on client errors
      if (error instanceof Error && error.message.includes('HTTP 4')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  // Use API data or fallback to prop data
  const arrivals = useMemo(() => {
    return arrivalsQuery.data || propArrivals || [];
  }, [arrivalsQuery.data, propArrivals]);
  const actualLastUpdated =
    lastUpdated ||
    (arrivalsQuery.dataUpdatedAt
      ? new Date(arrivalsQuery.dataUpdatedAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Unknown');
  const actualIsRefreshing = isRefreshing || arrivalsQuery.isFetching;

  // Alert for trains arriving soon
  useEffect(() => {
    arrivals.forEach((arrival) => {
      if (arrival.arrivalTime <= 1 && !alertedArrivals.has(arrival.id)) {
        setAlertedArrivals((prev) => new Set([...prev, arrival.id]));
      }
    });
  }, [arrivals]);

  // Handle manual refresh
  const handleRefresh = () => {
    arrivalsQuery.refetch();
    onRefresh?.();
  };

  const getArrivalTimeColor = (minutes: number) => {
    if (minutes === 0) return Colors.error;
    if (minutes <= 2) return Colors.warning;
    return Colors.primary;
  };

  const getArrivalTimeText = (minutes: number) => {
    if (minutes === 0) return 'Arriving';
    if (minutes === 1) return '1 min';
    return `${minutes} min`;
  };

  const renderArrival = ({ item }: { item: LiveArrival }) => (
    <View style={[styles.arrivalItem, item.arrivalTime <= 1 && styles.urgentArrival]}>
      <TransitStepIndicator
        step={{
          id: item.id,
          type: item.type,
          line: item.line,
          color: item.color,
          from: '',
          to: '',
          duration: 0,
        }}
        size="medium"
      />
      <View style={styles.arrivalInfo}>
        <Text style={styles.destinationText} numberOfLines={1}>
          {item.destination}
        </Text>
        {item.platform && <Text style={styles.platformText}>Platform {item.platform}</Text>}
      </View>
      <View style={styles.timeContainer}>
        {item.arrivalTime <= 1 && (
          <Bell size={14} color={Colors.warning} style={styles.alertIcon} />
        )}
        <Text style={[styles.arrivalTime, { color: getArrivalTimeColor(item.arrivalTime) }]}>
          {getArrivalTimeText(item.arrivalTime)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.stationInfo}>
          <MapPin size={20} color={Colors.primary} style={styles.stationIcon} />
          <Text style={styles.stationName}>{stationName}</Text>
        </View>
        <View style={styles.headerActions}>
          <View style={styles.updateInfo}>
            <Clock size={14} color={Colors.textLight} />
            <Text style={styles.updateText}>{actualLastUpdated}</Text>
            {arrivalsQuery.isError && (
              <AlertCircle size={14} color={Colors.error} style={{ marginLeft: 4 }} />
            )}
          </View>
          <Pressable
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={actualIsRefreshing}
          >
            <RefreshCw
              size={16}
              color={Colors.primary}
              style={[styles.refreshIcon, actualIsRefreshing && styles.spinning]}
            />
          </Pressable>
        </View>
      </View>

      {arrivalsQuery.isError ? (
        <View style={styles.errorState}>
          <AlertCircle size={24} color={Colors.error} />
          <Text style={styles.errorText}>
            {arrivalsQuery.error instanceof Error
              ? arrivalsQuery.error.message
              : 'Failed to load arrivals'}
          </Text>
          <Pressable style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryText}>Try Again</Text>
          </Pressable>
        </View>
      ) : arrivals.length > 0 ? (
        <FlatList
          data={arrivals.sort((a, b) => a.arrivalTime - b.arrivalTime)}
          renderItem={renderArrival}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.arrivalsList}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            {arrivalsQuery.isLoading ? 'Loading arrivals...' : 'No arrivals scheduled'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  stationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stationIcon: {
    marginRight: 8,
  },
  stationName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  updateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  updateText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 4,
  },
  refreshButton: {
    padding: 4,
  },
  refreshIcon: {
    // Add spinning animation styles if needed
  },
  spinning: {
    // Animation styles for spinning refresh icon
  },
  arrivalsList: {
    gap: 8,
  },
  arrivalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  urgentArrival: {
    backgroundColor: '#FFF9E6',
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  arrivalInfo: {
    flex: 1,
    marginLeft: 12,
  },
  destinationText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  platformText: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '500',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  alertIcon: {
    // Alert icon styles
  },
  arrivalTime: {
    fontSize: 16,
    fontWeight: '700',
    minWidth: 50,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  errorState: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LiveArrivalsCard;
