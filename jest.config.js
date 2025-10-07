export default {
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
    '^expo-constants$': '<rootDir>/__mocks__/expo-constants.js',
    '^@/components/MapLibreMap$': '<rootDir>/__mocks__/MapLibreMapMock.tsx',
    '(^|\\./|\\../)MapLibreMap$': '<rootDir>/__mocks__/MapLibreMapMock.tsx',
    '^utils/(.*)$': '<rootDir>/utils/$1.ts'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest'
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'node'
};