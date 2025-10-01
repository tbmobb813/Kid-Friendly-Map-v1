import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";
import SearchWithSuggestions from "@/components/SearchWithSuggestions";
import PlaceCard from "@/components/PlaceCard";
import CategoryButton from "@/components/CategoryButton";
import SafetyPanel from "@/components/SafetyPanel";
import RegionalFunFactCard from "@/components/RegionalFunFactCard";
import UserStatsCard from "@/components/UserStatsCard";
import WeatherWidget from "@/components/WeatherWidget";
import AIJourneyCompanion from "@/components/AIJourneyCompanion";
import VirtualPetCompanion from "@/components/VirtualPetCompanion";
import SmartRouteSuggestions from "@/components/SmartRouteSuggestions";
import EmptyState from "@/components/EmptyState";
import PullToRefresh from "@/components/PullToRefresh";
import { useNavigationStore } from "@/stores/navigationStore";
import { MapPin, Navigation } from "lucide-react-native";
import useLocation from "@/hooks/useLocation";
import { useGamificationStore } from "@/stores/gamificationStore";
import { useRegionalData } from "@/hooks/useRegionalData";
import { trackScreenView, trackUserAction } from "@/utils/analytics";
import { useCategoryStore } from "@/stores/categoryStore";
import { SafeZoneIndicator } from "@/components/SafeZoneIndicator";
export default function HomeScreen() {
    const router = useRouter();
    const { location } = useLocation();
    const [searchQuery, setSearchQuery] = useState("");
    const [showFunFact, setShowFunFact] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [showPetCompanion, setShowPetCompanion] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const [selectedDestination, setSelectedDestination] = useState(undefined);
    const { favorites, setDestination, addToRecentSearches, recentSearches } = useNavigationStore();
    const { userStats, completeTrip } = useGamificationStore();
    const { regionalContent, currentRegion } = useRegionalData();
    const { getApprovedCategories } = useCategoryStore();
    const approvedCategories = getApprovedCategories();
    React.useEffect(() => {
        trackScreenView('home');
    }, []);
    // Generate search suggestions
    const suggestions = React.useMemo(() => {
        if (!searchQuery.trim())
            return [];
        const searchSuggestions = [];
        // Add recent searches
        recentSearches.forEach(place => {
            if (place.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                searchSuggestions.push({
                    id: `recent-${place.id}`,
                    text: place.name,
                    type: "recent",
                    place,
                });
            }
        });
        // Add favorites
        favorites.forEach(place => {
            if (place.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                searchSuggestions.push({
                    id: `favorite-${place.id}`,
                    text: place.name,
                    type: "place",
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
                    type: "popular",
                    place: {
                        id: `popular-${index}`,
                        name: place.name,
                        address: place.description,
                        category: place.category,
                        coordinates: {
                            latitude: currentRegion.coordinates.latitude + (Math.random() - 0.5) * 0.01,
                            longitude: currentRegion.coordinates.longitude + (Math.random() - 0.5) * 0.01,
                        }
                    },
                });
            }
        });
        return searchSuggestions;
    }, [searchQuery, recentSearches, favorites, regionalContent.popularPlaces, currentRegion]);
    const handleRefresh = async () => {
        setRefreshing(true);
        // Simulate refresh delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRefreshing(false);
        trackUserAction('pull_to_refresh', { screen: 'home' });
    };
    const handlePlaceSelect = (place) => {
        setDestination(place);
        setSelectedDestination(place);
        setIsNavigating(true);
        addToRecentSearches(place);
        completeTrip("Current Location", place.name);
        trackUserAction('select_place', { place_name: place.name, place_category: place.category });
        router.push("/map");
    };
    const handleSuggestionSelect = (suggestion) => {
        if (suggestion.place) {
            handlePlaceSelect(suggestion.place);
        }
    };
    const handleCategorySelect = (categoryId) => {
        trackUserAction('select_category', { category: categoryId });
        router.push({
            pathname: "/search",
            params: { category: categoryId }
        });
    };
    const handleCurrentLocation = () => {
        const currentPlace = {
            id: "current-location",
            name: "Current Location",
            address: "Your current position",
            category: "other",
            coordinates: {
                latitude: location.latitude,
                longitude: location.longitude
            }
        };
        trackUserAction('use_current_location');
        handlePlaceSelect(currentPlace);
    };
    return (_jsx(PullToRefresh, { onRefresh: handleRefresh, refreshing: refreshing, children: _jsxs(View, { style: styles.container, children: [_jsx(UserStatsCard, { stats: userStats, onPetClick: () => setShowPetCompanion(true) }), _jsx(SafeZoneIndicator, {}), _jsx(WeatherWidget, { testId: "weather-widget" }), showFunFact && (_jsx(RegionalFunFactCard, { onDismiss: () => setShowFunFact(false) })), _jsx(AIJourneyCompanion, { currentLocation: location, destination: selectedDestination, isNavigating: isNavigating }), selectedDestination && (_jsx(SmartRouteSuggestions, { destination: selectedDestination, currentLocation: location, timeOfDay: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening', onSelectRoute: (suggestion) => {
                        console.log('Selected route:', suggestion);
                        trackUserAction('select_smart_route', { route_type: suggestion.type });
                    } })), _jsx(SafetyPanel, { currentLocation: location, currentPlace: selectedPlace ? {
                        id: selectedPlace.id,
                        name: selectedPlace.name
                    } : null }), _jsxs(View, { style: styles.searchContainer, children: [_jsx(SearchWithSuggestions, { value: searchQuery, onChangeText: setSearchQuery, onSelectSuggestion: handleSuggestionSelect, suggestions: suggestions, placeholder: `Where do you want to go in ${currentRegion.name}?` }), _jsxs(Pressable, { style: styles.currentLocationButton, onPress: handleCurrentLocation, children: [_jsx(Navigation, { size: 20, color: Colors.primary }), _jsx(Text, { style: styles.currentLocationText, children: "Use my location" })] })] }), _jsx(Text, { style: styles.sectionTitle, children: "Categories" }), _jsx(View, { style: styles.categoriesContainer, children: approvedCategories.map((category) => (_jsx(CategoryButton, { customCategory: category, onPress: handleCategorySelect, size: "large" }, category.id))) }), _jsx(Text, { style: styles.sectionTitle, children: "Favorites" }), favorites.length > 0 ? (favorites.map((place) => (_jsx(PlaceCard, { place: place, onPress: (selectedPlace) => {
                        setSelectedPlace(selectedPlace);
                        handlePlaceSelect(selectedPlace);
                    } }, place.id)))) : (_jsx(EmptyState, { icon: MapPin, title: "No favorites yet", description: `Add places you visit often in ${currentRegion.name} to see them here`, actionText: "Search Places", onAction: () => router.push("/search") })), _jsx(VirtualPetCompanion, { visible: showPetCompanion, onClose: () => setShowPetCompanion(false) })] }) }));
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
        flexDirection: "row",
        alignItems: "center",
        marginTop: 12,
        paddingVertical: 8,
    },
    currentLocationText: {
        marginLeft: 8,
        fontSize: 14,
        color: Colors.primary,
        fontWeight: "500",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.text,
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    categoriesContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 24,
        paddingHorizontal: 16,
    },
});
