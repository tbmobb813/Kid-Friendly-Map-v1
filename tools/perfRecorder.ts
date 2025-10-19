import fs from 'fs';
import path from 'path';

const outPath = path.resolve(__dirname, '..', 'coverage', 'perf-timings.json');

export function recordTiming(testName: string, ms: number) {
  try {
    const dir = path.dirname(outPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    let data: Record<string, number[]> = {};
    if (fs.existsSync(outPath)) {
      const raw = fs.readFileSync(outPath, 'utf8');
      try {
        data = JSON.parse(raw) as Record<string, number[]>;
      } catch (e) {
        // overwrite on parse failure
        data = {};
      }
    }

    if (!data[testName]) data[testName] = [];
    data[testName].push(ms);

    // Keep only last 50 entries per test to limit file size
    if (data[testName].length > 50) data[testName] = data[testName].slice(-50);

    fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    // Do not fail tests if recording fails

    const e: any = err;
    console.warn('perfRecorder: failed to record timing', e && e.message ? e.message : e);
  }
}
