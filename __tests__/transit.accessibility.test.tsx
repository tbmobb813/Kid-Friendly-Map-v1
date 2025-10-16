import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TransitScreen from '../app/(tabs)/transit';

describe('TransitScreen Accessibility', () => {
  it('renders accessibility toggles', () => {
    const { getByLabelText } = render(<TransitScreen />);
    expect(getByLabelText('Large Text')).toBeTruthy();
    expect(getByLabelText('High Contrast')).toBeTruthy();
  });

  it('toggles large text mode', () => {
    const { getByLabelText, getByText } = render(<TransitScreen />);
    const largeTextSwitch = getByLabelText('Large Text');
    fireEvent(largeTextSwitch, 'valueChange', true);
    // Section title should be larger
    expect(getByText('Live Arrivals').props.style.fontSize).toBeGreaterThanOrEqual(24);
  });

  it('toggles high contrast mode', () => {
    const { getByLabelText, getByText } = render(<TransitScreen />);
    const contrastSwitch = getByLabelText('High Contrast');
    fireEvent(contrastSwitch, 'valueChange', true);
    // Section title should have high contrast color
    expect(getByText('Live Arrivals').props.style.color).toBe('#000');
  });

  it('shows friendly status messages', () => {
    const { getByText } = render(<TransitScreen />);
    expect(getByText(/Trains are running smoothly!/)).toBeTruthy();
  });
});
