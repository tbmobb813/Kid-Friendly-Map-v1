import { UIManager, Platform } from 'react-native';

export type ViewManagerCheckResult = {
  name: string;
  available: boolean;
  details?: any;
};

/**
 * Check whether the native view managers with the given names are available.
 * Returns an array of results with `available` boolean for each name.
 */
export function checkViewManagers(names: string[]): ViewManagerCheckResult[] {
  return names.map((name) => {
    try {
      // UIManager.getViewManagerConfig may throw on some RN versions/environments
      const config = (UIManager as any)?.getViewManagerConfig?.(name);
      return { name, available: Boolean(config), details: config ?? null };
    } catch (e) {
      return { name, available: false, details: { error: String(e) } };
    }
  });
}

/**
 * Convenience function to check common map view managers for MapLibre/Mapbox.
 */
export function checkMapViewManagers(): ViewManagerCheckResult[] {
  const managerNames = ['MapLibreGLMapView', 'RCTMGLMapView', 'AIRMap'];
  if (Platform.OS === 'web') {
    return managerNames.map((n) => ({ name: n, available: false, details: 'web' }));
  }
  return checkViewManagers(managerNames);
}

export default { checkViewManagers, checkMapViewManagers };
