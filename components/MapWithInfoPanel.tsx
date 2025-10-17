import React, { useRef, useMemo } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, Animated } from 'react-native';
import { Audio } from '@/utils/expoAudioBridge';
import BottomSheet from '@gorhom/bottom-sheet';
import AchievementBadge from '@/components/AchievementBadge';
import InteractiveMap from '@/components/InteractiveMap';
import SafetyPanel from '@/components/SafetyPanel';
import RouteCard from '@/components/RouteCard';
import EnhancedRouteCard from '@/components/EnhancedRouteCard';
import FunFactCard from '@/components/FunFactCard';
import { useNavigationStore } from '@/stores/enhancedNavigationStore';
import Colors from '@/constants/colors';

const { height: screenHeight } = Dimensions.get('window');

export default function MapWithInfoPanel() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const panelAnim = useRef(new Animated.Value(0)).current;
  // Sound effect on panel open
  const playPanelOpenSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(require('@/assets/sounds/panel-open.mp3'));
      await sound.playAsync();
    } catch {}
  };
  // Sound effect on completion (e.g., achievement unlock)
  const playCompletionSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(require('@/assets/sounds/completion.mp3'));
      await sound.playAsync();
    } catch {}
  };
  const {
    origin,
    destination,
    availableRoutes,
    unifiedRoutes,
    selectedRoute,
    selectedUnifiedRoute,
    useAdvancedRouting,
    routingPreferences,
    isLoadingRoutes,
    routingError,
    findRoutes,
    setTravelMode,
    selectedTravelMode,
  } = useNavigationStore();

  // Snap points for bottom sheet
  const snapPoints = useMemo(() => [120, screenHeight * 0.45, screenHeight * 0.85], []);

  // Example achievement data
  const achievements = [
    {
      id: 'explorer-1',
      title: 'Explorer Level 1',
      description: 'Visited 5 stations',
      icon: '🧭',
      points: 50,
      unlocked: true,
    },
    {
      id: 'explorer-2',
      title: 'Explorer Level 2',
      description: 'Visited 10 stations',
      icon: '🧭',
      points: 100,
      unlocked: false,
    },
  ];

  // Animate panel open
  const handleSheetOpen = () => {
    Animated.timing(panelAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
    playPanelOpenSound();
  };

  // Mascot speech bubble state for hints (lifted to parent)
  const [mascotHint, setMascotHint] = React.useState('Hi! Tap a route or ask for help!');

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <InteractiveMap
          origin={origin || undefined}
          destination={destination || undefined}
          route={selectedRoute || undefined}
          showTransitStations
          mascotHint={mascotHint}
          setMascotHint={setMascotHint}
        />
      </View>
      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        onChange={handleSheetOpen}
      >
        <Animated.View
          style={[
            styles.sheetContent,
            {
              opacity: panelAnim,
              transform: [
                { scale: panelAnim.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] }) },
              ],
            },
          ]}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.swipeBlocks}>
            {/* Safety Status Block */}
            <View style={styles.block}>
              <SafetyPanel currentLocation={origin?.coordinates} currentPlace={destination} />
            </View>
            {/* Route Cards Block */}
            <View style={styles.block}>
              {destination && !isLoadingRoutes && !routingError && (
                <ScrollView style={styles.routesContainer}>
                  {useAdvancedRouting
                    ? unifiedRoutes.map((unifiedRoute) => {
                        const legacyRoute = availableRoutes.find((r) => r.id === unifiedRoute.id);
                        return legacyRoute ? (
                          <EnhancedRouteCard
                            key={unifiedRoute.id}
                            route={legacyRoute}
                            unifiedRoute={unifiedRoute}
                            isSelected={selectedUnifiedRoute?.id === unifiedRoute.id}
                            onPress={playCompletionSound}
                          />
                        ) : null;
                      })
                    : availableRoutes.map((route) => (
                        <RouteCard
                          key={route.id}
                          route={route}
                          isSelected={selectedRoute?.id === route.id}
                          onPress={playCompletionSound}
                        />
                      ))}
                </ScrollView>
              )}
            </View>
            {/* Fun Fact Block */}
            <View style={styles.block}>
              <FunFactCard fact="Did you know? The NYC subway has 472 stations!" />
            </View>
            {/* Achievements/Sticker Block */}
            <View style={styles.block}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.achievementsRow}
              >
                {achievements.map((a) => (
                  <View key={a.id} style={styles.achievementBadgeWrap}>
                    <AchievementBadge achievement={a} size="medium" onPress={playCompletionSound} />
                  </View>
                ))}
              </ScrollView>
            </View>
          </ScrollView>
        </Animated.View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  swipeBlocks: {
    flexGrow: 0,
    flexShrink: 0,
    flexDirection: 'row',
    paddingVertical: 8,
  },
  block: {
    width: 280,
    marginRight: 16,
    backgroundColor: '#F8F8FF',
    borderRadius: 16,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  achievementsRow: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  achievementBadgeWrap: {
    marginRight: 8,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  sheetBackground: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
  sheetContent: {
    flex: 1,
    padding: 16,
  },
  routesContainer: {
    marginTop: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  errorContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
});
