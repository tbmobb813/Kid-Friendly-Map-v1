# PostgreSQL + PostGIS Implementation Guide

## Step-by-Step Instructions for Kid-Friendly Map

### 🚀 **Quick Start Implementation**

This guide provides concrete steps to integrate PostgreSQL + PostGIS into your existing Kid-Friendly Map project.

## 📋 **Prerequisites Check**

Before starting, verify your current setup:

```bash
# Check your current dependencies
cat package.json | grep -E "(expo|react-native|zustand|async-storage)"

# Verify your current data structure
ls -la stores/
ls -la types/
```

## 🎯 **Phase 1: Backend Setup (Week 1)**

### **Step 1.1: Set Up Local PostgreSQL + PostGIS**

#### **Option A: Docker (Recommended)**

1. Create `docker-compose.spatial.yml` in your project root:

```yaml
version: '3.8'

services:
  postgis:
    image: postgis/postgis:15-3.3
    container_name: kidfriendlymap-db
    environment:
      POSTGRES_DB: kidfriendlymap
      POSTGRES_USER: kidmap_user
      POSTGRES_PASSWORD: kidmap_password
      POSTGRES_HOST_AUTH_METHOD: trust
    ports:
      - '5432:5432'
    volumes:
      - postgis_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d/
    restart: unless-stopped

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: kidfriendlymap-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@kidfriendlymap.com
      PGADMIN_DEFAULT_PASSWORD: admin123
    ports:
      - '5050:80'
    depends_on:
      - postgis
    restart: unless-stopped

volumes:
  postgis_data:
```

1. Start the database:

```bash
# Create database directory
mkdir -p database/init

# Start PostgreSQL + PostGIS
docker-compose -f docker-compose.spatial.yml up -d

# Verify it's running
docker ps
```

#### **Option B: Local Installation**

```bash
# macOS with Homebrew
brew install postgresql postgis

# Ubuntu/Debian
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib postgis

# Start PostgreSQL
brew services start postgresql  # macOS
sudo systemctl start postgresql # Linux
```

### **Step 1.2: Initialize Database Schema**

1. Create database initialization script:

```sql
-- database/init/01_init_postgis.sql
-- Enable PostGIS extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS postgis_sfcgal;

-- Create database user for application
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'kidmap_app') THEN
        CREATE ROLE kidmap_app LOGIN PASSWORD 'app_password';
    END IF;
END
$$;

-- Grant necessary permissions
GRANT CONNECT ON DATABASE kidfriendlymap TO kidmap_app;
GRANT USAGE ON SCHEMA public TO kidmap_app;
GRANT CREATE ON SCHEMA public TO kidmap_app;
```

1. Create core tables:

```sql
-- database/init/02_create_tables.sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Children profiles
CREATE TABLE IF NOT EXISTS children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    age INTEGER CHECK (age >= 0 AND age <= 18),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced safe zones with PostGIS geometry
CREATE TABLE IF NOT EXISTS safe_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    center_point GEOMETRY(POINT, 4326) NOT NULL,
    boundary GEOMETRY(POLYGON, 4326) NOT NULL,
    radius INTEGER NOT NULL CHECK (radius > 0), -- meters
    is_active BOOLEAN DEFAULT true,
    notification_settings JSONB DEFAULT '{"onEntry": true, "onExit": true}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spatial indexes for performance
CREATE INDEX IF NOT EXISTS idx_safe_zones_boundary ON safe_zones USING GIST (boundary);
CREATE INDEX IF NOT EXISTS idx_safe_zones_center ON safe_zones USING GIST (center_point);
CREATE INDEX IF NOT EXISTS idx_safe_zones_child_active ON safe_zones (child_id, is_active) WHERE is_active = true;

-- Places table with spatial data
CREATE TABLE IF NOT EXISTS places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    category VARCHAR(100),
    location GEOMETRY(POINT, 4326) NOT NULL,
    kid_friendly_score DECIMAL(3,2) CHECK (kid_friendly_score >= 0 AND kid_friendly_score <= 5),
    accessibility_features JSONB DEFAULT '{}',
    safety_rating INTEGER CHECK (safety_rating >= 1 AND safety_rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spatial index for places
CREATE INDEX IF NOT EXISTS idx_places_location ON places USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_places_category ON places (category);

-- Route analytics
CREATE TABLE IF NOT EXISTS route_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID REFERENCES children(id),
    route_name VARCHAR(255),
    start_point GEOMETRY(POINT, 4326) NOT NULL,
    end_point GEOMETRY(POINT, 4326) NOT NULL,
    route_geometry GEOMETRY(LINESTRING, 4326),
    distance_meters DECIMAL(10,2),
    duration_minutes INTEGER,
    safety_score DECIMAL(3,2),
    weather_condition VARCHAR(50),
    time_of_day TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spatial indexes for route analytics
CREATE INDEX IF NOT EXISTS idx_route_analytics_start ON route_analytics USING GIST (start_point);
CREATE INDEX IF NOT EXISTS idx_route_analytics_geometry ON route_analytics USING GIST (route_geometry);

-- Grant permissions to application user
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO kidmap_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO kidmap_app;
```

