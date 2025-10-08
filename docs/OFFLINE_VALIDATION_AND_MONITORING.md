# Offline Validation and Monitoring Guide

## 📋 Overview

This document covers the comprehensive offline capabilities and application monitoring system implemented in the Kid-Friendly Map app. The system ensures reliable operation in offline scenarios and provides production-grade monitoring for errors, performance, and system health.

---

## 🔌 Offline Capabilities

### Network State Detection

The app continuously monitors network connectivity and automatically adapts to changes:

```typescript
import { offlineManager } from './utils/offlineManager';

// Check current network state
const isOnline = offlineManager.isOnline();
const isOffline = offlineManager.isOffline();

// Get detailed network state
const networkState = offlineManager.getNetworkState();
console.log(networkState);
// {
//   isConnected: true,
//   isInternetReachable: true,
//   type: 'wifi',
//   isWifiEnabled: true
// }

// Listen for network changes
const unsubscribe = offlineManager.addNetworkListener((state) => {
  console.log('Network changed:', state);
});
```

### Network Quality Indicators

```typescript
const quality = offlineManager.getNetworkQuality();
// Returns: 'excellent' | 'good' | 'poor' | 'offline'

// Use for adaptive features
if (quality === 'excellent') {
  // Load high-quality images
} else if (quality === 'offline') {
  // Use cached data only
}
```

---

## 💾 Offline Data Management

### Response Caching

API responses are automatically cached for offline access:

```typescript
import { offlineStorage } from './utils/api';

// Cache response
await offlineStorage.cacheResponse('routes_list', routesData);

// Retrieve cached data
const cached = await offlineStorage.getCachedResponse('routes_list', 5 * 60 * 1000); // 5 min TTL

// Clear all cache
await offlineStorage.clearCache();
```

### Action Queue System

User actions performed while offline are queued and synced when connection is restored:

```typescript
// Queue an action while offline
const actionId = await offlineManager.queueAction(
  'PHOTO_CHECKIN',
  {
    photoUrl: 'file://photo.jpg',
    location: { lat: 40.7128, lng: -74.006 },
    timestamp: Date.now(),
  },
  3, // maxRetries
);

// Check pending actions
const count = offlineManager.getPendingActionsCount();
console.log(`${count} actions pending sync`);

// Force sync when back online
await offlineManager.forcSync();

// Clear all pending actions (if needed)
await offlineManager.clearPendingActions();
```

### Supported Offline Actions

The system handles these action types:

1. **PHOTO_CHECKIN** - Photo check-ins at locations
2. **UPDATE_PROFILE** - User profile updates
3. **SAVE_ROUTE** - Route saves and favorites
4. **ERROR_REPORT** - Error reports for monitoring

---

## 🔄 Sync Mechanism

### Automatic Sync

```typescript
// Sync happens automatically when:
// 1. Device comes back online
// 2. App is foregrounded
// 3. Actions are queued while online

// Manual sync
if (offlineManager.isOnline()) {
  await offlineManager.syncOfflineActions();
}
```

### Retry Strategy

Actions use exponential backoff:

```typescript
// First attempt: immediate
// Retry 1: after 2 seconds
// Retry 2: after 4 seconds
// Retry 3: after 8 seconds
// After max retries: action is dropped with error log
```

### Sync Status Monitoring

```typescript
// Listen for sync events
offlineManager.addNetworkListener((state) => {
  if (state.isConnected) {
    // Sync will trigger automatically
    console.log('Back online, syncing...');
  }
});

// Check if sync is in progress
const pendingCount = offlineManager.getPendingActionsCount();
if (pendingCount > 0) {
  console.log(`Syncing ${pendingCount} actions...`);
}
```

---

## 📊 Application Monitoring

### Initialization

```typescript
import { monitoring } from './utils/monitoring';

// Initialize monitoring system
await monitoring.initialize({
  sentryDsn: process.env.SENTRY_DSN, // Optional
  enablePerformanceMonitoring: true,
  enableUserTracking: true,
  enableCrashReporting: true,
  sampleRate: 1.0, // 100% in dev, reduce in production
  maxBreadcrumbs: 50,
  environment: __DEV__ ? 'development' : 'production',
});
```

### Error Tracking

```typescript
// Capture errors with context
monitoring.captureError({
  error: new Error('Route calculation failed'),
  context: 'AI Route Engine',
  severity: 'high',
  userId: 'user-123', // Optional
  metadata: {
    routeType: 'scenic',
    waypoints: 5,
  },
});

// Severity levels: 'low' | 'medium' | 'high' | 'critical'
```

### Performance Monitoring

```typescript
// Track performance metrics
monitoring.trackPerformance({
  name: 'route_calculation',
  duration: 1250, // milliseconds
  metadata: {
    routeType: 'safest',
    distance: 2.5,
  },
});

// Use performance timer
const endTimer = monitoring.startPerformanceTimer('api_call');
try {
  await fetchData();
} finally {
  endTimer({ endpoint: '/routes' });
}
```

### User Action Tracking

