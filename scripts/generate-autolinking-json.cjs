#!/usr/bin/env node
// generate-autolinking-json.cjs
// Usage: node generate-autolinking-json.cjs <outPath> [platform]
// Produces JSON autolinking metadata for React Native/Expo autolinking.

const { spawnSync } = require('child_process');
const { writeFileSync, mkdirSync } = require('fs');
const fs = require('fs');
const { resolve, join } = require('path');

function log(...args) { console.log('[autolink-gen]', ...args); }

async function main() {
  try {
    const outPath = process.argv[2];
    const platform = process.argv[3] || 'android';
    if (!outPath) {
      console.error('Usage: node generate-autolinking-json.cjs <outPath> [platform]');
      process.exit(2);
    }

    const projectRoot = resolve(__dirname, '..');

    // Try to resolve expo-modules-autolinking from the project root.
    let cliPath = null;
    try {
      // Prefer the package's JS entry (bin) if available
      const modPkg = require.resolve('expo-modules-autolinking/package.json', { paths: [projectRoot] });
      const pkg = require(modPkg);
      if (pkg && pkg.bin) {
        // If bin is an object, pick the first entry; if string, use it.
        if (typeof pkg.bin === 'string') cliPath = join(require('path').dirname(modPkg), pkg.bin);
        else if (typeof pkg.bin === 'object') {
          const first = Object.values(pkg.bin)[0];
          cliPath = join(require('path').dirname(modPkg), first);
        }
      }
    } catch (e) {
      // ignore; will fallback to npx invocation
    }

    // Fallback: try the known bin location inside node_modules
    if (!cliPath) {
      try {
        cliPath = require.resolve('expo-modules-autolinking/bin/expo-modules-autolinking.js', { paths: [projectRoot] });
      } catch (e) {
        // ignore
      }
    }

    const outDir = require('path').dirname(outPath);
    mkdirSync(outDir, { recursive: true });

    let result;
    if (cliPath) {
      log('Using expo-modules-autolinking at', cliPath);
      // Run node <cliPath> --platform <platform> --json (some versions support --json)
      const args = [cliPath, '--platform', platform, '--json'];
      result = spawnSync(process.execPath, args, { cwd: projectRoot, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    } else {
      log('expo-modules-autolinking not resolvable; falling back to npx.');
      // Try npx expo-modules-autolinking --platform <platform> --json
      result = spawnSync('npx', ['--yes', 'expo-modules-autolinking', '--platform', platform, '--json'], { cwd: projectRoot, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    }

    if (result.error) {
      log('Failed to execute autolinking CLI:', result.error && result.error.message || result.error);
      process.exit(3);
    }

    const stdout = result.stdout ? result.stdout.toString().trim() : '';
    const stderr = result.stderr ? result.stderr.toString().trim() : '';

    if (stderr) log('autolinking stderr:', stderr.split('\n').slice(0,20).join('\n'));

    // Best-effort: If stdout looks like JSON, write it directly.
    const isJson = stdout && (stdout.startsWith('{') || stdout.startsWith('['));
    if (isJson) {
      writeFileSync(outPath, stdout, 'utf8');
      log('Wrote autolinking JSON to', outPath, `(${Buffer.byteLength(stdout, 'utf8')} bytes)`);
      // Prune entries referencing missing JNI codegen directories to avoid
      // producing Android-autolinking.cmake add_subdirectory entries that
      // point to non-existent paths (which causes CMake to fail).
      tryPruneMissingJNI(outPath);
      process.exit(result.status || 0);
    }

    // Some versions of the CLI may print additional logs; attempt to extract JSON substring.
    const firstBrace = stdout.indexOf('{');
    if (firstBrace !== -1) {
      const jsonPart = stdout.slice(firstBrace);
      try {
        JSON.parse(jsonPart);
        writeFileSync(outPath, jsonPart, 'utf8');
        log('Extracted and wrote autolinking JSON to', outPath);
        tryPruneMissingJNI(outPath);
        process.exit(result.status || 0);
      } catch (e) {
        // fall through
      }
    }

    // If we get here, stdout didn't contain JSON. Some invocations may write a Java provider to stdout
    // or create files in the filesystem. In that case, attempt to run the CLI with explicit output
    // file if supported (older/newer variants differ). Try running with '--output' or '--out' flags.
    const tryOutputs = ['--output', '--out', '--package-list-output'];
    for (const flag of tryOutputs) {
      const args = cliPath ? [cliPath, flag, outPath, '--platform', platform] : ['--yes', 'expo-modules-autolinking', flag, outPath, '--platform', platform];
      const cmd = cliPath ? process.execPath : 'npx';
      const spawnArgs = cliPath ? args : args;
      const r = spawnSync(cliPath ? process.execPath : 'npx', spawnArgs, { cwd: projectRoot, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
      if (r.error) continue;
      const s = r.stdout ? r.stdout.toString().trim() : '';
      const e = r.stderr ? r.stderr.toString().trim() : '';
      if (s && (s.startsWith('{') || s.startsWith('['))) {
        writeFileSync(outPath, s, 'utf8');
        log('Wrote autolinking JSON via', flag, 'to', outPath);
        tryPruneMissingJNI(outPath);
        process.exit(r.status || 0);
      }
      if (require('fs').existsSync(outPath) && require('fs').statSync(outPath).size > 0) {
        log('Detected output file created by CLI at', outPath);
        tryPruneMissingJNI(outPath);
        process.exit(r.status || 0);
      }
    }

    console.error('Autolinking CLI did not produce JSON output. Stdout first 1k bytes:\n', stdout.slice(0, 1024));
    process.exit(4);
  } catch (err) {
    console.error('Autolinking generator failed:', err && err.stack ? err.stack : err);
    process.exit(5);
  }
}

main();

// Remove dependencies from autolinking.json that reference Android JNI
// codegen directories which do not exist on disk. This avoids generating
// CMake add_subdirectory() lines that point at missing folders and cause
// CMake configure to fail.
function tryPruneMissingJNI(outPath) {
  try {
    if (!fs.existsSync(outPath)) return;
    const raw = fs.readFileSync(outPath, 'utf8');
    const js = JSON.parse(raw);
    if (!js || !js.dependencies) return;
    const deps = js.dependencies;
    const removed = [];
    Object.keys(deps).forEach((name) => {
      const info = deps[name];
      const plat = info && info.platforms && info.platforms.android;
      if (plat && plat.cmakeListsPath) {
        // The CMakeLists.txt path's parent directory should exist (jni folder)
        const dir = require('path').dirname(plat.cmakeListsPath);
        if (!fs.existsSync(dir)) {
          removed.push(name);
          delete deps[name];
        }
      }
    });
    if (removed.length > 0) {
      fs.writeFileSync(outPath, JSON.stringify(js, null, 2), 'utf8');
      log('Pruned missing JNI dependencies from autolinking.json:', removed);
    }
  } catch (e) {
    log('Failed to prune autolinking.json:', e && e.message ? e.message : e);
  }
}
