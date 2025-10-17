import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, StyleSheet } from 'react-native';
import { checkMapViewManagers, ViewManagerCheckResult } from '@/utils/nativeChecks';

const NativeViewManagerCheck: React.FC = () => {
  const [results, setResults] = useState<ViewManagerCheckResult[]>([]);

  useEffect(() => {
    const res = checkMapViewManagers();
    setResults(res);

    // Also print to console so adb logcat picks it up
    // Tag logs with 'NativeCheck' to make them easy to filter

    console.info('[NativeCheck] View manager check results:', res);
  }, []);

  const handleLog = () => {
    console.info('[NativeCheck] Manual dump:', results);
    alert('Native view manager check logged to console (tag: NativeCheck)');
  };

  return (
    <ScrollView contentContainerStyle={styles.container} testID="native-view-manager-check">
      <Text style={styles.title}>Native View Manager Check</Text>
      <Text style={styles.subtitle}>
        This screen checks for native map view managers on the device.
      </Text>

      {results.map((r) => (
        <View key={r.name} style={styles.row}>
          <Text style={styles.name}>{r.name}</Text>
          <Text style={[styles.status, r.available ? styles.ok : styles.missing]}>
            {r.available ? 'Available' : 'Missing'}
          </Text>
        </View>
      ))}

      <View style={{ marginTop: 16 }}>
        <Button title="Log results to console" onPress={handleLog} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#666', marginBottom: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  name: { fontSize: 14 },
  status: { fontWeight: '700' },
  ok: { color: 'green' },
  missing: { color: 'red' },
});

export default NativeViewManagerCheck;
