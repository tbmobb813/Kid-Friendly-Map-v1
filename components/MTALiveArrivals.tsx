import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {
  Train,
  Bus,
  Clock,
  MapPin,
  AlertTriangle,
  Info,
  RefreshCw,
  Star,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { subwayLineColors } from '@/config/transit-data/mta-subway-lines';

type MTALiveArrivalsProps = {
  stationId?: string;
  stationName?: string;
  stationType: 'subway' | 'bus';
  userLocation?: { lat: number; lng: number };
};

type ArrivalInfo = {
  id: string;
  route: string;
  destination: string;
  direction: string;
  arrivalTime: number; // minutes
  status: 'on-time' | 'delayed' | 'approaching';
  track?: string;
  kidNote?: string;
  delayReason?: string;
};

type StationAlert = {
  id: string;
  type: 'delay' | 'service-change' | 'information';
  message: string;
  kidFriendlyMessage?: string;
  severity: 'low' | 'medium' | 'high';
  affectedRoutes: string[];
};

const MTALiveArrivals: React.FC<MTALiveArrivalsProps> = ({
  stationId = 'times-sq-42',
  stationName = 'Times Sq-42nd St',
  stationType,
  userLocation,
}) => {
  const [arrivals, setArrivals] = useState<ArrivalInfo[]>([]);
  const [alerts, setAlerts] = useState<StationAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [favoriteRoutes, setFavoriteRoutes] = useState<string[]>([]);

  // Mock data - in real app, this would fetch from MTA APIs
  const mockSubwayArrivals: ArrivalInfo[] = [
    {
      id: '1',
      route: '1',
      destination: 'South Ferry',
      direction: 'Downtown',
      arrivalTime: 2,
      status: 'approaching',
      track: '1',
      kidNote: 'Train to downtown Manhattan and the Statue of Liberty!',
    },
    {
      id: '2',
      route: 'N',
      destination: 'Coney Island',
      direction: 'Brooklyn-bound',
      arrivalTime: 4,
      status: 'on-time',
      track: '4',
      kidNote: 'Train to the beach and amusement park!',
    },
    {
      id: '3',
      route: 'Q',
      destination: '96th St',
      direction: 'Uptown',
      arrivalTime: 6,
      status: 'on-time',
      track: '3',
      kidNote: 'Train to the Upper East Side',
    },
    {
      id: '4',
      route: '4',
      destination: 'Woodlawn',
      direction: 'Uptown',
      arrivalTime: 8,
      status: 'delayed',
      track: '2',
      kidNote: 'Express train to the Bronx',
      delayReason: 'Signal problems ahead',
    },
    {
      id: '5',
      route: '7',
      destination: 'Flushing',
      direction: 'Queens-bound',
      arrivalTime: 10,
      status: 'on-time',
      track: '5',
      kidNote: 'Train to amazing food in Queens!',
    },
  ];

  const mockBusArrivals: ArrivalInfo[] = [
    {
      id: '1',
      route: 'M42',
      destination: 'UN/1st Av',
      direction: 'Eastbound',
      arrivalTime: 3,
      status: 'on-time',
      kidNote: 'Bus across 42nd Street to the United Nations',
    },
    {
      id: '2',
      route: 'M42',
      destination: 'Port Authority',
      direction: 'Westbound',
      arrivalTime: 7,
      status: 'on-time',
      kidNote: 'Bus to the big bus terminal',
    },
    {
      id: '3',
      route: 'M104',
      destination: '42nd St/Broadway',
      direction: 'Southbound',
      arrivalTime: 5,
      status: 'delayed',
      delayReason: 'Heavy traffic',
    },
  ];

  const mockAlerts: StationAlert[] = [
    {
      id: '1',
      type: 'information',
      severity: 'low',
      message: 'Elevator service normal',
      kidFriendlyMessage: 'Good news! The elevator is working for people who need it 🛗',
      affectedRoutes: ['ALL'],
    },
    {
      id: '2',
      type: 'delay',
      severity: 'medium',
      message: 'Minor delays on 4, 5, 6 lines due to signal problems',
      kidFriendlyMessage: 'Some trains might be a little late because of signal problems 🚦',
      affectedRoutes: ['4', '5', '6'],
    },
  ];

  useEffect(() => {
    loadArrivals();
    const interval = setInterval(loadArrivals, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [stationId, stationType]);

  const loadArrivals = async () => {
    try {
      setLoading(true);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Use mock data based on station type
      const mockData = stationType === 'subway' ? mockSubwayArrivals : mockBusArrivals;
      setArrivals(mockData);
      setAlerts(mockAlerts);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load arrivals:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadArrivals();
  };

  const toggleFavoriteRoute = (route: string) => {
    setFavoriteRoutes((prev) =>
      prev.includes(route) ? prev.filter((r) => r !== route) : [...prev, route],
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approaching':
        return <Train size={16} color="#4CAF50" />;
      case 'delayed':
        return <AlertTriangle size={16} color="#FF9800" />;
      default:
        return <Clock size={16} color="#2196F3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approaching':
        return '#4CAF50';
      case 'delayed':
        return '#FF9800';
      default:
        return '#2196F3';
    }
  };

  const getRouteColor = (route: string) => {
    return subwayLineColors[route] || Colors.primary;
  };

  const formatArrivalTime = (minutes: number) => {
    if (minutes <= 1) return 'Arriving';
    if (minutes <= 2) return '2 min';
    return `${minutes} min`;
  };

  const renderArrivalCard = (arrival: ArrivalInfo) => (
    <View key={arrival.id} style={styles.arrivalCard}>
      <View style={styles.arrivalHeader}>
        <View style={styles.routeInfo}>
          {stationType === 'subway' ? (
            <View
              style={[styles.routeIndicator, { backgroundColor: getRouteColor(arrival.route) }]}
            >
              <Text style={styles.routeText}>{arrival.route}</Text>
            </View>
          ) : (
            <View style={styles.busRouteIndicator}>
              <Bus size={16} color={Colors.primary} />
              <Text style={styles.busRouteText}>{arrival.route}</Text>
            </View>
          )}

          <View style={styles.destinationInfo}>
            <Text style={styles.destinationText}>{arrival.destination}</Text>
            <Text style={styles.directionText}>{arrival.direction}</Text>
            {arrival.track && <Text style={styles.trackText}>Track {arrival.track}</Text>}
          </View>
        </View>

        <View style={styles.arrivalInfo}>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => toggleFavoriteRoute(arrival.route)}
          >
            <Star
              size={16}
              color={favoriteRoutes.includes(arrival.route) ? '#FFD700' : '#CCCCCC'}
              fill={favoriteRoutes.includes(arrival.route) ? '#FFD700' : 'none'}
            />
          </TouchableOpacity>

          <View style={styles.timeContainer}>
            {getStatusIcon(arrival.status)}
            <Text style={[styles.arrivalTime, { color: getStatusColor(arrival.status) }]}>
              {formatArrivalTime(arrival.arrivalTime)}
            </Text>
          </View>
        </View>
      </View>

      {arrival.kidNote && (
        <View style={styles.kidNoteContainer}>
          <Info size={14} color="#4CAF50" />
          <Text style={styles.kidNoteText}>{arrival.kidNote}</Text>
        </View>
      )}

      {arrival.delayReason && (
        <View style={styles.delayContainer}>
          <AlertTriangle size={14} color="#FF9800" />
          <Text style={styles.delayText}>{arrival.delayReason}</Text>
        </View>
      )}
    </View>
  );

  const renderAlert = (alert: StationAlert) => (
    <View
      key={alert.id}
      style={[
        styles.alertCard,
        styles[`alert${alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}`],
      ]}
    >
      <View style={styles.alertHeader}>
        <AlertTriangle size={16} color={alert.severity === 'high' ? '#F44336' : '#FF9800'} />
        <Text style={styles.alertTitle}>
          {alert.type === 'delay'
            ? 'Service Delay'
            : alert.type === 'service-change'
              ? 'Service Change'
              : 'Information'}
        </Text>
      </View>

      <Text style={styles.alertMessage}>{alert.kidFriendlyMessage || alert.message}</Text>

      {alert.affectedRoutes.length > 0 && alert.affectedRoutes[0] !== 'ALL' && (
        <View style={styles.affectedRoutes}>
          <Text style={styles.affectedRoutesLabel}>Affected lines: </Text>
          {alert.affectedRoutes.map((route) => (
            <View
              key={route}
              style={[styles.affectedRouteTag, { backgroundColor: getRouteColor(route) }]}
            >
              <Text style={styles.affectedRouteText}>{route}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading live arrivals...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.stationInfo}>
          {stationType === 'subway' ? (
            <Train size={24} color={Colors.primary} />
          ) : (
            <Bus size={24} color={Colors.primary} />
          )}
          <View style={styles.stationDetails}>
            <Text style={styles.stationName}>{stationName}</Text>
            <Text style={styles.stationType}>
              {stationType === 'subway' ? 'Subway Station' : 'Bus Stop'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh} disabled={refreshing}>
          <RefreshCw
            size={20}
            color={refreshing ? '#CCCCCC' : Colors.primary}
            style={refreshing ? { transform: [{ rotate: '180deg' }] } : {}}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.lastUpdated}>Last updated: {lastUpdated.toLocaleTimeString()}</Text>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {alerts.length > 0 && (
          <View style={styles.alertsSection}>
            <Text style={styles.sectionTitle}>Service Alerts 🚨</Text>
            {alerts.map(renderAlert)}
          </View>
        )}

        <View style={styles.arrivalsSection}>
          <Text style={styles.sectionTitle}>
            Next {stationType === 'subway' ? 'Trains' : 'Buses'} 🚇
          </Text>

          {arrivals.length === 0 ? (
            <View style={styles.noArrivalsContainer}>
              <MapPin size={48} color="#CCCCCC" />
              <Text style={styles.noArrivalsText}>
                No arrivals found for this {stationType === 'subway' ? 'station' : 'stop'}
              </Text>
            </View>
          ) : (
            arrivals.map(renderArrivalCard)
          )}
        </View>

        <View style={styles.kidTipsSection}>
          <Text style={styles.sectionTitle}>Kid Tips 💡</Text>
          <View style={styles.tipCard}>
            <Info size={16} color="#4CAF50" />
            <Text style={styles.tipText}>
              {stationType === 'subway'
                ? "Watch for the train's destination on the front - make sure it's going where you want!"
                : 'Look for the bus number on the front and side - each route has its own number!'}
            </Text>
          </View>
          <View style={styles.tipCard}>
            <Clock size={16} color="#2196F3" />
            <Text style={styles.tipText}>
              Times shown are estimates - trains and buses might arrive a little earlier or later!
            </Text>
          </View>
        </View>
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
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  stationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stationDetails: {
    marginLeft: 12,
  },
  stationName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  stationType: {
    fontSize: 14,
    color: Colors.textLight,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
  },
  lastUpdated: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 20,
    marginBottom: 12,
  },
  alertsSection: {
    marginBottom: 8,
  },
  alertCard: {
    backgroundColor: '#FFF8E1',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  alertMedium: {
    backgroundColor: '#FFF3E0',
    borderLeftColor: '#FF9800',
  },
  alertHigh: {
    backgroundColor: '#FFEBEE',
    borderLeftColor: '#F44336',
  },
  alertLow: {
    backgroundColor: '#E8F5E8',
    borderLeftColor: '#4CAF50',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  alertMessage: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  affectedRoutes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  affectedRoutesLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginRight: 8,
  },
  affectedRouteTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  affectedRouteText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  arrivalsSection: {
    marginBottom: 8,
  },
  arrivalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  arrivalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  routeIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  routeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  busRouteIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  busRouteText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 4,
  },
  destinationInfo: {
    flex: 1,
  },
  destinationText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  directionText: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 2,
  },
  trackText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  arrivalInfo: {
    alignItems: 'flex-end',
  },
  favoriteButton: {
    padding: 4,
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrivalTime: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 6,
  },
  kidNoteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  kidNoteText: {
    fontSize: 13,
    color: '#2E7D32',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  delayContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  delayText: {
    fontSize: 13,
    color: '#E65100',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  noArrivalsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noArrivalsText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 22,
  },
  kidTipsSection: {
    marginBottom: 32,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: Colors.text,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
});

export default MTALiveArrivals;
