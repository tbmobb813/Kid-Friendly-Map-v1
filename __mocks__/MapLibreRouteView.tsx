import React from 'react';

// Simple mock implementation that renders a div with props for testing
const MapLibreRouteView = (props) => {
  return (
    <div data-testid={props.testID || 'mock-maplibre-route-view'}>
      {props.origin && (
        <div data-testid="origin-marker" data-coords={JSON.stringify(props.origin)} />
      )}
      {props.destination && (
        <div data-testid="destination-marker" data-coords={JSON.stringify(props.destination)} />
      )}
      {props.showTransitStations && <div data-testid="mock-shapesource-stations" />}
      {props.showTransitStations && <div data-testid="mock-circlelayer-stations-layer" />}
      {props.origin && props.destination && <div data-testid="mock-shapesource-route" />}
      {props.origin && props.destination && <div data-testid="mock-linelayer-route-line" />}
    </div>
  );
};

export default MapLibreRouteView;
