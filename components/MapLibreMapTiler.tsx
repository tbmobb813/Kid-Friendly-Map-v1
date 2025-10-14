import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapLibreMap from './MapLibreMap';

const MAPTILER_API_KEY = 'ayvaU57n5i7ZB4HOOCsQ';
const TILESET_URL = `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_API_KEY}`;

export default function MapLibreMapTiler() {
  return (
    <MapLibreMap styleURL={TILESET_URL} />
  );
}

