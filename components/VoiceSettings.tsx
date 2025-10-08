/**
 * Voice Settings Component
 * Allows users to configure TTS/voice settings
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Switch, Pressable, ScrollView } from 'react-native';
import { voiceManager, VoiceSettings, KidFriendlyPhrases } from '../utils/voice';
import * as Speech from 'expo-speech';

export default function VoiceSettingsComponent() {
  const [settings, setSettings] = useState<VoiceSettings>(voiceManager.getSettings());
  const [voices, setVoices] = useState<Speech.Voice[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    const availableVoices = voiceManager.getAvailableVoices();
    setVoices(availableVoices.filter((v) => v.language.startsWith('en')));
  };

  const handleSettingChange = (key: keyof VoiceSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    voiceManager.updateSettings({ [key]: value });
  };

  const testVoice = async () => {
    if (isTesting) return;
    setIsTesting(true);
    await voiceManager.speak(KidFriendlyPhrases.encouragement.goodJob);
    setTimeout(() => setIsTesting(false), 2000);
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-6">
        {/* Enable/Disable Voice */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800 mb-2">Voice Navigation</Text>
          <Text className="text-gray-600 mb-4">
            Turn on voice guidance to hear directions and safety reminders
          </Text>

          <View className="flex-row items-center justify-between bg-gray-50 p-4 rounded-xl">
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-800">Enable Voice</Text>
              <Text className="text-sm text-gray-600">Hear spoken instructions</Text>
            </View>
            <Switch
              value={settings.enabled}
              onValueChange={(value) => handleSettingChange('enabled', value)}
              trackColor={{ false: '#cbd5e0', true: '#4299e1' }}
              thumbColor={settings.enabled ? '#2b6cb0' : '#e2e8f0'}
            />
          </View>
        </View>

        {/* Voice Speed */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-semibold text-gray-800">Speaking Speed</Text>
            <Text className="text-sm text-gray-600">
              {settings.rate < 0.8 ? 'Slower' : settings.rate > 1.2 ? 'Faster' : 'Normal'}
            </Text>
          </View>
          <View className="bg-gray-50 p-4 rounded-xl">
            <View className="flex-row justify-between gap-2">
              <Pressable
                onPress={() => handleSettingChange('rate', 0.7)}
                disabled={!settings.enabled}
                className={`flex-1 p-3 rounded-lg ${
                  settings.rate === 0.7 ? 'bg-blue-500' : 'bg-white border border-gray-300'
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    settings.rate === 0.7 ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  Slow
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleSettingChange('rate', 0.9)}
                disabled={!settings.enabled}
                className={`flex-1 p-3 rounded-lg ${
                  settings.rate === 0.9 ? 'bg-blue-500' : 'bg-white border border-gray-300'
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    settings.rate === 0.9 ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  Normal
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleSettingChange('rate', 1.3)}
                disabled={!settings.enabled}
                className={`flex-1 p-3 rounded-lg ${
                  settings.rate === 1.3 ? 'bg-blue-500' : 'bg-white border border-gray-300'
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    settings.rate === 1.3 ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  Fast
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Voice Pitch */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-semibold text-gray-800">Voice Pitch</Text>
            <Text className="text-sm text-gray-600">
              {settings.pitch < 0.9 ? 'Lower' : settings.pitch > 1.2 ? 'Higher' : 'Normal'}
            </Text>
          </View>
          <View className="bg-gray-50 p-4 rounded-xl">
            <View className="flex-row justify-between gap-2">
              <Pressable
                onPress={() => handleSettingChange('pitch', 0.8)}
                disabled={!settings.enabled}
                className={`flex-1 p-3 rounded-lg ${
                  settings.pitch === 0.8 ? 'bg-blue-500' : 'bg-white border border-gray-300'
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    settings.pitch === 0.8 ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  Lower
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleSettingChange('pitch', 1.1)}
                disabled={!settings.enabled}
                className={`flex-1 p-3 rounded-lg ${
                  settings.pitch === 1.1 ? 'bg-blue-500' : 'bg-white border border-gray-300'
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    settings.pitch === 1.1 ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  Normal
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleSettingChange('pitch', 1.4)}
                disabled={!settings.enabled}
                className={`flex-1 p-3 rounded-lg ${
                  settings.pitch === 1.4 ? 'bg-blue-500' : 'bg-white border border-gray-300'
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    settings.pitch === 1.4 ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  Higher
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Test Voice Button */}
        <Pressable
          onPress={testVoice}
          disabled={!settings.enabled || isTesting}
          className={`p-4 rounded-xl ${
            settings.enabled && !isTesting ? 'bg-blue-500' : 'bg-gray-300'
          }`}
        >
          <Text className="text-center text-white font-semibold text-lg">
            {isTesting ? '🔊 Testing...' : '🎤 Test Voice'}
          </Text>
        </Pressable>

        {/* Voice Examples */}
        {settings.enabled && (
          <View className="mt-8 bg-blue-50 p-4 rounded-xl">
            <Text className="text-lg font-semibold text-blue-800 mb-3">💡 Voice Examples</Text>
            <View className="space-y-2">
              <Text className="text-sm text-blue-700">• Navigation: "Turn left up ahead"</Text>
              <Text className="text-sm text-blue-700">
                • Safety: "Hold a grown-up's hand while crossing"
              </Text>
              <Text className="text-sm text-blue-700">
                • Encouragement: "You're doing great! Keep going"
              </Text>
              <Text className="text-sm text-blue-700">
                • Achievements: "Wow! You earned a new badge!"
              </Text>
            </View>
          </View>
        )}

        {/* Info Section */}
        <View className="mt-6 bg-yellow-50 p-4 rounded-xl border border-yellow-200">
          <Text className="text-sm text-yellow-800">
            <Text className="font-semibold">👂 Tip:</Text> Voice guidance helps kids navigate safely
            without constantly looking at the screen. It's especially helpful during transit
            journeys!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
