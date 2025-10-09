Running tests
---------

This project separates tests into three suites: frontend, server, and bun-style logic/perf tests.

- To run frontend tests:

```
npm test
```

- To run server tests:

```
npm run test:server
```

- To run bun tests (logic + performance):

```
npm run test:bun
```

Performance tests
-----------------

The bun performance tests include timing-based assertions. To avoid false failures on slower developer machines, use the `PERF_TIME_MULTIPLIER` environment variable locally, e.g.:

```
PERF_TIME_MULTIPLIER=2 npm run test:bun
```

CI will run the strict checks with `PERF_TIME_MULTIPLIER=1`. The nightly workflow runs a strict performance job.
