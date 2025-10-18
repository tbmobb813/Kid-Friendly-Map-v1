// Canonical test helper loader
// This file re-exports the legacy simple renderer helpers and the hoisted
// test helpers defined in `__tests__/test-utils.tsx`. Tests should import
// from this location (tests/test-utils) to avoid TypeScript resolution issues
// when referencing './test-utils' from inside __tests__.

// Load legacy JS helpers (kept for backward compatibility)
let legacy = {};
try {
  legacy = require('../__tests__/test-utils.js');
} catch (e) {
  // If legacy helper not present, continue
}

// Load the hoisted TSX helper (exports named mocks/helpers)
let hoisted = {};
try {
  hoisted = require('../__tests__/test-utils.tsx');
} catch (e) {
  // TS helper may not be resolvable in some contexts; fall back to legacy only
}

// Compose exports: legacy APIs (simpleRender, getByTestId, etc.) plus
// hoisted helpers (map mocks, resetAll, setORSApiKey, etc.). Prefer hoisted
// definitions when available.
const composed = {
  // Legacy simple renderer helpers
  simpleRender: legacy.simpleRender || hoisted.simpleRender,
  getByTestId: legacy.getByTestId || hoisted.getByTestId,
  queryByTestId: legacy.queryByTestId || hoisted.queryByTestId,
  fireEvent: legacy.fireEvent || hoisted.fireEvent,
  act: legacy.act || hoisted.act,

  // Hoisted helpers exported from __tests__/test-utils.tsx
  setExpoLocationStatus: hoisted.setExpoLocationStatus,
  setExpoLocationCoords: hoisted.setExpoLocationCoords,
  resetExpoLocationMocks: hoisted.resetExpoLocationMocks,
  setORSApiKey: hoisted.setORSApiKey,
  getMapViewWrapperMock: hoisted.getMapViewWrapperMock,
  getLastFloatingMenuProps: hoisted.getLastFloatingMenuProps,
  getTestMapHost: hoisted.getTestMapHost,
  TestMapHost: hoisted.TestMapHost,
  resetAll: hoisted.resetAll,
};

module.exports = composed;