```typescript
// Track user interactions
monitoring.trackUserAction({
  action: 'button_click',
  screen: 'home',
  metadata: {
    buttonId: 'start_navigation',
  },
});

// Track screen views
import { useScreenTracking } from './utils/monitoring';

function HomeScreen() {
  useScreenTracking('home');
  // Component code...
}
```

### System Health Monitoring

```typescript
// Get system health status
const health = monitoring.getSystemHealth();
console.log(health);
// {
//   networkStatus: 'online',
//   backendStatus: 'healthy',
//   storageAvailable: true,
//   memoryPressure: 'low',
//   pendingSyncActions: 0
// }
```

### User Context

```typescript
// Set user context for error tracking
monitoring.setUser('user-123', {
  role: 'parent',
  subscriptionTier: 'premium',
});

// Clear user context (e.g., on logout)
monitoring.clearUser();
```

### Custom Breadcrumbs

```typescript
// Add breadcrumbs for debugging
monitoring.addBreadcrumb('User started navigation to Central Park', 'navigation', {
  destination: 'Central Park',
  routeType: 'scenic',
});
```

### Statistics and Reporting

```typescript
// Get monitoring statistics
const stats = monitoring.getStatistics();
console.log(stats);
// {
//   session: { duration: 123456, startTime: 1696176000000 },
//   errors: { total: 5, rate: 0.5 },
//   performance: { metricsTracked: 42, avgDuration: 250 },
//   userActions: { total: 156, rate: 12.5 },
//   health: { ... }
// }

// Flush all monitoring data
await monitoring.flush();
```

---

## 🧪 Testing

### Running Offline Tests

```bash
# Run offline validation tests
npm run test __tests__/offline-validation.test.ts

# Run monitoring tests
npm run test __tests__/monitoring.test.ts

# Run all tests
npm run test:all
```

### Test Coverage

#### Offline Validation Tests (400+ lines)

- ✅ Network state detection (online/offline transitions)
- ✅ Network quality indicators (excellent/good/poor/offline)
- ✅ Offline action queuing and persistence
- ✅ Cache management (set/get/expire/clear)
- ✅ Sync mechanism with retry logic
- ✅ Data integrity and ordering
- ✅ Edge cases (rapid transitions, empty queues, malformed data)
- ✅ Performance (high-frequency operations)

#### Monitoring Tests (400+ lines)

- ✅ System initialization with various configs
- ✅ Error tracking with different severity levels
- ✅ Performance metric collection
- ✅ User action tracking
- ✅ System health monitoring
- ✅ Memory pressure detection
- ✅ Statistics and reporting
- ✅ Breadcrumb management
- ✅ Integration with offline manager

### Manual Testing Checklist

#### Offline Capabilities

- [ ] **Network Detection**
  - [ ] Turn off WiFi - app detects offline state
  - [ ] Turn off cellular data - app detects offline state
  - [ ] Enable airplane mode - app detects offline state
  - [ ] Restore connection - app detects online state

- [ ] **Offline Actions**
  - [ ] Perform action while offline - gets queued
  - [ ] Check pending actions count - shows queued items
  - [ ] Restore connection - actions sync automatically
  - [ ] Check logs - sync completion logged

- [ ] **Cache Behavior**
  - [ ] Load data while online - data cached
  - [ ] Go offline and reload - cached data displayed
  - [ ] Wait for cache expiry - stale cache removed
  - [ ] Clear cache - all cached data removed

- [ ] **Network Quality**
  - [ ] On WiFi - quality shows "excellent"
  - [ ] On 4G/LTE - quality shows "good"
  - [ ] On 3G/slow connection - quality shows "poor"
  - [ ] Offline - quality shows "offline"

#### Monitoring System

- [ ] **Error Tracking**
  - [ ] Trigger error - logged to console/Sentry
  - [ ] Check error context - includes metadata
  - [ ] Verify severity levels - low/medium/high/critical
  - [ ] Check user context - associated with user

- [ ] **Performance Monitoring**
  - [ ] Perform slow operation - warning logged
  - [ ] Check performance stats - metrics collected
  - [ ] Verify average duration - calculated correctly
  - [ ] Check memory usage - old metrics cleared

- [ ] **User Tracking**
  - [ ] Navigate screens - screen views tracked
  - [ ] Click buttons - actions tracked
  - [ ] Check action rate - calculated correctly
  - [ ] Verify breadcrumbs - added for debugging

- [ ] **System Health**
  - [ ] Check network status - reflects current state
  - [ ] Check backend status - reflects API health
  - [ ] Check memory pressure - low/medium/high
  - [ ] Check pending sync - shows queue count

---

## 🚨 Production Checklist

### Before Launch

#### Offline Configuration

- [ ] Set appropriate cache TTL values for each data type
- [ ] Configure max retry attempts for sync actions
- [ ] Set up offline action queue size limits
- [ ] Test offline behavior with various network conditions

#### Monitoring Configuration

- [ ] Set up Sentry account and get DSN
- [ ] Configure appropriate sample rates (0.1-0.3 for production)
- [ ] Set up error alerts and notifications
- [ ] Configure user privacy settings (remove PII)
- [ ] Test monitoring in staging environment

#### Environment Variables

