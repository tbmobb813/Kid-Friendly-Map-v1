import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, Pressable, Dimensions, Platform, Modal } from "react-native";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";
import MapPlaceholder from "@/components/MapPlaceholder";
import InteractiveMap from "@/components/InteractiveMap";
import RouteCard from "@/components/RouteCard";
import SafetyPanel from "@/components/SafetyPanel";
import TravelModeSelector from "@/components/TravelModeSelector";
import MTALiveArrivals from "@/components/MTALiveArrivals";
import { useNavigationStore } from "@/stores/navigationStore";
import { Route } from "@/types/navigation";
import { Navigation, MapPin, Search, X } from "lucide-react-native";
import useLocation from "@/hooks/useLocation";
import { findStationById } from "@/config/transit/nyc-stations";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function MapScreen() {
  const router = useRouter();
  const { location } = useLocation();
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [showStationModal, setShowStationModal] = useState(false);
  
  const { 
    origin,
    destination,
    availableRoutes,
    selectedRoute,
    selectedTravelMode,
    setOrigin,
    findRoutes,
    selectRoute,
    setTravelMode
  } = useNavigationStore();

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

  const handleRouteSelect = (route: Route) => {
    selectRoute(route);
    router.push(`/(tabs)/transit` as any); // Navigate to transit instead of route for now
  };

  const handleSearchPress = () => {
    router.push("/(tabs)/search" as any);
  };

  const handleStationPress = (stationId: string) => {
    setSelectedStationId(stationId);
    setShowStationModal(true);
  };

  const handleCloseStationModal = () => {
    setShowStationModal(false);
    setSelectedStationId(null);
  };

  const selectedStation = selectedStationId ? findStationById(selectedStationId) : null;

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      bounces={true}
    >
      <View style={styles.mapContainer}>
        {origin && destination ? (
          <InteractiveMap
            origin={origin}
            destination={destination}
            route={selectedRoute || undefined}
            onStationPress={handleStationPress}
            showTransitStations={true}
          />
        ) : (
          <InteractiveMap
            origin={origin || undefined}
            destination={destination || undefined}
            onStationPress={handleStationPress}
            showTransitStations={true}
          />
        )}
      </View>

      <SafetyPanel 
        currentLocation={location} 
        currentPlace={destination ? {
          id: destination.id,
          name: destination.name
        } : undefined}
      />

      <View style={styles.contentContainer}>
        <View style={styles.locationBar}>
          <View style={styles.locationPins}>
            <View style={[styles.locationPin, styles.originPin]}>
              <Navigation size={16} color="#FFFFFF" />
            </View>
            <View style={styles.locationConnector} />
            <View style={[styles.locationPin, styles.destinationPin]}>
              <MapPin size={16} color="#FFFFFF" />
            </View>
          </View>
          
          <View style={styles.locationTexts}>
            <Pressable style={styles.locationButton}>
              <Text style={styles.locationText} numberOfLines={1}>
                {origin?.name || "Select starting point"}
              </Text>
            </Pressable>
            
            <Pressable 
              style={styles.locationButton}
              onPress={handleSearchPress}
            >
              <Text 
                style={[
                  styles.locationText, 
                  !destination && styles.placeholderText
                ]} 
                numberOfLines={1}
              >
                {destination?.name || "Where to?"}
              </Text>
              {!destination && (
                <Search size={16} color={Colors.textLight} style={styles.searchIcon} />
              )}
            </Pressable>
          </View>
        </View>

        {destination ? (
          <>
            <TravelModeSelector 
              selectedMode={selectedTravelMode}
              onModeChange={setTravelMode}
            />
            <Text style={styles.sectionTitle}>Available Routes</Text>
            <View style={styles.routesContainer}>
              {availableRoutes.map(route => (
                <RouteCard
                  key={route.id}
                  route={route}
                  onPress={handleRouteSelect}
                  isSelected={selectedRoute?.id === route.id}
                />
              ))}
            </View>
          </>
        ) : (
          <View style={styles.emptyStateContainer}>
            <MapPin size={40} color={Colors.textLight} />
            <Text style={styles.emptyStateText}>
              Select a destination to see available routes
            </Text>
            <Pressable 
              style={styles.searchButton}
              onPress={handleSearchPress}
            >
              <Text style={styles.searchButtonText}>Search Places</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Station Info Modal */}
      <Modal
        visible={showStationModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseStationModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <Text style={styles.modalTitle}>
                {selectedStation?.name || "Station Info"}
              </Text>
              <Text style={styles.modalSubtitle}>
                Live Transit Information
              </Text>
            </View>
            <Pressable 
              style={styles.closeButton}
              onPress={handleCloseStationModal}
            >
              <X size={24} color={Colors.text} />
            </Pressable>
          </View>
          
          {selectedStationId && (
            <MTALiveArrivals 
              stationId={selectedStationId}
              stationType="subway"
              stationName={selectedStation?.name}
            />
          )}
        </View>
      </Modal>
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
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
  },
});
