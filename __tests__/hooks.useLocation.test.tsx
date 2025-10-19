import { setExpoLocationStatus, resetAll } from '../tests/test-utils';
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import useLocation from '@/hooks/useLocation';
import { Text } from 'react-native';

const TestComp = () => {
  const { location, loading } = useLocation();
  return (
    <>
      <Text testID="lat">{location.latitude}</Text>
      <Text testID="lng">{location.longitude}</Text>
      <Text testID="error">{location.error ?? ''}</Text>
      <Text testID="loading">{loading ? 'true' : 'false'}</Text>
    </>
  );
};

describe('useLocation hook', () => {
  afterEach(() => resetAll());

  it('handles permission denied flow and sets error', async () => {
    setExpoLocationStatus('denied');

    const { getByTestId } = render(<TestComp />);

    await waitFor(() => {
      expect(getByTestId('loading').props.children).toBe('false');
    });

    const error = getByTestId('error').props.children;
    expect(error).toContain('Permission to access location was denied');
  });
});
