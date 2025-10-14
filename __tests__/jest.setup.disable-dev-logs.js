// Disable dev logging and set production environment for faster tests
process.env.NODE_ENV = 'production';
global.__DEV__ = false;

// Silence console methods optionally (keep errors)
const noop = () => { };
console.log = noop;
console.info = noop;
console.debug = noop;
console.warn = noop;
