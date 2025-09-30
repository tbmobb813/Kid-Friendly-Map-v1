import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Colors from "@/constants/colors";
import SearchBar from "@/components/SearchBar";
import PlaceCard from "@/components/PlaceCard";
import { useNavigationStore } from "@/stores/navigationStore";
import { MapPin } from "lucide-react-native";
import { Place, PlaceCategory } from "@/types/navigation";
import { favoriteLocations, recentSearches } from "@/mocks/places";

// Mock search results based on query or category
const getMockSearchResults = (query: string, category?: PlaceCategory): Place[] => {
  // Combine favorites and recent searches for the mock data pool
  const allPlaces = [...favoriteLocations, ...recentSearches];
  
  if (category) {
    return allPlaces.filter(place => place.category === category);
  }
  
  if (!query.trim()) {
    return [];
  }
  
  const lowerQuery = query.toLowerCase();
  return allPlaces.filter(
    place => 
      place.name.toLowerCase().includes(lowerQuery) || 
      place.address.toLowerCase().includes(lowerQuery)
  );
};

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const category = params.category as PlaceCategory;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  
  const { 
    recentSearches: storedRecentSearches,
    setDestination,
    addToRecentSearches
  } = useNavigationStore();

  useEffect(() => {
    // If category is provided, search by category
    if (category) {
      setSearchResults(getMockSearchResults("", category));
    }
  }, [category]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setSearchResults(getMockSearchResults(text, category));
  };

  const handlePlaceSelect = (place: Place) => {
    setDestination(place);
    addToRecentSearches(place);
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          onClear={() => {
            setSearchQuery("");
            setSearchResults([]);
          }}
          placeholder={
            category 
              ? `Search ${category} places...` 
              : "Search for a place..."
          }
        />
      </View>

      {searchQuery.length === 0 && !category && storedRecentSearches.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Recent Searches</Text>
          {storedRecentSearches.map(place => (
            <PlaceCard
              key={place.id}
              place={place}
              onPress={handlePlaceSelect}
            />
          ))}
        </>
      )}

      {searchResults.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>
            {category 
              ? `${category.charAt(0).toUpperCase() + category.slice(1)} Places` 
              : "Search Results"}
          </Text>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PlaceCard place={item} onPress={handlePlaceSelect} />
            )}
            contentContainerStyle={styles.resultsList}
          />
        </>
      ) : (
        searchQuery.length > 0 && (
          <View style={styles.emptyStateContainer}>
            <MapPin size={40} color={Colors.textLight} />
            <Text style={styles.emptyStateText}>
              No places found for "{searchQuery}"
            </Text>
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  searchContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 16,
  },
  resultsList: {
    paddingBottom: 16,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textLight,
    textAlign: "center",
  },
});
