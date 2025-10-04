// path: app/components/InteractiveMap.tsx
import React, { useMemo, useRef, useState, useCallback } from 'react';
import { Animated, Easing } from 'react-native';
import { View, StyleSheet, Platform, Pressable, Text } from 'react-native';
import Colors from '@/constants/colors';
import { Place, Route } from '@/types/navigation';
import { nycStations } from '@/config/transit/nyc-stations';
import MapPlaceholder from './MapPlaceholder';
import { Crosshair, Train } from 'lucide-react-native';
import ExpoMapView from './ExpoMapView';
import MapLibreRouteView from './MapLibreRouteView';
import { isMapLibreAvailable } from './MapLibreMap';

type LatLng = { latitude: number; longitude: number };

type InteractiveMapProps = {
  origin?: Place;
  destination?: Place;
  route?: Route & { geometry?: { coordinates: LatLng[] } };
  onMapReady?: () => void;
  onSelectLocation?: (coords: LatLng) => void;
  onStationPress?: (stationId: string) => void;
  showTransitStations?: boolean;
  testId?: string;
  onTouchStateChange?: (active: boolean) => void;
  /** Prefer native MapLibre engine when available; falls back to WebView+Leaflet. */
  preferNative?: boolean;
  /** Cluster radius in meters (native MapLibre only). */
  clusterRadiusMeters?: number;
  /** Mascot speech bubble hint text (optional, for parent wiring) */
  mascotHint?: string;
  /** Setter for mascot speech bubble hint (optional, for parent wiring) */
  setMascotHint?: React.Dispatch<React.SetStateAction<string>>;
};

