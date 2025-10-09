// Minimal Jest stub to avoid parsing react-native's complex mock.js during tests.
// Keep this file very small and pure CommonJS to prevent parser issues.
module.exports = function () {
  // react-native/jest/mock exports a function used by some RN preset utilities.
  // We provide a noop so tests don't attempt to parse the upstream file.
  return {};
};
