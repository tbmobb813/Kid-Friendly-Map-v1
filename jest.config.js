export default {
  // Remove preset: 'react-native' to avoid parsing issues with RN's mock files
  testPathIgnorePatterns: ['/node_modules/', '/bun-tests/'],
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
    global: { branches: 70, functions: 70, lines: 70, statements: 70 }
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^react-native$': '<rootDir>/__mocks__/react-native.js',
    '^react-native/jest/mock$': '<rootDir>/__mocks__/react-native-jest-mock.js',
    '^react-native/jest/setup$': '<rootDir>/__mocks__/react-native-jest-setup.js',
    '^expo-constants$': '<rootDir>/__mocks__/expo-constants.js',
    '^@/components/MapLibreMap$': '<rootDir>/__mocks__/MapLibreMapMock.tsx',
    '(^|\\./|\\../)MapLibreMap$': '<rootDir>/__mocks__/MapLibreMapMock.tsx',
    '^MapLibreRouteView$': '<rootDir>/__mocks__/MapLibreRouteView.tsx',
    '^utils/(.*)$': '<rootDir>/utils/$1.ts'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFiles: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-typescript',
        '@babel/preset-react'
      ],
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@maplibre|@maplibre\\/maplibre-react-native|@react-navigation|expo|@expo|@react-native-community)/)'
  ],
};