import { measureAndRecord } from './perfHelper';

test('perf: deterministic sort workload', async () => {
  await measureAndRecord('deterministic-sort-workload', async () => {
    // deterministic PRNG (mulberry32)
    function mulberry32(a: number) {
      return function () {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }

    const rng = mulberry32(0x12345678);
    const n = 20000; // moderate workload
    const arr: number[] = new Array(n);
    for (let i = 0; i < n; i++) arr[i] = Math.floor(rng() * 1000000);
    // sort
    arr.sort((a, b) => a - b);
    // simple warm assertion
    expect(arr[0]).toBeGreaterThanOrEqual(0);
    expect(arr.length).toBe(n);
  });
}, 20000);
