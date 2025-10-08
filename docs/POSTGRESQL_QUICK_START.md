# PostgreSQL + PostGIS Quick Start

## Immediate Implementation Steps

### ⚡ **5-Minute Setup**

#### 1. Start Database

```bash
# Create docker-compose.spatial.yml in your project root
curl -o docker-compose.spatial.yml https://raw.githubusercontent.com/postgis/docker-postgis/master/docker-compose.yml

# Or create manually with this content:
cat > docker-compose.spatial.yml << 'EOF'
version: '3.8'
services:
  postgis:
    image: postgis/postgis:15-3.3
    container_name: kidfriendlymap-db
    environment:
      POSTGRES_DB: kidfriendlymap
      POSTGRES_USER: kidmap_user
      POSTGRES_PASSWORD: kidmap_password
    ports:
      - "5432:5432"
    volumes:
      - postgis_data:/var/lib/postgresql/data
volumes:
  postgis_data:
EOF

# Start database
docker-compose -f docker-compose.spatial.yml up -d
```

#### 2. Add Environment Variables

```bash
# Add to your .env file
echo "
# Spatial Database Configuration
EXPO_PUBLIC_ENABLE_POSTGIS=true
EXPO_PUBLIC_SPATIAL_API_URL=http://localhost:3000/api/spatial
" >> .env
```

#### 3. Test Connection

```bash
# Verify PostgreSQL + PostGIS is working
docker exec -it kidfriendlymap-db psql -U kidmap_user -d kidfriendlymap -c "SELECT PostGIS_Version();"
```

### 🔧 **Add to Your Existing Code**

**1. Create Spatial Types** (add to `types/spatial.ts`):

```typescript
export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface EnhancedSafeZone extends SafeZone {
  centerPoint: GeoPoint;
  spatialMetadata?: {
    area: number;
    perimeter: number;
  };
}
```

**2. Enhance Safe Zone Creation** (modify `stores/parentalStore.ts`):

```typescript
// Add this import
import { spatialApi } from '@/utils/spatialApi';

// Modify your addSafeZone function to include this check:
const addSafeZone = async (zone: Omit<SafeZone, 'id' | 'createdAt'>) => {
  try {
    // Try spatial API if enabled
    if (process.env.EXPO_PUBLIC_ENABLE_POSTGIS === 'true') {
      const spatialZone = await spatialApi.createSafeZone({
        name: zone.name,
        center: { latitude: zone.latitude, longitude: zone.longitude },
        radius: zone.radius,
        childId: 'current_child',
      });
      console.log('✅ Created spatial safe zone:', spatialZone.name);
    }
  } catch (error) {
    console.log('⚠️ Spatial API unavailable, using fallback');
  }

  // Your existing safe zone creation logic here
  const newZone: SafeZone = {
    ...zone,
    id: `safe_zone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
  };

  const updatedSafeZones = [...safeZones, newZone];
  await saveSafeZones(updatedSafeZones);
  return newZone;
};
```

**3. Create Basic Spatial API** (create `utils/spatialApi.ts`):

```typescript
import { apiClient } from './api';

export const spatialApi = {
  async createSafeZone(data: {
    name: string;
    center: { latitude: number; longitude: number };
    radius: number;
    childId: string;
  }) {
    try {
      const response = await apiClient.post('/spatial/safe-zones', data);
      return response.data;
    } catch (error) {
      console.warn('Spatial API call failed:', error);
      throw error;
    }
  },

  async checkSafeZoneContainment(
    location: { latitude: number; longitude: number },
    childId: string,
  ) {
    try {
      const response = await apiClient.post('/spatial/safe-zones/check', {
        location,
        childId,
      });
      return response.data;
    } catch (error) {
      console.warn('Spatial check failed:', error);
      throw error;
    }
  },
};
```

### 🧪 **Test Your Integration**

**1. Test Database Connection**:

```bash
# Should return PostGIS version
docker exec -it kidfriendlymap-db psql -U kidmap_user -d kidfriendlymap -c "SELECT PostGIS_Version();"
```

**2. Test in Your App**:

```typescript
// In your app, try creating a safe zone
// Check if the spatial API is called
// Verify it falls back gracefully when backend is unavailable
```

### 📊 **Check Results**

**View Data in Database**:

```bash
# See created safe zones
docker exec -it kidfriendlymap-db psql -U kidmap_user -d kidfriendlymap -c "SELECT * FROM safe_zones;"
```

**Monitor API Calls**:

```bash
# Watch your Expo console for:
# ✅ Created spatial safe zone: [name]
# ⚠️ Spatial API unavailable, using fallback
```

### 🎯 **Benefits You Get Immediately**

1. **Database Ready**: PostgreSQL + PostGIS running and accessible
2. **Graceful Fallback**: App works normally when spatial API is unavailable
3. **Foundation Set**: Ready for advanced spatial features
4. **Data Persistence**: Safe zones can be stored with precise geometry
5. **Scalability**: Database ready for complex spatial queries

### 🔄 **Gradual Enhancement Path**

**Week 1**: Basic setup (above)
**Week 2**: Add backend API endpoints
**Week 3**: Implement real-time geofencing
**Week 4**: Add spatial analytics
**Week 5**: Performance optimization

### 🆘 **Quick Troubleshooting**

**Database Won't Start**:

```bash
docker logs kidfriendlymap-db
# Check for port conflicts, memory issues
```

**PostGIS Not Working**:

```bash
docker exec -it kidfriendlymap-db psql -U kidmap_user -d kidfriendlymap -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

**App Can't Connect**:

- Check .env file has correct EXPO_PUBLIC_SPATIAL_API_URL
- Verify network connectivity between app and database
- Test with curl: `curl http://localhost:3000/api/health`

### 💡 **Pro Tips**

1. **Start Simple**: Use the graceful fallback approach
2. **Test Early**: Verify database connection before building APIs
3. **Monitor Performance**: Watch spatial query response times
4. **Cache Smart**: Use existing AsyncStorage for frequently accessed data
5. **Stay Compatible**: Keep existing UI/UX unchanged

### 📈 **Success Metrics**

- ✅ Database starts successfully
- ✅ PostGIS extension loads
- ✅ App creates safe zones normally
- ✅ Spatial API calls succeed (when backend ready)
- ✅ Graceful fallback when offline

This quick start gets you spatial capabilities while maintaining your existing functionality!
