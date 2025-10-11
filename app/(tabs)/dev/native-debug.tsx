import React from 'react';
import { View, Text } from 'react-native';
import NativeViewManagersDebug from '@/components/Dev/NativeViewManagersDebug';

export default function NativeDebugScreen() {
  if (!__DEV__) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Not available in production</Text>
      </View>
    );
  }

  return <NativeViewManagersDebug />;
}
