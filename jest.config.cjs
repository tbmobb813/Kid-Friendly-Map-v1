module.exports = {
  preset: 'ts-jest',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  globals: {
    'ts-jest': {},
  },
<<<<<<< HEAD
  testPathIgnorePatterns: ['/node_modules/', '/bun-tests/'],
=======
  testPathIgnorePatterns: ['/node_modules/', '/bun-tests/', '/server/__tests__/'],
>>>>>>> feat/transit
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
<<<<<<< HEAD
    '!**/node_modules/**',
=======
    '!**/node_modules/**'
>>>>>>> feat/transit
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
<<<<<<< HEAD
=======
    '^react-native/jest/mock$': '<rootDir>/__mocks__/react-native-jest-mock.js',
    '^react-native/jest/setup$': '<rootDir>/__mocks__/react-native-jest-setup.js',
>>>>>>> feat/transit
    '^expo-constants$': '<rootDir>/__mocks__/expo-constants.js',
    '^lucide-react-native$': '<rootDir>/__mocks__/lucide-react-native.js',
    '^react-native-svg$': '<rootDir>/__mocks__/react-native-svg.js',
    // Prefer TypeScript source when both .ts and .js exist
    '^utils/(.*)$': '<rootDir>/utils/$1.ts',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
<<<<<<< HEAD
  setupFiles: ['<rootDir>/jest.setup.js'],
=======
  setupFiles: ['<rootDir>/jest.setup.cjs'],
>>>>>>> feat/transit
  testEnvironment: 'jsdom',
};
