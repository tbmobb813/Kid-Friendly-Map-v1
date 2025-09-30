module.exports = {
  // No preset here so Jest will use its defaults. For React Native specific
  // transforms set the preset back to 'react-native' in your local CI.
  // No setupFilesAfterEnv to avoid importing react-native-specific test helpers
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo|@unimodules|unimodules|sentry-expo|native-base|react-clone-referenced-element|@react-native-community|expo-router|@expo/vector-icons|react-native-svg|react-native-reanimated|@react-navigation|lucide-react-native)/)',
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
      '^react-native$': '<rootDir>/__mocks__/react-native.js'
    },
    transform: {
      '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    testEnvironment: 'node',
};
