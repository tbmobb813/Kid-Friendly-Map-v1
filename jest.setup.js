// Jest setup file: define RN globals expected by app code
// __DEV__ is normally provided by Metro/React Native. Define it here for tests.
// Run tests in development mode to avoid production crash-reporting side-effects
global.__DEV__ = true;

// Minimal ErrorUtils shim to satisfy React Native global error handling usage
// Provides getGlobalHandler and setGlobalHandler used by utils/logger.ts
global.ErrorUtils = (function() {
	let handler = (error, isFatal) => {
		// default noop handler during tests
		// throw the error so tests see unhandled exceptions unless overridden
		throw error;
	};

	return {
		getGlobalHandler: () => handler,
		setGlobalHandler: (h) => { handler = h; },
	};
})();

// Provide an in-memory AsyncStorage mock for tests
jest.mock('@react-native-async-storage/async-storage');
