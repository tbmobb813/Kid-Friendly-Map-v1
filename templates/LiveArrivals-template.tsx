/**
 * Live Arrivals Component Template
 *
 * This template provides a starting point for creating live arrival components
 * for any city's transit system. Based on the MTA Live Arrivals component
 * but adaptable to any transit system worldwide.
 *
 * INSTRUCTIONS:
 * 1. Copy this file to components/YourCityLiveArrivals.tsx (e.g., LondonLiveArrivals.tsx)
 * 2. Replace all "REPLACE_" placeholders with your city's information
 * 3. Update API endpoints and data structure to match your transit feed
 * 4. Customize colors and styling to match your transit authority's branding
 * 5. Adjust time formats and display logic for local conventions
 * 6. Update line colors and identifiers to match your system
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import {
  Train,
  Bus,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from 'lucide-react-native';
import Colors from '@/constants/colors';

type ArrivalPrediction = {
  id: string;
  lineId: string;
  lineName: string;
  lineColor: string;
  direction: string;
  destination: string;
  arrivalTime: number; // minutes until arrival
  isRealTime: boolean;
  vehicleType: 'train' | 'bus' | 'tram' | 'ferry';
  accessibility?: {
    wheelchairAccessible: boolean;
    audioAnnouncements: boolean;
  };
};

type Station = {
  id: string;
  name: string;
  type: 'rail' | 'bus' | 'tram' | 'ferry';
  lines: string[];
  accessibility?: {
    elevators: boolean;
    wheelchairAccessible: boolean;
    tactilePaving: boolean;
  };
};

type YourCityLiveArrivalsProps = {
  stationId?: string;
  maxArrivals?: number;
  showEducationalTips?: boolean;
};

const YourCityLiveArrivals: React.FC<YourCityLiveArrivalsProps> = ({
  stationId,
  maxArrivals = 10,
  showEducationalTips = true,
}) => {
  const [arrivals, setArrivals] = useState<ArrivalPrediction[]>([]);
  const [station, setStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (stationId) {
      fetchArrivals();
      const interval = setInterval(fetchArrivals, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [stationId]);

  const fetchArrivals = async () => {
    if (!stationId) return;

    try {
      setError(null);

      // Replace with your city's transit API endpoint
      const response = await fetch(`REPLACE_API_BASE_URL/arrivals/${stationId}`);

      if (!response.ok) {
        throw new Error(`REPLACE_ERROR_MESSAGE: ${response.status}`);
      }

      const data = await response.json();

      // Transform the API response to match our ArrivalPrediction type
      // This structure will need to be updated based on your API format
      const transformedArrivals: ArrivalPrediction[] =
        data.arrivals?.map((arrival: any) => ({
          id: arrival.REPLACE_ID_FIELD,
          lineId: arrival.REPLACE_LINE_ID_FIELD,
          lineName: arrival.REPLACE_LINE_NAME_FIELD,
          lineColor: arrival.REPLACE_LINE_COLOR_FIELD || '#000000',
          direction: arrival.REPLACE_DIRECTION_FIELD,
          destination: arrival.REPLACE_DESTINATION_FIELD,
          arrivalTime: Math.round(
            (new Date(arrival.REPLACE_TIME_FIELD).getTime() - Date.now()) / 60000,
          ),
          isRealTime: arrival.REPLACE_REALTIME_FIELD !== false,
          vehicleType: arrival.REPLACE_VEHICLE_TYPE_FIELD || 'train',
          accessibility: {
            wheelchairAccessible: arrival.REPLACE_WHEELCHAIR_FIELD === true,
            audioAnnouncements: arrival.REPLACE_AUDIO_FIELD === true,
          },
        })) || [];

      const stationInfo: Station = {
        id: data.station?.REPLACE_STATION_ID_FIELD || stationId,
        name: data.station?.REPLACE_STATION_NAME_FIELD || 'Unknown Station',
        type: data.station?.REPLACE_STATION_TYPE_FIELD || 'rail',
        lines: data.station?.REPLACE_LINES_FIELD || [],
        accessibility: {
          elevators: data.station?.REPLACE_ELEVATORS_FIELD === true,
          wheelchairAccessible: data.station?.REPLACE_ACCESSIBLE_FIELD === true,
          tactilePaving: data.station?.REPLACE_TACTILE_FIELD === true,
        },
      };

      setArrivals(transformedArrivals.slice(0, maxArrivals));
      setStation(stationInfo);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'REPLACE_GENERIC_ERROR_MESSAGE');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchArrivals();
  };

  const getVehicleIcon = (type: string, size: number = 16) => {
    switch (type) {
      case 'bus':
        return <Bus size={size} color="#666666" />;
      case 'tram':
        return <Train size={size} color="#666666" />;
      case 'ferry':
        return <MapPin size={size} color="#666666" />;
      default:
        return <Train size={size} color="#666666" />;
    }
  };

  const formatArrivalTime = (minutes: number): string => {
    if (minutes <= 0) return 'REPLACE_NOW_TEXT'; // e.g., "Now", "Arriving", "Here"
    if (minutes === 1) return 'REPLACE_ONE_MINUTE_TEXT'; // e.g., "1 min", "1 minute"
    if (minutes < 60) return `REPLACE_MINUTES_FORMAT`; // e.g., `${minutes} min`, `${minutes} minutes`

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours === 1 && remainingMinutes === 0) return 'REPLACE_ONE_HOUR_TEXT'; // e.g., "1 hour"
    if (remainingMinutes === 0) return `REPLACE_HOURS_FORMAT`; // e.g., `${hours} hours`
    return `REPLACE_HOUR_MINUTE_FORMAT`; // e.g., `${hours}h ${remainingMinutes}m`
  };

  const getArrivalUrgency = (minutes: number): 'urgent' | 'soon' | 'normal' => {
    if (minutes <= 2) return 'urgent';
    if (minutes <= 5) return 'soon';
    return 'normal';
  };

  const renderArrivalCard = (arrival: ArrivalPrediction) => {
    const urgency = getArrivalUrgency(arrival.arrivalTime);

    return (
      <View key={arrival.id} style={[styles.arrivalCard, styles[`${urgency}Card`]]}>
        <View style={styles.arrivalHeader}>
          <View style={styles.lineInfo}>
            <View style={[styles.lineIndicator, { backgroundColor: arrival.lineColor }]}>
              <Text style={styles.lineText}>{arrival.lineId}</Text>
            </View>
            <View style={styles.routeInfo}>
              <Text style={styles.lineName}>{arrival.lineName}</Text>
              <Text style={styles.destination}>
                REPLACE_TO_PREFIX {arrival.destination}
                {/* e.g., "to", "towards", "→" */}
              </Text>
            </View>
          </View>

          <View style={styles.arrivalTime}>
            <Text style={[styles.timeText, styles[`${urgency}TimeText`]]}>
              {formatArrivalTime(arrival.arrivalTime)}
            </Text>
            <View style={styles.arrivalMeta}>
              {getVehicleIcon(arrival.vehicleType, 12)}
              {arrival.isRealTime ? (
                <CheckCircle size={12} color="#4CAF50" />
              ) : (
                <Clock size={12} color="#FF9800" />
              )}
            </View>
          </View>
        </View>

        {arrival.accessibility && (
          <View style={styles.accessibilityInfo}>
            {arrival.accessibility.wheelchairAccessible && (
              <Text style={styles.accessibilityTag}>REPLACE_WHEELCHAIR_TAG</Text>
            )}
            {arrival.accessibility.audioAnnouncements && (
              <Text style={styles.accessibilityTag}>REPLACE_AUDIO_TAG</Text>
            )}
          </View>
        )}

        {showEducationalTips && arrival.arrivalTime <= 5 && (
          <View style={styles.educationalTip}>
            <Text style={styles.tipText}>
              {
                arrival.arrivalTime <= 1
                  ? 'REPLACE_URGENT_TIP' // e.g., "Get ready! The train is almost here!"
                  : 'REPLACE_SOON_TIP' // e.g., "Start heading to the platform!"
              }
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderStationInfo = () => {
    if (!station) return null;

    return (
      <View style={styles.stationInfo}>
        <View style={styles.stationHeader}>
          {getVehicleIcon(station.type, 20)}
          <Text style={styles.stationName}>{station.name}</Text>
        </View>

        {station.accessibility && (
          <View style={styles.stationAccessibility}>
            {station.accessibility.elevators && (
              <Text style={styles.accessibilityFeature}>REPLACE_ELEVATOR_TEXT</Text>
            )}
            {station.accessibility.wheelchairAccessible && (
              <Text style={styles.accessibilityFeature}>REPLACE_WHEELCHAIR_ACCESSIBLE_TEXT</Text>
            )}
            {station.accessibility.tactilePaving && (
              <Text style={styles.accessibilityFeature}>REPLACE_TACTILE_TEXT</Text>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderEducationalContent = () => {
    if (!showEducationalTips) return null;

    return (
      <View style={styles.educationalContent}>
        <Text style={styles.educationalTitle}>REPLACE_EDUCATIONAL_TITLE</Text>
        <View style={styles.educationalTips}>
          <View style={styles.tip}>
            <CheckCircle size={16} color="#4CAF50" />
            <Text style={styles.tipLabel}>REPLACE_REALTIME_LABEL</Text>
            <Text style={styles.tipDescription}>REPLACE_REALTIME_DESCRIPTION</Text>
          </View>
          <View style={styles.tip}>
            <Clock size={16} color="#FF9800" />
            <Text style={styles.tipLabel}>REPLACE_SCHEDULED_LABEL</Text>
            <Text style={styles.tipDescription}>REPLACE_SCHEDULED_DESCRIPTION</Text>
          </View>
          <View style={styles.tip}>
            <AlertTriangle size={16} color="#F44336" />
            <Text style={styles.tipLabel}>REPLACE_URGENT_LABEL</Text>
            <Text style={styles.tipDescription}>REPLACE_URGENT_DESCRIPTION</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <RefreshCw size={32} color={Colors.primary} />
        <Text style={styles.loadingText}>REPLACE_LOADING_TEXT</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <AlertTriangle size={32} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchArrivals}>
          <Text style={styles.retryButtonText}>REPLACE_RETRY_TEXT</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderStationInfo()}

      <ScrollView
        style={styles.arrivalsList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {arrivals.length === 0 ? (
          <View style={styles.emptyState}>
            <Train size={48} color="#CCCCCC" />
            <Text style={styles.emptyStateText}>REPLACE_NO_ARRIVALS_TEXT</Text>
            <Text style={styles.emptyStateSubtext}>REPLACE_NO_ARRIVALS_SUBTEXT</Text>
          </View>
        ) : (
          <>
            <View style={styles.arrivalsHeader}>
              <Text style={styles.arrivalsTitle}>REPLACE_ARRIVALS_TITLE</Text>
              {lastUpdated && (
                <Text style={styles.lastUpdated}>
                  REPLACE_UPDATED_PREFIX {lastUpdated.toLocaleTimeString()}
                </Text>
              )}
            </View>

            {arrivals.map(renderArrivalCard)}
          </>
        )}

        {renderEducationalContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  stationInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  stationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stationName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 8,
  },
  stationAccessibility: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  accessibilityFeature: {
    fontSize: 12,
    color: '#4CAF50',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  arrivalsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  arrivalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  arrivalsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  lastUpdated: {
    fontSize: 12,
    color: Colors.textLight,
  },
  arrivalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  normalCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#E0E0E0',
  },
  soonCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    backgroundColor: '#FFF8E1',
  },
  urgentCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  arrivalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  lineInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  lineIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lineText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  routeInfo: {
    flex: 1,
  },
  lineName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  destination: {
    fontSize: 13,
    color: Colors.textLight,
  },
  arrivalTime: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  normalTimeText: {
    color: Colors.text,
  },
  soonTimeText: {
    color: '#FF9800',
  },
  urgentTimeText: {
    color: '#F44336',
  },
  arrivalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  accessibilityInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  accessibilityTag: {
    fontSize: 10,
    color: '#4CAF50',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  educationalTip: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 6,
  },
  tipText: {
    fontSize: 12,
    color: '#1976D2',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textLight,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
    textAlign: 'center',
  },
  educationalContent: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 20,
  },
  educationalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  educationalTips: {
    gap: 12,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  tipLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    minWidth: 60,
  },
  tipDescription: {
    fontSize: 12,
    color: Colors.textLight,
    flex: 1,
    lineHeight: 16,
  },
});

export default YourCityLiveArrivals;

/*
 * CUSTOMIZATION CHECKLIST:
 *
 * □ Replace component name: YourCityLiveArrivals -> LondonLiveArrivals, TokyoLiveArrivals, etc.
 * □ Update API endpoint: REPLACE_API_BASE_URL
 * □ Map API response fields to match your transit feed structure
 * □ Customize text labels for your language/locale
 * □ Update time formatting for local conventions
 * □ Adjust vehicle types for your transit system (add tram, ferry, etc.)
 * □ Customize accessibility features for your system
 * □ Update color scheme to match your transit authority's branding
 * □ Add error handling specific to your API
 * □ Test with real transit data to ensure accuracy
 * □ Add any city-specific educational tips
 */
