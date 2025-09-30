/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Check if a location is within a certain radius of a target location
 * @param currentLat Current latitude
 * @param currentLon Current longitude
 * @param targetLat Target latitude
 * @param targetLon Target longitude
 * @param radiusMeters Allowed radius in meters (default: 100m)
 * @returns Object with verification status and distance
 */
export function verifyLocationProximity(
  currentLat: number,
  currentLon: number,
  targetLat: number,
  targetLon: number,
  radiusMeters: number = 100
): { isWithinRadius: boolean; distance: number } {
  const distance = calculateDistance(currentLat, currentLon, targetLat, targetLon);
  
  return {
    isWithinRadius: distance <= radiusMeters,
    distance: Math.round(distance)
  };
}

/**
 * Format distance for display
 * @param meters Distance in meters
 * @returns Formatted string
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters}m`;
  } else {
    return `${(meters / 1000).toFixed(1)}km`;
  }
}

/**
 * Get location accuracy description
 * @param distance Distance from target in meters
 * @returns User-friendly accuracy description
 */
export function getLocationAccuracyDescription(distance: number): string {
  if (distance <= 50) {
    return "Very close";
  } else if (distance <= 100) {
    return "Close";
  } else if (distance <= 200) {
    return "Nearby";
  } else if (distance <= 500) {
    return "In the area";
  } else {
    return "Far away";
  }
}
