import { Platform } from 'react-native';
import { log } from './logger';

// Input validation utilities for safety-critical components

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
};

export type LocationData = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
};

export type SafeZoneData = {
  id: string;
  name: string;
  center: LocationData;
  radius: number;
  isActive: boolean;
};

export type EmergencyContact = {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
};

export type PhotoCheckInData = {
  placeId: string;
  placeName: string;
  photoUrl: string;
  timestamp: number;
  location?: LocationData;
  notes?: string;
};

// Location validation
export function validateLocation(location: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!location) {
    errors.push('Location data is required');
    return { isValid: false, errors, warnings };
  }

  if (typeof location.latitude !== 'number' || isNaN(location.latitude)) {
    errors.push('Valid latitude is required');
  } else if (location.latitude < -90 || location.latitude > 90) {
    errors.push('Latitude must be between -90 and 90 degrees');
  }

  if (typeof location.longitude !== 'number' || isNaN(location.longitude)) {
    errors.push('Valid longitude is required');
  } else if (location.longitude < -180 || location.longitude > 180) {
    errors.push('Longitude must be between -180 and 180 degrees');
  }

  if (location.accuracy !== undefined) {
    if (typeof location.accuracy !== 'number' || location.accuracy < 0) {
      warnings.push('Location accuracy should be a positive number');
    } else if (location.accuracy > 100) {
      warnings.push('Location accuracy is low (>100m), results may be unreliable');
    }
  }

  if (location.timestamp !== undefined) {
    if (typeof location.timestamp !== 'number' || location.timestamp <= 0) {
      warnings.push('Invalid timestamp provided');
    } else {
      const age = Date.now() - location.timestamp;
      if (age > 300000) { // 5 minutes
        warnings.push('Location data is more than 5 minutes old');
      }
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
}

// Safe zone validation
export function validateSafeZone(safeZone: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!safeZone) {
    errors.push('Safe zone data is required');
    return { isValid: false, errors, warnings };
  }

  if (!safeZone.id || typeof safeZone.id !== 'string' || safeZone.id.trim().length === 0) {
    errors.push('Safe zone ID is required');
  }

  if (!safeZone.name || typeof safeZone.name !== 'string' || safeZone.name.trim().length === 0) {
    errors.push('Safe zone name is required');
  } else if (safeZone.name.length > 50) {
    warnings.push('Safe zone name is very long (>50 characters)');
  }

  const centerValidation = validateLocation(safeZone.center);
  if (!centerValidation.isValid) {
    errors.push('Safe zone center location is invalid: ' + centerValidation.errors.join(', '));
  }

  if (typeof safeZone.radius !== 'number' || safeZone.radius <= 0) {
    errors.push('Safe zone radius must be a positive number');
  } else if (safeZone.radius < 10) {
    warnings.push('Safe zone radius is very small (<10m)');
  } else if (safeZone.radius > 5000) {
    warnings.push('Safe zone radius is very large (>5km)');
  }

  if (typeof safeZone.isActive !== 'boolean') {
    errors.push('Safe zone active status must be a boolean');
  }

  return { isValid: errors.length === 0, errors, warnings };
}

// Emergency contact validation
export function validateEmergencyContact(contact: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!contact) {
    errors.push('Emergency contact data is required');
    return { isValid: false, errors, warnings };
  }

  if (!contact.id || typeof contact.id !== 'string' || contact.id.trim().length === 0) {
    errors.push('Contact ID is required');
  }

  if (!contact.name || typeof contact.name !== 'string' || contact.name.trim().length === 0) {
    errors.push('Contact name is required');
  } else if (contact.name.length > 100) {
    warnings.push('Contact name is very long (>100 characters)');
  }

  if (!contact.phone || typeof contact.phone !== 'string') {
    errors.push('Contact phone number is required');
  } else {
    // Basic phone number validation
    const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{7,15}$/;
    if (!phoneRegex.test(contact.phone.replace(/\s/g, ''))) {
      errors.push('Phone number format is invalid');
    }
  }

  if (!contact.relationship || typeof contact.relationship !== 'string' || contact.relationship.trim().length === 0) {
    errors.push('Contact relationship is required');
  }

  if (typeof contact.isPrimary !== 'boolean') {
    errors.push('Primary contact status must be a boolean');
  }

  return { isValid: errors.length === 0, errors, warnings };
}

