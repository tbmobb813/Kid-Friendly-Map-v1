import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
// Mock LiveArrivalsCard to keep tests fast and side-effect free
jest.mock('@/components/LiveArrivalsCard', () => {
  const React = require('react');
  function MockLiveArrivalsCard(props: any) {
    return React.createElement(
      'View',
      { testID: 'mock-live-arrivals' },
      `Mocked LiveArrivals for ${props.stationId}`,
    );
  }
  return { __esModule: true, default: MockLiveArrivalsCard };
});

import TransitScreen from '../app/(tabs)/transit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createWrapper = () => {
  const qc = new QueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
};

describe('TransitScreen Accessibility', () => {
  it('renders accessibility toggles', () => {
    const { getByLabelText } = render(<TransitScreen />, { wrapper: createWrapper() });
    expect(getByLabelText('Large Text')).toBeTruthy();
    expect(getByLabelText('High Contrast')).toBeTruthy();
  });

  it('toggles large text mode', () => {
    const { getByLabelText, getByText } = render(<TransitScreen />, { wrapper: createWrapper() });
    const largeTextSwitch = getByLabelText('Large Text');
    fireEvent(largeTextSwitch, 'valueChange', true);
    // Section title should be larger
    expect(getByText('Live Arrivals').props.style.fontSize).toBeGreaterThanOrEqual(24);
  });

  it('toggles high contrast mode', () => {
    const { getByLabelText, getByText } = render(<TransitScreen />, { wrapper: createWrapper() });
    const contrastSwitch = getByLabelText('High Contrast');
    fireEvent(contrastSwitch, 'valueChange', true);
    // Section title should have high contrast color
    expect(getByText('Live Arrivals').props.style.color).toBe('#000');
  });

  it('shows friendly status messages', () => {
    const { getAllByText } = render(<TransitScreen />, { wrapper: createWrapper() });
    const matches = getAllByText(/Trains are running smoothly!/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });
});