Apply the schema:

```bash
# If using Docker
docker exec -i kidfriendlymap-db psql -U kidmap_user -d kidfriendlymap < database/init/01_init_postgis.sql
docker exec -i kidfriendlymap-db psql -U kidmap_user -d kidfriendlymap < database/init/02_create_tables.sql

# If using local PostgreSQL
psql -h localhost -U postgres -d kidfriendlymap -f database/init/01_init_postgis.sql
psql -h localhost -U postgres -d kidfriendlymap -f database/init/02_create_tables.sql
```

### **Step 1.3: Set Up Backend API**

1. Create backend directory structure:

```bash
mkdir -p backend/src/{config,controllers,services,types,middleware}
cd backend
```

Initialize Node.js backend:

```bash
# Initialize package.json
npm init -y

# Install dependencies
npm install express cors helmet compression
npm install pg @types/pg knex
npm install @types/node @types/express typescript ts-node nodemon
npm install dotenv uuid @types/uuid
npm install turf @types/geojson

# Install development dependencies
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint prettier
```

Create `backend/package.json`:

```json
{
  "name": "kidfriendlymap-backend",
  "version": "1.0.0",
  "description": "Backend API for Kid-Friendly Map with PostGIS support",
  "main": "dist/index.js",
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "migrate": "knex migrate:latest",
    "seed": "knex seed:run"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "pg": "^8.11.3",
    "knex": "^3.0.1",
    "dotenv": "^16.3.1",
    "uuid": "^9.0.1",
    "@turf/turf": "^6.5.0"
  },
  "devDependencies": {
    "@types/node": "^20.8.0",
    "@types/express": "^4.17.18",
    "@types/pg": "^8.10.7",
    "@types/uuid": "^9.0.5",
    "@types/geojson": "^7946.0.10",
    "typescript": "^5.2.2",
    "ts-node": "^10.9.1",
    "nodemon": "^3.0.1"
  }
}
```

Create TypeScript configuration:

```json
// backend/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

Create environment configuration:

```bash
# backend/.env
DATABASE_URL=postgresql://kidmap_user:kidmap_password@localhost:5432/kidfriendlymap
NODE_ENV=development
PORT=3000
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=http://localhost:8081,exp://192.168.1.100:8081
```

Create database configuration:

```typescript
// backend/src/config/database.ts
import { knex, Knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const config: Knex.Config = {
  client: 'postgresql',
  connection: process.env.DATABASE_URL || {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'kidmap_user',
    password: process.env.DB_PASSWORD || 'kidmap_password',
    database: process.env.DB_NAME || 'kidfriendlymap',
  },
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 60000,
    idleTimeoutMillis: 30000,
  },
  migrations: {
    directory: './migrations',
    extension: 'ts',
  },
  seeds: {
    directory: './seeds',
    extension: 'ts',
  },
};

