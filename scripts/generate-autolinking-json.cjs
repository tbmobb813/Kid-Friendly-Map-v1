#!/usr/bin/env node
// Wrapper to call android/scripts/generate-autolinking-json.cjs with a default output
const path = require('path');
const child = require('child_process');

const outDefault = path.join('android', 'build', 'generated', 'autolinking', 'autolinking.json');
const args = process.argv.slice(2);
// If user provided an explicit path, pass it through; otherwise use default
let outArg = outDefault;
if (args.length >= 1 && !args[0].startsWith('-')) {
  outArg = args[0];
}

const scriptPath = path.join(__dirname, '..', 'android', 'scripts', 'generate-autolinking-json.cjs');
const node = process.execPath || 'node';
const spawnArgs = [scriptPath, outArg, 'android'];
console.log('Running autolinking wrapper:', node, spawnArgs.join(' '));
const rc = child.spawnSync(node, spawnArgs, { stdio: 'inherit' });
process.exit(rc.status === null ? 1 : rc.status);
