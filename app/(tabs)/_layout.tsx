import React from 'react';
import { Tabs } from 'expo-router';
import Colors from '@/constants/colors';
import { Home, Map, Train, Settings, Trophy } from 'lucide-react-native';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarStyle: {
          height: Platform.OS === 'android' ? 65 : 60,
          paddingBottom: Platform.OS === 'android' ? 10 : 8,
          paddingTop: Platform.OS === 'android' ? 5 : 0,
        },
        headerShadowVisible: false,
        // Android-specific tab styling
        ...(Platform.OS === 'android' && {
          tabBarStyle: {
            height: 65,
            paddingBottom: 10,
            paddingTop: 5,
            elevation: 8,
            borderTopWidth: 0,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
          headerTitle: 'KidMap',
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <Map size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="transit"
        options={{
          title: 'Transit',
          tabBarIcon: ({ color }) => <Train size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: 'Achievements',
          tabBarIcon: ({ color }) => <Trophy size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
