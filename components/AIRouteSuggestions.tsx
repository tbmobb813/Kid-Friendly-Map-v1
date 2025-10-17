/**
 * AI Smart Route Suggestions Component
 * Displays intelligent route options with scores and recommendations
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { aiRouteEngine, SmartRoute, RoutePreferences } from '../utils/aiRouteEngine';
import { voiceManager, speakMessage } from '../utils/voice';
import * as Location from 'expo-location';

interface AIRouteSuggestionsProps {
  origin?: Location.LocationObject;
  destination?: { latitude: number; longitude: number; name?: string };
  onRouteSelect?: (route: SmartRoute) => void;
}

export default function AIRouteSuggestions({
  origin,
  destination,
  onRouteSelect,
}: AIRouteSuggestionsProps) {
  const [routes, setRoutes] = useState<SmartRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<RoutePreferences>(
    aiRouteEngine['userPreferences'],
  );

  useEffect(() => {
    if (origin && destination) {
      generateRoutes();
    }
  }, [origin, destination]);

  const generateRoutes = async () => {
    setLoading(true);
    try {
      const smartRoutes = await aiRouteEngine.generateSmartRoutes(origin!, destination!);
      setRoutes(smartRoutes);

      // Announce top route via voice
      if (smartRoutes.length > 0) {
        await speakMessage(
          `I found ${smartRoutes.length} routes for you! The safest one takes about ${smartRoutes[0].estimatedDuration} minutes.`,
        );
      }
    } catch (error) {
      console.error('Failed to generate routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRouteSelect = async (route: SmartRoute) => {
    setSelectedRoute(route.id);

    // Voice announcement
    await speakMessage(
      `You selected the ${route.name}. This route has a ${route.kidFriendlyScore} safety score!`,
    );

    onRouteSelect?.(route);
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'challenging':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center p-8">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-lg text-gray-700">
          🤖 AI is finding the best routes for you...
        </Text>
      </View>
    );
  }

  if (!origin || !destination) {
    return (
      <View className="flex-1 justify-center items-center p-8">
        <Text className="text-xl font-bold text-gray-800 mb-2">🗺️ Ready for Smart Routes!</Text>
        <Text className="text-gray-600 text-center">
          Enter your starting point and destination to get AI-powered route suggestions
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
        <Text className="text-2xl font-bold text-white mb-2">🤖 AI Route Suggestions</Text>
        <Text className="text-white opacity-90">
          Powered by smart algorithms for kid-friendly journeys
        </Text>
      </View>

      {/* Personalized Recommendations */}
      <View className="bg-blue-50 p-4 m-4 rounded-xl border border-blue-200">
        <Text className="text-lg font-semibold text-blue-800 mb-2">💡 Your Personal Insights</Text>
        {aiRouteEngine.getPersonalizedRecommendations().map((rec, index) => (
          <Text key={index} className="text-sm text-blue-700 mb-1">
            • {rec}
          </Text>
        ))}
      </View>

      {/* Routes List */}
      <View className="p-4">
        {routes.map((route, index) => {
          const isSelected = selectedRoute === route.id;
          const insights = aiRouteEngine.getRouteInsights(route);

          return (
            <Pressable
              key={route.id}
              onPress={() => handleRouteSelect(route)}
              className={`mb-4 rounded-xl shadow-lg overflow-hidden ${
                isSelected ? 'border-4 border-blue-500' : 'border border-gray-200'
              }`}
            >
              {/* Route Header */}
              <View className={`p-4 ${isSelected ? 'bg-blue-50' : 'bg-white'}`}>
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center flex-1">
                    <Text className="text-2xl mr-2">{index === 0 ? '⭐' : '✨'}</Text>
                    <View className="flex-1">
                      <Text className="text-xl font-bold text-gray-800">{route.name}</Text>
                      <Text className="text-sm text-gray-600 mt-1">{route.description}</Text>
                    </View>
                  </View>

                  {/* AI Score Badge */}
                  <View className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-full w-16 h-16 items-center justify-center">
                    <Text className="text-white font-bold text-lg">{route.score}</Text>
                    <Text className="text-white text-xs">AI Score</Text>
                  </View>
                </View>

                {/* Route Stats */}
                <View className="flex-row flex-wrap gap-2 mt-3">
                  <View className="bg-blue-100 px-3 py-1 rounded-full">
                    <Text className="text-blue-800 text-xs font-semibold">
                      ⏱️ {route.estimatedDuration} min
                    </Text>
                  </View>
                  <View className="bg-green-100 px-3 py-1 rounded-full">
                    <Text className="text-green-800 text-xs font-semibold">
                      🚶 {Math.round(route.walkingDistance)}m
                    </Text>
                  </View>
                  <View
                    className={`px-3 py-1 rounded-full ${getDifficultyColor(
                      route.difficultyLevel,
                    )}`}
                  >
                    <Text className="text-xs font-semibold">
                      {route.difficultyLevel.toUpperCase()}
                    </Text>
                  </View>
                  <View className="bg-yellow-100 px-3 py-1 rounded-full">
                    <Text className="text-yellow-800 text-xs font-semibold">
                      👶 {route.kidFriendlyScore}% Kid-Friendly
                    </Text>
                  </View>
                </View>

                {/* Safety Features */}
                <View className="mt-4 bg-green-50 p-3 rounded-lg">
                  <Text className="text-sm font-semibold text-green-800 mb-2">
                    🛡️ Safety Features:
                  </Text>
                  {route.safetyFeatures.slice(0, 3).map((feature, idx) => (
                    <Text key={idx} className="text-xs text-green-700 mb-1">
                      ✓ {feature}
                    </Text>
                  ))}
                </View>

                {/* AI Recommendations */}
                <View className="mt-3 bg-purple-50 p-3 rounded-lg">
                  <Text className="text-sm font-semibold text-purple-800 mb-2">
                    🤖 AI Recommends:
                  </Text>
                  {route.aiRecommendations.map((rec, idx) => (
                    <Text key={idx} className="text-xs text-purple-700 mb-1">
                      • {rec}
                    </Text>
                  ))}
                </View>

                {/* AI Insights */}
                {insights.length > 0 && (
                  <View className="mt-3 bg-blue-50 p-3 rounded-lg">
                    <Text className="text-sm font-semibold text-blue-800 mb-2">
                      💭 Smart Insights:
                    </Text>
                    {insights.map((insight, idx) => (
                      <Text key={idx} className="text-xs text-blue-700 mb-1">
                        {insight}
                      </Text>
                    ))}
                  </View>
                )}

                {/* Accessibility Icons */}
                <View className="flex-row gap-3 mt-3">
                  {route.accessibility.wheelchairFriendly && (
                    <View className="flex-row items-center">
                      <Text className="text-lg mr-1">♿</Text>
                      <Text className="text-xs text-gray-600">Wheelchair</Text>
                    </View>
                  )}
                  {route.accessibility.strollerFriendly && (
                    <View className="flex-row items-center">
                      <Text className="text-lg mr-1">🚼</Text>
                      <Text className="text-xs text-gray-600">Stroller</Text>
                    </View>
                  )}
                  {route.accessibility.elevatorAvailable && (
                    <View className="flex-row items-center">
                      <Text className="text-lg mr-1">🛗</Text>
                      <Text className="text-xs text-gray-600">Elevator</Text>
                    </View>
                  )}
                </View>

                {/* Selected Badge */}
                {isSelected && (
                  <View className="mt-3 bg-blue-500 p-2 rounded-lg">
                    <Text className="text-white text-center font-semibold">✓ Selected Route</Text>
                  </View>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Preferences Section */}
      <View className="bg-white m-4 p-4 rounded-xl shadow-sm">
        <Text className="text-lg font-bold text-gray-800 mb-3">⚙️ Route Preferences</Text>
        <View className="space-y-2">
          <Text className="text-sm text-gray-700">👶 Child Age: {preferences.childAge} years</Text>
          <Text className="text-sm text-gray-700">🎯 Preference: {preferences.timePreference}</Text>
          <Text className="text-sm text-gray-700">
            🚶 Max Walking: {preferences.maxWalkingDistance}m
          </Text>
          <Text className="text-sm text-gray-700">
            🔄 Max Transfers: {preferences.maxTransferCount}
          </Text>
        </View>

        <Pressable
          className="mt-4 bg-gray-800 p-3 rounded-lg"
          onPress={() => {
            // Open preferences modal
            speakMessage('Opening route preferences');
          }}
        >
          <Text className="text-white text-center font-semibold">Update Preferences</Text>
        </Pressable>
      </View>

      {/* Info Footer */}
      <View className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 m-4 rounded-xl">
        <Text className="text-lg font-bold text-purple-800 mb-2">🌟 How AI Helps You</Text>
        <Text className="text-sm text-purple-700 mb-2">Our smart AI considers:</Text>
        <Text className="text-xs text-purple-600 mb-1">• Your child's age and preferences</Text>
        <Text className="text-xs text-purple-600 mb-1">• Safety features and safe zones</Text>
        <Text className="text-xs text-purple-600 mb-1">• Current time, weather, and traffic</Text>
        <Text className="text-xs text-purple-600 mb-1">• Your past journey history</Text>
        <Text className="text-xs text-purple-600">• Accessibility requirements</Text>
      </View>
    </ScrollView>
  );
}
