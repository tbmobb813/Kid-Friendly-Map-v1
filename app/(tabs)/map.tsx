import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View, ScrollView, Pressable, Dimensions, Platform, Modal, ActivityIndicator, UIManager } from "react-native";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";
import InteractiveMap from "@/components/InteractiveMap";
import ExpoMapView from "@/components/ExpoMapView";
import RouteCard from "@/components/RouteCard";
import EnhancedRouteCard from "@/components/EnhancedRouteCard";
import RoutingPreferences from "@/components/RoutingPreferences";
import SafetyPanel from "@/components/SafetyPanel";
import TravelModeSelector from "@/components/TravelModeSelector";
import MTALiveArrivals from "@/components/MTALiveArrivals";
import { useNavigationStore } from "@/stores/enhancedNavigationStore";
import { Route } from "@/types/navigation";
import { Navigation, MapPin, Search, X, Settings, AlertCircle, Zap } from "lucide-react-native";
import useLocation from "@/hooks/useLocation";
import { findStationById } from "@/config/transit/nyc-stations";
import MapLibreRouteView from "@/components/MapLibreRouteView";
import { isMapLibreAvailable } from "@/components/MapLibreMap";
import { useRouteORS } from "@/hooks/useRouteORS";
import Config from "@/utils/config";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function MapScreen() {
  const router = useRouter();
  const { location, loading: locationLoading } = useLocation();
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [showStationModal, setShowStationModal] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  
  const { 
    origin,
    destination,
    availableRoutes,
    unifiedRoutes,
    selectedRoute,
    selectedUnifiedRoute,
    selectedTravelMode,
    isLoadingRoutes,
    routingError,
    useAdvancedRouting,
    routingPreferences,
    setOrigin,
    findRoutes,
    selectRoute,
    selectUnifiedRoute,
    setTravelMode
  } = useNavigationStore();

  useEffect(() => {
    // Update origin when location changes, especially when moving from default to real location
    if (location && (!origin || origin.id === "current-location")) {
      console.log('📍 Updating origin to current location:', location);
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
  }, [location?.latitude, location?.longitude]);

  useEffect(() => {
    // Find routes when both origin and destination are set
    if (origin && destination) {
      findRoutes();
    }
  }, [origin, destination]);

  const handleRouteSelect = (route: Route) => {
    selectRoute(route);
    
    // Also select corresponding unified route if available
    const matchingUnifiedRoute = unifiedRoutes.find(ur => ur.id === route.id);
    if (matchingUnifiedRoute) {
      selectUnifiedRoute(matchingUnifiedRoute);
    }
    
    router.push(`/(tabs)/transit` as any);
  };

  const handleAdvancedRouteSelect = (unifiedRoute: any) => {
    selectUnifiedRoute(unifiedRoute);
    router.push(`/(tabs)/transit` as any);
  };

  const handleSearchPress = () => {
    router.push("/(tabs)/search" as any);
  };

  const handlePreferencesPress = () => {
    setShowPreferences(true);
  };

  const handleRetryRouting = () => {
    findRoutes();
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

  const mapLibreSupported = useMemo(() => {
    if (!isMapLibreAvailable) {
      return false;
    }

    if (Platform.OS === 'web') {
      return false;
    }

    const managerNames = ['MapLibreGLMapView', 'RCTMGLMapView'];
    return managerNames.some((name) => {
      try {
        return Boolean((UIManager as any)?.getViewManagerConfig?.(name));
      } catch {
        return false;
      }
    });
  }, []);

  // Check if expo-maps is available (only in development builds)
  const expoMapsSupported = useMemo(() => {
    // Expo Maps requires a development build - not available in Expo Go
    // Use a safe check that doesn't try to load the module
    try {
      // Check if expo-modules-core has the native module registered
      const ExpoModulesCore = require('expo-modules-core');
      const hasExpoMaps = ExpoModulesCore.NativeModulesProxy?.ExpoMaps != null;
      // Only support on Android for now since our implementation is Android-specific
      return hasExpoMaps && Platform.OS === 'android';
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (!mapLibreSupported && !expoMapsSupported) {
      console.warn(
        'Advanced mapping modules not detected. Using fallback OpenStreetMap. For better performance, run a development build with MapLibre or Expo Maps.',
      );
    }
  }, [mapLibreSupported, expoMapsSupported]);

  // Priority: MapLibre > Expo Maps > Interactive Map (OpenStreetMap)
  const mapImplementation = useMemo(() => {
    if (mapLibreSupported) return 'maplibre';
    if (expoMapsSupported) return 'expo-maps';
    return 'interactive';
  }, [mapLibreSupported, expoMapsSupported]);

  const originCoord = useMemo(
    () => (origin ? [origin.coordinates.longitude, origin.coordinates.latitude] as [number, number] : undefined),
    [origin?.coordinates?.longitude, origin?.coordinates?.latitude]
  );

  const destinationCoord = useMemo(
    () => (destination ? [destination.coordinates.longitude, destination.coordinates.latitude] as [number, number] : undefined),
    [destination?.coordinates?.longitude, destination?.coordinates?.latitude]
  );

  const { geojson: orsRouteGeoJSON } = useRouteORS(originCoord, destinationCoord, {
    enabled: Boolean(originCoord && destinationCoord && Config.ROUTING.ORS_API_KEY),
  });

  return (
    <View style={styles.container}>
      {/* GPS Status Indicator */}
      {locationLoading && (
        <View style={styles.gpsStatusBar}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.gpsStatusText}>Acquiring GPS location...</Text>
          <View style={styles.mapImplementationBadge}>
            <Text style={styles.mapImplementationText}>
              {mapImplementation === 'maplibre' ? 'MapLibre' : 
               mapImplementation === 'expo-maps' ? 'Google Maps' : 'OpenStreetMap'}
            </Text>
          </View>
        </View>
      )}
      {!locationLoading && location?.latitude !== 40.7128 && (
        <View style={styles.gpsStatusBar}>
          <View style={styles.gpsIndicator} />
          <Text style={styles.gpsStatusText}>GPS location active</Text>
          <View style={styles.mapImplementationBadge}>
            <Text style={styles.mapImplementationText}>
              {mapImplementation === 'maplibre' ? 'MapLibre' : 
               mapImplementation === 'expo-maps' ? 'Google Maps' : 'OpenStreetMap'}
            </Text>
          </View>
        </View>
      )}
      
      <View style={styles.mapContainer}>
        {mapImplementation === 'maplibre' ? (
          <MapLibreRouteView
            origin={origin ?? undefined}
            destination={destination ?? undefined}
            routeGeoJSON={orsRouteGeoJSON}
            onStationPress={handleStationPress}
            showTransitStations
          />
        ) : mapImplementation === 'expo-maps' ? (
          <ExpoMapView
            origin={origin || undefined}
            destination={destination || undefined}
            route={selectedRoute || undefined}
            onStationPress={handleStationPress}
            showTransitStations
            onMapReady={() => console.log('Expo Maps ready')}
          />
        ) : (
          <InteractiveMap
            origin={origin || undefined}
            destination={destination || undefined}
            route={selectedRoute || undefined}
            onStationPress={handleStationPress}
            showTransitStations
            onTouchStateChange={(active) => setScrollEnabled(!active)}
          />
        )}
      </View>

      <ScrollView 
        style={styles.scrollableContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEnabled={scrollEnabled}
      >
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
            <View style={styles.controlsRow}>
              <View style={styles.travelModeContainer}>
                <TravelModeSelector 
                  selectedMode={selectedTravelMode}
                  onModeChange={setTravelMode}
                />
              </View>
              <Pressable style={styles.preferencesButton} onPress={handlePreferencesPress}>
                <Settings size={20} color={Colors.primary} />
              </Pressable>
            </View>
            
            {/* Loading State */}
            {isLoadingRoutes && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Finding best routes...</Text>
                {routingPreferences.childAge && (
                  <Text style={styles.loadingSubtext}>
                    Optimizing for age {routingPreferences.childAge}
                  </Text>
                )}
              </View>
            )}

            {/* Error State */}
            {routingError && !isLoadingRoutes && (
              <View style={styles.errorContainer}>
                <AlertCircle size={24} color={Colors.error} />
                <Text style={styles.errorText}>{routingError}</Text>
                <Pressable style={styles.retryButton} onPress={handleRetryRouting}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </Pressable>
              </View>
            )}

            {/* Routes Section */}
            {!isLoadingRoutes && !routingError && (
              <>
                <View style={styles.routesHeader}>
                  <Text style={styles.sectionTitle}>
                    Available Routes ({useAdvancedRouting ? unifiedRoutes.length : availableRoutes.length})
                  </Text>
                  {useAdvancedRouting && (
                    <View style={styles.advancedBadge}>
                      <Zap size={12} color={Colors.success} />
                      <Text style={styles.advancedBadgeText}>Enhanced</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.routesContainer}>
                  {useAdvancedRouting ? (
                    // Enhanced route cards with scores and additional info
                    unifiedRoutes.map((unifiedRoute, index) => {
                      const legacyRoute = availableRoutes.find(r => r.id === unifiedRoute.id);
                      return legacyRoute ? (
                        <EnhancedRouteCard
                          key={unifiedRoute.id}
                          route={legacyRoute}
                          unifiedRoute={unifiedRoute}
                          onPress={handleRouteSelect}
                          isSelected={selectedUnifiedRoute?.id === unifiedRoute.id}
                          showDetailedScores={index === 0} // Show detailed scores for top route
                        />
                      ) : null;
                    })
                  ) : (
                    // Legacy route cards
                    availableRoutes.map(route => (
                      <RouteCard
                        key={route.id}
                        route={route}
                        onPress={handleRouteSelect}
                        isSelected={selectedRoute?.id === route.id}
                      />
                    ))
                  )}
                </View>

                {/* Route insights for enhanced routing */}
                {useAdvancedRouting && unifiedRoutes.length > 0 && (
                  <View style={styles.insightsContainer}>
                    <Text style={styles.insightsTitle}>Route Insights</Text>
                    {routingPreferences.childAge && (
                      <Text style={styles.insightText}>
                        🛡️ Routes optimized for {routingPreferences.childAge}-year-old safety
                      </Text>
                    )}
                    {routingPreferences.wheelchair && (
                      <Text style={styles.insightText}>
                        ♿ Showing only wheelchair accessible routes
                      </Text>
                    )}
                    {unifiedRoutes.some(r => r.alerts && r.alerts.length > 0) && (
                      <Text style={styles.insightText}>
                        ⚠️ Service alerts detected on some routes
                      </Text>
                    )}
                  </View>
                )}
              </>
            )}
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

      {/* Routing Preferences Modal */}
      <RoutingPreferences
        visible={showPreferences}
        onClose={() => setShowPreferences(false)}
      />

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gpsStatusBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  gpsIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  gpsStatusText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '600',
    flex: 1,
  },
  mapImplementationBadge: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mapImplementationText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '600',
  },
  mapContainer: {
    height: Platform.select({
      web: Math.min(screenHeight * 0.55, 540),
      default: screenHeight * 0.45,
    }),
    minHeight: 360,
    width: '100%',
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  scrollableContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 32,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
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
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  travelModeContainer: {
    flex: 1,
    marginRight: 12,
  },
  preferencesButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.primary + '15',
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text,
    marginTop: 12,
    fontWeight: "600",
  },
  loadingSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: Colors.error + '10',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: "center",
    marginVertical: 8,
  },
  retryButton: {
    backgroundColor: Colors.error,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  routesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  advancedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.success + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  advancedBadgeText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: "600",
  },
  insightsContainer: {
    backgroundColor: Colors.primary + '10',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
    lineHeight: 20,
  },
});
