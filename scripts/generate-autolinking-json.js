#!/usr/bin/env node
'use strict';
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const repoRoot = path.resolve(__dirname, '..');
const target = process.argv[2] || path.join(repoRoot, 'android', 'build', 'generated', 'autolinking', 'autolinking.json');
const platform = process.argv[3] || 'android';

const cli = path.join(repoRoot, 'node_modules', 'expo-modules-autolinking', 'bin', 'expo-modules-autolinking.js');

if (!fs.existsSync(cli)) {
  console.error('expo-modules-autolinking CLI not found at', cli);
  process.exit(1);
}

fs.mkdirSync(path.dirname(target), { recursive: true });

const node = process.execPath || 'node';
const args = [cli, 'react-native-config', '--platform', platform, '--json'];

const proc = spawn(node, args, { stdio: ['ignore', 'pipe', 'inherit'], cwd: repoRoot });

const outStream = fs.createWriteStream(target);
proc.stdout.pipe(outStream);

proc.on('close', code => {
  outStream.end();
  if (code !== 0) {
    console.error(`autolinking CLI exited with code ${code}`);
    process.exit(code);
  } else {
    console.log(`Wrote autolinking JSON to ${target}`);
    process.exit(0);
  }
});
