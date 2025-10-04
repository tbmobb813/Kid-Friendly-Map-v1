/**
 * Enhanced Storage Utility using MMKV
 * High-performance, synchronous key-value storage
 * 
 * Benefits over AsyncStorage:
 * - 10x faster
 * - Synchronous operations
 * - Type-safe
 * - Smaller memory footprint
 * - Encryption support
 */

import { MMKV } from 'react-native-mmkv';
import { log } from './logger';

type StorageInstance = Pick<
  MMKV,
  'set' | 'getString' | 'getNumber' | 'getBoolean' | 'delete' | 'clearAll' | 'getAllKeys' | 'contains'
>;

class MemoryStorage implements StorageInstance {
  private store = new Map<string, { type: 'string' | 'number' | 'boolean'; value: string }>();

  constructor(_label: string) {}

  set(key: string, value: string | number | boolean): void {
    let type: 'string' | 'number' | 'boolean' = 'string';
    let storedValue: string;

    if (typeof value === 'number') {
      type = 'number';
      storedValue = value.toString();
    } else if (typeof value === 'boolean') {
      type = 'boolean';
      storedValue = value ? '1' : '0';
    } else {
      storedValue = value;
    }

    this.store.set(key, { type, value: storedValue });
  }

  getString(key: string): string | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    if (entry.type === 'boolean') {
      return entry.value === '1' ? 'true' : 'false';
    }

    return entry.value;
  }

  getNumber(key: string): number | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    if (entry.type === 'number') {
      const parsed = Number(entry.value);
      return Number.isFinite(parsed) ? parsed : undefined;
    }

    const parsed = Number(entry.value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  getBoolean(key: string): boolean | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    if (entry.type === 'boolean') {
      return entry.value === '1';
    }

    if (entry.value === 'true' || entry.value === '1') {
      return true;
    }

    if (entry.value === 'false' || entry.value === '0') {
      return false;
    }

    return undefined;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clearAll(): void {
    this.store.clear();
  }

  getAllKeys(): string[] {
    return Array.from(this.store.keys());
  }

  contains(key: string): boolean {
    return this.store.has(key);
  }
}

type StorageDriver = 'mmkv' | 'memory';

const createStorageInstance = (
  config: ConstructorParameters<typeof MMKV>[0],
): { instance: StorageInstance; driver: StorageDriver } => {
  const label = config?.id ?? 'default';

  try {
    const instance = new MMKV(config);
    // Smoke test to ensure native module is available
    const probeKey = `__probe__${Date.now()}`;
    instance.set(probeKey, 'ok');
    instance.delete(probeKey);
    log.info(`Initialized MMKV storage for ${label}`);
    return { instance, driver: 'mmkv' };
  } catch (error) {
    log.warn(
      `MMKV native module unavailable for ${label}. Falling back to in-memory storage. Persistent data will reset between sessions.`,
      {
        error:
          error instanceof Error
            ? { name: error.name, message: error.message }
            : { message: String(error) },
      },
    );
    return { instance: new MemoryStorage(label), driver: 'memory' };
  }
};

const mainStorageInit = createStorageInstance({
  id: 'kid-friendly-map-storage',
  encryptionKey: 'kid-map-secure-key-2025',
});

const cacheStorageInit = createStorageInstance({
  id: 'kid-friendly-map-cache',
});

export const storage: StorageInstance = mainStorageInit.instance;
export const cacheStorage: StorageInstance = cacheStorageInit.instance;
export const STORAGE_DRIVER: StorageDriver = mainStorageInit.driver;
export const CACHE_STORAGE_DRIVER: StorageDriver = cacheStorageInit.driver;
export const isInMemoryStorage = STORAGE_DRIVER === 'memory';
export const isInMemoryCache = CACHE_STORAGE_DRIVER === 'memory';

/**
 * Storage Manager with type safety and error handling
 */
export class StorageManager {
  private instance: StorageInstance;

  constructor(instance: StorageInstance = storage) {
    this.instance = instance;
  }

