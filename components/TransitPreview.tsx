import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import useTransitFeed from '../hooks/useTransitFeed';

export default function TransitPreview() {
  const { data, error, isLoading } = useTransitFeed({ mock: true, refetchInterval: 8000 });

  if (isLoading) return <Text>Loading transit feed...</Text>;
  if (error) return <Text>Transit feed error: {String(error)}</Text>;

  return (
    <ScrollView style={{ padding: 12 }}>
      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Transit Preview</Text>
      {data?.routes && data.routes.length ? (
        data.routes.map((r) => (
          <View key={r.id} style={{ marginBottom: 8 }}>
            <Text>
              {r.name} — {r.status} — next in {r.nextArrival ?? 'N/A'} min
            </Text>
            {r.nextStopName ? (
              <Text style={{ color: '#666' }}>Next stop: {r.nextStopName}</Text>
            ) : null}
            {r.destination ? (
              <Text style={{ color: '#666' }}>Destination: {r.destination}</Text>
            ) : null}
          </View>
        ))
      ) : (
        <Text>No routes</Text>
      )}

      {data?.alerts && data.alerts.length ? (
        <View style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: 'bold' }}>Alerts</Text>
          {data.alerts.map((a) => (
            <Text key={a.id}>{a.message}</Text>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}
