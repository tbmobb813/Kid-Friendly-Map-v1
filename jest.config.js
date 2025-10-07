module.exports = {
  // Use the CommonJS ts-jest preset to keep compatibility with existing test
  // suites and to preserve the `jest` global in tests. If we later migrate to
  // ESM modules, we can switch back to the ESM preset and update tests.
  preset: 'ts-jest',
  testPathIgnorePatterns: [
    '/node_modules/',
    '/bun-tests/'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo|@unimodules|unimodules|sentry-expo|native-base|react-clone-referenced-element|@react-native-community|expo-router|@expo/vector-icons|react-native-svg|react-native-reanimated|@react-navigation|lucide-react-native|@react-native-async-storage)/)',
  ],
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)',
  ],
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'stores/**/*.{ts,tsx}',
    'utils/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^react-native$': '<rootDir>/__mocks__/react-native.js',
    '^expo-constants$': '<rootDir>/__mocks__/expo-constants.js',
    // Provide a stable mock for the local MapLibreMap component so imports during
    // module initialization (before per-test jest.mock calls) get a mocked version
    // that doesn't rely on native modules.
    '^@/components/MapLibreMap$': '<rootDir>/__mocks__/MapLibreMapMock.tsx',
  // Also map any direct relative imports of MapLibreMap to the mock so
  // components that import with './MapLibreMap' or '../MapLibreMap' get the mock.
  '(^|\\./|\\../)MapLibreMap$': '<rootDir>/__mocks__/MapLibreMapMock.tsx',
    // Prefer TypeScript source when both .ts and .js exist
    '^utils/(.*)$': '<rootDir>/utils/$1.ts',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'node',
};
