// Jest setup file: import shared test utils to hoist module mocks and provide helpers
try {
  require('./__tests__/test-utils');
} catch (e) {
  // If test-utils doesn't exist or errors, don't crash the test runner here.
  // Tests that want to opt-in can still import test-utils directly.
   
  console.warn('jest.setup: failed to load test-utils', e?.message ?? e);
}
// Jest setup file: define RN globals expected by app code
// __DEV__ is normally provided by Metro/React Native. Define it here for tests.
// Run tests in development mode to avoid production crash-reporting side-effects
global.__DEV__ = true;

// Minimal ErrorUtils shim to satisfy React Native global error handling usage
// Provides getGlobalHandler and setGlobalHandler used by utils/logger.ts
global.ErrorUtils = (function () {
  let handler = (error, isFatal) => {
    // default noop handler during tests
    // throw the error so tests see unhandled exceptions unless overridden
    throw error;
  };

  return {
    getGlobalHandler: () => handler,
    setGlobalHandler: (h) => {
      handler = h;
    },
  };
})();

// Provide an in-memory AsyncStorage mock for tests
jest.mock('@react-native-async-storage/async-storage');

// JSDOM / Jest may not provide TextEncoder/TextDecoder used by some server libs
// (formidable / @noble/hashes). Polyfill from Node's util if missing.
try {
  const { TextEncoder, TextDecoder } = require('util');
  if (typeof global.TextEncoder === 'undefined') global.TextEncoder = TextEncoder;
  if (typeof global.TextDecoder === 'undefined') global.TextDecoder = TextDecoder;
} catch (e) {
  // ignore if util is not available in some environments
}

// Increase default test timeout globally to accommodate tests that use timers
if (typeof jest !== 'undefined' && typeof jest.setTimeout === 'function') {
  jest.setTimeout(60000);
}

// Some older JS tests call error handling helpers without importing them.
// Make the common error handling utilities available globally to avoid fragile test order dependencies.
try {
   
  const errorHandling = require('./utils/errorHandling');

  if (errorHandling) {
    global.withRetry = errorHandling.withRetry;
    global.SafeAsyncStorage = errorHandling.SafeAsyncStorage;
    global.DEFAULT_RETRY_CONFIG = errorHandling.DEFAULT_RETRY_CONFIG;
    global.handleLocationError = errorHandling.handleLocationError;
    global.handleNetworkError = errorHandling.handleNetworkError;
    global.handleCameraError = errorHandling.handleCameraError;
    global.createSafetyErrorBoundary = errorHandling.createSafetyErrorBoundary;
  }
} catch (e) {
  // ignore; tests that import directly will still work
}

// Inform React testing utilities that we're in an act() environment
try {
  global.IS_REACT_ACT_ENVIRONMENT = true;
} catch (e) {
  // ignore
}

// Suppress noisy, well-known warnings in test output
const _origConsoleError = console.error;
console.error = (...args) => {
  try {
    const msg = typeof args[0] === 'string' ? args[0] : '' + args[0];
    if (
      msg.includes('react-test-renderer is deprecated') ||
      msg.includes('The current testing environment is not configured to support act')
    ) {
      return;
    }
  } catch (e) {
    // fallthrough
  }
  _origConsoleError.apply(console, args);
};

// Attempt to load jest-native matchers if available. Don't fail tests if it's not installed.
try {
   
  require('@testing-library/jest-native/extend-expect');
} catch (e) {
  // not critical; tests can still run without these matchers
}

// Default performance multiplier to avoid flaky timing tests on slower CI/machines
if (!process.env.PERF_TIME_MULTIPLIER) {
  process.env.PERF_TIME_MULTIPLIER = '2.0';
}
