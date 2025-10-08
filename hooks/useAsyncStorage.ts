import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UseAsyncStorageReturn<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  setData: (value: T) => Promise<void>;
  removeData: () => Promise<void>;
  refresh: () => Promise<void>;
};

export function useAsyncStorage<T>(key: string, defaultValue?: T): UseAsyncStorageReturn<T> {
  const [data, setDataState] = useState<T | null>(defaultValue || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        setDataState(parsed);
      } else if (defaultValue) {
        setDataState(defaultValue);
      }
    } catch (err) {
      console.error(`Error loading ${key}:`, err);
      setError(`Failed to load ${key}`);
      if (defaultValue) {
        setDataState(defaultValue);
      }
    } finally {
      setLoading(false);
    }
  }, [key, defaultValue]);

  const setData = useCallback(
    async (value: T) => {
      try {
        setError(null);
        await AsyncStorage.setItem(key, JSON.stringify(value));
        setDataState(value);
      } catch (err) {
        console.error(`Error saving ${key}:`, err);
        setError(`Failed to save ${key}`);
        throw err;
      }
    },
    [key],
  );

  const removeData = useCallback(async () => {
    try {
      setError(null);
      await AsyncStorage.removeItem(key);
      setDataState(null);
    } catch (err) {
      console.error(`Error removing ${key}:`, err);
      setError(`Failed to remove ${key}`);
      throw err;
    }
  }, [key]);

  const refresh = useCallback(() => loadData(), [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, loading, error, setData, removeData, refresh };
}
