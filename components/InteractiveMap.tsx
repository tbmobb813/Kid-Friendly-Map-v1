import React, { useMemo, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Platform, Pressable, Text, Dimensions } from 'react-native';
import Colors from '@/constants/colors';
import { Place, Route } from '@/types/navigation';
import { nycStations, Station } from '@/config/transit/nyc-stations';
import MapPlaceholder from './MapPlaceholder';
import { Crosshair, Train } from 'lucide-react-native';

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
};

const MapboxPreloader: React.FC<{ testId?: string; WebViewComponent: any | null }> = ({ testId, WebViewComponent }) => {
  if (Platform.OS === 'web' || !WebViewComponent) {
    return null;
  }
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
        } catch (e) {
          console.log('mapbox preload error', e);
        }
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
        try { console.log('Mapbox preloader message', e?.nativeEvent?.data ?? ''); } catch {}
      }}
    />
  );
};

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  origin,
  destination,
  route,
  onMapReady,
  onSelectLocation,
  onStationPress,
  showTransitStations = true,
  testId,
}) => {
  const WebViewComponent = useMemo(() => {
    if (Platform.OS === 'web') return null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('react-native-webview');
      return mod?.WebView ?? null;
    } catch (e) {
      console.log('WebView module not available', e);
      return null;
    }
  }, []);

  const webViewRef = useRef<any>(null);
  const [isMapReady, setMapReady] = useState<boolean>(false);
  const [containerLayout, setContainerLayout] = useState<{ width: number; height: number } | null>(null);

  const routeCoords = useMemo<LatLng[] | undefined>(() => {
    if (route?.geometry?.coordinates && route.geometry.coordinates.length > 0) {
      return route.geometry.coordinates;
    }
    if (origin?.coordinates && destination?.coordinates) {
      return [origin.coordinates, destination.coordinates];
    }
    return undefined;
  }, [route?.geometry?.coordinates, origin?.coordinates, destination?.coordinates]);

  const generateLeafletHTML = useCallback((layout?: { width: number; height: number }) => {
    const centerLat = origin?.coordinates?.latitude ?? 40.7128;
    const centerLng = origin?.coordinates?.longitude ?? -74.0060;
    const widthPx = layout?.width ? `${layout.width}px` : '100%';
    const heightPx = layout?.height ? `${layout.height}px` : '100%';

    const polylineJs = routeCoords
      ? `const poly = L.polyline(${JSON.stringify(
          routeCoords.map((c) => [c.latitude, c.longitude])
        )}, { color: '${Colors.primary}', weight: 4, opacity: 0.9 }).addTo(map);`
      : '';

    const fitBoundsJs = routeCoords
      ? `try { map.fitBounds(poly.getBounds().pad(0.15)); } catch (e) { console.log('fitBounds error', e); }`
      : '';

    const originMarkerJs = origin
      ? `const originMarker = L.marker([${origin.coordinates.latitude}, ${origin.coordinates.longitude}], { icon: originIcon }).addTo(map).bindPopup(${JSON.stringify(origin.name)});`
      : '';

    const destinationMarkerJs = destination
      ? `const destMarker = L.marker([${destination.coordinates.latitude}, ${destination.coordinates.longitude}], { icon: destinationIcon }).addTo(map).bindPopup(${JSON.stringify(destination.name)});`
      : '';

    const transitStationsJs = showTransitStations
      ? nycStations
          .map(
            (station) => `
          const station_${station.id.replace(/[^a-zA-Z0-9]/g, '_')} = L.marker([${station.coordinates.latitude}, ${station.coordinates.longitude}], { 
            icon: transitIcon 
          }).addTo(map).bindPopup(\`
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <h3 style="margin: 0 0 8px 0; color: #333;">${station.name}</h3>
              <div style="margin-bottom: 8px;">
                <strong>Lines:</strong> ${station.lines.map(line => `<span style="background: #007AFF; color: white; padding: 2px 6px; border-radius: 12px; font-size: 12px; margin-right: 4px;">${line}</span>`).join('')}
              </div>
              <div style="margin-bottom: 8px;">
                <strong>Safety Rating:</strong> ${'⭐'.repeat(station.kidFriendly.safetyRating)} (${station.kidFriendly.safetyRating}/5)
              </div>
              <div style="margin-bottom: 8px;">
                <strong>Kid-Friendly Features:</strong><br/>
                ${station.kidFriendly.hasElevator ? '✅ Elevator' : '❌ No Elevator'}<br/>
                ${station.kidFriendly.hasBathroom ? '✅ Bathroom' : '❌ No Bathroom'}<br/>
                ${station.kidFriendly.hasWideGates ? '✅ Wide Gates' : '❌ Standard Gates'}
              </div>
              ${station.kidFriendly.nearbyAttractions && station.kidFriendly.nearbyAttractions.length > 0 ? `
                <div style="margin-bottom: 8px;">
                  <strong>Nearby Attractions:</strong><br/>
                  ${station.kidFriendly.nearbyAttractions.map(attr => `• ${attr}`).join('<br/>')}
                </div>
              ` : ''}
              <button onclick="handleStationClick('${station.id}')" style="background: #007AFF; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; margin-top: 8px;">
                View Live Arrivals
              </button>
            </div>
          \`);
          
          station_${station.id.replace(/[^a-zA-Z0-9]/g, '_')}.on('click', function() {
            try {
              const payload = JSON.stringify({ type: 'station', stationId: '${station.id}' });
              window.ReactNativeWebView && window.ReactNativeWebView.postMessage(payload);
            } catch (err) { console.log('station click error', err); }
          });
        `
          )
          .join('\n')
      : '';

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        * { margin: 0 !important; padding: 0 !important; box-sizing: border-box; }
        html, body, #map {
          width: ${widthPx} !important;
          height: ${heightPx} !important;
          min-width: ${widthPx} !important;
          min-height: ${heightPx} !important;
          max-width: ${widthPx} !important;
          max-height: ${heightPx} !important;
          overflow: hidden !important;
          background: transparent !important;
        }
        body { position: relative !important; display: flex !important; }
        #map { position: absolute !important; top: 0; left: 0; right: 0; bottom: 0; }
        .leaflet-container,
        .leaflet-pane,
        .leaflet-map-pane,
        .leaflet-tile-container {
          width: 100% !important;
          height: 100% !important;
        }
        .leaflet-control-zoom {
          margin-top: 50px !important;
          margin-left: 10px !important;
          z-index: 1000 !important;
          display: flex !important;
          flex-direction: column !important;
        }
        .leaflet-control-zoom a {
          width: 34px !important;
          height: 34px !important;
          line-height: 34px !important;
          font-size: 22px !important;
          display: block !important;
          text-align: center !important;
          text-decoration: none !important;
          color: #000 !important;
          background-color: #fff !important;
          border: 2px solid rgba(0,0,0,0.2) !important;
        }
        .leaflet-control-zoom a:first-child { border-bottom: none !important; border-radius: 4px 4px 0 0 !important; }
        .leaflet-control-zoom a:last-child { border-radius: 0 0 4px 4px !important; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        const map = L.map('map', { zoomControl: false, preferCanvas: true }).setView([${centerLat}, ${centerLng}], 13);

        // Add zoom control with custom position
        L.control.zoom({ position: 'topleft' }).addTo(map);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(map);

        const originIcon = L.divIcon({
          html: '<div style="background: ${Colors.primary}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
          iconSize: [26,26], iconAnchor: [13,13]
        });
        const destinationIcon = L.divIcon({
          html: '<div style="background: ${Colors.secondary}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
          iconSize: [26,26], iconAnchor: [13,13]
        });
        const transitIcon = L.divIcon({
          html: '<div style="background: #FF6B35; width: 16px; height: 16px; border-radius: 4px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><span style="color: white; font-size: 10px; font-weight: bold;">🚇</span></div>',
          iconSize: [20,20], iconAnchor: [10,10]
        });

        function handleStationClick(stationId) {
          try {
            const payload = JSON.stringify({ type: 'station', stationId: stationId });
            window.ReactNativeWebView && window.ReactNativeWebView.postMessage(payload);
          } catch (err) { console.log('handleStationClick error', err); }
        }

        ${originMarkerJs}
        ${destinationMarkerJs}
        ${transitStationsJs}
        ${polylineJs}
        ${fitBoundsJs}

        map.on('click', function(e) {
          try {
            const payload = JSON.stringify({ type: 'tap', lat: e.latlng.lat, lng: e.latlng.lng });
            window.ReactNativeWebView && window.ReactNativeWebView.postMessage(payload);
          } catch (err) { console.log('postMessage error', err); }
        });

        function recenter() {
          try { ${routeCoords ? 'map.fitBounds(poly.getBounds().pad(0.15));' : `map.setView([${centerLat}, ${centerLng}], 13);`} } catch (e) { console.log('recenter error', e); }
        }

        document.addEventListener('message', function(event) {
          try {
            const data = JSON.parse(event.data || '{}');
            if (data.type === 'recenter') { recenter(); }
          } catch (e) { console.log('message parse error', e); }
        });

        // Ready + ensure proper sizing
        setTimeout(() => {
          try { map.invalidateSize(true); } catch {}
          try { window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' })); } catch {}
        }, 200);
        setTimeout(() => { try { map.invalidateSize(true); } catch {} }, 800);
      </script>
    </body>
    </html>`;
  }, [origin, destination, routeCoords, showTransitStations]);

  const handleMessage = useCallback((event: any) => {
    try {
      const raw: string = event?.nativeEvent?.data ?? '';
      if (!raw) return;
      if (raw === 'mapReady') {
        setMapReady(true);
        onMapReady?.();
        return;
      }
      const data = JSON.parse(raw);
      if (data?.type === 'mapLog') {
        console.log(`🛰️ Leaflet [${data.label ?? 'log'}]`, data.payload ?? null);
        return;
      }
      if (data?.type === 'ready') {
        setMapReady(true);
        onMapReady?.();
        return;
      }
      if (data?.type === 'tap' && typeof data.lat === 'number' && typeof data.lng === 'number') {
        onSelectLocation?.({ latitude: data.lat, longitude: data.lng });
      }
      if (data?.type === 'station' && typeof data.stationId === 'string') {
        onStationPress?.(data.stationId);
      }
    } catch (e) {
      console.log('InteractiveMap handleMessage error', e);
    }
  }, [onMapReady, onSelectLocation, onStationPress]);

  const sendRecenter = useCallback(() => {
    try {
      webViewRef.current?.postMessage(JSON.stringify({ type: 'recenter' }));
    } catch (e) {
      console.log('recenter postMessage error', e);
    }
  }, []);

  return (
    <View 
      style={styles.container} 
      testID={testId ?? (Platform.OS === 'web' ? 'interactive-map-web' : 'interactive-map')}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        console.log('🗺️  Map container layout:', { width, height });
        setContainerLayout({ width, height });
      }}
    >
      {Platform.OS === 'web' ? (
        <MapPlaceholder
          message={destination ? `Interactive map: ${origin?.name ?? 'Origin'} → ${destination.name}` : 'Select destination for interactive map'}
        />
      ) : WebViewComponent && containerLayout ? (
        <WebViewComponent
          key={`map-${origin?.coordinates?.latitude}-${origin?.coordinates?.longitude}-${containerLayout.width}-${containerLayout.height}`}
          ref={webViewRef}
          source={{ html: generateLeafletHTML(containerLayout) }}
          originWhitelist={['*']}
          style={styles.webMap}
          injectedJavaScript={`
            setTimeout(() => {
              try {
                if (typeof map !== 'undefined' && map.invalidateSize) {
                  map.invalidateSize(true);
                  console.log('📍 Map invalidateSize called from injected JS, container: ${containerLayout.width}x${containerLayout.height}');
                }
              } catch (e) {
                console.log('❌ injectedJS error:', e);
              }
            }, 500);
            true;
          `}
          onMessage={handleMessage}
          onLoadEnd={() => {
            console.log('🗺️  WebView loaded, injecting resize command');
            webViewRef.current?.injectJavaScript(`
              try {
                if (typeof map !== 'undefined') {
                  console.log('📏 Map element size:', document.getElementById('map').getBoundingClientRect());
                  map.invalidateSize(true);
                  setTimeout(() => map.invalidateSize(true), 1000);
                }
              } catch (e) {
                console.log('❌ onLoadEnd inject error:', e);
              }
              true;
            `);
          }}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          scalesPageToFit={false}
          androidLayerType="hardware"
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

      <Pressable accessibilityRole="button" testID="recenter-button" style={styles.recenterBtn} onPress={sendRecenter}>
        <Crosshair color={Colors.text} size={18} />
        <Text style={styles.recenterLabel}>Recenter</Text>
      </Pressable>

      {showTransitStations && (
        <View style={styles.transitInfo}>
          <Train color={Colors.primary} size={16} />
          <Text style={styles.transitLabel}>Transit stations shown</Text>
        </View>
      )}

      <MapboxPreloader WebViewComponent={WebViewComponent} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent', position: 'relative' },
  webMap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'transparent' },
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
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    zIndex: 1000,
  },
  recenterLabel: { color: Colors.text, fontWeight: '600' as const, fontSize: 12 },
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
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    zIndex: 1000,
  },
  transitLabel: { color: Colors.text, fontWeight: '600' as const, fontSize: 12 },
});

export default InteractiveMap;