const MapboxPreloader: React.FC<{ testId?: string; WebViewComponent: any | null }> = ({
  testId,
  WebViewComponent,
}) => {
  if (Platform.OS === 'web' || !WebViewComponent) return null;

  const preloadHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <script src="https://api.mapbox.com/mapbox-gl-js/v3.7.0/mapbox-gl.js"></script>
      <link href="https://api.mapbox.com/mapbox-gl-js/v3.7.0/mapbox-gl.css" rel="stylesheet" />
      <style> html, body, #map { margin:0; padding:0; height:100%; } </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        try {
          const token = null;
          if (!token) {
            window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapbox-preloaded' }));
          }
        } catch (e) { /* noop */ }
      </script>
    </body>
    </html>
  `;

  return (
    <WebViewComponent
      testID={testId ?? 'mapbox-preloader'}
      source={{ html: preloadHtml }}
      style={styles.preloader}
      javaScriptEnabled
      domStorageEnabled
      onMessage={(e: any) => {
        try {
          console.log('Mapbox preloader message', e?.nativeEvent?.data ?? '');
        } catch { /* noop */ }
      }}
    />
  );
};

// small helpers
const toRad = (d: number) => (d * Math.PI) / 180;
const haversineMeters = (a: LatLng, b: LatLng) => {
  const R = 6371000;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const la1 = toRad(a.latitude);
  const la2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * R * Math.asin(Math.sqrt(h));
};

type StationLike = { id: string; name: string; coordinates: LatLng };

type StationCluster = {
  id: string;
  center: LatLng;
  stationIds: string[];
  count: number;
};

const clusterStations = (stations: StationLike[], radiusMeters: number): StationCluster[] => {
  if (!stations.length) return [];
  const visited = new Set<string>();
  const clusters: StationCluster[] = [];

  for (const s of stations) {
    if (visited.has(s.id)) continue;
    const bucket: StationLike[] = [s];
    visited.add(s.id);

    for (const t of stations) {
      if (visited.has(t.id)) continue;
      if (haversineMeters(s.coordinates, t.coordinates) <= radiusMeters) {
        bucket.push(t);
        visited.add(t.id);
      }
    }

    const lat = bucket.reduce((acc, x) => acc + x.coordinates.latitude, 0) / bucket.length;
    const lng = bucket.reduce((acc, x) => acc + x.coordinates.longitude, 0) / bucket.length;
    clusters.push({
      id: `cluster_${bucket.map((x) => x.id).join('_')}`.slice(0, 120),
      center: { latitude: lat, longitude: lng },
      stationIds: bucket.map((x) => x.id),
      count: bucket.length,
    });
  }
  return clusters;
};

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  origin,
  destination,
  route,
  return (
    <Animated.View
      style={[styles.container, { transform: [{ scale: breathingAnim }] }]}
      testID={testId ?? (Platform.OS === 'web' ? 'interactive-map-web' : 'interactive-map')}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setContainerLayout({ width, height });
      }}>
      <>
        {/* Mascot bubble bottom left, FAB bottom right */}
        <View style={styles.mascotBubble} pointerEvents="box-none">
          <View style={styles.mascotCircle}>
            <Text style={styles.mascotEmoji} accessibilityLabel="Mascot">🦉</Text>
          </View>
          <View style={styles.mascotSpeech}>
            <Text style={styles.mascotText}>{mascotHintValue}</Text>
          </View>
        </View>
        <View style={styles.fabBottomRight} pointerEvents="box-none">
          <Text style={styles.fabIcon}>◎</Text>
        </View>
        {/* Map content below mascot/FAB */}
        {Platform.OS === 'web' ? (
          <MapPlaceholder
            message={
              destination
                ? `Interactive map: ${origin?.name ?? 'Origin'} → ${destination.name}`
                : 'Select destination for interactive map'
            }
          />
        ) : useNative ? (
          <>
            <ExpoMapView
              testId={testId ?? 'interactive-map-native'}
              origin={origin}
              destination={destination}
              route={route}
              showTransitStations={showTransitStations}
              onMapReady={onMapReady}
              onStationPress={onStationPress}
            />
            {/* Animated marker: pulsating dot at origin */}
            {origin?.coordinates && (
              <Animated.View
                style={[styles.animatedMarker, {
                  transform: [{ scale: markerAnim }],
                  left: '50%',
                  top: '50%',
                }]}
              />
            )}
            {route && (
              <MapLibreRouteView
                origin={origin}
                destination={destination}
                routeGeoJSON={route.geometry as any}
                showTransitStations={showTransitStations}
                onStationPress={onStationPress}
                testID={testId ? `${testId}-route` : undefined}
              />
            )}
          </>
        ) : WebViewComponent && containerLayout ? (
          <WebViewComponent
            key={`map-${origin?.coordinates?.latitude}-${origin?.coordinates?.longitude}-${containerLayout?.width ?? 0}-${containerLayout?.height ?? 0}`}
            ref={webViewRef}
            source={{ html: generateLeafletHTML }}
            originWhitelist={['*']}
            style={styles.webMap}
            injectedJavaScript={injectedResizeJS}
            onMessage={handleMessage}
            onLoadEnd={() => {
              webViewRef.current?.injectJavaScript(`
                try {
                  window.postMessage('mapReady', '*');
                } catch {}
              `);
            }}
          />
        ) : null}
      </>
  {/* End of Animated.View */}

        let data: any = raw;
        if (typeof raw === 'string') {
          try { data = JSON.parse(raw); } catch { /* ignore */ }
        }

        if (data?.type === 'mapLog') {
          console.log(`🛰️ Leaflet [${data.label ?? 'log'}]`, data.payload ?? null);
          return;
        }
        if (data?.type === 'touch') {
          onTouchStateChange?.(data.state === 'start');
          return;
        }
        if (data?.type === 'ready') {
          setMapReady(true);
          onMapReady?.();
          return;
        }
        if (data?.type === 'tap' && typeof data.lat === 'number' && typeof data.lng === 'number') {
          onSelectLocation?.({ latitude: data.lat, longitude: data.lng });
          return;
        }
        if (data?.type === 'station' && typeof data.stationId === 'string') {
          onStationPress?.(data.stationId);
          return;
        }
      } catch (e) {
        console.log('InteractiveMap handleMessage error', e);
      }
    },
    [onMapReady, onSelectLocation, onStationPress, onTouchStateChange]
  );

  const sendRecenterWeb = useCallback(() => {
    try {
      webViewRef.current?.postMessage(JSON.stringify({ type: 'recenter' }));
    } catch (e) {
      console.log('recenter postMessage error', e);
    }
  }, []);

  const injectedResizeJS = `
    try {
      if (typeof map !== 'undefined' && map.invalidateSize) {
        map.invalidateSize(true);
      }
    } catch (e) {}
    true;
  `;

  const generateLeafletHTML = useMemo(() => {
    const originMarkerJs = origin
      ? `const originMarker = L.marker([${origin.coordinates.latitude}, ${origin.coordinates.longitude}]).addTo(map).bindPopup(${JSON.stringify(
          origin.name
        )});`
      : '';

    const destinationMarkerJs = destination
      ? `const destMarker = L.marker([${destination.coordinates.latitude}, ${destination.coordinates.longitude}]).addTo(map).bindPopup(${JSON.stringify(
          destination.name
        )});`
      : '';

    const boundsInitJs = `
      const bounds = L.latLngBounds([]);
      const addToBounds = (lat, lng) => { try { bounds.extend([lat, lng]); } catch {} };
    `;

    const routeJs =
      routeCoords.length > 0
        ? `
      const routeLatLngs = ${JSON.stringify(routeCoords)};
      const routeLine = L.polyline(routeLatLngs, { weight: 4 }).addTo(map);
      routeLatLngs.forEach(([lat, lng]) => addToBounds(lat, lng));
    `
        : '';

    const addOriginToBounds = origin ? `addToBounds(${origin.coordinates.latitude}, ${origin.coordinates.longitude});` : '';
    const addDestToBounds = destination ? `addToBounds(${destination.coordinates.latitude}, ${destination.coordinates.longitude});` : '';

    const transitStationsJs = showTransitStations
      ? nycStations
          .map((station) => {
            const varName = `station_${station.id.replace(/[^a-zA-Z0-9]/g, '_')}`;
            return `
              const ${varName} = L.marker([${station.coordinates.latitude}, ${station.coordinates.longitude}]).addTo(map).bindPopup(${JSON.stringify(
              station.name
            )});
              ${varName}.on('click', function() {
                try {
                  const payload = JSON.stringify({ type: 'station', stationId: '${station.id}' });
                  window.ReactNativeWebView && window.ReactNativeWebView.postMessage(payload);
                } catch (err) { /* noop */ }
              });
            `;
          })
          .join('\n')
      : '';

    const w = containerLayout?.width ?? 0;
    const h = containerLayout?.height ?? 0;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { margin:0; padding:0; height:100%; width:100%; background:transparent; }
    #map { touch-action: pan-x pan-y; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    (function(){
      var map = L.map('map', { zoomControl: true, tap: true, attributionControl: false });
      var tile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 20, minZoom: 2 }).addTo(map);

      function post(msg){
        try { window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(msg)); } catch(e) {}
      }

      ${boundsInitJs}

      ${originMarkerJs}
      ${destinationMarkerJs}
      ${routeJs}
      ${addOriginToBounds}
      ${addDestToBounds}

      ${transitStationsJs}

      try {
        if (bounds.isValid()) { map.fitBounds(bounds, { padding: [24,24] }); }
        else { map.setView([40.7128, -74.0060], 11); }
      } catch {}

      map.on('click', function(e){ post({ type: 'tap', lat: e.latlng.lat, lng: e.latlng.lng }); });
      map.on('touchstart', function(){ post({ type: 'touch', state: 'start' }); });
      map.on('touchend', function(){ post({ type: 'touch', state: 'end' }); });

      function handleMessage(ev){
        var data = ev?.data;
        if (typeof data === 'string') { try { data = JSON.parse(data); } catch {} }
        if (!data || typeof data !== 'object') return;

        if (data.type === 'recenter') {
          try { if (bounds.isValid()) map.fitBounds(bounds, { padding: [24,24] }); else map.invalidateSize(true); } catch {}
        }
        if (data.type === 'invalidate') { try { map.invalidateSize(true); } catch {} }
      }
      document.addEventListener('message', handleMessage);
      window.addEventListener('message', handleMessage);

      setTimeout(function(){ try { map.invalidateSize(true); } catch {} }, 0);
      setTimeout(function(){ try { map.invalidateSize(true); } catch {} }, 500);

      post({ type: 'ready', size: { w: ${w}, h: ${h} } });
    })();
  </script>
</body>
</html>
    `;
  }, [origin, destination, routeCoords, showTransitStations, containerLayout]);

  // ---------- Native-only station data + clustering ----------
  const stations: StationLike[] = useMemo(
    () =>
      showTransitStations
        ? nycStations.map((s) => ({
            id: s.id,
            name: s.name,
            coordinates: { latitude: s.coordinates.latitude, longitude: s.coordinates.longitude },
          }))
        : [],
    [showTransitStations]
  );

  const stationClusters: StationCluster[] = useMemo(
    () => (useNative && stations.length ? clusterStations(stations, clusterRadiusMeters) : []),
    [useNative, stations, clusterRadiusMeters]
  );

  // ---------- recenter dispatch ----------
  const sendRecenterNative = useCallback(() => {
    setRecenterNonce((n) => n + 1); // why: prop-change handshake with native map
  }, []);
  const sendRecenter = useCallback(() => {
    if (useNative) sendRecenterNative();
    else sendRecenterWeb();
  }, [useNative, sendRecenterNative, sendRecenterWeb]);

  return (
    <Animated.View
      style={[styles.container, { transform: [{ scale: breathingAnim }] }]}
      testID={testId ?? (Platform.OS === 'web' ? 'interactive-map-web' : 'interactive-map')}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setContainerLayout({ width, height });
      }}
    >
      {/* Mascot bubble bottom left */}
      <View style={styles.mascotBubble} pointerEvents="box-none">
        <View style={styles.mascotCircle}>
          <Text style={styles.mascotEmoji} accessibilityLabel="Mascot">🦉</Text>
        </View>
        <View style={styles.mascotSpeech}>
      <Text style={styles.mascotText}>{mascotHintValue}</Text>
        </View>
      </View>
      {Platform.OS === 'web' ? (
        <MapPlaceholder
          message={
            destination
              ? `Interactive map: ${origin?.name ?? 'Origin'} → ${destination.name}`
              : 'Select destination for interactive map'
          }
        />
      ) : useNative ? (
        <>
          <ExpoMapView
            testId={testId ?? 'interactive-map-native'}
            origin={origin}
            destination={destination}
            route={route}
            showTransitStations={showTransitStations}
            onMapReady={onMapReady}
            onStationPress={onStationPress}
          />
          {/* Animated marker: pulsating dot at origin */}
          {origin?.coordinates && (
            <Animated.View
              style={[styles.animatedMarker, {
                transform: [{ scale: markerAnim }],
                left: '50%',
                top: '50%',
              }]}
            />
          )}
          {route && (
            <MapLibreRouteView
              origin={origin}
              destination={destination}
              routeGeoJSON={route.geometry as any}
              showTransitStations={showTransitStations}
              onStationPress={onStationPress}
              testID={testId ? `${testId}-route` : undefined}
            />
          )}
        </>
      ) : WebViewComponent && containerLayout ? (
        <WebViewComponent
          key={`map-${origin?.coordinates?.latitude}-${origin?.coordinates?.longitude}-${containerLayout?.width ?? 0}-${containerLayout?.height ?? 0}`}
          ref={webViewRef}
          source={{ html: generateLeafletHTML }}
          originWhitelist={['*']}
          style={styles.webMap}
          injectedJavaScript={injectedResizeJS}
          onMessage={handleMessage}
          onLoadEnd={() => {
            webViewRef.current?.injectJavaScript(`
              try {
                if (typeof map !== 'undefined' && map.invalidateSize) {
                  map.invalidateSize(true);
                  setTimeout(() => map.invalidateSize(true), 400);
                }
              } catch (e) {}
              true;
            `);
            setTimeout(() => {
              try { webViewRef.current?.postMessage(JSON.stringify({ type: 'invalidate' })); } catch {}
            }, 250);
          }}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          scalesPageToFit={false}
          androidLayerType="software"
          scrollEnabled={false}
          bounces={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          allowsFullscreenVideo={false}
          mixedContentMode="always"
          setSupportMultipleWindows={false}
        />
      ) : (
        <MapPlaceholder message="Map unavailable on this device" />
      )}

      {/* Floating Action Buttons (FABs) */}
      {/* Help FAB top right */}
      <Pressable
        accessibilityRole="button"
        testID="help-fab"
        style={[styles.fab, styles.fabTopRight]}
        onPress={() => alert('Help is on the way!')}
      >
        <Text style={styles.fabIcon}>?</Text>
      </Pressable>
      {/* Recenter FAB bottom right */}
      <Pressable
        accessibilityRole="button"
        testID="recenter-fab"
        style={[styles.fab, styles.fabBottomRight]}
        onPress={sendRecenter}
      >
        <Crosshair color={Colors.primary} size={32} />
      </Pressable>

      {showTransitStations && (
        <View style={styles.transitInfo} pointerEvents="none">
          <Train color={Colors.primary} size={16} />
          <Text style={styles.transitLabel}>Transit stations shown</Text>
        </View>
      )}

      {!useNative && <MapboxPreloader WebViewComponent={WebViewComponent} />}
  </Animated.View>
  );
};

