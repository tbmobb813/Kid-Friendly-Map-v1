/**
 * Smart Navigation Screen
 * Integrates AI route suggestions with map visualization and voice guidance
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, Modal, ScrollView, Alert } from 'react-native';
import * as Location from 'expo-location';
import KidFriendlyMap, { RoutePoint, SafeZone } from './KidFriendlyMap';
import AIRouteSuggestions from './AIRouteSuggestions';
import { aiRouteEngine, SmartRoute, RoutePreferences } from '../utils/aiRouteEngine';
import { voiceManager, speakNavigation } from '../utils/voice';
import { log } from '../utils/logger';

type ScreenMode = 'search' | 'suggestions' | 'navigation';

export default function SmartNavigationScreen() {
  // Navigation state
  const [mode, setMode] = useState<ScreenMode>('search');
  const [origin, setOrigin] = useState<Location.LocationObject | null>(null);
  const [destination, setDestination] = useState<{
    latitude: number;
    longitude: number;
    name?: string;
  } | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<SmartRoute | null>(null);

  // UI state
  const [destinationInput, setDestinationInput] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<RoutePreferences>(
    aiRouteEngine['userPreferences'],
  );

  // Map data
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [safeZones, setSafeZones] = useState<SafeZone[]>([]);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (selectedRoute) {
      // Convert smart route to map route points
      const points: RoutePoint[] = selectedRoute.steps.map((step) => ({
        latitude: step.location.latitude,
        longitude: step.location.longitude,
        instruction: step.instruction,
      }));
      setRoutePoints(points);

      // Extract safe zones from route
      const zones: SafeZone[] = selectedRoute.steps
        .filter((step) => step.type === 'safety-check')
        .map((step, idx) => ({
          id: `safe-${idx}`,
          center: step.location,
          radius: 100,
          name: step.instruction,
          color: '#00C800',
        }));
      setSafeZones(zones);

      // Start voice navigation
      if (preferences.voiceEnabled) {
        startVoiceNavigation(selectedRoute);
      }

      setMode('navigation');
    }
  }, [selectedRoute]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please enable location access to use navigation');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setOrigin(location);
    } catch (error) {
      log.error('Failed to get location', error as Error);
    }
  };

  const startVoiceNavigation = async (route: SmartRoute) => {
    await speakNavigation(
      `Starting ${route.name}. This journey will take about ${route.estimatedDuration} minutes. ${route.aiRecommendations[0]}`,
    );

    // Announce first instruction
    if (route.steps.length > 0) {
      setTimeout(async () => {
        await speakNavigation(route.steps[0].instruction);
      }, 3000);
    }
  };

  const handleSearch = () => {
    // In a real app, this would geocode the destination
    // For demo, using a mock location near NYC
    const mockDestination = {
      latitude: origin ? origin.coords.latitude + 0.01 : 40.7589,
      longitude: origin ? origin.coords.longitude + 0.01 : -73.9851,
      name: destinationInput,
    };
    setDestination(mockDestination);
    setMode('suggestions');
  };

  const handleRouteSelect = (route: SmartRoute) => {
    setSelectedRoute(route);
  };

  const handleBackToSearch = () => {
    setMode('search');
    setDestination(null);
    setSelectedRoute(null);
    setRoutePoints([]);
    setSafeZones([]);
  };

  const handleBackToSuggestions = () => {
    setMode('suggestions');
    setSelectedRoute(null);
    setRoutePoints([]);
    setSafeZones([]);
  };

  const updatePreferences = (updates: Partial<RoutePreferences>) => {
    const newPrefs = { ...preferences, ...updates };
    setPreferences(newPrefs);
    aiRouteEngine.updatePreferences(newPrefs);
    setShowPreferences(false);
  };

  return (
    <View className="flex-1">
      {/* Search Mode */}
      {mode === 'search' && (
        <View className="flex-1 bg-gradient-to-br from-blue-50 to-purple-50">
          <View className="p-6 pt-12">
            <Text className="text-4xl font-bold text-gray-800 mb-2">🚀 Smart Navigation</Text>
            <Text className="text-lg text-gray-600 mb-8">
              AI-powered routes for kid-friendly journeys
            </Text>

            {/* Current Location */}
            <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Starting From:</Text>
              <Text className="text-base text-gray-900">
                {origin
                  ? `📍 ${origin.coords.latitude.toFixed(4)}, ${origin.coords.longitude.toFixed(4)}`
                  : '⏳ Getting your location...'}
              </Text>
            </View>

            {/* Destination Input */}
            <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Where to?</Text>
              <TextInput
                className="bg-gray-50 p-3 rounded-lg text-base"
                placeholder="Enter destination (e.g., Museum, Park)"
                value={destinationInput}
                onChangeText={setDestinationInput}
                autoCapitalize="words"
              />
            </View>

            {/* Search Button */}
            <Pressable
              onPress={handleSearch}
              disabled={!origin || !destinationInput}
              className={`rounded-xl p-4 shadow-lg ${
                origin && destinationInput
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                  : 'bg-gray-300'
              }`}
            >
              <Text className="text-white text-center text-lg font-bold">🔍 Find Smart Routes</Text>
            </Pressable>

            {/* Preferences Button */}
            <Pressable
              onPress={() => setShowPreferences(true)}
              className="mt-4 bg-white rounded-xl p-4 shadow-sm"
            >
              <Text className="text-gray-800 text-center font-semibold">⚙️ Route Preferences</Text>
            </Pressable>

            {/* Feature Highlights */}
            <View className="mt-8 space-y-4">
              <View className="flex-row items-start">
                <Text className="text-3xl mr-3">🤖</Text>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-800">AI-Powered Routes</Text>
                  <Text className="text-sm text-gray-600">
                    Smart algorithms find the safest, fastest routes
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start">
                <Text className="text-3xl mr-3">🛡️</Text>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-800">Safety First</Text>
                  <Text className="text-sm text-gray-600">
                    Routes prioritize safe zones and kid-friendly areas
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start">
                <Text className="text-3xl mr-3">🎯</Text>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-800">Personalized</Text>
                  <Text className="text-sm text-gray-600">
                    Learns from your preferences and journey history
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Suggestions Mode */}
      {mode === 'suggestions' && (
        <View className="flex-1">
          <View className="bg-white p-4 shadow-md flex-row items-center">
            <Pressable onPress={handleBackToSearch} className="mr-3">
              <Text className="text-2xl">←</Text>
            </Pressable>
            <Text className="text-lg font-bold text-gray-800 flex-1">AI Route Options</Text>
          </View>
          <AIRouteSuggestions
            origin={origin!}
            destination={destination!}
            onRouteSelect={handleRouteSelect}
          />
        </View>
      )}

      {/* Navigation Mode */}
      {mode === 'navigation' && selectedRoute && (
        <View className="flex-1">
          {/* Navigation Header */}
          <View className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 shadow-lg">
            <View className="flex-row items-center mb-2">
              <Pressable onPress={handleBackToSuggestions} className="mr-3">
                <Text className="text-2xl text-white">←</Text>
              </Pressable>
              <View className="flex-1">
                <Text className="text-lg font-bold text-white">{selectedRoute.name}</Text>
                <Text className="text-sm text-white opacity-90">
                  {selectedRoute.estimatedDuration} min •{' '}
                  {Math.round(selectedRoute.walkingDistance)}m walking
                </Text>
              </View>
              <View className="bg-white bg-opacity-30 rounded-full px-3 py-1">
                <Text className="text-white font-bold">{selectedRoute.kidFriendlyScore}%</Text>
              </View>
            </View>

            {/* Current Instruction */}
            {selectedRoute.steps.length > 0 && (
              <View className="bg-white bg-opacity-20 rounded-lg p-3 mt-2">
                <Text className="text-white text-base">{selectedRoute.steps[0].instruction}</Text>
              </View>
            )}
          </View>

          {/* Map */}
          <KidFriendlyMap
            route={routePoints}
            safeZones={safeZones}
            enableVoiceGuidance={preferences.voiceEnabled}
            style={{ flex: 1 }}
          />

          {/* Navigation Controls */}
          <View className="bg-white p-4 shadow-lg">
            <View className="flex-row gap-2">
              <Pressable
                onPress={handleBackToSuggestions}
                className="flex-1 bg-gray-200 p-3 rounded-lg"
              >
                <Text className="text-gray-800 text-center font-semibold">Change Route</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (preferences.voiceEnabled && selectedRoute.steps.length > 0) {
                    speakNavigation(selectedRoute.steps[0].instruction);
                  }
                }}
                className="flex-1 bg-blue-500 p-3 rounded-lg"
              >
                <Text className="text-white text-center font-semibold">🔊 Repeat</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* Preferences Modal */}
      <Modal
        visible={showPreferences}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPreferences(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-2xl font-bold text-gray-800 mb-6">⚙️ Route Preferences</Text>

            <ScrollView className="max-h-96">
              {/* Child Age */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Child Age: {preferences.childAge} years
                </Text>
                <View className="flex-row gap-2">
                  {[5, 8, 10, 12].map((age) => (
                    <Pressable
                      key={age}
                      onPress={() => updatePreferences({ childAge: age })}
                      className={`flex-1 p-3 rounded-lg ${
                        preferences.childAge === age ? 'bg-blue-500' : 'bg-gray-200'
                      }`}
                    >
                      <Text
                        className={`text-center font-semibold ${
                          preferences.childAge === age ? 'text-white' : 'text-gray-700'
                        }`}
                      >
                        {age}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Time Preference */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Priority:</Text>
                <View className="gap-2">
                  {['safety', 'speed', 'comfort'].map((pref) => (
                    <Pressable
                      key={pref}
                      onPress={() => updatePreferences({ timePreference: pref as any })}
                      className={`p-3 rounded-lg ${
                        preferences.timePreference === pref ? 'bg-blue-500' : 'bg-gray-200'
                      }`}
                    >
                      <Text
                        className={`text-center font-semibold capitalize ${
                          preferences.timePreference === pref ? 'text-white' : 'text-gray-700'
                        }`}
                      >
                        {pref === 'safety' && '🛡️'} {pref === 'speed' && '⚡'}{' '}
                        {pref === 'comfort' && '😊'} {pref}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Voice Settings */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Voice Guidance:</Text>
                <Pressable
                  onPress={() => updatePreferences({ voiceEnabled: !preferences.voiceEnabled })}
                  className={`p-3 rounded-lg ${
                    preferences.voiceEnabled ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                >
                  <Text
                    className={`text-center font-semibold ${
                      preferences.voiceEnabled ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {preferences.voiceEnabled ? '🔊 Enabled' : '🔇 Disabled'}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>

            <Pressable
              onPress={() => setShowPreferences(false)}
              className="bg-gray-800 p-4 rounded-lg mt-4"
            >
              <Text className="text-white text-center font-bold">Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
