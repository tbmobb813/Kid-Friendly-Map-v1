// Converted from Bun-style test runner to Jest for compatibility
// Original: import { test, expect, describe } from 'bun:test';

describe('Performance Critical Operations', () => {
  describe('Large Dataset Processing', () => {
    test('should filter large location datasets efficiently', () => {
      const start = performance.now();

      // Generate 50k test locations
      const locations = Array.from({ length: 50000 }, (_, i) => ({
        id: i,
        latitude: (Math.random() - 0.5) * 180,
        longitude: (Math.random() - 0.5) * 360,
        isSafe: Math.random() > 0.3,
        category: ['playground', 'school', 'library', 'park', 'restaurant'][i % 5],
        rating: Math.random() * 5,
        distance: Math.random() * 10000,
      }));

      // Filter for safe playgrounds within 5km with good ratings
      const safeNearbyPlaygrounds = locations.filter(
        (loc) =>
          loc.isSafe && loc.category === 'playground' && loc.distance < 5000 && loc.rating > 3.5,
      );

      const end = performance.now();
      const processingTime = end - start;

      // Allow scaling of performance thresholds via PERF_TIME_MULTIPLIER env var.
      const PERF_TIME_MULTIPLIER = Number(process.env.PERF_TIME_MULTIPLIER || '1');
      // Relaxed base thresholds to be tolerant on typical CI/dev hardware
      const maxFilterTime = 300 * PERF_TIME_MULTIPLIER;

      expect(safeNearbyPlaygrounds.length).toBeGreaterThan(0);
      expect(processingTime).toBeLessThan(maxFilterTime); // Should be very fast

      console.log(`Bun: Filtered ${locations.length} locations in ${processingTime.toFixed(2)}ms`);
      console.log(`Found ${safeNearbyPlaygrounds.length} safe nearby playgrounds`);
    });

    test('should sort and group locations efficiently', () => {
      const start = performance.now();

      const locations = Array.from({ length: 20000 }, (_, i) => ({
        id: i,
        name: `Location ${i}`,
        category: ['playground', 'school', 'library', 'park'][i % 4],
        rating: Math.random() * 5,
        distance: Math.random() * 10000,
        city: `City${Math.floor(i / 1000)}`,
      }));

      // Sort by rating (desc) then distance (asc)
      const sorted = locations.sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return a.distance - b.distance;
      });

      // Group by category
      const grouped = sorted.reduce((acc, location) => {
        if (!acc[location.category]) acc[location.category] = [];
        acc[location.category].push(location);
        return acc;
      }, {});

      const end = performance.now();
      const processingTime = end - start;

      expect(sorted.length).toBe(20000);
      expect(Object.keys(grouped).length).toBe(4);
      const PERF_TIME_MULTIPLIER = Number(process.env.PERF_TIME_MULTIPLIER || '1');
      const maxSortTime = 250 * PERF_TIME_MULTIPLIER;
      expect(processingTime).toBeLessThan(maxSortTime);

      console.log(
        `Bun: Sorted and grouped ${locations.length} items in ${processingTime.toFixed(2)}ms`,
      );
    });
  });

  describe('JSON and Data Transformation', () => {
    test('should handle large JSON operations', () => {
      const start = performance.now();

      // Create complex nested data
      const data = {
        metadata: { version: '1.0', timestamp: Date.now() },
        locations: Array.from({ length: 5000 }, (_, i) => ({
          id: i,
          coordinates: { lat: Math.random() * 180 - 90, lng: Math.random() * 360 - 180 },
          details: {
            name: `Location ${i}`,
            type: ['safe', 'entertainment', 'educational'][i % 3],
            amenities: ['parking', 'restroom', 'playground', 'cafe'].filter(
              () => Math.random() > 0.5,
            ),
          },
        })),
      };

      // Serialize and parse
      const jsonString = JSON.stringify(data);
      const parsed = JSON.parse(jsonString);

      // Transform data
      const summary = {
        totalLocations: parsed.locations.length,
        byType: parsed.locations.reduce((acc, loc) => {
          acc[loc.details.type] = (acc[loc.details.type] || 0) + 1;
          return acc;
        }, {}),
        averageAmenities:
          parsed.locations.reduce((sum, loc) => sum + loc.details.amenities.length, 0) /
          parsed.locations.length,
      };

      const end = performance.now();
      const processingTime = end - start;

      expect(parsed.locations.length).toBe(5000);
      expect(summary.totalLocations).toBe(5000);
      expect(Object.keys(summary.byType).length).toBeGreaterThan(0);
      const PERF_TIME_MULTIPLIER = Number(process.env.PERF_TIME_MULTIPLIER || '1');
      const maxJsonTime = 200 * PERF_TIME_MULTIPLIER;
      expect(processingTime).toBeLessThan(maxJsonTime);

      console.log(
        `Bun: JSON ops on ${data.locations.length} records in ${processingTime.toFixed(2)}ms`,
      );
    });
  });

  describe('Mathematical Computations', () => {
    test('should perform bulk distance calculations', () => {
      const start = performance.now();

      // Optimized distance calculation: tight loop + Float64Array to reduce allocations
      const centerLat = 40.7128;
      const centerLng = -74.006;
      const numPoints = 10000;
      const degToRad = Math.PI / 180;
      const centerLatRad = centerLat * degToRad;
      const cosCenterLat = Math.cos(centerLatRad);
      const R = 6371; // Earth radius in km

      const distances = new Float64Array(numPoints);
      let sum = 0;
      let nearbyCount = 0;

      for (let i = 0; i < numPoints; i++) {
        const lat = Math.random() * 180 - 90;
        const lng = Math.random() * 360 - 180;

        const dLat = (lat - centerLat) * degToRad;
        const dLng = (lng - centerLng) * degToRad;

        const sinDLat = Math.sin(dLat * 0.5);
        const sinDLng = Math.sin(dLng * 0.5);

        const a = sinDLat * sinDLat + cosCenterLat * Math.cos(lat * degToRad) * sinDLng * sinDLng;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const dist = R * c;

        distances[i] = dist;
        sum += dist;
        if (dist < 1000) nearbyCount++;
      }

      const nearbyPoints = nearbyCount; // Within 1000km
      const averageDistance = sum / distances.length;

      const end = performance.now();
      const processingTime = end - start;

      expect(distances.length).toBe(10000);
      expect(averageDistance).toBeGreaterThan(0);
      const PERF_TIME_MULTIPLIER = Number(process.env.PERF_TIME_MULTIPLIER || '1');
      const maxDistanceTime = 150 * PERF_TIME_MULTIPLIER; // ms (relaxed)
      expect(processingTime).toBeLessThan(maxDistanceTime);

      console.log(
        `Bun: Calculated ${distances.length} distances in ${processingTime.toFixed(2)}ms`,
      );
      console.log(`Average distance: ${averageDistance.toFixed(2)}km, Nearby: ${nearbyPoints}`);
    });
  });

  describe('String Processing', () => {
    test('should handle bulk text processing', () => {
      const start = performance.now();

      // Generate test data
      const texts = Array.from(
        { length: 5000 },
        (_, i) =>
          `<p>Location ${i} has <b>great</b> amenities! Visit ${i}@example.com or call (555) ${String(
            i,
          ).padStart(4, '0')}</p>`,
      );

      // Process text: sanitize HTML, extract emails and phones
      const processed = texts.map((text) => {
        const sanitized = text.replace(/<[^>]*>/g, ''); // Remove HTML
        const emails = text.match(/\S+@\S+\.\S+/g) || [];
        const phones = text.match(/\(\d{3}\)\s\d{4}/g) || [];

        return {
          text: sanitized.trim(),
          hasEmail: emails.length > 0,
          hasPhone: phones.length > 0,
          wordCount: sanitized.split(/\s+/).length,
        };
      });

      const totalWords = processed.reduce((sum, p) => sum + p.wordCount, 0);
      const withContacts = processed.filter((p) => p.hasEmail || p.hasPhone).length;

      const end = performance.now();
      const processingTime = end - start;

      expect(processed.length).toBe(5000);
      expect(totalWords).toBeGreaterThan(0);
      const PERF_TIME_MULTIPLIER = Number(process.env.PERF_TIME_MULTIPLIER || '1');
      const maxTextTime = 200 * PERF_TIME_MULTIPLIER;
      expect(processingTime).toBeLessThan(maxTextTime);

      console.log(
        `Bun: Processed ${texts.length} texts (${totalWords} words) in ${processingTime.toFixed(
          2,
        )}ms`,
      );
      console.log(`Found ${withContacts} entries with contact info`);
    });
  });
});

