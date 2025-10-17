// Background refresh worker test (partial)
process.env.TEST_ENABLE_REFRESH = '1';
process.env.FEED_REFRESH_ENABLED = 'true';
process.env.FEED_REFRESH_INTERVAL_SEC = '1';

jest.mock('../../adapter.js', () => {
  const original = jest.requireActual('../../adapter.js');
  return { ...original, fetchGtfsRt: jest.fn(async () => ({ entity: [] })) };
});

const { startServer, _internal } = require('../../index.js');

describe('Background refresh worker', () => {
  let server;
  beforeAll(() => {
    process.env.PORT = '0'; // Use random available port
    server = startServer();
  });
  afterAll(() => {
    if (server) {
      _internal.stopBackgroundRefresh();
      server.close();
    }
  });

  test('invokes fetchGtfsRt on interval', async () => {
    const { fetchGtfsRt } = require('../../adapter.js');
    expect(fetchGtfsRt).toHaveBeenCalledTimes(0);
    await new Promise((r) => setTimeout(r, 1200));
    expect(fetchGtfsRt).toHaveBeenCalled();
    _internal.stopBackgroundRefresh();
  });
});
