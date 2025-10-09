module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/bun-tests'],
  testMatch: ['**/?(*.)+(test).[jt]s'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  verbose: true,
};