// Deterministic performance tests migrated from bun-tests/performance
// Use a seeded PRNG so timings are more stable across environments
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEED = Number(process.env.TEST_SEED || 123456);
const rng = mulberry32(SEED);

describe('Performance Critical Operations', () => {
  describe('Large Dataset Processing', () => {
    test('should filter large location datasets efficiently', () => {
      const start = performance.now();

      // Generate 50k test locations deterministically
      const locations = Array.from({ length: 50000 }, (_, i) => ({
        id: i,
        latitude: (rng() - 0.5) * 180,
        longitude: (rng() - 0.5) * 360,
        isSafe: rng() > 0.3,
        category: ['playground', 'school', 'library', 'park', 'restaurant'][i % 5],
        rating: rng() * 5,
        distance: rng() * 10000,
      }));

      const safeNearbyPlaygrounds = locations.filter(
        (loc) =>
          loc.isSafe && loc.category === 'playground' && loc.distance < 5000 && loc.rating > 3.5,
      );

      const end = performance.now();
      const processingTime = end - start;

      const PERF_TIME_MULTIPLIER = Number(process.env.PERF_TIME_MULTIPLIER || '1');
      const maxFilterTime = 300 * PERF_TIME_MULTIPLIER;

      expect(safeNearbyPlaygrounds.length).toBeGreaterThan(0);
      expect(processingTime).toBeLessThan(maxFilterTime);
    });

    test('should sort and group locations efficiently', () => {
      const start = performance.now();

      const locations = Array.from({ length: 20000 }, (_, i) => ({
        id: i,
        name: `Location ${i}`,
        category: ['playground', 'school', 'library', 'park'][i % 4],
        rating: rng() * 5,
        distance: rng() * 10000,
        city: `City${Math.floor(i / 1000)}`,
      }));

      const sorted = locations.sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return a.distance - b.distance;
      });

      const grouped = sorted.reduce((acc: Record<string, any[]>, location) => {
        if (!acc[location.category]) acc[location.category] = [];
        acc[location.category].push(location);
        return acc;
      }, {} as Record<string, any[]>);

      const end = performance.now();
      const processingTime = end - start;

      expect(sorted.length).toBe(20000);
      expect(Object.keys(grouped).length).toBe(4);
      const PERF_TIME_MULTIPLIER = Number(process.env.PERF_TIME_MULTIPLIER || '1');
      const maxSortTime = 250 * PERF_TIME_MULTIPLIER;
      expect(processingTime).toBeLessThan(maxSortTime);
    });
  });

  describe('JSON and Data Transformation', () => {
    test('should handle large JSON operations', () => {
      const start = performance.now();

      const data = {
        metadata: { version: '1.0', timestamp: Date.now() },
        locations: Array.from({ length: 5000 }, (_, i) => ({
          id: i,
          coordinates: { lat: rng() * 180 - 90, lng: rng() * 360 - 180 },
          details: {
            name: `Location ${i}`,
            type: ['safe', 'entertainment', 'educational'][i % 3],
            amenities: ['parking', 'restroom', 'playground', 'cafe'].filter(() => rng() > 0.5),
          },
        })),
      };

      const jsonString = JSON.stringify(data);
      const parsed = JSON.parse(jsonString);

      const summary = {
        totalLocations: parsed.locations.length,
        byType: parsed.locations.reduce((acc: Record<string, number>, loc: any) => {
          acc[loc.details.type] = (acc[loc.details.type] || 0) + 1;
          return acc;
        }, {}),
        averageAmenities:
          parsed.locations.reduce(
            (sum: number, loc: any) => sum + loc.details.amenities.length,
            0,
          ) / parsed.locations.length,
      };

      const end = performance.now();
      const processingTime = end - start;

      expect(parsed.locations.length).toBe(5000);
      expect(summary.totalLocations).toBe(5000);
      expect(Object.keys(summary.byType).length).toBeGreaterThan(0);
      const PERF_TIME_MULTIPLIER = Number(process.env.PERF_TIME_MULTIPLIER || '1');
      const maxJsonTime = 200 * PERF_TIME_MULTIPLIER;
      expect(processingTime).toBeLessThan(maxJsonTime);
    });
  });

  describe('Mathematical Computations', () => {
    test('should perform bulk distance calculations', () => {
      const start = performance.now();

      const centerLat = 40.7128;
      const centerLng = -74.006;
      const numPoints = 10000;
      const degToRad = Math.PI / 180;
      const centerLatRad = centerLat * degToRad;
      const cosCenterLat = Math.cos(centerLatRad);
      const R = 6371; // Earth radius in km

      const distances = new Float64Array(numPoints);
      let sum = 0;
      let nearbyCount = 0;

      for (let i = 0; i < numPoints; i++) {
        const lat = rng() * 180 - 90;
        const lng = rng() * 360 - 180;

        const dLat = (lat - centerLat) * degToRad;
        const dLng = (lng - centerLng) * degToRad;

        const sinDLat = Math.sin(dLat * 0.5);
        const sinDLng = Math.sin(dLng * 0.5);

        const a = sinDLat * sinDLat + cosCenterLat * Math.cos(lat * degToRad) * sinDLng * sinDLng;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const dist = R * c;

        distances[i] = dist;
        sum += dist;
        if (dist < 1000) nearbyCount++;
      }

      const nearbyPoints = nearbyCount; // Within 1000km
      const averageDistance = sum / distances.length;

      const end = performance.now();
      const processingTime = end - start;

      expect(distances.length).toBe(10000);
      expect(averageDistance).toBeGreaterThan(0);
      const PERF_TIME_MULTIPLIER = Number(process.env.PERF_TIME_MULTIPLIER || '1');
      const maxDistanceTime = 100 * PERF_TIME_MULTIPLIER;
      expect(processingTime).toBeLessThan(maxDistanceTime);
    });
  });

  describe('String Processing', () => {
    test('should handle bulk text processing', () => {
      const start = performance.now();

      const texts = Array.from(
        { length: 5000 },
        (_, i) =>
          `<p>Location ${i} has <b>great</b> amenities! Visit ${i}@example.com or call (555) ${String(
            i,
          ).padStart(4, '0')}</p>`,
      );

      const processed = texts.map((text) => {
        const sanitized = text.replace(/<[^>]*>/g, '');
        const emails = text.match(/\S+@\S+\.\S+/g) || [];
        const phones = text.match(/\(\d{3}\)\s\d{4}/g) || [];

        return {
          text: sanitized.trim(),
          hasEmail: emails.length > 0,
          hasPhone: phones.length > 0,
          wordCount: sanitized.split(/\s+/).length,
        };
      });

      const totalWords = processed.reduce((sum, p) => sum + p.wordCount, 0);
      const withContacts = processed.filter((p) => p.hasEmail || p.hasPhone).length;

      const end = performance.now();
      const processingTime = end - start;

      expect(processed.length).toBe(5000);
      expect(totalWords).toBeGreaterThan(0);
      const PERF_TIME_MULTIPLIER = Number(process.env.PERF_TIME_MULTIPLIER || '1');
      const maxTextTime = 200 * PERF_TIME_MULTIPLIER;
      expect(processingTime).toBeLessThan(maxTextTime);
    });
  });
});
