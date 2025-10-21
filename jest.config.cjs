module.exports = {
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  // Ignore helper module that lives inside __tests__ but isn't a test file
  testPathIgnorePatterns: ['/node_modules/', '/server/__tests__/', '/__tests__/test-utils\.(ts|tsx|js)$'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo|@unimodules|unimodules|sentry-expo|native-base|react-clone-referenced-element|@react-native-community|expo-router|@expo/vector-icons|react-native-svg|react-native-reanimated|@react-navigation|lucide-react-native|@react-native-async-storage)/)',
  ],
  testMatch: ['**/__tests__/**/*.(ts|tsx|js)', '**/*.(test|spec).(ts|tsx|js)'],
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'stores/**/*.{ts,tsx}',
    'utils/**/*.{ts,tsx}',
  '!**/*.d.ts',
  '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 5,
      functions: 5,
      lines: 5,
      statements: 5,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  '^react-native$': '<rootDir>/__mocks__/react-native.js',
  '^react-native/jest/mock$': '<rootDir>/__mocks__/react-native-jest-mock.js',
  '^react-native/jest/setup$': '<rootDir>/__mocks__/react-native-jest-setup.js',
    '^expo-constants$': '<rootDir>/__mocks__/expo-constants.js',
    '^lucide-react-native$': '<rootDir>/__mocks__/lucide-react-native.js',
    '^react-native-svg$': '<rootDir>/__mocks__/react-native-svg.js',
    // Prefer TypeScript source when both .ts and .js exist
    '^utils/(.*)$': '<rootDir>/utils/$1.ts',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // Explicit transforms instead of relying on the ts-jest preset
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { useESM: false }],
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  setupFiles: ['<rootDir>/jest.setup.cjs'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
};