  /**
   * Set a value (synchronous)
   */
  set<T>(key: string, value: T): boolean {
    try {
      if (value === undefined || value === null) {
        this.instance.delete(key);
        return true;
      }

      const type = typeof value;
      
      if (type === 'string') {
        this.instance.set(key, value as string);
      } else if (type === 'number') {
        this.instance.set(key, value as number);
      } else if (type === 'boolean') {
        this.instance.set(key, value as boolean);
      } else {
        // For objects, arrays, etc.
        this.instance.set(key, JSON.stringify(value));
      }
      
      return true;
    } catch (error) {
      log.error(`Failed to set storage key: ${key}`, error as Error);
      return false;
    }
  }

  /**
   * Get a value (synchronous)
   */
  get<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const value = this.instance.getString(key);
      
      if (value === undefined) {
        return defaultValue;
      }

      // Try to parse as JSON for objects/arrays
      try {
        return JSON.parse(value) as T;
      } catch {
        // If not JSON, return as-is (for primitive types stored as strings)
        return value as T;
      }
    } catch (error) {
      log.error(`Failed to get storage key: ${key}`, error as Error);
      return defaultValue;
    }
  }

  /**
   * Get string value
   */
  getString(key: string, defaultValue?: string): string | undefined {
    try {
      return this.instance.getString(key) ?? defaultValue;
    } catch (error) {
      log.error(`Failed to get string: ${key}`, error as Error);
      return defaultValue;
    }
  }

  /**
   * Get number value
   */
  getNumber(key: string, defaultValue?: number): number | undefined {
    try {
      return this.instance.getNumber(key) ?? defaultValue;
    } catch (error) {
      log.error(`Failed to get number: ${key}`, error as Error);
      return defaultValue;
    }
  }

  /**
   * Get boolean value
   */
  getBoolean(key: string, defaultValue?: boolean): boolean | undefined {
    try {
      return this.instance.getBoolean(key) ?? defaultValue;
    } catch (error) {
      log.error(`Failed to get boolean: ${key}`, error as Error);
      return defaultValue;
    }
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    try {
      return this.instance.contains(key);
    } catch (error) {
      log.error(`Failed to check key existence: ${key}`, error as Error);
      return false;
    }
  }

  /**
   * Delete a key
   */
  delete(key: string): boolean {
    try {
      this.instance.delete(key);
      return true;
    } catch (error) {
      log.error(`Failed to delete key: ${key}`, error as Error);
      return false;
    }
  }

  /**
   * Clear all data
   */
  clearAll(): boolean {
    try {
      this.instance.clearAll();
      log.info('Storage cleared successfully');
      return true;
    } catch (error) {
      log.error('Failed to clear storage', error as Error);
      return false;
    }
  }

  /**
   * Get all keys
   */
  getAllKeys(): string[] {
    try {
      return this.instance.getAllKeys();
    } catch (error) {
      log.error('Failed to get all keys', error as Error);
      return [];
    }
  }

  /**
   * Batch set multiple values
   */
  setBatch(entries: Record<string, any>): boolean {
    try {
      Object.entries(entries).forEach(([key, value]) => {
        this.set(key, value);
      });
      return true;
    } catch (error) {
      log.error('Failed to set batch', error as Error);
      return false;
    }
  }

  /**
   * Batch get multiple values
   */
  getBatch<T>(keys: string[]): Record<string, T | undefined> {
    const result: Record<string, T | undefined> = {};
    keys.forEach(key => {
      result[key] = this.get<T>(key);
    });
    return result;
  }
}

// Export instances for different use cases
export const mainStorage = new StorageManager(storage);
export const cache = new StorageManager(cacheStorage);

/**
 * Typed storage keys for type safety
 */
