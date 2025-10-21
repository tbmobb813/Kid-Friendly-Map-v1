#!/usr/bin/env node
// run-eslint.cjs
// A small wrapper that resolves the repository canonical path and invokes
// eslint from there to avoid the "File ignored because outside of base path"
// when the editor or tooling opens the project through a different mount
// or symlink path.
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

try {
  const projectRoot = path.resolve(__dirname, '..');
  const realRoot = fs.realpathSync(projectRoot);

  const userArgs = process.argv.slice(2);
  const args = userArgs.length ? userArgs : ['**/*.{ts,tsx,js,jsx}'];

  // Resolve any absolute paths to realpaths so eslint sees files inside the
  // real project root.
  const normalized = args.map((a) => {
    if (a.startsWith('-')) return a;
    if (a.includes('*')) return a;
    try {
      if (path.isAbsolute(a)) return fs.realpathSync(a);
      const abs = path.resolve(process.cwd(), a);
      return fs.realpathSync(abs);
    } catch (e) {
      return a;
    }
  });

  const eslintPath = path.join(realRoot, 'node_modules', '.bin', 'eslint');
  const useLocal = fs.existsSync(eslintPath);
  const cmd = useLocal ? eslintPath : 'npx';
  const finalArgs = useLocal ? normalized : ['eslint', ...normalized];

  const res = spawnSync(cmd, finalArgs, { cwd: realRoot, stdio: 'inherit' });
  process.exit(res.status || 0);
} catch (err) {
  console.error('run-eslint: failed', err);
  process.exit(2);
}
