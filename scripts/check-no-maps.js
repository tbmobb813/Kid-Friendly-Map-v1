// Prevent accidental installs of react-native-maps or expo-maps which conflict with MapLibre
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const pkgPath = path.join(projectRoot, 'package.json');

function readPkg() {
  try {
    return JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  } catch (e) {
    return null;
  }
}

function check() {
  const pkg = readPkg();
  if (!pkg) return 0;
  const deps = Object.assign({}, pkg.dependencies || {}, pkg.devDependencies || {}, pkg.optionalDependencies || {});
  const forbidden = ['react-native-maps', 'expo-maps'];
  const present = forbidden.filter((n) => deps[n]);
  if (present.length > 0) {
    console.error('\n\u001b[31mError: Detected forbidden map packages in package.json:\u001b[0m', present.join(', '));
    console.error('This project uses MapLibre natively and installing react-native-maps or expo-maps causes native conflicts (duplicate view registrations).');
    console.error('Remove these packages from package.json and run `npm install` again.');
    return 1;
  }
  return 0;
}

process.exitCode = check();
