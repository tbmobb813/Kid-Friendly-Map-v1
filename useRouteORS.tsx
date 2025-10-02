import React from 'react';
import MapLibreGL from '@maplibre/maplibre-react-native';

type Props = {
  geojson: GeoJSON.FeatureCollection | GeoJSON.Geometry;
};

export default function RouteShape({ geojson }: Props) {
  return (
    <MapLibreGL.ShapeSource id="routeSource" shape={geojson}>
      <MapLibreGL.LineLayer
        id="routeLine"
        style={{ lineColor: '#007AFF', lineWidth: 4, lineOpacity: 0.85 }}
      />
    </MapLibreGL.ShapeSource>
  );
}
