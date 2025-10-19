import { recordTiming } from '../../tools/perfRecorder';

export async function measureAndRecord(testName: string, fn: () => Promise<any> | any) {
  const start = Date.now();
  let res;
  try {
    res = await fn();
  } finally {
    const ms = Date.now() - start;
    try {
      recordTiming(testName, ms);
    } catch (e) {
      // swallow
    }
  }
  return res;
}
