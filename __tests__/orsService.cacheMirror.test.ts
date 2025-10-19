import AsyncStorage from '@react-native-async-storage/async-storage';
import { orsService } from '../utils/orsService';
import { offlineStorage } from '../utils/api';

jest.mock('@react-native-async-storage/async-storage');

describe('ORS service cache mirroring', () => {
  const cacheKey = 'ors_foot-walking_-74.006,40.7128|-73.9934,40.7505_default_{}';
  const mockRouteResponse = {
    routes: [
      {
        summary: { duration: 100, distance: 200 },
        geometry: {
          coordinates: [
            [-74.006, 40.7128],
            [-73.9934, 40.7505],
          ],
        },
      },
    ],
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    orsService.resetForTests();
    // clear in-memory fallback
    // @ts-ignore
    offlineStorage._memoryCache.clear();
    // Ensure orsService internal memory cache is cleared
    // @ts-ignore
    orsService.resetForTests();
  });

  it('mirrors persistent cache into in-memory cache to avoid duplicate network calls', async () => {
    // Scenario:
    // 1) offlineStorage.cacheResponse writes successfully to AsyncStorage (simulate success)
    // 2) later, AsyncStorage.getItem fails (simulate read failures) — orsService should have mirrored cached response into its in-memory cache, so getRoute should return cached value without network fetch

    // Mock AsyncStorage.setItem to succeed
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

    // Manually write to persistent cache via offlineStorage
    await offlineStorage.cacheResponse(cacheKey, mockRouteResponse);

    // At this point, offlineStorage should have attempted to write to AsyncStorage and also filled the memory fallback
    expect(AsyncStorage.setItem).toHaveBeenCalled();

    // Now simulate that AsyncStorage.getItem fails (e.g., storage corruption) so read from persistent storage will throw
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('read error'));

    // Also mock global fetch so we can detect network calls; if caching works, fetch should not be called.
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: true, json: () => Promise.resolve({}) } as Response);

    // Construct a request object that creates the same cache key used above
    const request = {
      coordinates: [
        [-74.006, 40.7128],
        [-73.9934, 40.7505],
      ] as [number, number][],
      profile: 'foot-walking' as const,
    };

    // First call to orsService.getRoute should consult in-memory cache (the orsService mirrors persistent cache into its own memory cache during getRoute), returning the cached response without calling fetch
    const result = await orsService.getRoute(request as any);

    expect(result).toEqual(mockRouteResponse);
    // ensure fetch was not called
    expect((global.fetch as jest.Mock).mock.calls.length).toBe(0);
  });
});
