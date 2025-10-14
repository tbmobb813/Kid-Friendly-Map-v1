// Silence non-error console methods during tests to reduce noise and speed
// Keep NODE_ENV unchanged so React and test renderer stay consistent
global.__DEV__ = false;

// Silence console methods but preserve errors and warns if desired
const noop = () => { };
console.log = noop;
console.info = noop;
console.debug = noop;
