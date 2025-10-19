import AsyncStorage from '@react-native-async-storage/async-storage';
import { offlineStorage } from '../utils/api';

jest.mock('@react-native-async-storage/async-storage');

describe('offlineStorage in-memory fallback', () => {
  const key = 'test_key_fallback';
  const value = { hello: 'world' };

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear in-memory cache
    // @ts-ignore access private for test
    offlineStorage._memoryCache.clear();
  });

  it('falls back to memory cache when AsyncStorage.setItem fails', async () => {
    // make AsyncStorage.setItem throw
    (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage full'));

    await offlineStorage.cacheResponse(key, value);

    // setItem was attempted
    expect(AsyncStorage.setItem).toHaveBeenCalled();

    // data should be present in in-memory fallback
    // @ts-ignore access private for test
    const mem = offlineStorage._memoryCache.get(key);
    expect(mem).toBeDefined();
    // use non-null assertion now that we've asserted it's defined
    // @ts-ignore
    expect(mem!.data).toEqual(value);
  });

  it('reads from memory cache when AsyncStorage.getItem fails', async () => {
    // pre-populate memory cache
    // @ts-ignore access private for test
    offlineStorage._memoryCache.set(key, { data: value, timestamp: Date.now() });

    // make AsyncStorage.getItem throw
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('read fail'));

    const res = await offlineStorage.getCachedResponse(key);
    expect(AsyncStorage.getItem).toHaveBeenCalled();
    expect(res).toEqual(value);
  });

  it('expires memory cache entries after maxAge', async () => {
    const oldTimestamp = Date.now() - 1000 * 60 * 10; // 10 minutes ago
    // @ts-ignore
    offlineStorage._memoryCache.set(key, { data: value, timestamp: oldTimestamp });

    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('read fail'));

    const res = await offlineStorage.getCachedResponse(key, 1000 * 60); // 1 minute maxAge
    expect(res).toBeNull();
    // ensure memory cache removed
    // @ts-ignore
    expect(offlineStorage._memoryCache.get(key)).toBeUndefined();
  });
});
