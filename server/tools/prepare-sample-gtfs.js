const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'static-gtfs');
if (!fs.existsSync(dir)) process.exit(0);
for (const f of fs.readdirSync(dir)) {
  if (f.startsWith('sample_')) {
    const target = path.join(dir, f.replace('sample_', ''));
    fs.copyFileSync(path.join(dir, f), target);
  }
}
console.log('prepared sample GTFS files');
