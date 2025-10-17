import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import {
  Search,
  MapPin,
  Train,
  Bus,
  Navigation,
  Accessibility,
  Clock,
  Star,
  Info,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { subwayLineColors } from '@/config/transit-data/mta-subway-lines';

type MTAStationFinderProps = {
  userLocation?: { lat: number; lng: number };
  onStationSelect?: (station: StationInfo) => void;
};

type StationInfo = {
  id: string;
  name: string;
  type: 'subway' | 'bus';
  borough: string;
  lines: string[];
  coordinates: { lat: number; lng: number };
  distance?: number; // in meters
  accessibility: {
    wheelchairAccessible: boolean;
    elevators?: string[];
    escalators: boolean;
    visualAids?: string[];
    audioAids?: string[];
  };
  kidFriendlyInfo: {
    nickname: string;
    whatToSee: string[];
    tip: string;
    funFact: string;
    safetyNote?: string;
  };
  exits: {
    name: string;
    description: string;
    isAccessible?: boolean;
  }[];
  amenities?: string[];
  nearbyAttractions?: string[];
};

const MTAStationFinder: React.FC<MTAStationFinderProps> = ({ userLocation, onStationSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stations, setStations] = useState<StationInfo[]>([]);
  const [filteredStations, setFilteredStations] = useState<StationInfo[]>([]);
  const [selectedType, setSelectedType] = useState<'all' | 'subway' | 'bus'>('all');
  const [showAccessibleOnly, setShowAccessibleOnly] = useState(false);
  const [favoriteStations, setFavoriteStations] = useState<string[]>([]);

  // Named coordinates for stations and stops
  const COORD_TIMES_SQ_42 = { lat: 40.7549, lng: -73.9872 };
  const COORD_CENTRAL_PARK_59 = { lat: 40.7681, lng: -73.9819 };
  const COORD_BROOKLYN_BRIDGE_CITY_HALL = { lat: 40.7127, lng: -74.0059 };
  const COORD_14TH_ST_UNION_SQ = { lat: 40.7348, lng: -73.9897 };
  const COORD_14TH_ST_1ST_AV_BUS = { lat: 40.7323, lng: -73.986 };
  const mockStations: StationInfo[] = [
    {
      id: 'times-sq-42',
      name: 'Times Sq-42nd St',
      type: 'subway',
      borough: 'Manhattan',
      lines: ['1', '2', '3', '7', 'N', 'Q', 'R', 'W', 'S'],
      coordinates: COORD_TIMES_SQ_42,
      distance: userLocation ? calculateDistance(userLocation, COORD_TIMES_SQ_42) : undefined,
      accessibility: {
        wheelchairAccessible: true,
        elevators: ['Street to mezzanine', 'Mezzanine to platform'],
        escalators: true,
        visualAids: ['Tactile warning strips', 'High contrast signs'],
        audioAids: ['Audio announcements', 'Talking directions'],
      },
      kidFriendlyInfo: {
        nickname: 'The Heart of NYC',
        whatToSee: [
          'Bright lights everywhere',
          'Street performers',
          'Red Steps',
          'TKTS booth',
          'Costume characters',
        ],
        tip: 'This is one of the busiest stations in the world - hold hands tight and stay close!',
        funFact:
          "Over 200,000 people pass through this station every day - that's like a whole city!",
        safetyNote: 'Very crowded - always stay with your adult and watch for moving crowds',
      },
      exits: [
        {
          name: '7th Av & 42nd St',
          description: 'Main Times Square exit with red steps',
          isAccessible: true,
        },
        {
          name: 'Broadway & 42nd St',
          description: 'Theater District exit near TKTS',
          isAccessible: true,
        },
        {
          name: '8th Av & 42nd St',
          description: 'Port Authority Bus Terminal exit',
          isAccessible: false,
        },
      ],
      amenities: ['Police station', 'Information booth', 'Restrooms', 'Food vendors'],
      nearbyAttractions: [
        'Times Square',
        'Broadway theaters',
        'M&M Store',
        "Hershey's Chocolate World",
      ],
    },
    {
      id: 'central-park-59',
      name: '59th St-Columbus Circle',
      type: 'subway',
      borough: 'Manhattan',
      lines: ['A', 'B', 'C', 'D', '1'],
      coordinates: COORD_CENTRAL_PARK_59,
      distance: userLocation ? calculateDistance(userLocation, COORD_CENTRAL_PARK_59) : undefined,
      accessibility: {
        wheelchairAccessible: true,
        elevators: ['Street to mezzanine elevator', 'Platform elevator'],
        escalators: true,
        visualAids: ['Braille signs', 'Tactile guidance'],
        audioAids: ['Platform announcements'],
      },
      kidFriendlyInfo: {
        nickname: 'Gateway to Central Park',
        whatToSee: [
          'Central Park entrance',
          'Columbus statue',
          'Horse carriages',
          'Street artists',
        ],
        tip: 'Perfect place to start exploring Central Park - the entrance is right outside!',
        funFact: 'The station is at the exact corner where Central Park begins!',
        safetyNote: 'Watch for horse carriages and bikes near the park entrance',
      },
      exits: [
        {
          name: 'Central Park South',
          description: 'Direct entrance to Central Park',
          isAccessible: true,
        },
        {
          name: 'Columbus Circle',
          description: 'Shopping center and restaurants',
          isAccessible: true,
        },
      ],
      amenities: ['Tourist information', 'Bike rental nearby', 'Food court access'],
      nearbyAttractions: ['Central Park', 'Time Warner Center', 'Lincoln Center', 'Apple Store'],
    },
    {
      id: 'brooklyn-bridge-city-hall',
      name: 'Brooklyn Bridge-City Hall',
      type: 'subway',
      borough: 'Manhattan',
      lines: ['4', '5', '6'],
      coordinates: COORD_BROOKLYN_BRIDGE_CITY_HALL,
      distance: userLocation
        ? calculateDistance(userLocation, COORD_BROOKLYN_BRIDGE_CITY_HALL)
        : undefined,
      accessibility: {
        wheelchairAccessible: false,
        elevators: [],
        escalators: false,
        visualAids: ['Some tactile strips'],
        audioAids: ['Basic announcements'],
      },
      kidFriendlyInfo: {
        nickname: 'Gateway to the Famous Bridge',
        whatToSee: ['Bridge entrance', 'Historic buildings', 'City Hall park', 'Old architecture'],
        tip: 'This station is old and has lots of stairs - perfect for seeing the famous Brooklyn Bridge!',
        funFact: 'This is one of the original subway stations from 1904!',
        safetyNote: 'Lots of stairs and no elevators - not good for strollers or wheelchairs',
      },
      exits: [
        {
          name: 'Park Row',
          description: 'Brooklyn Bridge pedestrian entrance',
          isAccessible: false,
        },
        {
          name: 'Centre St',
          description: 'City Hall and government buildings',
          isAccessible: false,
        },
      ],
      amenities: ['Historic tile work', 'Tourist signs'],
      nearbyAttractions: [
        'Brooklyn Bridge',
        'South Street Seaport',
        'Stone Street',
        '9/11 Memorial',
      ],
    },
    {
      id: '14th-st-union-sq',
      name: '14th St-Union Sq',
      type: 'subway',
      borough: 'Manhattan',
      lines: ['4', '5', '6', 'L', 'N', 'Q', 'R', 'W'],
      coordinates: COORD_14TH_ST_UNION_SQ,
      distance: userLocation ? calculateDistance(userLocation, COORD_14TH_ST_UNION_SQ) : undefined,
      accessibility: {
        wheelchairAccessible: true,
        elevators: ['Main elevator to all levels', 'Platform elevators'],
        escalators: true,
        visualAids: ['Full tactile guidance', 'Braille maps'],
        audioAids: ['Comprehensive audio system'],
      },
      kidFriendlyInfo: {
        nickname: 'The Big Transfer Station',
        whatToSee: ['Union Square Park', 'Farmers market', 'Street performers', 'Statues'],
        tip: 'Great place to transfer between trains and see lots of different people!',
        funFact: "8 different subway lines meet here - it's like a train crossroads!",
        safetyNote: 'Very busy transfer station - follow the signs carefully',
      },
      exits: [
        {
          name: 'Union Square Park',
          description: 'Main park entrance with farmers market',
          isAccessible: true,
        },
        { name: '14th St & Broadway', description: 'Shopping and restaurants', isAccessible: true },
        { name: '4th Ave', description: 'Quieter residential side', isAccessible: false },
      ],
      amenities: ['Large transfer area', 'Information booth', 'Emergency assistance'],
      nearbyAttractions: ['Union Square Park', 'Strand Bookstore', 'Whole Foods', 'Comedy clubs'],
    },
    {
      id: '14th-st-1st-av-bus',
      name: '14th St/1st Av',
      type: 'bus',
      borough: 'Manhattan',
      lines: ['M15'],
      coordinates: COORD_14TH_ST_1ST_AV_BUS,
      distance: userLocation
        ? calculateDistance(userLocation, COORD_14TH_ST_1ST_AV_BUS)
        : undefined,
      accessibility: {
        wheelchairAccessible: true,
        elevators: [],
        escalators: false,
        visualAids: ['Audio announcements at stop'],
        audioAids: ['Bus arrival announcements'],
      },
      kidFriendlyInfo: {
        nickname: 'The Select Bus Stop',
        whatToSee: ['Busy street life', 'Local shops', 'People from all walks of life'],
        tip: 'This is a Select Bus stop - remember to pay at the machine before the bus comes!',
        funFact: 'Select buses have their own special lanes to avoid traffic!',
        safetyNote: 'Stay behind the yellow line and watch for bikes in the bike lane',
      },
      exits: [
        {
          name: '1st Avenue',
          description: 'Main avenue with shops and restaurants',
          isAccessible: true,
        },
      ],
      amenities: ['SBS fare machines', 'Real-time arrival displays', 'Shelter'],
      nearbyAttractions: ['Stuyvesant Square', 'Local markets', 'Community gardens'],
    },
  ];

  useEffect(() => {
    setStations(mockStations);
    filterStations(mockStations, searchQuery, selectedType, showAccessibleOnly);
  }, []);

  useEffect(() => {
    filterStations(stations, searchQuery, selectedType, showAccessibleOnly);
  }, [searchQuery, selectedType, showAccessibleOnly, stations]);

  function calculateDistance(
    coord1: { lat: number; lng: number },
    coord2: { lat: number; lng: number },
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (coord1.lat * Math.PI) / 180;
    const φ2 = (coord2.lat * Math.PI) / 180;
    const Δφ = ((coord2.lat - coord1.lat) * Math.PI) / 180;
    const Δλ = ((coord2.lng - coord1.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  const filterStations = (
    allStations: StationInfo[],
    query: string,
    type: 'all' | 'subway' | 'bus',
    accessibleOnly: boolean,
  ) => {
    let filtered = allStations;

    // Filter by search query
    if (query.trim()) {
      filtered = filtered.filter(
        (station) =>
          station.name.toLowerCase().includes(query.toLowerCase()) ||
          station.borough.toLowerCase().includes(query.toLowerCase()) ||
          station.lines.some((line) => line.toLowerCase().includes(query.toLowerCase())) ||
          station.kidFriendlyInfo.nickname.toLowerCase().includes(query.toLowerCase()),
      );
    }

    // Filter by type
    if (type !== 'all') {
      filtered = filtered.filter((station) => station.type === type);
    }

    // Filter by accessibility
    if (accessibleOnly) {
      filtered = filtered.filter((station) => station.accessibility.wheelchairAccessible);
    }

    // Sort by distance if location available
    if (userLocation) {
      filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    setFilteredStations(filtered);
  };

  const toggleFavorite = (stationId: string) => {
    setFavoriteStations((prev) =>
      prev.includes(stationId) ? prev.filter((id) => id !== stationId) : [...prev, stationId],
    );
  };

  const handleStationPress = (station: StationInfo) => {
    if (onStationSelect) {
      onStationSelect(station);
    } else {
      Alert.alert(
        station.kidFriendlyInfo.nickname,
        `${station.kidFriendlyInfo.tip}\n\nFun fact: ${station.kidFriendlyInfo.funFact}`,
        [{ text: 'Cool!', style: 'default' }],
      );
    }
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return '';
    if (distance < 1000) {
      return `${Math.round(distance)}m away`;
    }
    return `${(distance / 1000).toFixed(1)}km away`;
  };

  const renderStationCard = (station: StationInfo) => (
    <TouchableOpacity
      key={station.id}
      style={styles.stationCard}
      onPress={() => handleStationPress(station)}
    >
      <View style={styles.stationHeader}>
        <View style={styles.stationInfo}>
          <View style={styles.stationIconContainer}>
            {station.type === 'subway' ? (
              <Train size={20} color={Colors.primary} />
            ) : (
              <Bus size={20} color={Colors.primary} />
            )}
          </View>

          <View style={styles.stationDetails}>
            <Text style={styles.stationName}>{station.name}</Text>
            <Text style={styles.stationNickname}>{station.kidFriendlyInfo.nickname}</Text>
            <Text style={styles.stationBorough}>{station.borough}</Text>
            {station.distance && (
              <Text style={styles.stationDistance}>{formatDistance(station.distance)}</Text>
            )}
          </View>
        </View>

        <View style={styles.stationActions}>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(station.id)}
          >
            <Star
              size={16}
              color={favoriteStations.includes(station.id) ? '#FFD700' : '#CCCCCC'}
              fill={favoriteStations.includes(station.id) ? '#FFD700' : 'none'}
            />
          </TouchableOpacity>

          {station.accessibility.wheelchairAccessible && (
            <View style={styles.accessibilityBadge}>
              <Accessibility size={16} color="#4CAF50" />
            </View>
          )}
        </View>
      </View>

      {/* Transit Lines */}
      <View style={styles.linesContainer}>
        <Text style={styles.linesLabel}>Lines: </Text>
        <View style={styles.linesList}>
          {station.lines.map((line) => (
            <View
              key={line}
              style={[
                styles.lineIndicator,
                {
                  backgroundColor:
                    station.type === 'subway'
                      ? subwayLineColors[line] || Colors.primary
                      : Colors.primary,
                },
              ]}
            >
              <Text style={styles.lineText}>{line}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Kid-Friendly Info */}
      <View style={styles.kidInfoSection}>
        <Text style={styles.tipText}>💡 {station.kidFriendlyInfo.tip}</Text>
        <Text style={styles.funFactText}>🎉 {station.kidFriendlyInfo.funFact}</Text>
      </View>

      {/* What to See */}
      <View style={styles.attractionsSection}>
        <Text style={styles.attractionsTitle}>What to see nearby:</Text>
        <View style={styles.attractionsList}>
          {station.kidFriendlyInfo.whatToSee.slice(0, 3).map((attraction, index) => (
            <Text key={index} style={styles.attractionItem}>
              • {attraction}
            </Text>
          ))}
          {station.kidFriendlyInfo.whatToSee.length > 3 && (
            <Text style={styles.moreAttractions}>
              and {station.kidFriendlyInfo.whatToSee.length - 3} more...
            </Text>
          )}
        </View>
      </View>

      {/* Safety Note */}
      {station.kidFriendlyInfo.safetyNote && (
        <View style={styles.safetyNote}>
          <Info size={14} color="#FF9800" />
          <Text style={styles.safetyText}>{station.kidFriendlyInfo.safetyNote}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stations, lines, or neighborhoods..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textLight}
          />
        </View>
      </View>

      {/* Filter Options */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterButton, selectedType === 'all' && styles.activeFilter]}
            onPress={() => setSelectedType('all')}
          >
            <Text style={[styles.filterText, selectedType === 'all' && styles.activeFilterText]}>
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, selectedType === 'subway' && styles.activeFilter]}
            onPress={() => setSelectedType('subway')}
          >
            <Train size={16} color={selectedType === 'subway' ? '#FFFFFF' : Colors.primary} />
            <Text style={[styles.filterText, selectedType === 'subway' && styles.activeFilterText]}>
              Subway
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, selectedType === 'bus' && styles.activeFilter]}
            onPress={() => setSelectedType('bus')}
          >
            <Bus size={16} color={selectedType === 'bus' ? '#FFFFFF' : Colors.primary} />
            <Text style={[styles.filterText, selectedType === 'bus' && styles.activeFilterText]}>
              Bus
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, showAccessibleOnly && styles.activeFilter]}
            onPress={() => setShowAccessibleOnly(!showAccessibleOnly)}
          >
            <Accessibility size={16} color={showAccessibleOnly ? '#FFFFFF' : Colors.primary} />
            <Text style={[styles.filterText, showAccessibleOnly && styles.activeFilterText]}>
              Accessible
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Results */}
      <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.resultsHeader}>
          {filteredStations.length} station{filteredStations.length !== 1 ? 's' : ''} found
        </Text>

        {filteredStations.length === 0 ? (
          <View style={styles.noResultsContainer}>
            <MapPin size={48} color="#CCCCCC" />
            <Text style={styles.noResultsText}>No stations found matching your search</Text>
            <Text style={styles.noResultsSubtext}>
              Try searching for a different station name, line, or neighborhood
            </Text>
          </View>
        ) : (
          filteredStations.map(renderStationCard)
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.text,
  },
  filtersContainer: {
    paddingVertical: 12,
    paddingLeft: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeFilter: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 6,
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultsHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginVertical: 16,
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  stationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  stationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stationInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  stationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stationDetails: {
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  stationNickname: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 2,
  },
  stationBorough: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 2,
  },
  stationDistance: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  stationActions: {
    alignItems: 'flex-end',
  },
  favoriteButton: {
    padding: 8,
    marginBottom: 4,
  },
  accessibilityBadge: {
    backgroundColor: '#E8F5E8',
    padding: 6,
    borderRadius: 16,
  },
  linesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  linesLabel: {
    fontSize: 13,
    color: Colors.textLight,
    marginRight: 8,
  },
  linesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  lineIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  lineText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  kidInfoSection: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  tipText: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
    marginBottom: 4,
  },
  funFactText: {
    fontSize: 13,
    color: Colors.primary,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  attractionsSection: {
    marginBottom: 8,
  },
  attractionsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  attractionsList: {
    paddingLeft: 8,
  },
  attractionItem: {
    fontSize: 12,
    color: Colors.textLight,
    lineHeight: 16,
  },
  moreAttractions: {
    fontSize: 12,
    color: Colors.primary,
    fontStyle: 'italic',
  },
  safetyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3E0',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  safetyText: {
    fontSize: 12,
    color: '#E65100',
    marginLeft: 6,
    flex: 1,
    lineHeight: 16,
  },
});

export default MTAStationFinder;