const styles = StyleSheet.create({
  mascotBubble: {
    position: 'absolute',
    left: 16,
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'flex-end',
    zIndex: 2100,
  },
  mascotCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
    marginRight: 8,
  },
  mascotEmoji: {
    fontSize: 32,
  },
  mascotSpeech: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    maxWidth: 160,
  },
  mascotText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  fabTopRight: {
    position: 'absolute',
    top: 32,
    right: 24,
    zIndex: 2000,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 8,
  },
  fabBottomRight: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    zIndex: 2000,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 8,
  },
  animatedMarker: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4F8EF7',
    opacity: 0.7,
    borderWidth: 4,
    borderColor: '#fff',
    zIndex: 1000,
    marginLeft: -16,
    marginTop: -16,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    pointerEvents: 'box-none',
    zIndex: 2000,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 8,
    marginHorizontal: 16,
  },
  fabRight: {
    alignSelf: 'flex-end',
  },
  fabLeft: {
    alignSelf: 'flex-start',
  },
  fabIcon: {
    fontSize: 32,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  container: { flex: 1, backgroundColor: 'transparent', position: 'relative' },
  webMap: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'transparent',
    minHeight: 250,
  },
  preloader: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  recenterBtn: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    zIndex: 1000,
  },
  recenterLabel: { color: Colors.text, fontWeight: '600' as const, fontSize: 12, marginLeft: 6 },
  transitInfo: {
    position: 'absolute',
    left: 16,
    bottom: 24,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    zIndex: 1000,
  },
  transitLabel: { color: Colors.text, fontWeight: '600' as const, fontSize: 12, marginLeft: 6 },
});

export default InteractiveMap;
