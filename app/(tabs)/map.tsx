import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
// (View, Text already imported below)
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TouchableOpacity } from 'react-native';
import { HelpCircle, Accessibility, Menu } from 'lucide-react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
// MapLibreGL Native Map scaffold
const MapLibreMapView = ({
  origin,
  destination,
  route,
  showTransitStations,
  stations,
  onStationPress,
  mapStyle,
}: any) => (
  <MapLibreGL.MapView style={{ flex: 1 }} mapStyle={mapStyle}>
    {/* Center on origin if available */}
    <MapLibreGL.Camera
      zoomLevel={13}
      centerCoordinate={
        origin?.coordinates
          ? [origin.coordinates.longitude, origin.coordinates.latitude]
          : [-74.006, 40.7128]
      }
    />
    {/* Marker for origin/current location */}
    {origin?.coordinates && (
      <MapLibreGL.PointAnnotation
        id="origin"
        coordinate={[origin.coordinates.longitude, origin.coordinates.latitude]}
      >
        <View style={{ backgroundColor: '#4F8EF7', borderRadius: 12, padding: 6 }}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>📍</Text>
        </View>
      </MapLibreGL.PointAnnotation>
    )}
    {/* Marker for destination */}
    {destination?.coordinates && (
      <MapLibreGL.PointAnnotation
        id="destination"
        coordinate={[destination.coordinates.longitude, destination.coordinates.latitude]}
      >
        <View style={{ backgroundColor: '#F7B500', borderRadius: 12, padding: 6 }}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>🏁</Text>
        </View>
      </MapLibreGL.PointAnnotation>
    )}
    {/* Polyline for route */}
    {route?.geometry?.coordinates && (
      <MapLibreGL.ShapeSource
        id="route"
        shape={{ type: 'LineString', coordinates: route.geometry.coordinates }}
      >
        <MapLibreGL.LineLayer id="routeLine" style={{ lineColor: '#4F8EF7', lineWidth: 5 }} />
      </MapLibreGL.ShapeSource>
    )}
    {/* Show transit stations as markers, wire up tap logic */}
    {showTransitStations &&
      Array.isArray(stations) &&
      stations.map((station: any) => (
        <MapLibreGL.PointAnnotation
          key={station.id}
          id={station.id}
          coordinate={[station.coordinates.longitude, station.coordinates.latitude]}
          onSelected={() => onStationPress?.(station.id)}
        >
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 8,
              padding: 4,
              borderWidth: 1,
              borderColor: '#4F8EF7',
            }}
          >
            <Text style={{ color: '#4F8EF7', fontWeight: 'bold', fontSize: 12 }}>🚉</Text>
          </View>
        </MapLibreGL.PointAnnotation>
      ))}
  </MapLibreGL.MapView>
);
// Note: Expo-maps removed. We prefer MapLibre; a standalone ExpoMapView wrapper
// now exists in `components/ExpoMapView.tsx` which itself prefers MapLibre.

// FAB bullet/burger menu: single main FAB that toggles small action buttons above it
import FloatingMenu from '@/components/FloatingMenu';
// Removed local BottomSheet placeholder to avoid naming conflict
const RouteInfoPanel = ({ route, unifiedRoute }: any) => {
  if (!route && !unifiedRoute) {
    return (
      <View style={{ padding: 8 }}>
        <Text style={{ fontWeight: '600', color: '#4F8EF7' }}>No route selected</Text>
        <Text style={{ color: '#666', marginTop: 6 }}>
          Set an origin and destination to see route details here.
        </Text>
      </View>
    );
  }

  const summary = route?.properties?.summary ?? unifiedRoute?.properties?.summary ?? null;

  return (
    <View style={{ padding: 8 }}>
      <Text style={{ fontWeight: '700', fontSize: 16, color: '#0f172a' }}>
        {route?.name ?? unifiedRoute?.name ?? 'Selected route'}
      </Text>
      {summary && (
        <Text
          style={{ color: '#374151', marginTop: 6 }}
        >{`Distance: ${Math.round(((summary.distance ?? 0) / 1000) * 10) / 10} km · Duration: ${Math.round((summary.duration ?? 0) / 60)} min`}</Text>
      )}
    </View>
  );
};

const SafetyPanel = ({ children }: any) => (
  <View style={{ padding: 8, backgroundColor: '#FEF3F2', borderRadius: 8, marginVertical: 8 }}>
    <Text style={{ fontWeight: '700', color: '#B91C1C' }}>Safety tips</Text>
    <Text style={{ color: '#7F1D1D', marginTop: 6 }}>
      • Stay on well-lit routes at night
      {'\n'}• Keep an eye on surroundings and avoid isolated areas
      {'\n'}• Make sure your child is visible to drivers
    </Text>
    {children}
  </View>
);

const FunFactCard = ({ fact }: any) => (
  <View style={{ padding: 8, backgroundColor: '#EEF2FF', borderRadius: 8, marginVertical: 8 }}>
    <Text style={{ fontWeight: '700', color: '#3730A3' }}>Fun fact</Text>
    <Text style={{ color: '#3730A3', marginTop: 6 }}>
      {fact ?? 'Parks make kids happier — take a detour!'}
    </Text>
  </View>
);

