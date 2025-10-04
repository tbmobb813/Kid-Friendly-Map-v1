/// <reference types="jest" />

import { validateLocation, validateSafeZone, validateEmergencyContact, validatePhotoCheckIn, validatePIN, sanitizeInput, validateDistance } from '../utils/validation';
import { SafeAsyncStorage, withRetry, handleLocationError, handleCameraError } from '../utils/errorHandling';

// Mock AsyncStorage for testing
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock logger
jest.mock('../utils/logger', () => ({
  log: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }
}));

describe('Validation Utils', () => {
  describe('validateLocation', () => {
    it('should validate correct location data', () => {
      const validLocation = {
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 10,
        timestamp: Date.now()
      };

      const result = validateLocation(validLocation);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid latitude', () => {
      const invalidLocation = {
        latitude: 91, // Invalid: > 90
        longitude: -74.0060
      };

      const result = validateLocation(invalidLocation as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Latitude must be between -90 and 90 degrees');
    });

    it('should reject invalid longitude', () => {
      const invalidLocation = {
        latitude: 40.7128,
        longitude: 181 // Invalid: > 180
      };

      const result = validateLocation(invalidLocation as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Longitude must be between -180 and 180 degrees');
    });

    it('should warn about low accuracy', () => {
      const lowAccuracyLocation = {
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 150 // Low accuracy
      };

      const result = validateLocation(lowAccuracyLocation as any);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Location accuracy is low (>100m), results may be unreliable');
    });

    it('should warn about old timestamp', () => {
      const oldLocation = {
        latitude: 40.7128,
        longitude: -74.0060,
        timestamp: Date.now() - 600000 // 10 minutes ago
      };

      const result = validateLocation(oldLocation as any);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Location data is more than 5 minutes old');
    });

    it('should reject null/undefined location', () => {
      const result = validateLocation(null as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Location data is required');
    });
  });

  describe('validateSafeZone', () => {
    it('should validate correct safe zone data', () => {
      const validSafeZone = {
        id: 'zone1',
        name: 'Home',
        center: { latitude: 40.7128, longitude: -74.0060 },
        radius: 100,
        isActive: true
      };

      const result = validateSafeZone(validSafeZone as any);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject safe zone without ID', () => {
      const invalidSafeZone = {
        name: 'Home',
        center: { latitude: 40.7128, longitude: -74.0060 },
        radius: 100,
        isActive: true
      };

      const result = validateSafeZone(invalidSafeZone as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Safe zone ID is required');
    });

    it('should reject negative radius', () => {
      const invalidSafeZone = {
        id: 'zone1',
        name: 'Home',
        center: { latitude: 40.7128, longitude: -74.0060 },
        radius: -50, // Invalid: negative
        isActive: true
      };

      const result = validateSafeZone(invalidSafeZone as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Safe zone radius must be a positive number');
    });

    it('should warn about very small radius', () => {
      const smallRadiusSafeZone = {
        id: 'zone1',
        name: 'Home',
        center: { latitude: 40.7128, longitude: -74.0060 },
        radius: 5, // Very small
        isActive: true
      };

      const result = validateSafeZone(smallRadiusSafeZone as any);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Safe zone radius is very small (<10m)');
    });
  });

  describe('validateEmergencyContact', () => {
    it('should validate correct emergency contact', () => {
      const validContact = {
        id: 'contact1',
        name: 'Mom',
        phone: '+1234567890',
        relationship: 'Parent',
        isPrimary: true
      };

      const result = validateEmergencyContact(validContact as any);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject contact without phone', () => {
      const invalidContact = {
        id: 'contact1',
        name: 'Mom',
        relationship: 'Parent',
        isPrimary: true
      };

      const result = validateEmergencyContact(invalidContact as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Contact phone number is required');
    });

    it('should reject invalid phone format', () => {
      const invalidContact = {
        id: 'contact1',
        name: 'Mom',
        phone: '123', // Too short
        relationship: 'Parent',
        isPrimary: true
      };

      const result = validateEmergencyContact(invalidContact as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Phone number format is invalid');
    });
  });

  describe('validatePhotoCheckIn', () => {
    it('should validate correct photo check-in', () => {
      const validCheckIn = {
        placeId: 'place1',
        placeName: 'School',
        photoUrl: 'https://example.com/photo.jpg',
        timestamp: Date.now(),
        location: { latitude: 40.7128, longitude: -74.0060 },
        notes: 'Arrived safely'
      };

      const result = validatePhotoCheckIn(validCheckIn as any);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject check-in without place ID', () => {
      const invalidCheckIn = {
        placeName: 'School',
        photoUrl: 'https://example.com/photo.jpg',
        timestamp: Date.now()
      };

      const result = validatePhotoCheckIn(invalidCheckIn as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Place ID is required');
    });

    it('should accept file:// URLs for mobile', () => {
      const mobileCheckIn = {
        placeId: 'place1',
        placeName: 'School',
        photoUrl: 'file:///path/to/photo.jpg',
        timestamp: Date.now()
      };

      const result = validatePhotoCheckIn(mobileCheckIn as any);
      expect(result.isValid).toBe(true);
    });

    it('should warn about old check-in', () => {
      const oldCheckIn = {
        placeId: 'place1',
        placeName: 'School',
        photoUrl: 'https://example.com/photo.jpg',
        timestamp: Date.now() - 86400000 - 1000 // More than 24 hours ago
      };

      const result = validatePhotoCheckIn(oldCheckIn as any);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Check-in timestamp is more than 24 hours old');
    });
  });

  describe('validatePIN', () => {
    it('should validate correct PIN', () => {
      const result = validatePIN('1357');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject short PIN', () => {
      const result = validatePIN('12');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('PIN must be at least 4 digits');
    });

    it('should reject non-numeric PIN', () => {
      const result = validatePIN('12ab');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('PIN must contain only numbers');
    });

    it('should warn about weak PIN', () => {
      const result = validatePIN('1111');
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('PIN is easily guessable, consider using a stronger combination');
    });

    it('should warn about sequential PIN', () => {
      const result = validatePIN('1234');
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('PIN is easily guessable, consider using a stronger combination');
    });
  });

  describe('sanitizeInput', () => {
    it('should sanitize HTML characters', () => {
      const input = '<script>alert("xss")</script>';
      const result = sanitizeInput(input as any);
      expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    it('should trim whitespace', () => {
      const input = '  hello world  ';
      const result = sanitizeInput(input as any);
      expect(result).toBe('hello world');
    });

    it('should limit length', () => {
      const input = 'a'.repeat(1500);
      const result = sanitizeInput(input as any, 100);
      expect(result).toHaveLength(100);
    });

    it('should handle non-string input', () => {
      const result = sanitizeInput(null as any);
      expect(result).toBe('');
    });
  });

  describe('validateDistance', () => {
    it('should validate reasonable distance', () => {
      const result = validateDistance(100 as any);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject negative distance', () => {
      const result = validateDistance(-50 as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('location distance cannot be negative');
    });

    it('should reject unrealistic distance', () => {
      const result = validateDistance(25000000 as any); // > 20,000 km
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('location distance is unrealistically large');
    });

    it('should warn about very large distance', () => {
      const result = validateDistance(1500000 as any); // 1500 km
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('location distance is very large (>1000km)');
    });

    it('should reject NaN distance', () => {
      const result = validateDistance(NaN as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('location distance must be a valid number');
    });
  });
});

describe('Error Handling Utils', () => {
  describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      const options = { maxAttempts: 3, delayMs: 100 };

      const result = await withRetry(operation as any, options as any);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('fail1'))
        .mockRejectedValueOnce(new Error('fail2'))
        .mockResolvedValue('success');

      const options = { maxAttempts: 3, delayMs: 10 };

      const result = await withRetry(operation as any, options as any);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should fail after max attempts', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('persistent failure'));
      const options = { maxAttempts: 2, delayMs: 10 };

      await expect(withRetry(operation as any, options as any)).rejects.toThrow('persistent failure');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should respect shouldRetry function', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('non-retryable'));
      const options = {
        maxAttempts: 3,
        delayMs: 10,
        shouldRetry: (error: Error) => !error.message.includes('non-retryable')
      };

      await expect(withRetry(operation as any, options as any)).rejects.toThrow('non-retryable');
      expect(operation).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleLocationError', () => {
    it('should handle permission denied error', () => {
      const error = { code: 1 } as any; // PERMISSION_DENIED
      const result = handleLocationError(error);

      expect(result.userMessage).toBe('Location access is needed for safety features');
      expect(result.canRetry).toBe(true);
      expect(result.suggestedAction).toContain('enable location access');
    });

    it('should handle position unavailable error', () => {
      const error = { code: 2 } as any; // POSITION_UNAVAILABLE
      const result = handleLocationError(error);

      expect(result.userMessage).toBe("Can't find your location right now");
      expect(result.canRetry).toBe(true);
      expect(result.suggestedAction).toContain('better GPS signal');
    });

    it('should handle timeout error', () => {
      const error = { code: 3 } as any; // TIMEOUT
      const result = handleLocationError(error);

      expect(result.userMessage).toBe('Location is taking too long to find');
      expect(result.canRetry).toBe(true);
    });

    it('should handle unknown error', () => {
      const error = { message: 'Unknown location error' } as any;
      const result = handleLocationError(error);

      expect(result.userMessage).toBe('Having trouble with location services');
      expect(result.canRetry).toBe(true);
    });
  });

  describe('handleCameraError', () => {
    it('should handle permission error', () => {
      const error = { message: 'Camera permission denied' } as any;
      const result = handleCameraError(error);

      expect(result.userMessage).toBe('Camera permission is needed for photo check-ins');
      expect(result.requiresPermission).toBe(true);
      expect(result.canRetry).toBe(true);
    });

    it('should handle camera unavailable error', () => {
      const error = { message: 'Camera not available' } as any;
      const result = handleCameraError(error);

      expect(result.userMessage).toBe('Camera is not available on this device');
      expect(result.canRetry).toBe(false);
      expect(result.requiresPermission).toBe(false);
    });

    it('should handle cancelled error', () => {
      const error = { message: 'User cancelled camera' } as any;
      const result = handleCameraError(error);

      expect(result.userMessage).toBe('Photo was cancelled');
      expect(result.canRetry).toBe(true);
      expect(result.requiresPermission).toBe(false);
    });

    it('should handle unknown camera error', () => {
      const error = { message: 'Unknown camera error' } as any;
      const result = handleCameraError(error);

      expect(result.userMessage).toBe('Camera error, please try again');
      expect(result.canRetry).toBe(true);
    });
  });
});

// Integration tests for safety-critical workflows
describe('Safety Integration Tests', () => {
  describe('Photo Check-in Workflow', () => {
    it('should validate complete photo check-in flow', () => {
      // Test location validation
      const location = { latitude: 40.7128, longitude: -74.0060, accuracy: 15 } as any;
      const locationResult = validateLocation(location);
      expect(locationResult.isValid).toBe(true);

      // Test photo check-in validation
      const checkIn = {
        placeId: 'school_123',
        placeName: 'Lincoln Elementary School',
        photoUrl: 'file:///path/to/photo.jpg',
        timestamp: Date.now(),
        location,
        notes: 'Arrived safely at school'
      } as any;

      const checkInResult = validatePhotoCheckIn(checkIn);
      expect(checkInResult.isValid).toBe(true);

      // Test distance validation (assuming 50m from school)
      const distanceResult = validateDistance(50 as any, 'check-in' as any);
      expect(distanceResult.isValid).toBe(true);
    });
  });

  describe('Safe Zone Setup Workflow', () => {
    it('should validate complete safe zone setup', () => {
      // Test location validation for safe zone center
      const center = { latitude: 40.7589, longitude: -73.9851 } as any; // Times Square
      const locationResult = validateLocation(center);
      expect(locationResult.isValid).toBe(true);

      // Test safe zone validation
      const safeZone = {
        id: 'home_zone',
        name: 'Home Safe Zone',
        center,
        radius: 200,
        isActive: true
      } as any;

      const safeZoneResult = validateSafeZone(safeZone);
      expect(safeZoneResult.isValid).toBe(true);
    });
  });

  describe('Emergency Contact Setup Workflow', () => {
    it('should validate emergency contact setup', () => {
      const contact = {
        id: 'mom_contact',
        name: 'Sarah Johnson',
        phone: '+1-555-123-4567',
        relationship: 'Mother',
        isPrimary: true
      } as any;

      const result = validateEmergencyContact(contact);
      expect(result.isValid).toBe(true);
    });
  });

  describe('PIN Security Workflow', () => {
    it('should validate PIN setup with security checks', () => {
      // Test weak PIN rejection
      const weakPIN = validatePIN('1111' as any);
      expect(weakPIN.isValid).toBe(true);
      expect(weakPIN.warnings).toBeDefined();

      // Test strong PIN acceptance
      const strongPIN = validatePIN('7392' as any);
      expect(strongPIN.isValid).toBe(true);
      expect(strongPIN.warnings).toHaveLength(0);
    });
  });
});
