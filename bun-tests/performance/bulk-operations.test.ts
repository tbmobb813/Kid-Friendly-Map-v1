import { test, expect, describe } from "bun:test";

describe("Performance Critical Operations", () => {
  describe("Large Dataset Processing", () => {
    test("should filter large location datasets efficiently", () => {
      const start = performance.now();
      
      // Generate 50k test locations
      const locations = Array.from({ length: 50000 }, (_, i) => ({
        id: i,
        latitude: (Math.random() - 0.5) * 180,
        longitude: (Math.random() - 0.5) * 360,
        isSafe: Math.random() > 0.3,
        category: ['playground', 'school', 'library', 'park', 'restaurant'][i % 5],
        rating: Math.random() * 5,
        distance: Math.random() * 10000
      }));

      // Filter for safe playgrounds within 5km with good ratings
      const safeNearbyPlaygrounds = locations.filter(loc => 
        loc.isSafe && 
        loc.category === 'playground' && 
        loc.distance < 5000 && 
        loc.rating > 3.5
      );

      const end = performance.now();
      const processingTime = end - start;

      expect(safeNearbyPlaygrounds.length).toBeGreaterThan(0);
      expect(processingTime).toBeLessThan(100); // Should be very fast
      
      console.log(`Bun: Filtered ${locations.length} locations in ${processingTime.toFixed(2)}ms`);
      console.log(`Found ${safeNearbyPlaygrounds.length} safe nearby playgrounds`);
    });

    test("should sort and group locations efficiently", () => {
      const start = performance.now();

      const locations = Array.from({ length: 20000 }, (_, i) => ({
        id: i,
        name: `Location ${i}`,
        category: ['playground', 'school', 'library', 'park'][i % 4],
        rating: Math.random() * 5,
        distance: Math.random() * 10000,
        city: `City${Math.floor(i / 1000)}`
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
      expect(processingTime).toBeLessThan(200);

      console.log(`Bun: Sorted and grouped ${locations.length} items in ${processingTime.toFixed(2)}ms`);
    });
  });

  describe("JSON and Data Transformation", () => {
    test("should handle large JSON operations", () => {
      const start = performance.now();

      // Create complex nested data
      const data = {
        metadata: { version: "1.0", timestamp: Date.now() },
        locations: Array.from({ length: 5000 }, (_, i) => ({
          id: i,
          coordinates: { lat: Math.random() * 180 - 90, lng: Math.random() * 360 - 180 },
          details: {
            name: `Location ${i}`,
            type: ['safe', 'entertainment', 'educational'][i % 3],
            amenities: ['parking', 'restroom', 'playground', 'cafe'].filter(() => Math.random() > 0.5)
          }
        }))
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
        averageAmenities: parsed.locations.reduce((sum, loc) => 
          sum + loc.details.amenities.length, 0
        ) / parsed.locations.length
      };

      const end = performance.now();
      const processingTime = end - start;

      expect(parsed.locations.length).toBe(5000);
      expect(summary.totalLocations).toBe(5000);
      expect(Object.keys(summary.byType).length).toBeGreaterThan(0);
      expect(processingTime).toBeLessThan(150);

      console.log(`Bun: JSON ops on ${data.locations.length} records in ${processingTime.toFixed(2)}ms`);
    });
  });

  describe("Mathematical Computations", () => {
    test("should perform bulk distance calculations", () => {
      const start = performance.now();

      const centerPoint = { lat: 40.7128, lng: -74.0060 }; // NYC
      const points = Array.from({ length: 10000 }, () => ({
        lat: Math.random() * 180 - 90,
        lng: Math.random() * 360 - 180
      }));

      // Calculate distances using Haversine formula
      const distances = points.map(point => {
        const R = 6371; // Earth radius in km
        const dLat = (point.lat - centerPoint.lat) * Math.PI / 180;
        const dLng = (point.lng - centerPoint.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(centerPoint.lat * Math.PI / 180) * Math.cos(point.lat * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      });

      const nearbyPoints = distances.filter(d => d < 1000).length; // Within 1000km
      const averageDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;

      const end = performance.now();
      const processingTime = end - start;

      expect(distances.length).toBe(10000);
      expect(averageDistance).toBeGreaterThan(0);
      expect(processingTime).toBeLessThan(50);

      console.log(`Bun: Calculated ${distances.length} distances in ${processingTime.toFixed(2)}ms`);
      console.log(`Average distance: ${averageDistance.toFixed(2)}km, Nearby: ${nearbyPoints}`);
    });
  });

  describe("String Processing", () => {
    test("should handle bulk text processing", () => {
      const start = performance.now();

      // Generate test data
      const texts = Array.from({ length: 5000 }, (_, i) => 
        `<p>Location ${i} has <b>great</b> amenities! Visit ${i}@example.com or call (555) ${String(i).padStart(4, '0')}</p>`
      );

      // Process text: sanitize HTML, extract emails and phones
      const processed = texts.map(text => {
        const sanitized = text.replace(/<[^>]*>/g, ''); // Remove HTML
        const emails = text.match(/\S+@\S+\.\S+/g) || [];
        const phones = text.match(/\(\d{3}\)\s\d{4}/g) || [];
        
        return {
          text: sanitized.trim(),
          hasEmail: emails.length > 0,
          hasPhone: phones.length > 0,
          wordCount: sanitized.split(/\s+/).length
        };
      });

      const totalWords = processed.reduce((sum, p) => sum + p.wordCount, 0);
      const withContacts = processed.filter(p => p.hasEmail || p.hasPhone).length;

      const end = performance.now();
      const processingTime = end - start;

      expect(processed.length).toBe(5000);
      expect(totalWords).toBeGreaterThan(0);
      expect(processingTime).toBeLessThan(100);

      console.log(`Bun: Processed ${texts.length} texts (${totalWords} words) in ${processingTime.toFixed(2)}ms`);
      console.log(`Found ${withContacts} entries with contact info`);
    });
  });
});