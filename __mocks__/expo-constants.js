// Minimal CommonJS mock for expo-constants used in tests
// Provides the properties accessed by utils/config.ts
module.exports = {
  expoConfig: {
    version: '1.0.0',
    name: 'Transit Navigator',
  },
  // A reasonable default for status bar height used by Config.PLATFORM.HAS_NOTCH
  statusBarHeight: 20,
};
