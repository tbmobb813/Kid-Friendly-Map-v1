# Migration Guide: Upgrading to Enhanced Features

## Overview

This guide helps you migrate existing code to use the new MMKV storage, Voice/TTS, and React Native Maps features.

## 1. Migrating from AsyncStorage to MMKV

### Automatic Migration

Run the migration once on app startup:

```typescript
import { migrateFromAsyncStorage } from '../utils/storage';

// In your app initialization (App.tsx or _layout.tsx)
useEffect(() => {
  migrateFromAsyncStorage();
}, []);
```

### Manual Code Updates

**Before (AsyncStorage):**

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get
const value = await AsyncStorage.getItem('key');
const parsed = value ? JSON.parse(value) : null;

// Set
await AsyncStorage.setItem('key', JSON.stringify(data));

// Remove
await AsyncStorage.removeItem('key');
```

**After (MMKV):**

```typescript
import { mainStorage } from '../utils/storage';

// Get (synchronous!)
const value = mainStorage.get('key');

// Set (synchronous!)
mainStorage.set('key', data);

// Remove
mainStorage.delete('key');
```

### Benefits

- No more `await` needed
- Automatic JSON parsing
- Type-safe operations
- 10x faster

## 2. Adding Voice to Existing Features

### Navigation Updates

**Before:**

```typescript
const navigateToLocation = (destination) => {
  // Just visual navigation
  setRoute(destination);
};
```

**After:**

```typescript
import { speakNavigation } from '../utils/voice';

const navigateToLocation = async (destination) => {
  setRoute(destination);
  // Add voice guidance
  await speakNavigation('Starting navigation', 0);
};
```

### Safety Features

**Before:**

```typescript
const checkSafety = () => {
  if (isSafe) {
    Alert.alert('Safety Check', 'You are in a safe area');
  }
};
```

**After:**

```typescript
import { speakSafety, KidFriendlyPhrases } from '../utils/voice';

const checkSafety = async () => {
  if (isSafe) {
    await speakSafety(KidFriendlyPhrases.safety.safeZone);
  }
};
```

### Achievement System

**Before:**

```typescript
const awardBadge = (badge) => {
  showNotification(`You earned: ${badge.name}`);
};
```

**After:**

```typescript
import { speakAchievement, KidFriendlyPhrases } from '../utils/voice';

const awardBadge = async (badge) => {
  showNotification(`You earned: ${badge.name}`);
  await speakAchievement(KidFriendlyPhrases.achievements.newBadge);
};
```

## 3. Replacing Map Components

### From expo-maps to react-native-maps

**Before (expo-maps):**

```typescript
import MapView from 'expo-maps';

<MapView
  initialRegion={region}
/>
```

**After (react-native-maps with enhancements):**

```typescript
import KidFriendlyMap from '../components/KidFriendlyMap';

<KidFriendlyMap
  initialLocation={{ latitude: 40.7589, longitude: -73.9851 }}
  safeZones={safeZones}
  route={route}
  enableVoiceGuidance={true}
  onLocationChange={handleLocationChange}
  onSafeZoneEnter={handleSafeZoneEnter}
/>
```

### Adding Safe Zones

```typescript
const safeZones = [
  {
    id: 'home',
    center: { latitude: 40.7589, longitude: -73.9851 },
    radius: 100,
    name: 'Home',
    color: '#10b981',
  },
  // Add more zones
];
```

### Adding Routes

```typescript
const route = [
  {
    latitude: 40.7589,
    longitude: -73.9851,
    instruction: 'Start here',
  },
  {
    latitude: 40.7614,
    longitude: -73.9776,
    instruction: 'Destination',
  },
];
```

## 4. Updating Storage Keys

### Create Typed Keys

**Before:**

```typescript
await AsyncStorage.setItem('user_favorites', JSON.stringify(favorites));
const stored = await AsyncStorage.getItem('user_favorites');
```

**After:**

```typescript
import { mainStorage, StorageKeys } from '../utils/storage';

mainStorage.set(StorageKeys.FAVORITE_PLACES, favorites);
const stored = mainStorage.get(StorageKeys.FAVORITE_PLACES);
```

### Available Keys

```typescript
StorageKeys.USER_PROFILE;
StorageKeys.AUTH_TOKEN;
StorageKeys.EMERGENCY_CONTACTS;
StorageKeys.SAFE_ZONES;
StorageKeys.VOICE_ENABLED;
StorageKeys.RECENT_SEARCHES;
StorageKeys.FAVORITE_PLACES;
StorageKeys.ACHIEVEMENTS;
// ... and more
```

## 5. Adding Voice Settings UI

### Add to Settings Screen

```typescript
import VoiceSettings from '../components/VoiceSettings';

