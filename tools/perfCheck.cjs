#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const DEFAULT_THRESHOLD = Number(process.env.PERF_REGRESSION_THRESHOLD || 0.4); // 40%
const filePath = path.resolve(__dirname, '..', 'coverage', 'perf-timings.json');

function median(arr) {
  const sorted = arr.slice().sort((a,b) => a-b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length === 0) return null;
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid-1] + sorted[mid]) / 2;
}

if (!fs.existsSync(filePath)) {
  console.error('perfCheck: no timings file found at', filePath);
  process.exit(2);
}

const raw = fs.readFileSync(filePath, 'utf8');
let data;
try {
  data = JSON.parse(raw);
} catch (e) {
  console.error('perfCheck: failed to parse JSON', e.message || e);
  process.exit(2);
}

let failed = 0;
for (const [testName, samples] of Object.entries(data)) {
  if (!Array.isArray(samples) || samples.length === 0) continue;
  const last = samples[samples.length -1];
  const med = median(samples.slice(0, -1));
  if (med === null) continue; // not enough history
  const ratio = (last - med) / med;
  if (ratio > DEFAULT_THRESHOLD) {
    console.error(`perfCheck: REGRESSION detected for ${testName}: last=${last}ms median=${med}ms ratio=${(ratio*100).toFixed(1)}%`);
    failed++;
  } else {
    console.log(`perfCheck: OK ${testName}: last=${last}ms median=${med}ms ratio=${(ratio*100).toFixed(1)}%`);
  }
}

if (failed > 0) process.exit(3);
console.log('perfCheck: no regressions detected');
process.exit(0);
