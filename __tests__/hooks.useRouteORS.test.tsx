import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { useRouteORS } from '@/hooks/useRouteORS';
import Config from '@/utils/config';
import { setORSApiKey, resetAll } from '../tests/test-utils';

describe('useRouteORS', () => {
  const originalApiKey = Config.ROUTING.ORS_API_KEY;
  beforeEach(() => {
    setORSApiKey('test-key');
    jest.resetAllMocks();
  });

  afterEach(() => {
    resetAll();
    Config.ROUTING.ORS_API_KEY = originalApiKey;
  });

  function makeHookHost(start: [number, number], end: [number, number], enabled = false) {
    const snapshot: any = { current: null };

    const Host = () => {
      const result = useRouteORS(start, end, { enabled });
      snapshot.current = result;
      return null;
    };

    return { Host, snapshot };
  }

  it('returns null on aborted fetch (refetch)', async () => {
    // Simulate fetch rejecting with an AbortError
    const abortErr: any = new Error('Aborted');
    abortErr.name = 'AbortError';
    (global as any).fetch = jest.fn().mockRejectedValue(abortErr);

    const { Host, snapshot } = makeHookHost([0, 0], [1, 1], false);
    render(React.createElement(Host));

    const res = await act(async () => snapshot.current.refetch());
    expect(res).toBeNull();
  });

  it('sets error when response not ok', async () => {
    (global as any).fetch = jest
      .fn()
      .mockResolvedValue({ ok: false, status: 500, text: async () => 'server error' });

    const { Host, snapshot } = makeHookHost([0, 0], [1, 1], true);
    render(React.createElement(Host));

    // wait for the hook to process the non-ok response and set the error
    await waitFor(() => {
      expect(snapshot.current.error).toBeTruthy();
    });

    expect(snapshot.current.geojson).toBeNull();
  });
});
