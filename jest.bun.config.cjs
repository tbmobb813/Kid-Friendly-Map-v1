module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/bun-tests'],
  testMatch: ['**/?(*.)+(test).[jt]s'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleNameMapper: {
    '^bun:test$': '<rootDir>/__mocks__/bun-test-shim.js',
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  verbose: true,
};
