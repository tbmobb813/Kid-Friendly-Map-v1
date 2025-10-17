declare module 'bun:test' {
  // Use Jest's globals types so `expect` is callable and matches Jest's matcher API
  export const test: typeof import('@jest/globals').test;
  export const expect: typeof import('@jest/globals').expect;
  export const describe: typeof import('@jest/globals').describe;
}
