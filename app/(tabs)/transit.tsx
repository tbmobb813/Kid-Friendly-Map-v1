import React, { useState } from 'react';
import { Text, View, Pressable, Switch } from 'react-native';
import transitStyles from '@/app/styles/transit';
import { nycStations } from '@/config/transit/nyc-stations';
import { useNavigationStore } from '@/stores/enhancedNavigationStore';

export default function TransitScreen() {
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  const { setOrigin } = useNavigationStore.getState();

  const handleSelectStation = (station: any) => {
    setOrigin({
      id: station.id,
      name: station.name,
      coordinates: station.coordinates ?? {
        latitude: station.latitude ?? 0,
        longitude: station.longitude ?? 0,
      },
    } as any);
  };

  const titleStyle: any = {
    fontSize: largeText ? 24 : 18,
    fontWeight: '700',
    color: highContrast ? '#000' : '#111',
    marginBottom: 16,
  };

  return (
    <View style={transitStyles.container}>
      <View style={{ flexDirection: 'row', gap: 12, margin: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text>Large</Text>
          <Switch accessibilityLabel="Large Text" value={largeText} onValueChange={setLargeText} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text>Contrast</Text>
          <Switch
            accessibilityLabel="High Contrast"
            value={highContrast}
            onValueChange={setHighContrast}
          />
        </View>
      </View>

      <Text style={titleStyle}>Live Arrivals</Text>

      <View>
        {nycStations.slice(0, 4).map((s) => (
          <Pressable key={s.id} onPress={() => handleSelectStation(s)}>
            <Text>{s.name}</Text>
          </Pressable>
        ))}
      </View>

      <Text>{'Trains are running smoothly!'}</Text>
    </View>
  );
}