// Photo check-in validation
export function validatePhotoCheckIn(checkIn: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!checkIn) {
    errors.push('Photo check-in data is required');
    return { isValid: false, errors, warnings };
  }

  if (!checkIn.placeId || typeof checkIn.placeId !== 'string' || checkIn.placeId.trim().length === 0) {
    errors.push('Place ID is required');
  }

  if (!checkIn.placeName || typeof checkIn.placeName !== 'string' || checkIn.placeName.trim().length === 0) {
    errors.push('Place name is required');
  }

  if (!checkIn.photoUrl || typeof checkIn.photoUrl !== 'string' || checkIn.photoUrl.trim().length === 0) {
    errors.push('Photo URL is required');
  } else {
    // Basic URL validation
    try {
      new URL(checkIn.photoUrl);
    } catch {
      // For local file URIs on mobile
      if (!checkIn.photoUrl.startsWith('file://') && !checkIn.photoUrl.startsWith('content://')) {
        errors.push('Photo URL format is invalid');
      }
    }
  }

  if (typeof checkIn.timestamp !== 'number' || checkIn.timestamp <= 0) {
    errors.push('Valid timestamp is required');
  } else {
    const age = Date.now() - checkIn.timestamp;
    if (age > 86400000) { // 24 hours
      warnings.push('Check-in timestamp is more than 24 hours old');
    }
  }

  if (checkIn.location) {
    const locationValidation = validateLocation(checkIn.location);
    if (!locationValidation.isValid) {
      warnings.push('Check-in location is invalid: ' + locationValidation.errors.join(', '));
    }
  }

  if (checkIn.notes && typeof checkIn.notes !== 'string') {
    warnings.push('Check-in notes should be a string');
  } else if (checkIn.notes && checkIn.notes.length > 500) {
    warnings.push('Check-in notes are very long (>500 characters)');
  }

  return { isValid: errors.length === 0, errors, warnings };
}

// PIN validation for parental controls
export function validatePIN(pin: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!pin || typeof pin !== 'string') {
    errors.push('PIN is required');
    return { isValid: false, errors, warnings };
  }

  if (pin.length < 4) {
    errors.push('PIN must be at least 4 digits');
  } else if (pin.length > 8) {
    errors.push('PIN must be no more than 8 digits');
  }

  if (!/^\d+$/.test(pin)) {
    errors.push('PIN must contain only numbers');
  }

  // Check for weak PINs
  const weakPatterns = [
    /^(\d)\1+$/, // All same digits (1111, 2222, etc.)
    /^1234$/, /^4321$/, /^0000$/, /^1111$/, /^2222$/, /^3333$/, /^4444$/, /^5555$/, /^6666$/, /^7777$/, /^8888$/, /^9999$/,
    /^123456$/, /^654321$/, /^000000$/
  ];

  for (const pattern of weakPatterns) {
    if (pattern.test(pin)) {
      warnings.push('PIN is easily guessable, consider using a stronger combination');
      break;
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
}

// Sanitize user input to prevent XSS and other issues
export function sanitizeInput(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>"'&]/g, (match) => {
      const entities: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entities[match] || match;
    });
}

// Validate and sanitize form data
export function validateAndSanitizeFormData(data: Record<string, any>, schema: Record<string, any>): {
  isValid: boolean;
  sanitizedData: Record<string, any>;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const sanitizedData: Record<string, any> = {};

  for (const [key, rules] of Object.entries(schema)) {
    const value = data[key];
    
    // Check if required field is missing
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${key} is required`);
      continue;
    }

    // Skip validation if field is optional and empty
    if (!rules.required && (value === undefined || value === null || value === '')) {
      continue;
    }

    // Type validation
    if (rules.type && typeof value !== rules.type) {
      errors.push(`${key} must be of type ${rules.type}`);
      continue;
    }

    // String validation and sanitization
    if (typeof value === 'string') {
      let sanitized = sanitizeInput(value, rules.maxLength);
      
      if (rules.minLength && sanitized.length < rules.minLength) {
        errors.push(`${key} must be at least ${rules.minLength} characters`);
      }
      
      if (rules.maxLength && sanitized.length > rules.maxLength) {
        warnings.push(`${key} was truncated to ${rules.maxLength} characters`);
      }
      
      if (rules.pattern && !rules.pattern.test(sanitized)) {
        errors.push(`${key} format is invalid`);
      }
      
      sanitizedData[key] = sanitized;
    } else {
      sanitizedData[key] = value;
    }
  }

  return {
    isValid: errors.length === 0,
    sanitizedData,
    errors,
    warnings
  };
}

// Log validation results for debugging
export function logValidationResult(context: string, result: ValidationResult): void {
  if (!result.isValid) {
    log.warn(`Validation failed for ${context}`, { errors: result.errors });
  }
  
  if (result.warnings && result.warnings.length > 0) {
    log.warn(`Validation warnings for ${context}`, { warnings: result.warnings });
  }
  
  if (result.isValid && (!result.warnings || result.warnings.length === 0)) {
    log.debug(`Validation passed for ${context}`);
  }
}

// Distance validation for location-based features
export function validateDistance(distance: number, context: string = 'location'): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (typeof distance !== 'number' || isNaN(distance)) {
    errors.push(`${context} distance must be a valid number`);
  } else if (distance < 0) {
    errors.push(`${context} distance cannot be negative`);
  } else if (distance > 20000000) { // ~20,000 km (half Earth circumference)
    errors.push(`${context} distance is unrealistically large`);
  } else if (distance > 1000000) { // 1000 km
    warnings.push(`${context} distance is very large (>1000km)`);
  }

  return { isValid: errors.length === 0, errors, warnings };
}

export default {
  validateLocation,
  validateSafeZone,
  validateEmergencyContact,
  validatePhotoCheckIn,
  validatePIN,
  sanitizeInput,
  validateAndSanitizeFormData,
  logValidationResult,
  validateDistance
};
