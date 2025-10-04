// Minimal CommonJS mock for expo-constants used in tests
// Provides the properties accessed by utils/config.ts
module.exports = {
  expoConfig: {
    version: '1.0.0',
    name: 'Transit Navigator',
    extra: {
      monitoring: {
        enabled: false,
        sentryDsn: '',
        environment: 'test',
        tracesSampleRate: 0.1,
        autoSessionTracking: false,
        profileSampleRate: 0,
      },
      analytics: {
        enabled: false,
        batchSize: 10,
        flushInterval: 30000,
        plausible: {
          enabled: false,
          endpoint: '',
          siteId: '',
          sharedKey: '',
          defaultUrl: 'https://app.kidfriendlymap.example',
          source: 'kid-map-app',
        },
        privacy: {
          defaultOptIn: false,
        },
      },
    },
  },
  // A reasonable default for status bar height used by Config.PLATFORM.HAS_NOTCH
  statusBarHeight: 20,
};
