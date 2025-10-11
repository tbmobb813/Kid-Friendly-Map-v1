import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { checkViewManagers } from '../../utils/nativeChecks';

const DEFAULT_NAMES = [
  'MapLibreGLMapView',
  'RCTMGLMapView',
  'AIRMap',
  'mlrncamera',
  'MapView',
  'RNMapView',
];

export function NativeViewManagersDebug({ names = DEFAULT_NAMES }: { names?: string[] }) {
  const results = useMemo(() => checkViewManagers(names), [names]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Native View Managers</Text>
      <Text style={styles.subtitle}>
        Platform: {Platform.OS} — these checks use UIManager.getViewManagerConfig(name)
      </Text>

      {results.map((r) => (
        <View key={r.name} style={styles.row}>
          <Text style={styles.name}>{r.name}</Text>
          <Text style={[styles.badge, r.available ? styles.ok : styles.missing]}>
            {r.available ? 'available' : 'missing'}
          </Text>
          {r.details ? (
            <Text style={styles.details}>{JSON.stringify(r.details, null, 2)}</Text>
          ) : null}
        </View>
      ))}

      <View style={styles.footer}>
        <Text style={styles.note}>Tip: Rebuild dev-client after removing native packages to update results.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
  header: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  subtitle: { color: '#444', marginBottom: 12 },
  row: { marginBottom: 12, padding: 10, borderWidth: 1, borderColor: '#eee', borderRadius: 8 },
  name: { fontWeight: '700' },
  badge: { marginTop: 6, alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, color: '#fff' },
  ok: { backgroundColor: '#22c55e' },
  missing: { backgroundColor: '#ef4444' },
  details: { marginTop: 8, fontFamily: 'monospace', color: '#111' },
  footer: { marginTop: 20 },
  note: { color: '#666' },
});

export default NativeViewManagersDebug;