export const StorageKeys = {
  // User preferences
  USER_PROFILE: 'user_profile',
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  THEME: 'theme',
  LANGUAGE: 'language',
  
  // Safety features
  EMERGENCY_CONTACTS: 'emergency_contacts',
  SAFE_ZONES: 'safe_zones',
  PARENT_PIN: 'parent_pin',
  
  // App settings
  VOICE_ENABLED: 'voice_enabled',
  VOICE_RATE: 'voice_rate',
  VOICE_PITCH: 'voice_pitch',
  VOICE_LANGUAGE: 'voice_language',
  NOTIFICATIONS_ENABLED: 'notifications_enabled',
  LOCATION_TRACKING: 'location_tracking',
  
  // Journey data
  RECENT_SEARCHES: 'recent_searches',
  FAVORITE_PLACES: 'favorite_places',
  JOURNEY_HISTORY: 'journey_history',
  
  // Achievements
  ACHIEVEMENTS: 'achievements',
  BADGES: 'badges',
  POINTS: 'points',
  
  // Cache keys (in cacheStorage)
  TRANSIT_DATA: 'transit_data',
  WEATHER_DATA: 'weather_data',
  MAP_TILES: 'map_tiles',
  LAST_SYNC: 'last_sync',
} as const;

export type StorageKey = typeof StorageKeys[keyof typeof StorageKeys];

/**
 * Migration helper to move data from AsyncStorage to MMKV
 */
export async function migrateFromAsyncStorage(): Promise<void> {
  try {
    const AsyncStorage = await import('@react-native-async-storage/async-storage').then(
      m => m.default
    );

    const keys = await AsyncStorage.getAllKeys();
    log.info(`Migrating ${keys.length} keys from AsyncStorage to MMKV`);

    for (const key of keys) {
      try {
        const value = await AsyncStorage.getItem(key);
        if (value !== null) {
          // Determine if it should go to cache or main storage
          const isCacheKey = key.startsWith('cache_') || 
                           key.includes('temp_') || 
                           key.includes('weather_') ||
                           key.includes('transit_');
          
          const storageInstance = isCacheKey ? cache : mainStorage;
          
          // Try to parse as JSON
          try {
            const parsed = JSON.parse(value);
            storageInstance.set(key, parsed);
          } catch {
            // Store as string if not JSON
            storageInstance.set(key, value);
          }
        }
      } catch (error) {
        log.warn(`Failed to migrate key: ${key}`);
      }
    }

    // Clear AsyncStorage after successful migration
    await AsyncStorage.clear();
    log.info('AsyncStorage migration completed successfully');
  } catch (error) {
    log.error('Failed to migrate from AsyncStorage', error as Error);
  }
}

/**
 * Storage utilities for common patterns
 */
export const StorageUtils = {
  /**
   * Store with expiration
   */
  setWithExpiry(key: string, value: any, ttlMs: number): boolean {
    const expiryTime = Date.now() + ttlMs;
    return cache.set(key, {
      value,
      expiry: expiryTime,
    });
  },

  /**
   * Get with expiration check
   */
  getWithExpiry<T>(key: string): T | undefined {
    const item = cache.get<{ value: T; expiry: number }>(key);
    
    if (!item) {
      return undefined;
    }

    if (Date.now() > item.expiry) {
      cache.delete(key);
      return undefined;
    }

    return item.value;
  },

  /**
   * Clear expired cache entries
   */
  clearExpired(): number {
    const keys = cache.getAllKeys();
    let cleared = 0;

    keys.forEach(key => {
      const item = cache.get<{ value: any; expiry: number }>(key);
      if (item && item.expiry && Date.now() > item.expiry) {
        cache.delete(key);
        cleared++;
      }
    });

    log.info(`Cleared ${cleared} expired cache entries`);
    return cleared;
  },

  /**
   * Get storage size info
   */
  getStorageInfo(): { mainKeys: number; cacheKeys: number } {
    return {
      mainKeys: mainStorage.getAllKeys().length,
      cacheKeys: cache.getAllKeys().length,
    };
  },
};

export default {
  storage,
  cacheStorage,
  mainStorage,
  cache,
  StorageKeys,
  StorageUtils,
  migrateFromAsyncStorage,
};
