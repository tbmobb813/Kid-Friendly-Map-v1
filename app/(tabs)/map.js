import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, Pressable, Dimensions, Platform } from "react-native";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";
import MapPlaceholder from "@/components/MapPlaceholder";
import InteractiveMap from "@/components/InteractiveMap";
import RouteCard from "@/components/RouteCard";
import SafetyPanel from "@/components/SafetyPanel";
import TravelModeSelector from "@/components/TravelModeSelector";
import { useNavigationStore } from "@/stores/navigationStore";
import { Navigation, MapPin, Search } from "lucide-react-native";
import useLocation from "@/hooks/useLocation";
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
export default function MapScreen() {
    const router = useRouter();
    const { location } = useLocation();
    const { origin, destination, availableRoutes, selectedRoute, selectedTravelMode, setOrigin, findRoutes, selectRoute, setTravelMode } = useNavigationStore();
    useEffect(() => {
        // If no origin is set, use current location
        if (!origin && location) {
            setOrigin({
                id: "current-location",
                name: "Current Location",
                address: "Your current position",
                category: "other",
                coordinates: {
                    latitude: location.latitude,
                    longitude: location.longitude
                }
            });
        }
    }, [location, origin]);
    useEffect(() => {
        // Find routes when both origin and destination are set
        if (origin && destination) {
            findRoutes();
        }
    }, [origin, destination]);
    const handleRouteSelect = (route) => {
        selectRoute(route);
        router.push(`/route/${route.id}`);
    };
    const handleSearchPress = () => {
        router.push("/search");
    };
    return (_jsxs(ScrollView, { style: styles.container, contentContainerStyle: styles.scrollContent, showsVerticalScrollIndicator: false, bounces: true, children: [_jsx(View, { style: styles.mapContainer, children: origin && destination ? (_jsx(InteractiveMap, { origin: origin, destination: destination, route: selectedRoute || undefined })) : (_jsx(MapPlaceholder, { message: destination
                        ? `Map showing route to ${destination.name}`
                        : "Select a destination to see the route" })) }), _jsx(SafetyPanel, { currentLocation: location, currentPlace: destination ? {
                    id: destination.id,
                    name: destination.name
                } : undefined }), _jsxs(View, { style: styles.contentContainer, children: [_jsxs(View, { style: styles.locationBar, children: [_jsxs(View, { style: styles.locationPins, children: [_jsx(View, { style: [styles.locationPin, styles.originPin], children: _jsx(Navigation, { size: 16, color: "#FFFFFF" }) }), _jsx(View, { style: styles.locationConnector }), _jsx(View, { style: [styles.locationPin, styles.destinationPin], children: _jsx(MapPin, { size: 16, color: "#FFFFFF" }) })] }), _jsxs(View, { style: styles.locationTexts, children: [_jsx(Pressable, { style: styles.locationButton, children: _jsx(Text, { style: styles.locationText, numberOfLines: 1, children: origin?.name || "Select starting point" }) }), _jsxs(Pressable, { style: styles.locationButton, onPress: handleSearchPress, children: [_jsx(Text, { style: [
                                                    styles.locationText,
                                                    !destination && styles.placeholderText
                                                ], numberOfLines: 1, children: destination?.name || "Where to?" }), !destination && (_jsx(Search, { size: 16, color: Colors.textLight, style: styles.searchIcon }))] })] })] }), destination ? (_jsxs(_Fragment, { children: [_jsx(TravelModeSelector, { selectedMode: selectedTravelMode, onModeChange: setTravelMode }), _jsx(Text, { style: styles.sectionTitle, children: "Available Routes" }), _jsx(View, { style: styles.routesContainer, children: availableRoutes.map(route => (_jsx(RouteCard, { route: route, onPress: handleRouteSelect, isSelected: selectedRoute?.id === route.id }, route.id))) })] })) : (_jsxs(View, { style: styles.emptyStateContainer, children: [_jsx(MapPin, { size: 40, color: Colors.textLight }), _jsx(Text, { style: styles.emptyStateText, children: "Select a destination to see available routes" }), _jsx(Pressable, { style: styles.searchButton, onPress: handleSearchPress, children: _jsx(Text, { style: styles.searchButtonText, children: "Search Places" }) })] }))] })] }));
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        minHeight: screenHeight,
    },
    mapContainer: {
        height: Platform.select({
            web: Math.min(screenHeight * 0.4, 400),
            default: Math.min(screenHeight * 0.35, 300),
        }),
        minHeight: 250,
    },
    contentContainer: {
        flex: 1,
        padding: 16,
        paddingBottom: 32,
    },
    routesContainer: {
        gap: 12,
    },
    locationBar: {
        flexDirection: "row",
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    locationPins: {
        alignItems: "center",
        marginRight: 16,
    },
    locationPin: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },
    originPin: {
        backgroundColor: Colors.primary,
    },
    destinationPin: {
        backgroundColor: Colors.secondary,
    },
    locationConnector: {
        width: 2,
        height: 24,
        backgroundColor: Colors.border,
    },
    locationTexts: {
        flex: 1,
    },
    locationButton: {
        paddingVertical: 8,
        justifyContent: "center",
    },
    locationText: {
        fontSize: 16,
        color: Colors.text,
    },
    placeholderText: {
        color: Colors.textLight,
    },
    searchIcon: {
        position: "absolute",
        right: 0,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.text,
        marginBottom: 16,
    },
    emptyStateContainer: {
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        minHeight: 200,
    },
    emptyStateText: {
        marginTop: 16,
        marginBottom: 24,
        fontSize: 16,
        color: Colors.textLight,
        textAlign: "center",
    },
    searchButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    searchButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
});
