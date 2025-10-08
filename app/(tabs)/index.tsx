import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import SearchWithSuggestions from '@/components/SearchWithSuggestions';
import PlaceCard from '@/components/PlaceCard';
import CategoryButton from '@/components/CategoryButton';
import SafetyPanel from '@/components/SafetyPanel';
import RegionalFunFactCard from '@/components/RegionalFunFactCard';
import UserStatsCard from '@/components/UserStatsCard';
import WeatherWidget from '@/components/WeatherWidget';
import AIJourneyCompanion from '@/components/AIJourneyCompanion';
import VirtualPetCompanion from '@/components/VirtualPetCompanion';
import SmartRouteSuggestions from '@/components/SmartRouteSuggestions';

import EmptyState from '@/components/EmptyState';
import PullToRefresh from '@/components/PullToRefresh';
import { useNavigationStore } from '@/stores/navigationStore';
import { PlaceCategory, Place } from '@/types/navigation';
import { MapPin, Navigation } from 'lucide-react-native';
import useLocation from '@/hooks/useLocation';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useRegionalData } from '@/hooks/useRegionalData';
import { trackScreenView, trackUserAction } from '@/utils/analytics';
import { useCategoryStore } from '@/stores/categoryStore';
import { SafeZoneIndicator } from '@/components/SafeZoneIndicator';

type SearchSuggestion = {
  id: string;
  text: string;
  type: 'recent' | 'popular' | 'place';
  place?: Place;
};

export default function HomeScreen() {
  const router = useRouter();
  const { location } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFunFact, setShowFunFact] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [showPetCompanion, setShowPetCompanion] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<Place | undefined>(undefined);

  const { favorites, setDestination, addToRecentSearches, recentSearches } = useNavigationStore();

  const { userStats, completeTrip } = useGamificationStore();
  const { regionalContent, currentRegion } = useRegionalData();
  const { getApprovedCategories } = useCategoryStore();

  const approvedCategories = getApprovedCategories();

  React.useEffect(() => {
    trackScreenView('home');
  }, []);

  // Generate search suggestions
  const suggestions: SearchSuggestion[] = React.useMemo(() => {
    if (!searchQuery.trim()) return [];

    const searchSuggestions: SearchSuggestion[] = [];

    // Add recent searches
    recentSearches.forEach((place) => {
      if (place.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        searchSuggestions.push({
          id: `recent-${place.id}`,
          text: place.name,
          type: 'recent',
          place,
        });
      }
    });

    // Add favorites
    favorites.forEach((place) => {
      if (place.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        searchSuggestions.push({
          id: `favorite-${place.id}`,
          text: place.name,
          type: 'place',
          place,
        });
      }
    });

    // Add regional popular places
    regionalContent.popularPlaces.forEach((place, index) => {
      if (place.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        searchSuggestions.push({
          id: `popular-${index}`,
          text: place.name,
          type: 'popular',
          place: {
            id: `popular-${index}`,
            name: place.name,
            address: place.description,
            category: place.category as PlaceCategory,
            coordinates: {
              latitude: currentRegion.coordinates.latitude + (Math.random() - 0.5) * 0.01,
              longitude: currentRegion.coordinates.longitude + (Math.random() - 0.5) * 0.01,
            },
          },
        });
      }
    });

    return searchSuggestions;
  }, [searchQuery, recentSearches, favorites, regionalContent.popularPlaces, currentRegion]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
    trackUserAction('pull_to_refresh', { screen: 'home' });
  };

  const handlePlaceSelect = (place: Place) => {
    setDestination(place);
    setSelectedDestination(place);
    setIsNavigating(true);
    addToRecentSearches(place);
    completeTrip('Current Location', place.name);
    trackUserAction('select_place', { place_name: place.name, place_category: place.category });
    router.push('/map' as any);
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    if (suggestion.place) {
      handlePlaceSelect(suggestion.place);
    }
  };

  const handleCategorySelect = (categoryId: PlaceCategory | string) => {
    trackUserAction('select_category', { category: categoryId });
    router.push({
      pathname: '/search' as any,
      params: { category: categoryId },
    });
  };

  const handleCurrentLocation = () => {
    const currentPlace = {
      id: 'current-location',
      name: 'Current Location',
      address: 'Your current position',
      category: 'other' as PlaceCategory,
      coordinates: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
    };

    trackUserAction('use_current_location');
    handlePlaceSelect(currentPlace);
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
      <View style={styles.container}>
        <UserStatsCard stats={userStats} onPetClick={() => setShowPetCompanion(true)} />

        <SafeZoneIndicator />

        <WeatherWidget testId="weather-widget" />

        {showFunFact && <RegionalFunFactCard onDismiss={() => setShowFunFact(false)} />}

        <AIJourneyCompanion
          currentLocation={location}
          destination={selectedDestination}
          isNavigating={isNavigating}
        />

        {selectedDestination && (
          <SmartRouteSuggestions
            destination={selectedDestination}
            currentLocation={location}
            timeOfDay={
              new Date().getHours() < 12
                ? 'morning'
                : new Date().getHours() < 18
                ? 'afternoon'
                : 'evening'
            }
            onSelectRoute={(suggestion) => {
              console.log('Selected route:', suggestion);
              trackUserAction('select_smart_route', { route_type: suggestion.type });
            }}
          />
        )}

        <SafetyPanel
          currentLocation={location}
          currentPlace={
            selectedPlace
              ? {
                  id: selectedPlace.id,
                  name: selectedPlace.name,
                }
              : null
          }
        />

        <View style={styles.searchContainer}>
          <SearchWithSuggestions
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSelectSuggestion={handleSuggestionSelect}
            suggestions={suggestions}
            placeholder={`Where do you want to go in ${currentRegion.name}?`}
          />
          <Pressable style={styles.currentLocationButton} onPress={handleCurrentLocation}>
            <Navigation size={20} color={Colors.primary} />
            <Text style={styles.currentLocationText}>Use my location</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoriesContainer}>
          {approvedCategories.map((category) => (
            <CategoryButton
              key={category.id}
              customCategory={category}
              onPress={handleCategorySelect}
              size="large"
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Favorites</Text>
        {favorites.length > 0 ? (
          favorites.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              onPress={(selectedPlace) => {
                setSelectedPlace(selectedPlace);
                handlePlaceSelect(selectedPlace);
              }}
            />
          ))
        ) : (
          <EmptyState
            icon={MapPin}
            title="No favorites yet"
            description={`Add places you visit often in ${currentRegion.name} to see them here`}
            actionText="Search Places"
            onAction={() => router.push('/search' as any)}
          />
        )}

        <VirtualPetCompanion
          visible={showPetCompanion}
          onClose={() => setShowPetCompanion(false)}
        />
      </View>
    </PullToRefresh>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  currentLocationText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
});
