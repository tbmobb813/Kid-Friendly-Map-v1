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
// Provide an in-memory AsyncStorage mock for tests (explicit implementation)
jest.mock('@react-native-async-storage/async-storage', () => {
	const store = new Map();

	const asyncStorage = {
		getItem: jest.fn((key) => Promise.resolve(store.has(key) ? store.get(key) : null)),
		setItem: jest.fn((key, value) => { store.set(key, value); return Promise.resolve(); }),
		removeItem: jest.fn((key) => { store.delete(key); return Promise.resolve(); }),
		clear: jest.fn(() => { store.clear(); return Promise.resolve(); }),
		// Additional methods used by the app
		getAllKeys: jest.fn(() => Promise.resolve(Array.from(store.keys()))),
		multiGet: jest.fn((keys) => Promise.resolve(keys.map(k => [k, store.has(k) ? store.get(k) : null]))),
		multiSet: jest.fn((entries) => { entries.forEach(([k, v]) => store.set(k, v)); return Promise.resolve(); }),
		multiRemove: jest.fn((keys) => { keys.forEach(k => store.delete(k)); return Promise.resolve(); }),
		mergeItem: jest.fn((key, value) => { const existing = store.get(key); try {
			const merged = existing ? JSON.stringify(Object.assign(JSON.parse(existing), JSON.parse(value))) : value;
			store.set(key, merged);
			return Promise.resolve();
		} catch (e) {
			// fallback to overwrite if parse/merge fails
			store.set(key, value);
			return Promise.resolve();
		} }),
	};

	return {
		__esModule: true,
		default: asyncStorage,
	};
});

// Mock @react-native-community/netinfo with a simple interface used by the app
jest.mock('@react-native-community/netinfo', () => ({
	__esModule: true,
	default: {
		addEventListener: jest.fn(() => jest.fn()),
		fetch: jest.fn(() => Promise.resolve({ isConnected: true, isInternetReachable: true })),
	},
	// also export named constant used in some modules
	useNetInfo: () => ({ isConnected: true, isInternetReachable: true }),
}));
