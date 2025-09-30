import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { SafeAsyncStorage } from './errorHandling';
import { log } from './logger';
import { Config } from './config';

export type CacheEntry<T> = {
  data: T;
  timestamp: number;
  expiresAt: number;
  version: string;
  metadata?: {
    source: 'network' | 'cache';
    lastUpdated: number;
    accessCount: number;
  };
};

export type CacheOptions = {
  ttl?: number; // Time to live in milliseconds
  version?: string; // Cache version for invalidation
  priority?: 'low' | 'medium' | 'high'; // Cache priority
  compress?: boolean; // Compress large data
  syncWithNetwork?: boolean; // Auto-sync with network when available
};

export type CacheStats = {
  totalEntries: number;
  totalSize: number; // Approximate size in bytes
  hitRate: number;
  oldestEntry: number;
  newestEntry: number;
};

class EnhancedCacheManager {
  private static instance: EnhancedCacheManager;
  private cachePrefix = 'enhanced_cache_';
  private metadataKey = 'cache_metadata';
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0
  };

  private constructor() {
    this.initializeCache();
  }

  static getInstance(): EnhancedCacheManager {
    if (!EnhancedCacheManager.instance) {
      EnhancedCacheManager.instance = new EnhancedCacheManager();
    }
    return EnhancedCacheManager.instance;
  }

  private async initializeCache() {
    try {
      log.debug('Initializing enhanced cache manager');
      
      // Clean up expired entries on startup
      await this.cleanupExpiredEntries();
      
      // Setup periodic cleanup
      this.setupPeriodicCleanup();
      
      log.info('Enhanced cache manager initialized');
    } catch (error) {
      log.error('Failed to initialize cache manager', error as Error);
    }
  }

  private setupPeriodicCleanup() {
    // Clean up every 30 minutes
    setInterval(() => {
      this.cleanupExpiredEntries().catch(error => {
        log.warn('Periodic cache cleanup failed', error as Error);
      });
    }, 30 * 60 * 1000);
  }

  private getCacheKey(key: string): string {
    return `${this.cachePrefix}${key}`;
  }

  private async compressData(data: any): Promise<string> {
    // Simple compression using JSON.stringify with space removal
    // In a real app, you might use a proper compression library
    const jsonString = JSON.stringify(data);
    return jsonString.replace(/\\s+/g, ' ').trim();
  }

  private async decompressData(compressedData: string): Promise<any> {
    try {
      return JSON.parse(compressedData);
    } catch (error) {
      log.warn('Failed to decompress cache data', error as Error);
      return null;
    }
  }

  async set<T>(
    key: string, 
    data: T, 
    options: CacheOptions = {}
  ): Promise<boolean> {
    try {
      const {
        ttl = Config.CACHE.DEFAULT_TTL,
        version = '1.0',
        priority = 'medium',
        compress = false,
        syncWithNetwork = false
      } = options;

      const now = Date.now();
      const cacheEntry: CacheEntry<T> = {
        data,
        timestamp: now,
        expiresAt: now + ttl,
        version,
        metadata: {
          source: 'network',
          lastUpdated: now,
          accessCount: 0
        }
      };

      let dataToStore = cacheEntry;
      
      // Compress if requested and data is large
      if (compress) {
        const jsonSize = JSON.stringify(cacheEntry).length;
        if (jsonSize > 1024) { // Compress if larger than 1KB
          const compressedData = await this.compressData(cacheEntry.data);
          dataToStore = {
            ...cacheEntry,
            data: compressedData as T,
            metadata: {
              ...cacheEntry.metadata!,
              compressed: true
            }
          };
        }
      }

      await SafeAsyncStorage.setItem(
        this.getCacheKey(key),
        dataToStore,
        { strategy: 'retry' }
      );

      // Update metadata
      await this.updateCacheMetadata(key, {
        priority,
        size: JSON.stringify(dataToStore).length,
        lastAccess: now,
        syncWithNetwork
      });

      this.stats.sets++;
      log.debug(`Cache set: ${key}`, { ttl, version, priority });
      
      return true;
    } catch (error) {
      log.error(`Failed to set cache for ${key}`, error as Error);
      return false;
    }
  }

  async get<T>(key: string, defaultValue?: T): Promise<T | null> {
    try {
      const cacheEntry = await SafeAsyncStorage.getItem<CacheEntry<T>>(
        this.getCacheKey(key),
        null,
        { strategy: 'fallback', fallbackValue: null }
      );

      if (!cacheEntry) {
        this.stats.misses++;
        log.debug(`Cache miss: ${key}`);
        return defaultValue || null;
      }

      // Check if expired
      if (cacheEntry.expiresAt < Date.now()) {
        log.debug(`Cache expired: ${key}`);
        await this.delete(key);
        this.stats.misses++;
        return defaultValue || null;
      }

      // Update access metadata
      const updatedEntry = {
        ...cacheEntry,
        metadata: {
          ...cacheEntry.metadata!,
          accessCount: (cacheEntry.metadata?.accessCount || 0) + 1
        }
      };

      // Update the entry with new access count (fire and forget)
      SafeAsyncStorage.setItem(this.getCacheKey(key), updatedEntry)
        .catch(error => log.warn('Failed to update cache access count', error as Error));

      // Update metadata
      await this.updateCacheMetadata(key, {
        lastAccess: Date.now()
      });

      let data = cacheEntry.data;
      
      // Decompress if needed
      if (cacheEntry.metadata && 'compressed' in cacheEntry.metadata) {
        data = await this.decompressData(cacheEntry.data as string) as T;
      }

      this.stats.hits++;
      log.debug(`Cache hit: ${key}`, { 
        age: Date.now() - cacheEntry.timestamp,
        accessCount: updatedEntry.metadata.accessCount
      });
      
      return data;
    } catch (error) {
      log.error(`Failed to get cache for ${key}`, error as Error);
      this.stats.misses++;
      return defaultValue || null;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      await SafeAsyncStorage.removeItem(this.getCacheKey(key));
      await this.removeCacheMetadata(key);
      
      this.stats.deletes++;
      log.debug(`Cache deleted: ${key}`);
      
      return true;
    } catch (error) {
      log.error(`Failed to delete cache for ${key}`, error as Error);
      return false;
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      const cacheEntry = await SafeAsyncStorage.getItem<CacheEntry<any>>(
        this.getCacheKey(key),
        null,
        { strategy: 'fallback', fallbackValue: null }
      );

      if (!cacheEntry) return false;
      
      // Check if expired
      if (cacheEntry.expiresAt < Date.now()) {
        await this.delete(key);
        return false;
      }

      return true;
    } catch (error) {
      log.error(`Failed to check cache existence for ${key}`, error as Error);
      return false;
    }
  }

  async clear(): Promise<boolean> {
    try {
      log.info('Clearing all cache entries');
      
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.cachePrefix));
      
      await AsyncStorage.multiRemove(cacheKeys);
      await SafeAsyncStorage.removeItem(this.metadataKey);
      
      // Reset stats
      this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0 };
      
      log.info(`Cleared ${cacheKeys.length} cache entries`);
      return true;
    } catch (error) {
      log.error('Failed to clear cache', error as Error);
      return false;
    }
  }

  async getStats(): Promise<CacheStats> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.cachePrefix));
      
      let totalSize = 0;
      let oldestEntry = Date.now();
      let newestEntry = 0;
      
      for (const key of cacheKeys) {
        try {
          const entry = await AsyncStorage.getItem(key);
          if (entry) {
            totalSize += entry.length;
            
            const cacheEntry = JSON.parse(entry);
            if (cacheEntry.timestamp) {
              oldestEntry = Math.min(oldestEntry, cacheEntry.timestamp);
              newestEntry = Math.max(newestEntry, cacheEntry.timestamp);
            }
          }
        } catch (error) {
          // Skip invalid entries
        }
      }
      
      const totalRequests = this.stats.hits + this.stats.misses;
      const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;
      
      return {
        totalEntries: cacheKeys.length,
        totalSize,
        hitRate,
        oldestEntry: oldestEntry === Date.now() ? 0 : oldestEntry,
        newestEntry
      };
    } catch (error) {
      log.error('Failed to get cache stats', error as Error);
      return {
        totalEntries: 0,
        totalSize: 0,
        hitRate: 0,
        oldestEntry: 0,
        newestEntry: 0
      };
    }
  }

  private async cleanupExpiredEntries(): Promise<void> {
    try {
      log.debug('Starting cache cleanup');
      
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.cachePrefix));
      
      let cleanedCount = 0;
      
      for (const key of cacheKeys) {
        try {
          const entry = await AsyncStorage.getItem(key);
          if (entry) {
            const cacheEntry = JSON.parse(entry);
            if (cacheEntry.expiresAt && cacheEntry.expiresAt < Date.now()) {
              await AsyncStorage.removeItem(key);
              cleanedCount++;
            }
          }
        } catch (error) {
          // Remove invalid entries
          await AsyncStorage.removeItem(key);
          cleanedCount++;
        }
      }
      
      if (cleanedCount > 0) {
        log.info(`Cleaned up ${cleanedCount} expired cache entries`);
      }
    } catch (error) {
      log.error('Cache cleanup failed', error as Error);
    }
  }

  private async updateCacheMetadata(key: string, metadata: any): Promise<void> {
    try {
      const existingMetadata = await SafeAsyncStorage.getItem<Record<string, any>>(
        this.metadataKey,
        {},
        { strategy: 'fallback', fallbackValue: {} }
      );
      
      const updatedMetadata = {
        ...existingMetadata,
        [key]: {
          ...existingMetadata?.[key],
          ...metadata
        }
      };
      
      await SafeAsyncStorage.setItem(this.metadataKey, updatedMetadata);
    } catch (error) {
      log.warn('Failed to update cache metadata', error as Error);
    }
  }

  private async removeCacheMetadata(key: string): Promise<void> {
    try {
      const existingMetadata = await SafeAsyncStorage.getItem<Record<string, any>>(
        this.metadataKey,
        {},
        { strategy: 'fallback', fallbackValue: {} }
      );
      
      if (existingMetadata && existingMetadata[key]) {
        delete existingMetadata[key];
        await SafeAsyncStorage.setItem(this.metadataKey, existingMetadata);
      }
    } catch (error) {
      log.warn('Failed to remove cache metadata', error as Error);
    }
  }

  // Advanced cache operations
  async invalidateByPattern(pattern: RegExp): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => 
        key.startsWith(this.cachePrefix) && 
        pattern.test(key.replace(this.cachePrefix, ''))
      );
      
      await AsyncStorage.multiRemove(cacheKeys);
      
      log.info(`Invalidated ${cacheKeys.length} cache entries matching pattern`);
      return cacheKeys.length;
    } catch (error) {
      log.error('Failed to invalidate cache by pattern', error as Error);
      return 0;
    }
  }

  async invalidateByVersion(version: string): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.cachePrefix));
      
      let invalidatedCount = 0;
      
      for (const key of cacheKeys) {
        try {
          const entry = await AsyncStorage.getItem(key);
          if (entry) {
            const cacheEntry = JSON.parse(entry);
            if (cacheEntry.version !== version) {
              await AsyncStorage.removeItem(key);
              invalidatedCount++;
            }
          }
        } catch (error) {
          // Remove invalid entries
          await AsyncStorage.removeItem(key);
          invalidatedCount++;
        }
      }
      
      log.info(`Invalidated ${invalidatedCount} cache entries with old version`);
      return invalidatedCount;
    } catch (error) {
      log.error('Failed to invalidate cache by version', error as Error);
      return 0;
    }
  }

  // Network-aware caching
  async getOrFetch<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T | null> {
    // Try cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    
    // Fetch from network
    try {
      log.debug(`Fetching data for cache key: ${key}`);
      const data = await fetchFunction();
      
      // Cache the result
      await this.set(key, data, options);
      
      return data;
    } catch (error) {
      log.error(`Failed to fetch data for ${key}`, error as Error);
      return null;
    }
  }

  // Preload cache entries
  async preload(entries: Array<{ key: string; fetchFunction: () => Promise<any>; options?: CacheOptions }>): Promise<void> {
    log.info(`Preloading ${entries.length} cache entries`);
    
    const promises = entries.map(async ({ key, fetchFunction, options }) => {
      try {
        // Only preload if not already cached
        const exists = await this.has(key);
        if (!exists) {
          const data = await fetchFunction();
          await this.set(key, data, options);
        }
      } catch (error) {
        log.warn(`Failed to preload cache entry: ${key}`, error as Error);
      }
    });
    
    await Promise.allSettled(promises);
    log.info('Cache preloading completed');
  }
}

// Export singleton instance
export const cacheManager = EnhancedCacheManager.getInstance();

// Utility functions for common cache patterns
export function createCacheKey(...parts: (string | number)[]): string {
  return parts.join(':');
}

export function getCacheTTL(type: 'short' | 'medium' | 'long' | 'persistent'): number {
  switch (type) {
    case 'short': return 2 * 60 * 1000; // 2 minutes
    case 'medium': return 30 * 60 * 1000; // 30 minutes
    case 'long': return 24 * 60 * 60 * 1000; // 24 hours
    case 'persistent': return 7 * 24 * 60 * 60 * 1000; // 7 days
    default: return Config.CACHE.DEFAULT_TTL;
  }
}

export default cacheManager;
