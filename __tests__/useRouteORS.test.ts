import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useRouteORS } from '@/hooks/useRouteORS';
import Config from '@/utils/config';

// Mock the config
jest.mock('@/utils/config', () => ({
  ROUTING: {
    BASE_URL: 'https://api.openrouteservice.org',
    ORS_API_KEY: 'test-api-key',
    DEFAULT_PROFILE: 'foot-walking',
    REQUEST_TIMEOUT: 15000,
    INCLUDE_ETA: true,
  },
}));

// Mock fetch
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

const mockSuccessResponse = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [-74.006, 40.7128],
          [-74.005, 40.7135],
          [-74.004, 40.7142],
        ],
      },
      properties: {
        summary: {
          duration: 300, // 5 minutes
          distance: 1500, // 1.5km
        },
      },
    },
  ],
};

describe('useRouteORS', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockSuccessResponse,
      text: async () => JSON.stringify(mockSuccessResponse),
    } as Response);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useRouteORS());

    expect(result.current.geojson).toBeNull();
    expect(result.current.summary).toEqual({
      durationSeconds: null,
      distanceMeters: null,
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should fetch route when valid coordinates are provided', async () => {
    const start: [number, number] = [-74.006, 40.7128];
    const end: [number, number] = [-74.004, 40.7142];

    const { result } = renderHook(() => useRouteORS(start, end));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(
        'https://api.openrouteservice.org/v2/directions/foot-walking/geojson',
      ),
      expect.objectContaining({
        method: 'GET',
        headers: {
          Authorization: 'test-api-key',
        },
        signal: expect.any(AbortSignal),
      }),
    );

    expect(result.current.geojson).toEqual(mockSuccessResponse);
    expect(result.current.summary).toEqual({
      durationSeconds: 300,
      distanceMeters: 1500,
    });
    expect(result.current.error).toBeNull();
  });

  it('should not fetch when coordinates are invalid', () => {
    const { result } = renderHook(() => useRouteORS([NaN, 40.7128], [-74.004, 40.7142]));

    expect(result.current.loading).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.geojson).toBeNull();
  });

  it('should not fetch when disabled', () => {
    const start: [number, number] = [-74.006, 40.7128];
    const end: [number, number] = [-74.004, 40.7142];

    const { result } = renderHook(() => useRouteORS(start, end, { enabled: false }));

    expect(result.current.loading).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.geojson).toBeNull();
  });

  it('should handle API errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized',
    } as Response);

    const start: [number, number] = [-74.006, 40.7128];
    const end: [number, number] = [-74.004, 40.7142];

    const { result } = renderHook(() => useRouteORS(start, end));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain('401');
    expect(result.current.geojson).toBeNull();
  });

  it('should handle missing API key', async () => {
    // Temporarily mock empty API key
    const originalConfig = { ...Config.ROUTING };
    (Config.ROUTING as any).ORS_API_KEY = '';

    const start: [number, number] = [-74.006, 40.7128];
    const end: [number, number] = [-74.004, 40.7142];

    const { result } = renderHook(() => useRouteORS(start, end));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain('Missing OpenRouteService API key');

    // Restore original config
    Object.assign(Config.ROUTING, originalConfig);
  });

  it('should use custom profile when provided', async () => {
    const start: [number, number] = [-74.006, 40.7128];
    const end: [number, number] = [-74.004, 40.7142];

    renderHook(() => useRouteORS(start, end, { profile: 'cycling-regular' }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/v2/directions/cycling-regular/geojson'),
      expect.any(Object),
    );
  });

  it('should abort previous request when coordinates change', async () => {
    jest.useFakeTimers();

    const start1: [number, number] = [-74.006, 40.7128];
    const end1: [number, number] = [-74.004, 40.7142];
    const start2: [number, number] = [-74.007, 40.7129];
    const end2: [number, number] = [-74.003, 40.7143];

    let resolveFirstFetch: (value: Response) => void;
    const firstFetchPromise = new Promise<Response>((resolve) => {
      resolveFirstFetch = resolve;
    });

    mockFetch.mockReturnValueOnce(firstFetchPromise);

    const { result, rerender } = renderHook(
      (props: { start: [number, number]; end: [number, number] }) =>
        useRouteORS(props.start, props.end),
      {
        initialProps: { start: start1, end: end1 },
      },
    );

    expect(result.current.loading).toBe(true);

    // Change coordinates before first request completes
    rerender({ start: start2, end: end2 });

    // Use real timers before resolving the mocked fetch so waitFor works with testing-library
    jest.useRealTimers();

    // Resolve first request (should be ignored due to abort)
    resolveFirstFetch!({
      ok: true,
      json: async () => mockSuccessResponse,
    } as Response);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should have made two fetch calls
    expect(mockFetch).toHaveBeenCalledTimes(2);

    jest.useRealTimers();
  });

  it('should provide refetch function', async () => {
    const start: [number, number] = [-73.985, 40.7589];
    const end: [number, number] = [-74.004, 40.7142];

    const { result } = renderHook(() => useRouteORS(start, end));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Mock another successful response
    mockFetch.mockReturnValueOnce(
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockSuccessResponse),
      } as Response),
    );

    let refetchPromise: Promise<any>;
    act(() => {
      refetchPromise = result.current.refetch();
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await refetchPromise!;
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.geojson).toEqual(mockSuccessResponse);
    });
  });

  it('should handle refetch with no coordinates', async () => {
    const { result } = renderHook(() => useRouteORS());

    const refetchResult = await result.current.refetch();

    expect(refetchResult).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should parse summary correctly when includeEta is false', async () => {
    const start: [number, number] = [-74.006, 40.7128];
    const end: [number, number] = [-74.004, 40.7142];

    const { result } = renderHook(() => useRouteORS(start, end, { includeEta: false }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.summary).toEqual({
      durationSeconds: null,
      distanceMeters: null,
    });
  });

  it('should handle malformed response data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ features: [] }), // Missing summary
    } as Response);

    const start: [number, number] = [-74.006, 40.7128];
    const end: [number, number] = [-74.004, 40.7142];

    const { result } = renderHook(() => useRouteORS(start, end));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.summary).toEqual({
      durationSeconds: null,
      distanceMeters: null,
    });
  });
});
