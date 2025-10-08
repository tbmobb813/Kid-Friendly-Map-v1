import React from 'react';
import { Text, View, ActivityIndicator, FlatList } from 'react-native';
import { useTransitFeed } from './useTransitFeed';

export default function TransitWidget({
  region = 'nyc',
  system = 'mta-subway',
  mock = true,
}: {
  region?: string;
  system?: string;
  mock?: boolean;
}) {
  const { routes, loading, error } = useTransitFeed(region, system, {
    pollIntervalMs: 10000,
    mock,
  });

  if (loading) return <ActivityIndicator />;

  if (error)
    return (
      <View>
        <Text>Error: {String(error)}</Text>
      </View>
    );

  return (
    <View style={{ padding: 8 }}>
      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Transit — {system}</Text>
      <FlatList
        data={routes}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 6 }}>
            <Text>
              {item.name} — {item.destination || 'unknown'}
            </Text>
            <Text style={{ color: '#666' }}>
              {item.status || ''} {item.nextArrival ? `· ${item.nextArrival} min` : ''}{' '}
              {item.nextStopName ? `· next: ${item.nextStopName}` : ''}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