function SettingsScreen() {
  return (
    <ScrollView>
      {/* Your existing settings */}

      {/* Add voice settings */}
      <VoiceSettings />
    </ScrollView>
  );
}
```

## 6. Cache Strategy Updates

### Implement Cache Expiration

**Before:**

```typescript
const cacheData = async (key, data) => {
  await AsyncStorage.setItem(
    key,
    JSON.stringify({
      data,
      timestamp: Date.now(),
    }),
  );
};

const getCachedData = async (key, maxAge) => {
  const cached = await AsyncStorage.getItem(key);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < maxAge) {
      return data;
    }
  }
  return null;
};
```

**After:**

```typescript
import { StorageUtils } from '../utils/storage';

const cacheData = (key, data, maxAge) => {
  StorageUtils.setWithExpiry(key, data, maxAge);
};

const getCachedData = (key) => {
  return StorageUtils.getWithExpiry(key);
};

// Cleanup expired cache periodically
StorageUtils.clearExpired();
```

## 7. Location Tracking Integration

### Update Location Handlers

**Before:**

```typescript
const trackLocation = async () => {
  const location = await Location.getCurrentPositionAsync();
  setCurrentLocation(location.coords);
};
```

**After:**

```typescript
import { mainStorage } from '../utils/storage';

const trackLocation = async () => {
  const location = await Location.getCurrentPositionAsync();
  setCurrentLocation(location.coords);

  // Store with MMKV
  mainStorage.set('last_location', {
    lat: location.coords.latitude,
    lng: location.coords.longitude,
    timestamp: Date.now(),
  });
};
```

## 8. Complete Example: Journey Screen

### Before

```typescript
import { useState } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView from 'expo-maps';

export default function JourneyScreen() {
  const [route, setRoute] = useState([]);

  const saveJourney = async (journey) => {
    await AsyncStorage.setItem('journey', JSON.stringify(journey));
  };

  return (
    <View>
      <MapView />
    </View>
  );
}
```

### After

```typescript
import { useState, useEffect } from 'react';
import { View } from 'react-native';
import { mainStorage, StorageKeys } from '../utils/storage';
import { speakNavigation, speakSafety } from '../utils/voice';
import KidFriendlyMap from '../components/KidFriendlyMap';

export default function JourneyScreen() {
  const [route, setRoute] = useState([]);
  const [safeZones, setSafeZones] = useState([]);

  useEffect(() => {
    // Load saved data (synchronous!)
    const savedRoute = mainStorage.get(StorageKeys.JOURNEY_HISTORY);
    const savedZones = mainStorage.get(StorageKeys.SAFE_ZONES);

    if (savedRoute) setRoute(savedRoute);
    if (savedZones) setSafeZones(savedZones);
  }, []);

  const saveJourney = (journey) => {
    // No await needed!
    mainStorage.set(StorageKeys.JOURNEY_HISTORY, journey);
  };

  const handleLocationChange = (location) => {
    mainStorage.set('current_location', location.coords);
  };

  const handleSafeZoneEnter = async (zone) => {
    await speakSafety(`You're in ${zone.name}!`);

    // Log entry
    const history = mainStorage.get('zone_history', []);
    history.push({
      zone: zone.id,
      timestamp: Date.now(),
    });
    mainStorage.set('zone_history', history);
  };

  return (
    <View style={{ flex: 1 }}>
      <KidFriendlyMap
        route={route}
        safeZones={safeZones}
        onLocationChange={handleLocationChange}
        onSafeZoneEnter={handleSafeZoneEnter}
        enableVoiceGuidance={true}
      />
    </View>
  );
}
```

## 9. Testing Checklist

- [ ] Run automatic AsyncStorage migration
- [ ] Test MMKV storage operations
- [ ] Verify voice settings work
- [ ] Test voice announcements
- [ ] Check map rendering
- [ ] Verify safe zone detection
- [ ] Test route visualization
- [ ] Confirm location tracking
- [ ] Test on physical device

## 10. Common Issues

### Issue: Voice not working

**Solution:** Test on physical device (simulators have limited voices)

### Issue: Map not showing

**Solution:** Check location permissions and test on device

### Issue: Storage migration slow

**Solution:** Run migration once, then remove the call

### Issue: TypeScript errors

**Solution:** Ensure you're using typed keys and proper imports

## Resources

- [Enhanced Features Guide](./ENHANCED_FEATURES_GUIDE.md)
- [Quick Reference](./QUICK_REFERENCE.md)
- [Summary](./ENHANCED_FEATURES_SUMMARY.md)

---

**Need Help?** Check the demo component: `components/EnhancedFeaturesDemo.tsx`
