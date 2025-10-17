module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/?(*.)+(test).[jt]s'],
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  // No moduleNameMapper required; bun-specific tests were migrated to __tests__
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  verbose: true,
};
