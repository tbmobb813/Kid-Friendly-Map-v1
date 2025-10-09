/**
 * Station Finder Component Template
 *
 * This template provides a starting point for creating station finder components
 * for any city's transit system. Based on the MTA Station Finder component
 * but adaptable to any transit system worldwide.
 *
 * INSTRUCTIONS:
 * 1. Copy this file to components/YourCityStationFinder.tsx (e.g., LondonStationFinder.tsx)
 * 2. Replace all "REPLACE_" placeholders with your city's information
 * 3. Update station data structure and search logic for your system
 * 4. Customize filters based on your transit types and accessibility features
 * 5. Update colors and styling to match your transit authority's branding
 * 6. Add or remove search criteria based on your system's features
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {
  Search,
  MapPin,
  Train,
  Bus,
  Filter,
  Star,
  Accessibility,
  X,
  ChevronRight,
} from 'lucide-react-native';
import Colors from '@/constants/colors';

type StationAccessibility = {
  wheelchairAccessible: boolean;
  elevators: boolean;
  escalators: boolean;
  tactilePaving: boolean;
  audioAnnouncements: boolean;
  visualDisplays: boolean;
};

type TransitStation = {
  id: string;
  name: string;
  type: 'rail' | 'bus' | 'tram' | 'ferry' | 'multi';
  lines: string[];
  borough?: string; // or district, zone, area depending on your city
  address?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  accessibility: StationAccessibility;
  amenities: string[];
  isPopular: boolean;
  transferHub: boolean;
  kidFriendlyFeatures: string[];
};

type FilterState = {
  stationType: 'all' | 'rail' | 'bus' | 'tram' | 'ferry';
  accessibilityOnly: boolean;
  transferHubsOnly: boolean;
  popularOnly: boolean;
  borough: string; // or district/zone
};

type YourCityStationFinderProps = {
  onStationSelect?: (station: TransitStation) => void;
  showFilters?: boolean;
  maxResults?: number;
};

const YourCityStationFinder: React.FC<YourCityStationFinderProps> = ({
  onStationSelect,
  showFilters = true,
  maxResults = 50,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stations, setStations] = useState<TransitStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    stationType: 'all',
    accessibilityOnly: false,
    transferHubsOnly: false,
    popularOnly: false,
    borough: 'all',
  });

  // Load stations data - replace with your data source
  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      // Replace with your city's station data source
      // This could be a local JSON file, API endpoint, or imported data
      const response = await fetch('REPLACE_STATIONS_DATA_URL');
      const data = await response.json();

      // Transform your data to match the TransitStation type
      const transformedStations: TransitStation[] =
        data.stations?.map((station: any) => ({
          id: station.REPLACE_ID_FIELD,
          name: station.REPLACE_NAME_FIELD,
          type: station.REPLACE_TYPE_FIELD,
          lines: station.REPLACE_LINES_FIELD || [],
          borough: station.REPLACE_BOROUGH_FIELD, // or district/zone
          address: station.REPLACE_ADDRESS_FIELD,
          coordinates: {
            latitude: station.REPLACE_LAT_FIELD,
            longitude: station.REPLACE_LON_FIELD,
          },
          accessibility: {
            wheelchairAccessible: station.REPLACE_WHEELCHAIR_FIELD === true,
            elevators: station.REPLACE_ELEVATORS_FIELD === true,
            escalators: station.REPLACE_ESCALATORS_FIELD === true,
            tactilePaving: station.REPLACE_TACTILE_FIELD === true,
            audioAnnouncements: station.REPLACE_AUDIO_FIELD === true,
            visualDisplays: station.REPLACE_VISUAL_FIELD === true,
          },
          amenities: station.REPLACE_AMENITIES_FIELD || [],
          isPopular: station.REPLACE_POPULAR_FIELD === true,
          transferHub: station.REPLACE_TRANSFER_FIELD === true,
          kidFriendlyFeatures: station.REPLACE_KID_FEATURES_FIELD || [],
        })) || [];

      setStations(transformedStations);
    } catch (error) {
      console.error('Failed to load stations:', error);
      // You might want to load a local backup or show an error message
    } finally {
      setLoading(false);
    }
  };

  const filteredStations = useMemo(() => {
    let filtered = stations;

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (station) =>
          station.name.toLowerCase().includes(query) ||
          station.borough?.toLowerCase().includes(query) ||
          station.lines.some((line) => line.toLowerCase().includes(query)) ||
          station.address?.toLowerCase().includes(query),
      );
    }

    // Station type filter
    if (filters.stationType !== 'all') {
      filtered = filtered.filter(
        (station) =>
          station.type === filters.stationType ||
          (station.type === 'multi' && filters.stationType === 'rail'),
      );
    }

    // Accessibility filter
    if (filters.accessibilityOnly) {
      filtered = filtered.filter((station) => station.accessibility.wheelchairAccessible);
    }

    // Transfer hubs filter
    if (filters.transferHubsOnly) {
      filtered = filtered.filter((station) => station.transferHub);
    }

    // Popular stations filter
    if (filters.popularOnly) {
      filtered = filtered.filter((station) => station.isPopular);
    }

    // Borough/district filter
    if (filters.borough !== 'all') {
      filtered = filtered.filter((station) => station.borough === filters.borough);
    }

    return filtered.slice(0, maxResults);
  }, [stations, searchQuery, filters, maxResults]);

  const uniqueBoroughs = useMemo(() => {
    return [...new Set(stations.map((s) => s.borough).filter(Boolean))].sort();
  }, [stations]);

  const getStationIcon = (type: string, size: number = 20) => {
    switch (type) {
      case 'bus':
        return <Bus size={size} color={Colors.primary} />;
      case 'tram':
        return <Train size={size} color="#FF9800" />;
      case 'ferry':
        return <MapPin size={size} color="#2196F3" />;
      case 'multi':
        return <MapPin size={size} color="#9C27B0" />;
      default:
        return <Train size={size} color={Colors.primary} />;
    }
  };

  const renderFilterPanel = () => {
    if (!showFilterPanel) return null;

    return (
      <View style={styles.filterPanel}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>REPLACE_FILTER_TITLE</Text>
          <TouchableOpacity onPress={() => setShowFilterPanel(false)}>
            <X size={20} color="#666666" />
          </TouchableOpacity>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>REPLACE_STATION_TYPE_TITLE</Text>
          <View style={styles.filterOptions}>
            {[
              { key: 'all', label: 'REPLACE_ALL_TYPES' },
              { key: 'rail', label: 'REPLACE_RAIL_LABEL' }, // e.g., "Trains", "Underground", "Metro"
              { key: 'bus', label: 'REPLACE_BUS_LABEL' },
              { key: 'tram', label: 'REPLACE_TRAM_LABEL' }, // Remove if not applicable
              { key: 'ferry', label: 'REPLACE_FERRY_LABEL' }, // Remove if not applicable
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.filterOption,
                  filters.stationType === option.key && styles.activeFilterOption,
                ]}
                onPress={() => setFilters({ ...filters, stationType: option.key as any })}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    filters.stationType === option.key && styles.activeFilterOptionText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>REPLACE_AREA_FILTER_TITLE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  filters.borough === 'all' && styles.activeFilterOption,
                ]}
                onPress={() => setFilters({ ...filters, borough: 'all' })}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    filters.borough === 'all' && styles.activeFilterOptionText,
                  ]}
                >
                  REPLACE_ALL_AREAS
                </Text>
              </TouchableOpacity>
              {uniqueBoroughs.map((borough) => (
                <TouchableOpacity
                  key={borough}
                  style={[
                    styles.filterOption,
                    filters.borough === borough && styles.activeFilterOption,
                  ]}
                  onPress={() => setFilters({ ...filters, borough })}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      filters.borough === borough && styles.activeFilterOptionText,
                    ]}
                  >
                    {borough}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>REPLACE_SPECIAL_FILTERS_TITLE</Text>
          <View style={styles.toggleFilters}>
            <TouchableOpacity
              style={[styles.toggleFilter, filters.accessibilityOnly && styles.activeToggleFilter]}
              onPress={() =>
                setFilters({ ...filters, accessibilityOnly: !filters.accessibilityOnly })
              }
            >
              <Accessibility
                size={16}
                color={filters.accessibilityOnly ? '#FFFFFF' : Colors.primary}
              />
              <Text
                style={[
                  styles.toggleFilterText,
                  filters.accessibilityOnly && styles.activeToggleFilterText,
                ]}
              >
                REPLACE_ACCESSIBILITY_FILTER
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleFilter, filters.transferHubsOnly && styles.activeToggleFilter]}
              onPress={() =>
                setFilters({ ...filters, transferHubsOnly: !filters.transferHubsOnly })
              }
            >
              <MapPin size={16} color={filters.transferHubsOnly ? '#FFFFFF' : Colors.primary} />
              <Text
                style={[
                  styles.toggleFilterText,
                  filters.transferHubsOnly && styles.activeToggleFilterText,
                ]}
              >
                REPLACE_TRANSFER_HUBS_FILTER
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleFilter, filters.popularOnly && styles.activeToggleFilter]}
              onPress={() => setFilters({ ...filters, popularOnly: !filters.popularOnly })}
            >
              <Star size={16} color={filters.popularOnly ? '#FFFFFF' : Colors.primary} />
              <Text
                style={[
                  styles.toggleFilterText,
                  filters.popularOnly && styles.activeToggleFilterText,
                ]}
              >
                REPLACE_POPULAR_FILTER
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderStationCard = ({ item: station }: { item: TransitStation }) => (
    <TouchableOpacity style={styles.stationCard} onPress={() => onStationSelect?.(station)}>
      <View style={styles.stationHeader}>
        <View style={styles.stationInfo}>
          {getStationIcon(station.type)}
          <View style={styles.stationDetails}>
            <View style={styles.stationNameRow}>
              <Text style={styles.stationName}>{station.name}</Text>
              {station.isPopular && <Star size={14} color="#FFD700" fill="#FFD700" />}
            </View>
            {station.borough && <Text style={styles.stationBorough}>{station.borough}</Text>}
          </View>
        </View>
        <ChevronRight size={16} color="#CCCCCC" />
      </View>

      {station.lines.length > 0 && (
        <View style={styles.linesContainer}>
          <Text style={styles.linesLabel}>REPLACE_LINES_LABEL:</Text>
          <View style={styles.lines}>
            {station.lines.slice(0, 4).map((line, index) => (
              <View key={index} style={styles.lineTag}>
                <Text style={styles.lineTagText}>{line}</Text>
              </View>
            ))}
            {station.lines.length > 4 && (
              <Text style={styles.moreLinesText}>
                +{station.lines.length - 4} REPLACE_MORE_TEXT
              </Text>
            )}
          </View>
        </View>
      )}

      <View style={styles.stationFeatures}>
        {station.accessibility.wheelchairAccessible && (
          <View style={styles.featureTag}>
            <Accessibility size={12} color="#4CAF50" />
            <Text style={styles.featureTagText}>REPLACE_ACCESSIBLE_TAG</Text>
          </View>
        )}
        {station.transferHub && (
          <View style={styles.featureTag}>
            <MapPin size={12} color="#2196F3" />
            <Text style={styles.featureTagText}>REPLACE_TRANSFER_TAG</Text>
          </View>
        )}
        {station.kidFriendlyFeatures.length > 0 && (
          <View style={styles.featureTag}>
            <Star size={12} color="#FF9800" />
            <Text style={styles.featureTagText}>REPLACE_KID_FRIENDLY_TAG</Text>
          </View>
        )}
      </View>

      {station.kidFriendlyFeatures.length > 0 && (
        <View style={styles.kidFeatures}>
          <Text style={styles.kidFeaturesText}>
            {station.kidFriendlyFeatures.slice(0, 2).join(', ')}
            {station.kidFriendlyFeatures.length > 2 && '...'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Search size={32} color={Colors.primary} />
        <Text style={styles.loadingText}>REPLACE_LOADING_STATIONS_TEXT</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#666666" />
          <TextInput
            style={styles.searchInput}
            placeholder="REPLACE_SEARCH_PLACEHOLDER"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color="#666666" />
            </TouchableOpacity>
          )}
        </View>

        {showFilters && (
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilterPanel(!showFilterPanel)}
          >
            <Filter size={20} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {renderFilterPanel()}

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredStations.length} REPLACE_RESULTS_TEXT
          {searchQuery && ` REPLACE_FOR_TEXT "${searchQuery}"`}
        </Text>
      </View>

      <FlatList
        data={filteredStations}
        renderItem={renderStationCard}
        keyExtractor={(item) => item.id}
        style={styles.stationsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Search size={48} color="#CCCCCC" />
            <Text style={styles.emptyStateText}>REPLACE_NO_STATIONS_TEXT</Text>
            <Text style={styles.emptyStateSubtext}>REPLACE_NO_STATIONS_SUBTEXT</Text>
          </View>
        }
      />
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
  searchContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.text,
  },
  filterButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  filterPanel: {
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 16,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  filterSection: {
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeFilterOption: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterOptionText: {
    fontSize: 13,
    color: Colors.text,
  },
  activeFilterOptionText: {
    color: '#FFFFFF',
  },
  toggleFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  toggleFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeToggleFilter: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  toggleFilterText: {
    fontSize: 13,
    color: Colors.text,
    marginLeft: 6,
  },
  activeToggleFilterText: {
    color: '#FFFFFF',
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  resultsCount: {
    fontSize: 14,
    color: Colors.textLight,
  },
  stationsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  stationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stationInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  stationDetails: {
    marginLeft: 12,
    flex: 1,
  },
  stationNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stationName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  stationBorough: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 2,
  },
  linesContainer: {
    marginBottom: 8,
  },
  linesLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  lines: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    alignItems: 'center',
  },
  lineTag: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  lineTagText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  moreLinesText: {
    fontSize: 11,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
  stationFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  featureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  featureTagText: {
    fontSize: 10,
    color: '#666666',
    marginLeft: 3,
  },
  kidFeatures: {
    backgroundColor: '#FFF8E1',
    padding: 8,
    borderRadius: 6,
  },
  kidFeaturesText: {
    fontSize: 12,
    color: '#F57C00',
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
});

export default YourCityStationFinder;

/*
 * CUSTOMIZATION CHECKLIST:
 *
 * □ Replace component name: YourCityStationFinder -> LondonStationFinder, TokyoStationFinder, etc.
 * □ Update data source URL: REPLACE_STATIONS_DATA_URL
 * □ Map station data fields to match your data structure
 * □ Customize area filter (borough → district, zone, etc.)
 * □ Update vehicle types and remove inapplicable ones (tram, ferry)
 * □ Customize text labels for your language/locale
 * □ Update accessibility features for your system
 * □ Add city-specific amenities and kid-friendly features
 * □ Customize color scheme to match your transit authority
 * □ Test search and filtering with real station data
 * □ Add any city-specific filters or features
 */
