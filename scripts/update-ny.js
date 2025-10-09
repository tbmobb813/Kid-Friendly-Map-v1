import { transitDataUpdater } from '@/utils/transitDataUpdater';
async function run() {
  try {
    const res = await transitDataUpdater.updateRegionTransitData('nyc');
    console.log('Update result:', res);
  } catch (e) {
    console.error('Update failed:', e);
  }
}
run();
