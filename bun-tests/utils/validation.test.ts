// Pure logic tests that don't need React Native mocks
import { test, expect, describe } from "bun:test";

// Test your utility functions with Bun for speed
describe("Validation Utils (Pure Logic)", () => {
  test("validatePIN should accept valid 4-digit PIN", () => {
    // Simulate the validation logic without RN dependencies
    const isValidPIN = (pin: string) => {
      return /^\d{4}$/.test(pin);
    };
    
    expect(isValidPIN("1234")).toBe(true);
    expect(isValidPIN("0000")).toBe(true);
    expect(isValidPIN("123")).toBe(false);
    expect(isValidPIN("12345")).toBe(false);
    expect(isValidPIN("abcd")).toBe(false);
  });

  test("sanitizeInput should clean user input", () => {
    const sanitizeInput = (input: string) => {
      return input.trim().replace(/[<>]/g, '');
    };
    
    expect(sanitizeInput("  hello  ")).toBe("hello");
    expect(sanitizeInput("<script>alert('xss')</script>")).toBe("scriptalert('xss')/script");
    expect(sanitizeInput("normal text")).toBe("normal text");
  });

  test("distance calculation", () => {
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      // Simplified distance calculation
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    const distance = calculateDistance(40.7128, -74.0060, 34.0522, -118.2437); // NYC to LA
    expect(distance).toBeGreaterThan(3900); // Should be ~3944 km
    expect(distance).toBeLessThan(4000);
  });
});

describe("Array and Object Processing (Performance Critical)", () => {
  test("large dataset filtering", () => {
    const start = performance.now();
    
    const locations = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      lat: Math.random() * 180 - 90,
      lon: Math.random() * 360 - 180,
      isSafe: Math.random() > 0.3,
      category: ['playground', 'school', 'library', 'park'][i % 4]
    }));
    
    const safePlaygrounds = locations.filter(loc => 
      loc.isSafe && loc.category === 'playground'
    );
    
    const end = performance.now();
    
    expect(safePlaygrounds.length).toBeGreaterThan(0);
    console.log(`Bun: Filtered ${locations.length} locations in ${end - start}ms`);
    expect(end - start).toBeLessThan(50); // Should be very fast
  });
});