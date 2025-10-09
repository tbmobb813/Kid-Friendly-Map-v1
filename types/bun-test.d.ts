declare module 'bun:test' {
  export const test: typeof import('jest').test;
  export const expect: typeof import('expect');
  export const describe: typeof import('jest').describe;
}
