module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/server/__tests__'],
  testMatch: ['**/?(*.)+(test).[jt]s'],
  collectCoverageFrom: ['server/**/*.js','!server/**/node_modules/**'],
  transform: {
    '^.+\\.(js)$': 'babel-jest'
  },
  moduleFileExtensions: ['js','json','node'],
  verbose: true,
};
