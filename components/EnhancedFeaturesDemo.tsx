/**
 * Enhanced Features Demo
 * Demonstrates MMKV storage, Voice/TTS, react-native-maps, and AI route suggestions
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import KidFriendlyMap, { SafeZone, RoutePoint, MapLocation } from '../components/KidFriendlyMap';
import VoiceSettings from '../components/VoiceSettings';
import AIRouteSuggestions from '../components/AIRouteSuggestions';
import SmartNavigationScreen from '../components/SmartNavigationScreen';
import { mainStorage, cache, StorageKeys, StorageUtils } from '../utils/storage';
import {
  voiceManager,
  KidFriendlyPhrases,
  speakNavigation,
  speakSafety,
  speakAchievement,
} from '../utils/voice';
import * as Location from 'expo-location';

export default function EnhancedFeaturesDemo() {
  const [activeTab, setActiveTab] = useState<'map' | 'voice' | 'storage' | 'ai' | 'smart-nav'>(
    'smart-nav',
  );
  const [storageInfo, setStorageInfo] = useState({ mainKeys: 0, cacheKeys: 0 });
  const [userLocation, setUserLocation] = useState<MapLocation | null>(null);

  // Demo safe zones (schools, libraries, community centers)
  const safeZones: SafeZone[] = [
    {
      id: 'home',
      center: { latitude: 40.7589, longitude: -73.9851 },
      radius: 100,
      name: 'Home',
      color: '#10b981',
    },
    {
      id: 'school',
      center: { latitude: 40.7614, longitude: -73.9776 },
      radius: 150,
      name: 'School',
      color: '#3b82f6',
    },
  ];

  // Demo route
  const demoRoute: RoutePoint[] = [
    {
      latitude: 40.7589,
      longitude: -73.9851,
      instruction: 'Start at home',
    },
    {
      latitude: 40.76,
      longitude: -73.982,
      instruction: 'Turn left at the corner',
    },
    {
      latitude: 40.7614,
      longitude: -73.9776,
      instruction: 'Arrive at school',
    },
  ];

  useEffect(() => {
    loadStorageInfo();
    initializeDemoData();
  }, []);

  const loadStorageInfo = () => {
    const info = StorageUtils.getStorageInfo();
    setStorageInfo(info);
  };

  const initializeDemoData = () => {
    // Demo: Store some data
    mainStorage.set(StorageKeys.FAVORITE_PLACES, [
      { name: 'Home', lat: 40.7589, lng: -73.9851 },
      { name: 'School', lat: 40.7614, lng: -73.9776 },
    ]);

    mainStorage.set(StorageKeys.ACHIEVEMENTS, [
      { id: 'first-journey', name: 'First Journey', earned: true },
      { id: 'safety-champion', name: 'Safety Champion', earned: false },
    ]);

    // Demo: Cache with expiry
    StorageUtils.setWithExpiry('demo_cache', { data: 'This will expire' }, 60000); // 1 minute

    loadStorageInfo();
  };

  const handleLocationChange = (location: Location.LocationObject) => {
    setUserLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  };

  const handleSafeZoneEnter = (zone: SafeZone) => {
    Alert.alert('Safe Zone', `You entered: ${zone.name}`);
  };

  // Storage demos
  const testStorageOperations = () => {
    // Test MMKV operations
    const testKey = 'test_data';
    const testValue = { message: 'Hello from MMKV!', timestamp: Date.now() };

    mainStorage.set(testKey, testValue);
    const retrieved = mainStorage.get(testKey);

    Alert.alert(
      'Storage Test',
      `Stored and retrieved successfully!\n\nData: ${JSON.stringify(retrieved, null, 2)}`,
    );

    loadStorageInfo();
  };

  const clearCache = () => {
    cache.clearAll();
    Alert.alert('Success', 'Cache cleared!');
    loadStorageInfo();
  };

  const clearExpiredCache = () => {
    const cleared = StorageUtils.clearExpired();
    Alert.alert('Success', `Cleared ${cleared} expired entries`);
    loadStorageInfo();
  };

  // Voice demos
  const testVoiceNavigation = async () => {
    await speakNavigation('Turn left at the next corner', 50);
  };

  const testVoiceSafety = async () => {
    await speakSafety(KidFriendlyPhrases.safety.lookBothWays);
  };

  const testVoiceAchievement = async () => {
    await speakAchievement(KidFriendlyPhrases.achievements.newBadge);
  };

  const testVoiceQueue = async () => {
    await voiceManager.speak('First message');
    await voiceManager.speak('Second message');
    await voiceManager.speak('Third message');
    Alert.alert('Voice Queue', `${voiceManager.getQueueLength()} messages queued`);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Tab Navigation */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="bg-white border-b border-gray-200"
      >
        <Pressable
          onPress={() => setActiveTab('smart-nav')}
          className={`p-4 ${activeTab === 'smart-nav' ? 'border-b-2 border-blue-500' : ''}`}
        >
          <Text
            className={`text-center font-semibold whitespace-nowrap ${
              activeTab === 'smart-nav' ? 'text-blue-500' : 'text-gray-600'
            }`}
          >
            🚀 Smart Nav
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('ai')}
          className={`p-4 ${activeTab === 'ai' ? 'border-b-2 border-blue-500' : ''}`}
        >
          <Text
            className={`text-center font-semibold whitespace-nowrap ${
              activeTab === 'ai' ? 'text-blue-500' : 'text-gray-600'
            }`}
          >
            🤖 AI Routes
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('map')}
          className={`p-4 ${activeTab === 'map' ? 'border-b-2 border-blue-500' : ''}`}
        >
          <Text
            className={`text-center font-semibold whitespace-nowrap ${
              activeTab === 'map' ? 'text-blue-500' : 'text-gray-600'
            }`}
          >
            🗺️ Map
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('voice')}
          className={`p-4 ${activeTab === 'voice' ? 'border-b-2 border-blue-500' : ''}`}
        >
          <Text
            className={`text-center font-semibold whitespace-nowrap ${
              activeTab === 'voice' ? 'text-blue-500' : 'text-gray-600'
            }`}
          >
            🎤 Voice
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('storage')}
          className={`p-4 ${activeTab === 'storage' ? 'border-b-2 border-blue-500' : ''}`}
        >
          <Text
            className={`text-center font-semibold whitespace-nowrap ${
              activeTab === 'storage' ? 'text-blue-500' : 'text-gray-600'
            }`}
          >
            💾 Storage
          </Text>
        </Pressable>
      </ScrollView>

      {/* Map Tab */}
      {activeTab === 'map' && (
        <View className="flex-1">
          <KidFriendlyMap
            initialLocation={{ latitude: 40.7589, longitude: -73.9851 }}
            safeZones={safeZones}
            route={demoRoute}
            showUserLocation={true}
            onLocationChange={handleLocationChange}
            onSafeZoneEnter={handleSafeZoneEnter}
            enableVoiceGuidance={true}
          />

          <View className="absolute bottom-32 left-4 right-4 bg-white p-4 rounded-xl shadow-lg">
            <Text className="text-lg font-bold text-gray-800 mb-2">📍 MapLibre Integration</Text>
            <Text className="text-sm text-gray-600 mb-2">• Native map performance (MapLibre)</Text>
            <Text className="text-sm text-gray-600 mb-2">• Safe zone detection</Text>
            <Text className="text-sm text-gray-600 mb-2">• Route visualization</Text>
            <Text className="text-sm text-gray-600">• Real-time location tracking</Text>
          </View>
        </View>
      )}

      {/* Voice Tab */}
      {activeTab === 'voice' && (
        <ScrollView className="flex-1">
          <VoiceSettings />

          <View className="p-6 space-y-4">
            <Text className="text-2xl font-bold text-gray-800 mb-4">🎤 Voice Features Demo</Text>

            <Pressable onPress={testVoiceNavigation} className="bg-blue-500 p-4 rounded-xl">
              <Text className="text-white text-center font-semibold text-lg">
                Test Navigation Voice
              </Text>
            </Pressable>

            <Pressable onPress={testVoiceSafety} className="bg-green-500 p-4 rounded-xl">
              <Text className="text-white text-center font-semibold text-lg">
                Test Safety Reminder
              </Text>
            </Pressable>

            <Pressable onPress={testVoiceAchievement} className="bg-yellow-500 p-4 rounded-xl">
              <Text className="text-white text-center font-semibold text-lg">Test Achievement</Text>
            </Pressable>

            <Pressable onPress={testVoiceQueue} className="bg-purple-500 p-4 rounded-xl">
              <Text className="text-white text-center font-semibold text-lg">Test Voice Queue</Text>
            </Pressable>

            <View className="bg-blue-50 p-4 rounded-xl mt-4">
              <Text className="text-lg font-semibold text-blue-800 mb-2">✨ Voice Features</Text>
              <Text className="text-sm text-blue-700">
                • Priority-based speech queue{'\n'}• Configurable rate and pitch{'\n'}• Kid-friendly
                voice selection{'\n'}• Navigation guidance integration{'\n'}• Safety reminder
                announcements
              </Text>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Storage Tab */}
      {activeTab === 'storage' && (
        <ScrollView className="flex-1 p-6">
          <Text className="text-2xl font-bold text-gray-800 mb-4">💾 MMKV Storage Demo</Text>

          <View className="bg-white p-4 rounded-xl shadow-sm mb-4">
            <Text className="text-lg font-semibold text-gray-800 mb-2">Storage Info</Text>
            <Text className="text-gray-600">Main Storage Keys: {storageInfo.mainKeys}</Text>
            <Text className="text-gray-600">Cache Keys: {storageInfo.cacheKeys}</Text>
          </View>

          <Pressable onPress={testStorageOperations} className="bg-blue-500 p-4 rounded-xl mb-4">
            <Text className="text-white text-center font-semibold text-lg">
              Test Storage Operations
            </Text>
          </Pressable>

          <Pressable onPress={clearExpiredCache} className="bg-orange-500 p-4 rounded-xl mb-4">
            <Text className="text-white text-center font-semibold text-lg">
              Clear Expired Cache
            </Text>
          </Pressable>

          <Pressable onPress={clearCache} className="bg-red-500 p-4 rounded-xl mb-4">
            <Text className="text-white text-center font-semibold text-lg">Clear All Cache</Text>
          </Pressable>

          <View className="bg-green-50 p-4 rounded-xl">
            <Text className="text-lg font-semibold text-green-800 mb-2">⚡ MMKV Benefits</Text>
            <Text className="text-sm text-green-700">
              • 10x faster than AsyncStorage{'\n'}• Synchronous operations{'\n'}• Type-safe API
              {'\n'}• Encryption support{'\n'}• Smaller memory footprint{'\n'}• Automatic cache
              expiration
            </Text>
          </View>

          <View className="bg-purple-50 p-4 rounded-xl mt-4">
            <Text className="text-lg font-semibold text-purple-800 mb-2">
              📦 Stored Data Examples
            </Text>
            <Text className="text-sm text-purple-700 mb-1">• User preferences and settings</Text>
            <Text className="text-sm text-purple-700 mb-1">• Favorite places and routes</Text>
            <Text className="text-sm text-purple-700 mb-1">• Achievement progress</Text>
            <Text className="text-sm text-purple-700 mb-1">• Journey history</Text>
            <Text className="text-sm text-purple-700">• Cached transit data</Text>
          </View>
        </ScrollView>
      )}

      {/* AI Routes Tab */}
      {activeTab === 'ai' && (
        <ScrollView className="flex-1">
          <View className="p-6">
            <Text className="text-2xl font-bold text-gray-800 mb-4">
              🤖 AI Route Suggestions Demo
            </Text>

            <View className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-xl mb-4">
              <Text className="text-lg font-semibold text-purple-800 mb-2">✨ AI Features</Text>
              <Text className="text-sm text-purple-700 mb-1">
                • Smart route generation with 4 types
              </Text>
              <Text className="text-sm text-purple-700 mb-1">• AI scoring algorithm (0-100)</Text>
              <Text className="text-sm text-purple-700 mb-1">• Personalized recommendations</Text>
              <Text className="text-sm text-purple-700 mb-1">• Learning from user choices</Text>
              <Text className="text-sm text-purple-700 mb-1">
                • Context-aware suggestions (time, weather)
              </Text>
              <Text className="text-sm text-purple-700">• Safety-first prioritization</Text>
            </View>

            <View className="bg-blue-50 p-4 rounded-xl mb-4">
              <Text className="text-lg font-semibold text-blue-800 mb-2">📊 Route Types</Text>
              <View className="space-y-2">
                <View className="flex-row items-center">
                  <Text className="text-2xl mr-2">🛡️</Text>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-blue-800">Safest Route</Text>
                    <Text className="text-xs text-blue-600">
                      Maximum safe zones, well-lit areas
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-2xl mr-2">⚡</Text>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-blue-800">Fastest Route</Text>
                    <Text className="text-xs text-blue-600">Minimal travel time, direct paths</Text>
                  </View>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-2xl mr-2">😊</Text>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-blue-800">Easiest Route</Text>
                    <Text className="text-xs text-blue-600">Less walking, fewer transfers</Text>
                  </View>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-2xl mr-2">🌳</Text>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-blue-800">Scenic Route</Text>
                    <Text className="text-xs text-blue-600">Parks, landmarks, fun spots</Text>
                  </View>
                </View>
              </View>
            </View>

            <View className="bg-green-50 p-4 rounded-xl mb-4">
              <Text className="text-lg font-semibold text-green-800 mb-2">
                🎯 AI Scoring Factors
              </Text>
              <Text className="text-sm text-green-700 mb-1">• Safety score (40% weight)</Text>
              <Text className="text-sm text-green-700 mb-1">• Speed/efficiency (25% weight)</Text>
              <Text className="text-sm text-green-700 mb-1">• Ease of travel (20% weight)</Text>
              <Text className="text-sm text-green-700 mb-1">
                • User preference alignment (15% weight)
              </Text>
              <Text className="text-sm text-green-700">• Additional context factors</Text>
            </View>

            <View className="bg-yellow-50 p-4 rounded-xl">
              <Text className="text-lg font-semibold text-yellow-800 mb-2">🧠 Learning Model</Text>
              <Text className="text-sm text-yellow-700 mb-1">• Tracks route selections</Text>
              <Text className="text-sm text-yellow-700 mb-1">• Analyzes time/context patterns</Text>
              <Text className="text-sm text-yellow-700 mb-1">• Adapts to user behavior</Text>
              <Text className="text-sm text-yellow-700">• Improves recommendations over time</Text>
            </View>

            <Pressable
              onPress={() => setActiveTab('smart-nav')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-xl mt-4"
            >
              <Text className="text-white text-center font-semibold text-lg">
                Try Smart Navigation →
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      )}

      {/* Smart Navigation Tab */}
      {activeTab === 'smart-nav' && <SmartNavigationScreen />}
    </View>
  );
}
