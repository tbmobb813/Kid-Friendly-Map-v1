// Minimal shim to provide Bun-like test imports for Jest
const { test, expect, describe } = require('@jest/globals');
module.exports = { test, expect, describe };