```bash
# .env.production
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
MONITORING_SAMPLE_RATE=0.2
MONITORING_ENVIRONMENT=production
ENABLE_CRASH_REPORTING=true
ENABLE_PERFORMANCE_TRACKING=true
ENABLE_USER_TRACKING=true
```

### Monitoring Setup

#### Sentry Configuration

1. **Create Sentry Project**
   - Go to https://sentry.io
   - Create new React Native project
   - Copy DSN

2. **Install Sentry SDK**

   ```bash
   npx expo install @sentry/react-native
   ```

3. **Configure Sentry**

   ```typescript
   await monitoring.initialize({
     sentryDsn: process.env.SENTRY_DSN,
     environment: 'production',
     sampleRate: 0.2, // 20% of events
   });
   ```

4. **Set Up Alerts**
   - Configure error rate alerts
   - Set up performance degradation alerts
   - Configure crash alerts for critical errors

#### Alternative Monitoring Options

If not using Sentry, the monitoring system still works with local logging:

- Errors logged to console and local storage
- Performance metrics collected in-memory
- User actions tracked locally
- Health status monitored

---

## 📈 Metrics and KPIs

### Offline Performance

- **Cache Hit Rate**: % of requests served from cache
- **Sync Success Rate**: % of queued actions successfully synced
- **Average Sync Time**: Time to sync all pending actions
- **Queue Depth**: Average number of pending actions

### Monitoring Metrics

- **Error Rate**: Errors per minute/hour
- **Crash-Free Sessions**: % of sessions without crashes
- **Average Response Time**: API call performance
- **Memory Pressure**: % of sessions with high memory usage

### Target Benchmarks

```
✅ Cache Hit Rate: > 60%
✅ Sync Success Rate: > 95%
✅ Average Sync Time: < 2 seconds
✅ Error Rate: < 0.1 per minute
✅ Crash-Free Sessions: > 99%
✅ Average Response Time: < 500ms
✅ High Memory Pressure: < 5% of sessions
```

---

## 🔍 Debugging

### Enable Verbose Logging

```typescript
import { log } from './utils/logger';

// Set log level
log.setLevel('debug'); // 'debug' | 'info' | 'warn' | 'error'

// Check offline manager logs
offlineManager.addNetworkListener((state) => {
  console.log('[Network]', state);
});
```

### View Queued Actions

```typescript
// In development, add debug view
if (__DEV__) {
  console.log('Pending actions:', offlineManager.getPendingActionsCount());

  // Force sync for testing
  await offlineManager.forcSync();
}
```

### Monitor System Health

```typescript
// Add health check component
function HealthMonitor() {
  const [health, setHealth] = React.useState(monitoring.getSystemHealth());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setHealth(monitoring.getSystemHealth());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View>
      <Text>Network: {health.networkStatus}</Text>
      <Text>Backend: {health.backendStatus}</Text>
      <Text>Memory: {health.memoryPressure}</Text>
      <Text>Pending: {health.pendingSyncActions}</Text>
    </View>
  );
}
```

---

## 🎯 Best Practices

### Offline First

1. **Always cache important data**
   - User profiles
   - Recent routes
   - Safety zone information
   - Educational content

2. **Queue user actions gracefully**
   - Show immediate feedback to user
   - Display "Will sync when online" message
   - Show pending action count indicator

3. **Handle sync failures gracefully**
   - Retry with exponential backoff
   - Show user-friendly error messages
   - Allow manual retry option

### Monitoring Best Practices

1. **Don't over-monitor in production**
   - Use sampling (10-30%)
   - Limit breadcrumbs to 50-100
   - Clear old metrics regularly

2. **Protect user privacy**
   - Filter out PII from errors
   - Anonymize user IDs
   - Don't log sensitive data

3. **Set up proper alerts**
   - Critical errors: immediate notification
   - High error rate: hourly digest
   - Performance degradation: daily report

4. **Regular monitoring review**
   - Weekly: Review error trends
   - Monthly: Analyze performance metrics
   - Quarterly: Optimize monitoring config

---

## 🚀 Next Steps

1. **Enable Sentry in Production**
   - Get Sentry DSN
   - Configure environment variables
   - Set up error alerts

2. **Add Custom Dashboards**
   - Create health status dashboard
   - Build offline sync monitor
   - Implement performance charts

3. **Integrate with CI/CD**
   - Add monitoring to build pipeline
   - Upload source maps to Sentry
   - Automate error reporting tests

4. **User Feedback Integration**
   - Add "Report Issue" button
   - Include monitoring context in reports
   - Link user feedback to error events

---

## 📚 References

- [Offline Manager Implementation](../utils/offlineManager.ts)
- [Monitoring System Implementation](../utils/monitoring.ts)
- [Offline Tests](__tests__/offline-validation.test.ts)
- [Monitoring Tests](__tests__/monitoring.test.ts)
- [API Layer with Caching](../utils/api.ts)
- [Error Handling System](../utils/errorHandling.ts)

---

**Status**: ✅ **PRODUCTION READY**

Both offline capabilities and monitoring system are fully implemented, tested, and ready for production deployment with comprehensive test coverage (800+ test lines) and documentation.