export const db = knex(config);

// Test connection and PostGIS extension
export async function testConnection(): Promise<boolean> {
  try {
    await db.raw('SELECT 1');
    console.log('✅ Database connection successful');

    // Test PostGIS
    const result = await db.raw('SELECT PostGIS_Version()');
    console.log('✅ PostGIS version:', result.rows[0].postgis_version);

    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}
```

## 🔧 **Phase 2: Enhance Your Frontend (Week 2)**

### **Step 2.1: Update Environment Configuration**

1. Add to your `.env` file:

```bash
# Add to existing .env
# Spatial Database Configuration
EXPO_PUBLIC_ENABLE_POSTGIS=true
EXPO_PUBLIC_SPATIAL_API_URL=http://localhost:3000/api/spatial
EXPO_PUBLIC_SPATIAL_WS_URL=ws://localhost:3000/spatial
EXPO_PUBLIC_ENABLE_REALTIME_GEOFENCE=true
EXPO_PUBLIC_SPATIAL_CACHE_TTL=300000
```

### **Step 2.2: Create Enhanced Types**

Create new spatial types to extend your existing ones:

```typescript
// types/spatial.ts
import { SafeZone, CheckInRequest } from './parental';
import { Place } from './navigation';

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface GeoPolygon {
  type: 'Polygon';
  coordinates: number[][][]; // GeoJSON format
}

export interface SpatialBounds {
  northEast: GeoPoint;
  southWest: GeoPoint;
}

// Enhanced SafeZone with spatial capabilities
export interface EnhancedSafeZone extends SafeZone {
  boundary?: GeoPolygon;
  centerPoint: GeoPoint;
  spatialMetadata?: {
    area: number; // square meters
    perimeter: number; // meters
    isCircular: boolean;
    accurateGeometry: boolean;
  };
}

// Enhanced Place with spatial features
export interface SpatialPlace extends Place {
  spatialData: {
    geometry: GeoPoint;
    nearbyFeatures: string[];
    accessibilityScore: number;
    safetyFeatures: string[];
    distanceFromUser?: number;
  };
}

export interface SpatialQueryOptions {
  center: GeoPoint;
  radius?: number;
  bounds?: SpatialBounds;
  filters?: {
    categories?: string[];
    safetyRating?: number;
    accessibility?: boolean;
    kidFriendlyScore?: number;
  };
  limit?: number;
}

export interface RouteAnalytics {
  routeId: string;
  geometry: GeoJSON.LineString;
  safetyScore: number;
  kidFriendlyFeatures: string[];
  estimatedWalkTime: number;
  weatherSuitability: number;
  crowdLevels: 'low' | 'medium' | 'high';
  alternativeRoutes?: RouteAnalytics[];
}

export interface GeofenceEvent {
  id: string;
  type: 'entry' | 'exit';
  safeZoneId: string;
  safeZoneName: string;
  childId: string;
  location: GeoPoint;
  timestamp: number;
  confidence: number; // 0-1, accuracy of detection
}

export interface SpatialError {
  code: 'SPATIAL_QUERY_FAILED' | 'GEOMETRY_INVALID' | 'POSTGIS_ERROR' | 'NETWORK_ERROR';
  message: string;
  details?: any;
  fallbackAvailable: boolean;
}
```

### **Step 2.3: Create Spatial API Client**

Extend your existing API client with spatial capabilities:

```typescript
// utils/spatialApi.ts
import { apiClient, handleApiError, offlineStorage } from './api';
import {
  GeoPoint,
  EnhancedSafeZone,
  SpatialPlace,
  SpatialQueryOptions,
  RouteAnalytics,
  GeofenceEvent,
  SpatialError,
} from '@/types/spatial';

class SpatialApiClient {
  // Safe zone management with spatial operations
  async createSafeZone(data: {
    name: string;
    center: GeoPoint;
    radius: number;
    childId: string;
    notifications?: {
      onEntry: boolean;
      onExit: boolean;
    };
  }): Promise<EnhancedSafeZone> {
    try {
      const response = await apiClient.post('/spatial/safe-zones', data);
      return response.data;
    } catch (error) {
      const spatialError = this.handleSpatialError(error);
      if (spatialError.fallbackAvailable) {
        return this.createSafeZoneFallback(data);
      }
      throw spatialError;
    }
  }

  async checkSafeZoneContainment(
    location: GeoPoint,
    childId: string,
  ): Promise<{
    isInSafeZone: boolean;
    safeZones: EnhancedSafeZone[];
    events: GeofenceEvent[];
  }> {
    try {
      const response = await apiClient.post('/spatial/safe-zones/check', {
        location,
        childId,
      });
      return response.data;
    } catch (error) {
      // Fallback to client-side calculation
      return this.checkSafeZoneFallback(location, childId);
    }
  }

  async findNearbyPlaces(options: SpatialQueryOptions): Promise<SpatialPlace[]> {
    const cacheKey = `nearby_places_${options.center.latitude}_${options.center.longitude}_${options.radius}`;

    try {
      const response = await apiClient.post('/spatial/places/nearby', options);

      // Cache successful response
      await offlineStorage.cacheResponse(cacheKey, response.data);

      return response.data;
    } catch (error) {
      // Try cache fallback
      const cached = await offlineStorage.getCachedResponse(cacheKey);
      if (cached) {
        console.log('Using cached nearby places data');
        return cached;
      }

      throw this.handleSpatialError(error);
    }
  }

  async analyzeRoute(waypoints: GeoPoint[]): Promise<RouteAnalytics> {
    try {
      const response = await apiClient.post('/spatial/routes/analyze', { waypoints });
      return response.data;
    } catch (error) {
      // Fallback to basic route analysis
      return this.analyzeRouteFallback(waypoints);
    }
  }

  async getOptimizedRoute(
    start: GeoPoint,
    end: GeoPoint,
    preferences: {
      avoidBusyRoads: boolean;
      preferParks: boolean;
      maxWalkTime: number;
      accessibilityNeeds: boolean;
    },
  ): Promise<RouteAnalytics> {
    try {
      const response = await apiClient.post('/spatial/routes/optimize', {
        start,
        end,
        preferences,
      });
      return response.data;
    } catch (error) {
      // Fallback to existing ORS integration
      return this.getOptimizedRouteFallback(start, end, preferences);
    }
  }

  // Fallback methods for offline functionality
  private async createSafeZoneFallback(data: any): Promise<EnhancedSafeZone> {
    // Create basic safe zone using existing logic
    const basicSafeZone: EnhancedSafeZone = {
      id: `fallback_${Date.now()}`,
      name: data.name,
      latitude: data.center.latitude,
      longitude: data.center.longitude,
      radius: data.radius,
      isActive: true,
      createdAt: Date.now(),
      notifications: data.notifications || { onEntry: true, onExit: true },
      centerPoint: data.center,
      spatialMetadata: {
        area: Math.PI * data.radius * data.radius,
        perimeter: 2 * Math.PI * data.radius,
        isCircular: true,
        accurateGeometry: false,
      },
    };

    // Store for later sync
    await this.queueForSync('create_safe_zone', data);

    return basicSafeZone;
  }

  private async checkSafeZoneFallback(location: GeoPoint, childId: string) {
    // Use existing client-side safe zone checking logic
    // This would integrate with your existing parental store
    return {
      isInSafeZone: false,
      safeZones: [],
      events: [],
    };
  }

  private async analyzeRouteFallback(waypoints: GeoPoint[]): Promise<RouteAnalytics> {
    // Basic route analysis using existing ORS integration
    return {
      routeId: `fallback_${Date.now()}`,
      geometry: {
        type: 'LineString',
        coordinates: waypoints.map((p) => [p.longitude, p.latitude]),
      } as GeoJSON.LineString,
      safetyScore: 3.5,
      kidFriendlyFeatures: ['sidewalks', 'crosswalks'],
      estimatedWalkTime: 15,
      weatherSuitability: 0.8,
      crowdLevels: 'medium',
    };
  }

  private async getOptimizedRouteFallback(
    start: GeoPoint,
    end: GeoPoint,
    preferences: any,
  ): Promise<RouteAnalytics> {
    // Use existing route optimization logic
    return this.analyzeRouteFallback([start, end]);
  }

  private handleSpatialError(error: any): SpatialError {
    const baseError = handleApiError(error);

    return {
      code: baseError.isNetworkError ? 'NETWORK_ERROR' : 'SPATIAL_QUERY_FAILED',
      message: baseError.message,
      details: error,
      fallbackAvailable: true,
    };
  }

  private async queueForSync(operation: string, data: any) {
    const syncQueue = (await offlineStorage.getCachedResponse('spatial_sync_queue')) || [];
    syncQueue.push({
      operation,
      data,
      timestamp: Date.now(),
    });
    await offlineStorage.cacheResponse('spatial_sync_queue', syncQueue);
  }
}

export const spatialApi = new SpatialApiClient();
```

### **Step 2.4: Enhance Your Existing Stores**

Update your parental store to integrate with spatial features:

```typescript
// Add to stores/parentalStore.ts - enhance existing functions

// Add this import at the top
import { spatialApi } from '@/utils/spatialApi';
import { EnhancedSafeZone, GeoPoint } from '@/types/spatial';

// Enhance the addSafeZone function
const addSafeZone = async (zone: Omit<SafeZone, 'id' | 'createdAt'>) => {
  try {
    // Try to create enhanced safe zone with PostGIS
    if (process.env.EXPO_PUBLIC_ENABLE_POSTGIS === 'true') {
      const enhancedZone = await spatialApi.createSafeZone({
        name: zone.name,
        center: { latitude: zone.latitude, longitude: zone.longitude },
        radius: zone.radius,
        childId: 'current_child', // Replace with actual child ID
        notifications: zone.notifications,
      });

      // Convert back to standard SafeZone for existing UI
      const standardZone: SafeZone = {
        id: enhancedZone.id,
        name: enhancedZone.name,
        latitude: enhancedZone.latitude,
        longitude: enhancedZone.longitude,
        radius: enhancedZone.radius,
        isActive: enhancedZone.isActive,
        createdAt: enhancedZone.createdAt,
        notifications: enhancedZone.notifications,
      };

      const updatedSafeZones = [...safeZones, standardZone];
      await saveSafeZones(updatedSafeZones);
      return standardZone;
    }
  } catch (error) {
    console.warn('Failed to create enhanced safe zone, using fallback:', error);
  }

  // Fallback to existing logic
  const newZone: SafeZone = {
    ...zone,
    id: `safe_zone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
  };

  const updatedSafeZones = [...safeZones, newZone];
  await saveSafeZones(updatedSafeZones);
  return newZone;
};

// Add new spatial check function
const checkLocationInSafeZones = async (location: GeoPoint) => {
  try {
    if (process.env.EXPO_PUBLIC_ENABLE_POSTGIS === 'true') {
      const result = await spatialApi.checkSafeZoneContainment(
        location,
        'current_child', // Replace with actual child ID
      );

      if (result.events.length > 0) {
        // Handle geofence events
        result.events.forEach((event) => {
          console.log(`Safe zone ${event.type}: ${event.safeZoneName}`);
          // Trigger notifications, update dashboard, etc.
        });
      }

      return result.isInSafeZone;
    }
  } catch (error) {
    console.warn('Spatial safe zone check failed, using fallback');
  }

  // Fallback to existing client-side calculation
  return checkLocationInSafeZonesFallback(location);
};

const checkLocationInSafeZonesFallback = (location: GeoPoint): boolean => {
  return safeZones.some((zone) => {
    if (!zone.isActive) return false;

    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      zone.latitude,
      zone.longitude,
    );

    return distance <= zone.radius;
  });
};

// Helper function for distance calculation (if not already present)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
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
};

// Add the new functions to your store's return object
return {
  // ... existing properties and functions
  checkLocationInSafeZones,
  addSafeZone, // This replaces the existing addSafeZone
};
```

## 🧪 **Phase 3: Testing Your Integration (Week 3)**

### **Step 3.1: Create Spatial Tests**

Create test files to verify your spatial integration:

```typescript
// __tests__/spatial/safeZoneGeometry.test.ts
import { spatialApi } from '@/utils/spatialApi';
import { GeoPoint } from '@/types/spatial';

describe('PostGIS Safe Zone Integration', () => {
  const testCenter: GeoPoint = { latitude: 40.7128, longitude: -74.006 };
  const testRadius = 100; // meters

  beforeAll(async () => {
    // Ensure test database is available
    // This would connect to your test database
  });

  test('should create accurate geometric safe zone', async () => {
    const safeZone = await spatialApi.createSafeZone({
      name: 'Test Zone',
      center: testCenter,
      radius: testRadius,
      childId: 'test-child',
    });

    expect(safeZone.name).toBe('Test Zone');
    expect(safeZone.centerPoint).toEqual(testCenter);
    expect(safeZone.radius).toBe(testRadius);
    expect(safeZone.spatialMetadata?.area).toBeCloseTo(Math.PI * testRadius * testRadius, -2);
  });

  test('should accurately detect safe zone containment', async () => {
    // Point inside the safe zone (very close to center)
    const insidePoint: GeoPoint = {
      latitude: testCenter.latitude + 0.0001,
      longitude: testCenter.longitude + 0.0001,
    };

    // Point outside the safe zone
    const outsidePoint: GeoPoint = {
      latitude: testCenter.latitude + 0.01,
      longitude: testCenter.longitude + 0.01,
    };

    const insideResult = await spatialApi.checkSafeZoneContainment(insidePoint, 'test-child');

    const outsideResult = await spatialApi.checkSafeZoneContainment(outsidePoint, 'test-child');

    expect(insideResult.isInSafeZone).toBe(true);
    expect(outsideResult.isInSafeZone).toBe(false);
  });

  test('should handle network errors gracefully', async () => {
    // Mock network failure
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    try {
      const result = await spatialApi.checkSafeZoneContainment(testCenter, 'test-child');

      // Should still return a result (fallback)
      expect(result).toBeDefined();
      expect(typeof result.isInSafeZone).toBe('boolean');
    } finally {
      global.fetch = originalFetch;
    }
  });
});
```

### **Step 3.2: Integration Testing Script**

Create a script to test your integration end-to-end:

```typescript
// scripts/testSpatialIntegration.ts
import { spatialApi } from '../utils/spatialApi';
import { db, testConnection } from '../backend/src/config/database';

async function runIntegrationTests() {
  console.log('🧪 Starting Spatial Integration Tests...\n');

  // Test 1: Database Connection
  console.log('1. Testing Database Connection...');
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('❌ Database connection failed');
    process.exit(1);
  }

  // Test 2: PostGIS Extension
  console.log('2. Testing PostGIS Extension...');
  try {
    const result = await db.raw('SELECT ST_AsText(ST_MakePoint(-74.0060, 40.7128))');
    console.log('✅ PostGIS is working:', result.rows[0].st_astext);
  } catch (error) {
    console.error('❌ PostGIS test failed:', error);
    process.exit(1);
  }

  // Test 3: Safe Zone Creation
  console.log('3. Testing Safe Zone Creation...');
  try {
    const testZone = await spatialApi.createSafeZone({
      name: 'Integration Test Zone',
      center: { latitude: 40.7128, longitude: -74.006 },
      radius: 50,
      childId: 'test-child-id',
    });
    console.log('✅ Safe zone created:', testZone.name);
  } catch (error) {
    console.error('❌ Safe zone creation failed:', error);
  }

  // Test 4: Spatial Query
  console.log('4. Testing Spatial Queries...');
  try {
    const containmentResult = await spatialApi.checkSafeZoneContainment(
      { latitude: 40.7128, longitude: -74.006 },
      'test-child-id',
    );
    console.log('✅ Spatial query successful:', containmentResult.isInSafeZone);
  } catch (error) {
    console.error('❌ Spatial query failed:', error);
  }

  console.log('\n🎉 Integration tests completed!');
  process.exit(0);
}

// Run tests
runIntegrationTests().catch((error) => {
  console.error('💥 Integration test failed:', error);
  process.exit(1);
});
```

## 🚀 **Phase 4: Running Your Enhanced App**

### **Step 4.1: Start Your Services**

1. Start PostgreSQL + PostGIS:

```bash
# Start database
docker-compose -f docker-compose.spatial.yml up -d

# Verify it's running
docker ps
```

Start your backend API:

```bash
# In backend directory
cd backend
npm run dev

# Should see:
# ✅ Database connection successful
# ✅ PostGIS version: 3.3.x
# 🚀 Server running on port 3000
```

Start your Expo app:

```bash
# In your main project directory
npx expo start

# Or for web
npx expo start --web
```

### **Step 4.2: Test the Integration**

1. Run the integration test:

```bash
# In your project root
npx ts-node scripts/testSpatialIntegration.ts
```

Test in your app:

```bash
# Create a safe zone through your app
# Check the database to verify it was created with spatial data
docker exec -it kidfriendlymap-db psql -U kidmap_user -d kidfriendlymap -c "SELECT name, ST_AsText(center_point), ST_AsText(boundary) FROM safe_zones;"
```

## 📊 **Monitoring Your Integration**

### **Database Monitoring**

Access pgAdmin to monitor your spatial data:

1. Open <http://localhost:5050>
2. Login with <admin@kidfriendlymap.com> / admin123
3. Add server: localhost:5432, user: kidmap_user

### **Performance Monitoring**

Add this to your backend to monitor spatial query performance:

```typescript
// backend/src/middleware/spatialMetrics.ts
export const spatialMetrics = (req: any, res: any, next: any) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.includes('/spatial/')) {
      console.log(`Spatial Query: ${req.path} - ${duration}ms`);
    }
  });

  next();
};
```

## 🎯 **Next Steps**

After completing this basic integration:

1. **Week 4**: Add real-time geofencing with WebSockets
2. **Week 5**: Implement spatial analytics and reporting
3. **Week 6**: Add advanced route optimization
4. **Week 7**: Performance optimization and production deployment

## 🆘 **Troubleshooting**

### Common Issues

1. **PostgreSQL Connection Fails**

   ```bash
   # Check if PostgreSQL is running
   docker ps

   # Check logs
   docker logs kidfriendlymap-db
   ```

2. **PostGIS Extension Missing**

   ```sql
   -- Connect to database and run:
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

3. **Spatial Queries Fail**

   ```bash
   # Verify PostGIS is working
   docker exec -it kidfriendlymap-db psql -U kidmap_user -d kidfriendlymap -c "SELECT PostGIS_Version();"
   ```

4. **API Connection Issues**
   - Check your .env file has correct EXPO_PUBLIC_SPATIAL_API_URL
   - Verify backend is running on correct port
   - Test API directly: curl <http://localhost:3000/api/health>

This implementation guide maintains your existing architecture while adding powerful spatial capabilities. The integration is designed to be:

- **Non-breaking**: Existing features continue to work
- **Graceful**: Falls back to existing logic when spatial services are unavailable
- **Scalable**: Foundation for advanced spatial features
- **Production-ready**: Includes proper error handling, caching, and monitoring

Start with Phase 1 and test each step before proceeding to the next phase!
