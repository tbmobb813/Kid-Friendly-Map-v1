# Quick Reference: Enhanced Features

## MMKV Storage (Fast & Synchronous)

```typescript
import { mainStorage, cache, StorageKeys, StorageUtils } from '../utils/storage';

// Set/Get (synchronous - no await!)
mainStorage.set('key', value);
const value = mainStorage.get('key', defaultValue);

// With expiration (1 hour)
StorageUtils.setWithExpiry('cache_key', data, 3600000);
const data = StorageUtils.getWithExpiry('cache_key');

// Batch operations
mainStorage.setBatch({ key1: value1, key2: value2 });

// Cleanup
StorageUtils.clearExpired();
cache.clearAll();
```

## Voice/TTS

```typescript
import { voiceManager, speakNavigation, speakSafety, KidFriendlyPhrases } from '../utils/voice';

// Simple speak
await speakMessage('Hello there!');

// Navigation with distance
await speakNavigation('Turn left', 50);

// Safety reminder
await speakSafety(KidFriendlyPhrases.safety.lookBothWays);

// Settings
voiceManager.updateSettings({ rate: 0.9, pitch: 1.1 });
const isEnabled = voiceManager.toggle();
```

## React Native Maps

```typescript
import KidFriendlyMap from '../components/KidFriendlyMap';

<KidFriendlyMap
  initialLocation={{ latitude: 40.7589, longitude: -73.9851 }}
  safeZones={[
    {
      id: 'home',
      center: { latitude: 40.7589, longitude: -73.9851 },
      radius: 100,
      name: 'Home',
    }
  ]}
  route={[
    { latitude: 40.7589, longitude: -73.9851, instruction: 'Start' },
    { latitude: 40.7614, longitude: -73.9776, instruction: 'End' },
  ]}
  onLocationChange={(location) => {}}
  onSafeZoneEnter={(zone) => {}}
  enableVoiceGuidance={true}
/>
```

## Complete Example

```typescript
import { mainStorage, StorageKeys } from '../utils/storage';
import { speakNavigation } from '../utils/voice';
import KidFriendlyMap from '../components/KidFriendlyMap';

function MyJourney() {
  const handleLocationChange = (location) => {
    mainStorage.set('last_location', location.coords);
  };

  const handleSafeZoneEnter = (zone) => {
    speakNavigation(`You're in ${zone.name}!`);
  };

  return (
    <KidFriendlyMap
      onLocationChange={handleLocationChange}
      onSafeZoneEnter={handleSafeZoneEnter}
    />
  );
}
```

## Testing

```bash
# Run demo
npx expo start

# Test on device
npx expo start --android
npx expo start --ios
```

## Benefits

- ⚡ MMKV: 10x faster than AsyncStorage
- 🎤 Voice: Kid-friendly TTS with queue management
- 🗺️ Maps: Native performance with safe zones