const ParentControlsTab = ({ onOpenSettings }: any) => (
  <View style={{ padding: 8 }}>
    <Text style={{ fontWeight: '700' }}>Parent Controls</Text>
    <TouchableOpacity onPress={onOpenSettings} style={{ marginTop: 8 }}>
      <View
        style={{
          padding: 10,
          backgroundColor: '#fff',
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#E6E6E6',
        }}
      >
        <Text>Settings</Text>
      </View>
    </TouchableOpacity>
  </View>
);
const AnimatedConfetti = () => (
  <View
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 20,
      backgroundColor: 'transparent',
      zIndex: 100,
    }}
  >
    <Text>AnimatedConfetti</Text>
  </View>
);
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Platform,
  Modal,
  ActivityIndicator,
  UIManager,
} from 'react-native';
// Import bottom-sheet at runtime to avoid type resolution issues in some environments
let BottomSheet: any = null;
let BottomSheetView: any = null;
let BottomSheetHandle: any = null;
let BottomSheetModalProvider: any = ({ children }: any) => children;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const _bs = require('@gorhom/bottom-sheet');
  BottomSheet = _bs.default ?? _bs;
  BottomSheetView = _bs.BottomSheetView ?? _bs.BottomSheetView;
  BottomSheetHandle = _bs.BottomSheetHandle ?? _bs.BottomSheetHandle;
  BottomSheetModalProvider =
    _bs.BottomSheetModalProvider ?? _bs.BottomSheetModalProvider ?? BottomSheetModalProvider;
} catch (e) {
  // If module isn't present at runtime (e.g. tests), fallback to no-op components
  BottomSheet = ({ children }: any) => <>{children}</>;
}
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import MapWithInfoPanel from '@/components/MapWithInfoPanel';
import { useNavigationStore } from '@/stores/enhancedNavigationStore';
import { Route } from '@/types/navigation';
import { Navigation, MapPin, Search, X, Settings, AlertCircle, Zap } from 'lucide-react-native';
import useLocation from '@/hooks/useLocation';
import { findStationById, findNearestStations } from '@/config/transit/nyc-stations';
import MapViewWrapper from '@/components/MapViewWrapper';
import { isMapLibreAvailable } from '@/components/MapLibreMap';
import { useRouteORS } from '@/hooks/useRouteORS';
import Config from '@/utils/config';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function MapScreen() {
  const router = useRouter();
  const { location, loading: locationLoading } = useLocation();
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [showStationModal, setShowStationModal] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const mapLibreCameraRef = React.useRef(null);
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
    setTravelMode,
  } = useNavigationStore();

  useEffect(() => {
    // Update origin when location changes, especially when moving from default to real location
    if (location && (!origin || origin.id === 'current-location')) {
      console.log('📍 Updating origin to current location:', location);
      setOrigin({
        id: 'current-location',
        name: 'Current Location',
        address: 'Your current position',
        category: 'other',
        coordinates: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
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
    const matchingUnifiedRoute = unifiedRoutes.find((ur) => ur.id === route.id);
    if (matchingUnifiedRoute) {
      selectUnifiedRoute(matchingUnifiedRoute);
    }

    router.push(`/(tabs)/transit` as any);
  };

  const handleAdvancedRouteSelect = (unifiedRoute: any) => {
    selectUnifiedRoute(unifiedRoute);
    router.push(`/(tabs)/transit` as any);
    router.push('/(tabs)/transit');
  };

  const handleSearchPress = () => {
    router.push('/(tabs)/search' as any);
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
    try {
      // call the runtime function to check availability without forcing require at import time
      if (!isMapLibreAvailable()) {
        return false;
      }
    } catch {
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


  useEffect(() => {
    if (!mapLibreSupported) {
      console.warn(
        'MapLibre not detected. Using fallback OpenStreetMap. For better performance, run a development build with MapLibre.',
      );
    }
  }, [mapLibreSupported]);

  // Priority: MapLibre > Interactive Map (OpenStreetMap)
  const mapImplementation = useMemo(() => {
    return mapLibreSupported ? 'maplibre' : 'interactive';
  }, [mapLibreSupported]);

  const originCoord = useMemo(
    () =>
      origin
        ? ([origin.coordinates.longitude, origin.coordinates.latitude] as [number, number])
        : undefined,
    [origin?.coordinates?.longitude, origin?.coordinates?.latitude],
  );

  const destinationCoord = useMemo(
    () =>
      destination
        ? ([destination.coordinates.longitude, destination.coordinates.latitude] as [
            number,
            number,
          ])
        : undefined,
    [destination?.coordinates?.longitude, destination?.coordinates?.latitude],
  );

  // Get real nearby stations using helper
  const nearbyStations = useMemo(() => {
    if (origin?.coordinates) {
      return findNearestStations(origin.coordinates.latitude, origin.coordinates.longitude, 10).map(
        (s) => s.station,
      );
    }
    return [];
  }, [origin?.coordinates?.latitude, origin?.coordinates?.longitude]);

  const { geojson: orsRouteGeoJSON } = useRouteORS(originCoord, destinationCoord, {
    enabled: Boolean(originCoord && destinationCoord && Config.ROUTING.ORS_API_KEY),
  });

  // ...existing code...
  // Snap points for bottom sheet
  const bottomSheetSnapPoints = ['25%', '60%'];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          {/* AnimatedConfetti overlays everything */}
          <AnimatedConfetti />
          {/* Debug badge showing which map implementation is active */}
          <View
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              zIndex: 1200,
              backgroundColor: 'rgba(0,0,0,0.6)',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
            }}
            pointerEvents="none"
          >
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
              {`Map: ${mapImplementation}`}
            </Text>
            {__DEV__ ? (
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/dev/native-debug')}
                style={{
                  marginTop: 6,
                  pointerEvents: 'auto',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  paddingHorizontal: 6,
                  paddingVertical: 4,
                  borderRadius: 4,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 11 }}>Debug</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          {/* MapView fills space above bottom sheet */}
          <View style={{ flex: 1 }}>
            {/* Use MapLibreRouteView which accepts GeoJSON for route rendering.
                Prefer ORS geojson (real-time routing) when available, otherwise
                fall back to unified route geometry (converted to a FeatureCollection).
            */}
            {
              // Log the route GeoJSON before passing to the map for easier tracing in tests/dev
            }
            {(() => {
              const routeToPass =
                orsRouteGeoJSON ??
                (selectedUnifiedRoute && selectedUnifiedRoute.geometry
                  ? {
                      type: 'FeatureCollection',
                      features: [
                        {
                          type: 'Feature',
                          id: selectedUnifiedRoute.id,
                          properties: {},
                          geometry: selectedUnifiedRoute.geometry,
                        },
                      ],
                    }
                  : null);

              // Lightweight defensive logging so test harnesses can assert logs
              try {
                // Avoid circulars; stringify minimal info
                const summary = routeToPass
                  ? {
                      type: routeToPass.type,
                      features: (routeToPass.features || []).map((f: any) => ({ id: f.id, type: f.geometry?.type })),
                    }
                  : null;
                // eslint-disable-next-line no-console
                console.debug('[MapScreen] routeGeoJSON before MapLibreRouteView:', summary);
              } catch (e) {
                // ignore logging errors
              }

              return (
                <MapViewWrapper
                  origin={origin ?? undefined}
                  destination={destination ?? undefined}
                  route={routeToPass}
                  onStationPress={handleStationPress}
                  showTransitStations={true}
                  testId="maplibre-route-view"
                />
              );
            })()}
          </View>
          {/* FloatingControls float above map, not inside it */}
          <View style={{ position: 'absolute', bottom: 240, right: 24, zIndex: 10 }}>
            <FloatingMenu
              onRecenter={() => {
                // Recenter map to origin (user location)
                if (origin?.coordinates && globalThis?.mapLibreCameraRef?.current) {
                  globalThis.mapLibreCameraRef.current.setCamera({
                    centerCoordinate: [origin.coordinates.longitude, origin.coordinates.latitude],
                    zoomLevel: 15,
                    animationDuration: 800,
                  });
                }
              }}
              onHelp={() => {
                // Show help modal or info
                alert(
                  'Help: Tap stations for info, drag up the panel for details, use accessibility for larger text.',
                );
              }}
              onToggleAccessibility={() => {
                // Toggle accessibility mode in navigation store
                setShowPreferences((prev) => !prev);
              }}
            />
          </View>
          {/* Interactive BottomSheet from @gorhom/bottom-sheet */}
          <BottomSheet
            index={0}
            snapPoints={bottomSheetSnapPoints}
            backgroundStyle={{
              backgroundColor: '#fff',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: -2 },
              elevation: 8,
            }}
            handleIndicatorStyle={{
              backgroundColor: '#4F8EF7',
              width: 40,
              height: 6,
              borderRadius: 3,
              alignSelf: 'center',
              marginVertical: 8,
            }}
          >
            <BottomSheetView style={{ padding: 16 }}>
              <RouteInfoPanel />
              <SafetyPanel />
              <FunFactCard />
              <ParentControlsTab />
              {/* Test content for visibility */}
              <Text style={{ textAlign: 'center', color: '#4F8EF7', marginTop: 16 }}>
                BottomSheet is visible!
              </Text>
            </BottomSheetView>
          </BottomSheet>
        </View>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  // ...existing code...
  // ...existing code...
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
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  locationPins: {
    alignItems: 'center',
    marginRight: 16,
  },
  locationPin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
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
    justifyContent: 'center',
  },
  locationText: {
    fontSize: 16,
    color: Colors.text,
  },
  placeholderText: {
    color: Colors.textLight,
  },
  searchIcon: {
    position: 'absolute',
    right: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    minHeight: 200,
  },
  emptyStateText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
  searchButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text,
    marginTop: 12,
    fontWeight: '600',
  },
  loadingSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
    textAlign: 'center',
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
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  routesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  advancedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  advancedBadgeText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '600',
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
    fontWeight: '600',
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
