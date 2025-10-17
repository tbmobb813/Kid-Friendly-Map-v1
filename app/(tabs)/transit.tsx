import React, { useState, useEffect } from 'react';
import type { TextStyle } from 'react-native';
import { StyleSheet, Text, View, ScrollView, Pressable, Dimensions, Platform, Switch } from 'react-native';
import globalStyles from '../../styles'; // Use globalStyles for shared styles

// TODO: Move any shared/reusable styles to styles.ts and use globalStyles
import Colors from '@/constants/colors';
import { subwayLines } from '@/mocks/transit';
import SearchBar from '@/components/SearchBar';
import { Clock, MapPin, AlertCircle, Bell } from 'lucide-react-native';
import LiveArrivalsCard from '@/components/LiveArrivalsCard';
import { mockLiveArrivals, nearbyStations } from '@/mocks/liveArrivals';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type SubwayStatus = {
  id: string;
  name: string;
  status: string;
  message: string;
};

export default function TransitScreen() {
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLine, setSelectedLine] = useState<string | null>(null);
  const [selectedStation, setSelectedStation] = useState<string | null>('main-st-station');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Auto-refresh arrivals every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefreshArrivals();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefreshArrivals = () => {
    setIsRefreshing(true);
    setLastRefresh(new Date());

    // Simulate API call delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds} sec ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min ago`;
  };

  // Mock subway status data
  const subwayStatus: SubwayStatus[] = [
    { id: 'a', name: 'A', status: 'normal', message: 'Good service' },
    { id: 'b', name: 'B', status: 'delayed', message: 'Delays of 10-15 minutes' },
    { id: 'c', name: 'C', status: 'normal', message: 'Good service' },
    { id: 'd', name: 'D', status: 'normal', message: 'Good service' },
    { id: 'e', name: 'E', status: 'alert', message: 'Service changes this weekend' },
    { id: 'f', name: 'F', status: 'normal', message: 'Good service' },
    { id: 'g', name: 'G', status: 'normal', message: 'Good service' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return Colors.success;
      case 'delayed':
        return Colors.warning;
      case 'alert':
        return Colors.error;
      default:
        return Colors.textLight;
    }
  };

  const renderStationButton = (station: (typeof nearbyStations)[0]) => (
    <Pressable
      key={station.id}
      style={[styles.stationButton, selectedStation === station.id && styles.selectedStationButton]}
      onPress={() => setSelectedStation(station.id)}
    >
      <Text
        style={[
          styles.stationButtonText,
          selectedStation === station.id && styles.selectedStationButtonText,
        ]}
      >
        {station.name}
      </Text>
      <Text style={styles.stationDistance}>{station.distance}</Text>
    </Pressable>
  );

  const renderLineItem = (item: (typeof subwayLines)[0]) => {
    const status = subwayStatus.find((s) => s.id === item.id);

    return (
      <Pressable
        key={item.id}
        style={[styles.lineItem, selectedLine === item.id && styles.selectedLine]}
        onPress={() => setSelectedLine(item.id)}
      >
        <View style={[styles.lineCircle, { backgroundColor: item.color }]}>
          <Text style={styles.lineText}>{item.name}</Text>
        </View>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(status?.status || 'normal') },
            ]}
          />
          <Text style={styles.statusText}>{status?.message || 'No information available'}</Text>
        </View>
      </Pressable>
    );
  };

  // Dynamic styles for accessibility
  const dynamicStyles: Record<string, TextStyle> = {
    sectionTitle: {
      fontSize: largeText ? 24 : 18,
      fontWeight: (largeText ? '700' : '600') as TextStyle['fontWeight'],
      color: highContrast ? '#000' : Colors.text,
      marginBottom: 16,
    },
    lineText: {
      color: '#FFFFFF',
      fontSize: largeText ? 20 : 16,
      fontWeight: '700' as TextStyle['fontWeight'],
    },
    statusText: {
      fontSize: largeText ? 18 : 14,
      color: highContrast ? '#000' : Colors.text,
    },
    detailsTitle: {
      fontSize: largeText ? 20 : 16,
      fontWeight: '600' as TextStyle['fontWeight'],
      color: highContrast ? '#000' : Colors.text,
      marginBottom: 12,
    },
    trainTimeText: {
      fontSize: largeText ? 20 : 16,
      fontWeight: '700' as TextStyle['fontWeight'],
      color: highContrast ? '#000' : Colors.primary,
      marginBottom: 4,
    },
    trainDirectionText: {
      fontSize: largeText ? 16 : 12,
      color: highContrast ? '#000' : Colors.textLight,
    },
    stationButtonText: {
      fontSize: largeText ? 18 : 14,
      fontWeight: '600' as TextStyle['fontWeight'],
      color: highContrast ? '#000' : Colors.text,
      marginBottom: 4,
    },
    quickActionText: {
      fontSize: largeText ? 16 : 12,
      fontWeight: '600' as TextStyle['fontWeight'],
      color: highContrast ? '#000' : Colors.text,
      textAlign: 'center',
    },
    alertText: {
      flex: 1,
      fontSize: largeText ? 18 : 14,
      color: highContrast ? '#000' : Colors.text,
    },
    timeText: {
      fontSize: largeText ? 16 : 12,
      color: highContrast ? '#000' : Colors.textLight,
      marginLeft: 4,
    },
    stationDistance: {
      fontSize: largeText ? 16 : 12,
      color: highContrast ? '#000' : Colors.textLight,
    },
  };

  // Friendly alert/status messages
  const friendlyStatusMessage = (msg: string) => {
    if (msg.includes('Delays')) return 'Trains are running a bit late.';
    if (msg.includes('Service changes')) return 'Trains are taking a new path this weekend!';
    if (msg.includes('Good service')) return 'Trains are running smoothly!';
    return msg;
  };

  return (
    <ScrollView
      style={[styles.container, highContrast && { backgroundColor: '#FFF' }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      bounces={true}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={dynamicStyles.sectionTitle}>A+</Text>
          <Switch value={largeText} onValueChange={setLargeText} accessibilityLabel="Large Text" />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={dynamicStyles.sectionTitle}>🌙</Text>
          <Switch
            value={highContrast}
            onValueChange={setHighContrast}
            accessibilityLabel="High Contrast"
          />
        </View>
      </View>
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Search for subway or train lines"
        />
      </View>

      <Text style={dynamicStyles.sectionTitle}>Live Arrivals</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.stationsScroll}
        contentContainerStyle={styles.stationsContainer}
      >
        {nearbyStations.map((station) => (
          <Pressable
            key={station.id}
            style={[
              styles.stationButton,
              selectedStation === station.id && styles.selectedStationButton,
              highContrast && { backgroundColor: '#FFD700', borderColor: '#000' },
            ]}
            onPress={() => setSelectedStation(station.id)}
          >
            <Text
              style={[
                dynamicStyles.stationButtonText,
                selectedStation === station.id && { color: '#FFF' },
              ]}
            >
              {station.name}
            </Text>
            <Text style={dynamicStyles.stationDistance}>{station.distance}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {selectedStation && (
        <LiveArrivalsCard
          stationName={nearbyStations.find((s) => s.id === selectedStation)?.name || 'Station'}
          stationId={selectedStation}
          arrivals={mockLiveArrivals[selectedStation] || []}
          lastUpdated={getTimeAgo(lastRefresh)}
          onRefresh={handleRefreshArrivals}
          isRefreshing={isRefreshing}
        />
      )}

      <View style={styles.quickActionsContainer}>
        <Text style={dynamicStyles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <Pressable
            style={[
              styles.quickActionButton,
              highContrast && { backgroundColor: '#FFD700', borderColor: '#000' },
            ]}
          >
            <Bell size={20} color={highContrast ? '#000' : Colors.primary} />
            <Text style={dynamicStyles.quickActionText}>Set Alerts</Text>
          </Pressable>
          <Pressable
            style={[
              styles.quickActionButton,
              highContrast && { backgroundColor: '#FFD700', borderColor: '#000' },
            ]}
          >
            <MapPin size={20} color={highContrast ? '#000' : Colors.primary} />
            <Text style={dynamicStyles.quickActionText}>Find Station</Text>
          </Pressable>
          <Pressable
            style={[
              styles.quickActionButton,
              highContrast && { backgroundColor: '#FFD700', borderColor: '#000' },
            ]}
          >
            <Clock size={20} color={highContrast ? '#000' : Colors.primary} />
            <Text style={dynamicStyles.quickActionText}>Schedule</Text>
          </Pressable>
        </View>
      </View>

      <View
        style={[
          styles.statusSummaryContainer,
          highContrast && { backgroundColor: '#FFD700', borderColor: '#000' },
        ]}
      >
        <View style={styles.statusHeader}>
          <Text style={dynamicStyles.sectionTitle}>Subway Status</Text>
          <View style={styles.timeContainer}>
            <Clock size={14} color={highContrast ? '#000' : Colors.textLight} />
            <Text style={dynamicStyles.timeText}>Updated 5 min ago</Text>
          </View>
        </View>

        <View style={[styles.alertContainer, highContrast && { backgroundColor: '#FFD700' }]}>
          <AlertCircle
            size={20}
            color={highContrast ? '#000' : Colors.warning}
            style={styles.alertIcon}
          />
          <Text style={dynamicStyles.alertText}>
            Some lines are experiencing delays or service changes
          </Text>
        </View>
      </View>

      <Text style={dynamicStyles.sectionTitle}>Subway Lines</Text>
      <View style={styles.linesContainer}>
        {subwayLines.map((item) => {
          const status = subwayStatus.find((s) => s.id === item.id);
          return (
            <Pressable
              key={item.id}
              style={[
                styles.lineItem,
                selectedLine === item.id && styles.selectedLine,
                highContrast && { backgroundColor: '#FFD700', borderColor: '#000' },
              ]}
              onPress={() => setSelectedLine(item.id)}
            >
              <View style={[styles.lineCircle, { backgroundColor: item.color }]}>
                <Text style={dynamicStyles.lineText}>{item.name}</Text>
              </View>
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(status?.status || 'normal') },
                  ]}
                />
                <Text style={dynamicStyles.statusText}>
                  {friendlyStatusMessage(status?.message || 'No information available')}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {selectedLine && (
        <View
          style={[
            styles.lineDetailsContainer,
            highContrast && { backgroundColor: '#FFD700', borderColor: '#000' },
          ]}
        >
          <Text style={dynamicStyles.detailsTitle}>
            Line {subwayLines.find((l) => l.id === selectedLine)?.name} Details
          </Text>
          <View style={styles.nextTrainsContainer}>
            <Text style={styles.nextTrainsTitle}>Next trains:</Text>
            <View style={styles.trainTimesContainer}>
              <View style={styles.trainTime}>
                <Text style={dynamicStyles.trainTimeText}>3 min</Text>
                <Text style={dynamicStyles.trainDirectionText}>Uptown</Text>
              </View>
              <View style={styles.trainTime}>
                <Text style={dynamicStyles.trainTimeText}>7 min</Text>
                <Text style={dynamicStyles.trainDirectionText}>Downtown</Text>
              </View>
              <View style={styles.trainTime}>
                <Text style={dynamicStyles.trainTimeText}>12 min</Text>
                <Text style={dynamicStyles.trainDirectionText}>Uptown</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 32,
  },
  searchContainer: {
    marginBottom: 16,
  },
  statusSummaryContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 4,
  },
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    padding: 12,
  },
  alertIcon: {
    marginRight: 8,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  linesContainer: {
    gap: 12,
    marginBottom: 16,
  },
  lineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  selectedLine: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  lineCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  lineText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  statusContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: Colors.text,
  },
  lineDetailsContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  nextTrainsContainer: {
    marginTop: 8,
  },
  nextTrainsTitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
  },
  trainTimesContainer: {
    flexDirection: Platform.select({
      web: screenWidth > 600 ? 'row' : 'column',
      default: 'row',
    }),
    justifyContent: 'space-between',
    gap: 8,
  },
  trainTime: {
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    borderRadius: 8,
    padding: 12,
    minWidth: Platform.select({
      web: screenWidth > 600 ? 80 : '100%',
      default: 80,
    }),
    flex: Platform.select({
      web: screenWidth > 600 ? 1 : undefined,
      default: 1,
    }),
  },
  trainTimeText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  trainDirectionText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  stationsScroll: {
    marginBottom: 16,
  },
  stationsContainer: {
    paddingHorizontal: 4,
    gap: 12,
  },
  stationButton: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 140,
  },
  selectedStationButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  selectedStationButtonText: {
    color: '#FFFFFF',
  },
  stationDistance: {
    fontSize: 12,
    color: Colors.textLight,
  },
  quickActionsContainer: {
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: Platform.select({
      web: screenWidth > 768 ? 'row' : 'column',
      default: 'row',
    }),
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionButton: {
    flex: Platform.select({
      web: screenWidth > 768 ? 1 : undefined,
      default: 1,
    }),
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    minHeight: 80,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
});
