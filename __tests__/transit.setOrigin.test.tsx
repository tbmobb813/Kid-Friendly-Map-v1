import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TransitScreen from '@/app/(tabs)/transit';
import { useNavigationStore } from '@/stores/enhancedNavigationStore';
import { nycStations } from '@/config/transit/nyc-stations';

// Minimal mocks for components used by TransitScreen
jest.mock('@/components/LiveArrivalsCard', () => (props: any) => {
  return React.createElement('LiveArrivalsCard', { testID: 'live-arrivals', ...props });
});

jest.mock('@/components/SearchBar', () => (props: any) => {
  return React.createElement('SearchBar', { testID: 'search-bar', ...props });
});

// Mock colors config
jest.mock('@/constants/colors', () => ({
  primary: '#007AFF',
  secondary: '#FF9500',
  background: '#fff',
  card: '#f7f7f7',
  text: '#111',
  textLight: '#666',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  border: '#E5E7EB',
}));

describe('TransitScreen integration', () => {
  beforeEach(() => {
    // reset store
    useNavigationStore.setState({ origin: null });
  });

  it('selecting a station sets origin in navigation store', () => {
    const { getByText } = render((<TransitScreen />) as any);

    // Use the first station from nycStations (Main St Station)
    const stationName = nycStations[0].name;

    const stationButton = getByText(stationName);
    expect(stationButton).toBeTruthy();

    fireEvent.press(stationButton);

    const origin = useNavigationStore.getState().origin;
    expect(origin).toBeTruthy();
    expect(origin?.id).toBe(nycStations[0].id);
    expect(origin?.name).toBe(nycStations[0].name);
    expect(origin?.coordinates.latitude).toBeCloseTo(nycStations[0].coordinates.latitude, 5);
    expect(origin?.coordinates.longitude).toBeCloseTo(nycStations[0].coordinates.longitude, 5);
  });
});
