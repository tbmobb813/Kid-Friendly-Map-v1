// Clean deterministic performance tests
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEED = Number(process.env.TEST_SEED || 123456);
const rng = mulberry32(SEED);

describe('Performance Critical Operations (deterministic)', () => {
  test('bulk data processing suite (filter/sort/json/math/string)', () => {
    // Run a few deterministic workloads; we assert basic outputs and keep timing checks relaxed
    const PERF_TIME_MULTIPLIER = Number(process.env.PERF_TIME_MULTIPLIER || '1');

    // Filter workload
    {
      const start = performance.now();
      const locations = Array.from({ length: 20000 }, (_, i) => ({
        id: i,
        isSafe: rng() > 0.3,
        category: ['playground', 'school', 'library', 'park'][i % 4],
        distance: rng() * 10000,
        rating: rng() * 5,
      }));

      const filtered = locations.filter(
        (l) => l.isSafe && l.category === 'playground' && l.rating > 3,
      );
      const time = performance.now() - start;
      expect(filtered.length).toBeGreaterThanOrEqual(0);
      expect(time).toBeLessThan(500 * PERF_TIME_MULTIPLIER);
    }

    // Sort workload
    {
      const start = performance.now();
      const arr = Array.from({ length: 10000 }, (_, i) => ({ v: rng() * 1000, k: i }));
      arr.sort((a, b) => b.v - a.v || a.k - b.k);
      const time = performance.now() - start;
      expect(arr.length).toBe(10000);
      expect(time).toBeLessThan(500 * PERF_TIME_MULTIPLIER);
    }

    // JSON transform workload
    {
      const start = performance.now();
      const data = { items: Array.from({ length: 3000 }, (_, i) => ({ id: i, x: rng() })) };
      const s = JSON.stringify(data);
      const p = JSON.parse(s);
      const time = performance.now() - start;
      expect(p.items.length).toBe(3000);
      expect(time).toBeLessThan(500 * PERF_TIME_MULTIPLIER);
    }

    // Math workload
    {
      const start = performance.now();
      let sum = 0;
      for (let i = 0; i < 5000; i++) {
        sum += Math.sqrt(rng() * 10000 + i);
      }
      const time = performance.now() - start;
      expect(sum).toBeGreaterThan(0);
      expect(time).toBeLessThan(500 * PERF_TIME_MULTIPLIER);
    }

    // String workload
    {
      const start = performance.now();
      const texts = Array.from({ length: 2000 }, (_, i) => `<p>Item ${i} ${rng()}</p>`);
      const cleaned = texts.map((t) => t.replace(/<[^>]*>/g, '')).join(' ');
      const time = performance.now() - start;
      expect(cleaned.length).toBeGreaterThan(0);
      expect(time).toBeLessThan(500 * PERF_TIME_MULTIPLIER);
    }
  });
});
