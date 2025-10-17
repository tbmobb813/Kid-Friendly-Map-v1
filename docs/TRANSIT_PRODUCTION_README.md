## Test Strategy & Coverage Goals

Testing is critical for production reliability. The transit adapter test suite includes:

- **Unit tests:** Validate enrichment logic, cache, and utility functions (`server/__tests__/unit`).
- **Integration tests:** Cover API endpoints, importers, and database interactions (`server/__tests__/integration`).
- **End-to-end tests:** Simulate real-world usage, including server startup, API calls, and failover (`server/__tests__/e2e`).

Coverage goals:

- 90%+ for core enrichment and API logic
- 80%+ for importers and cache
- Automated CI runs for all test types

## Shape/Geometry Import (Polylines)

Status: IMPLEMENTED (JSON static import + API enrichment)

The static GTFS importer now parses `shapes.txt` and writes `shape_points_by_shape.json`. The adapter:

- Samples the polyline for each route (≤ ~50 points) and attaches it as `shape` to each route in `/v1/feeds/...` responses when a `trip.shape_id` exists.
- Exposes a raw shape lookup endpoint: `GET /v1/shapes/:shapeId` returning all points `{ lat, lon }`.

Client guidance:

- Use the sampled `route.shape` for map rendering; fetch full shape via `/v1/shapes/:shapeId` only when higher fidelity is needed (progressive enhancement).
- Cache shapes aggressively client-side; they change only when static GTFS is refreshed.

Future enhancements:

- Polyline simplification (Douglas-Peucker) server-side for adaptive detail levels.
- Conditional inclusion via query flag (e.g. `?includeShape=1`) if payload size becomes an issue.

Postgres note: Add a `shapes` table if server-side DB-based shape queries become necessary:

```sql
CREATE TABLE IF NOT EXISTS shapes (
   shape_id TEXT NOT NULL,
   shape_pt_lat DOUBLE PRECISION NOT NULL,
   shape_pt_lon DOUBLE PRECISION NOT NULL,
   shape_pt_sequence INTEGER NOT NULL,
   PRIMARY KEY(shape_id, shape_pt_sequence)
);
CREATE INDEX IF NOT EXISTS idx_shapes_id ON shapes(shape_id);
```

Importer extension IMPLEMENTED (basic incremental insert):
`import-to-postgres.js` now loads `shape_points_by_shape.json` rows into `shapes` with
`ON CONFLICT DO NOTHING`.
Future optimization: switch to COPY for batch performance.

## Advanced Alerting & Dashboarding

- Set up Grafana dashboards for latency, error rate, cache hit ratio, and error budget burn.
- Example panels: p99 latency, cache effectiveness, SLO compliance.
- Export dashboard JSON for reproducibility.

## Staging/Blue-Green Deployment Guidance

- Use k8s Deployments or Cloud Run revisions for zero-downtime deploys.
- Apply schema migrations using staging tables and atomic swaps.
- Document rollback and traffic shifting procedures.

## API Versioning & Backward Compatibility

Status: IMPLEMENTED

- Legacy endpoint: `GET /feeds/:region/:system.json` (will remain for one deprecation window).
- Versioned endpoint: `GET /v1/feeds/:region/:system.json` (adds `version` field, optional `shape` array on routes, future-safe for new fields).
- New endpoint: `GET /v1/shapes/:shapeId` for raw polyline retrieval.

Deprecation plan:

1. Announce target removal date for legacy unversioned path (e.g., 90 days) after clients migrate.
2. Add server log + `Deprecation` response header on legacy requests.
3. Eventually 301 or 410 legacy path, depending on product decision.

Change management:

- All new response fields MUST first ship on versioned endpoint.
- Breaking schema changes require a new version (`/v2/feeds/...`).
- Maintain previous N versions concurrently (policy recommendation: support current and previous version only).

## Security Hardening

- Integrate with API gateway for authentication and rate limiting.
- Enable TLS everywhere; terminate at proxy/gateway.
- Add DDoS protection and audit logging.
- Document incident response and key rotation procedures.

## Compliance & Privacy

- Document data retention and deletion policies.
- Note privacy requirements for user and transit data.
- Reference regulatory standards (GDPR, CCPA, etc.) if applicable.

## Final Checklist Review

- Review all must-have and nice-to-have items for completion.
- Mark deferred or optional items for future work.

## Changelog & Governance

- Update `DOCS_CHANGELOG.md` for every major production change.
- Note documentation ownership and review process.

## Style Guide Reference

- See `STYLE_GUIDE.md` for documentation and code standards.

## Load Testing & SLO Instrumentation

### Load Testing

- Use tools like `k6`, `artillery`, or `wrk` to simulate concurrent requests to `/feeds/:region/:system.json`.
- Example k6 script:

  ```javascript
  import http from 'k6/http';
  export default function () {
    http.get('http://localhost:3001/feeds/nyc/mta-subway.json');
  }
  ```

- Run with increasing VUs (virtual users) and monitor latency, error rate, and cache hit ratio.

### SLO Instrumentation

- Key metrics:
  - `transit_adapter_fetch_duration_seconds` (histogram)
  - `transit_adapter_enriched_routes` (gauge)
  - `transit_adapter_cache_hits_total` / `transit_adapter_cache_misses_total`
  - `transit_adapter_fetch_failures_total`

- Example Prometheus SLO rules:

  ```yaml
  - alert: TransitAdapterHighLatency
     expr: histogram_quantile(0.99, sum(rate(transit_adapter_fetch_duration_seconds_bucket[5m])) by (le)) > 2
     for: 5m
     labels:
        severity: warning
     annotations:
        summary: "Transit adapter p99 request latency >2s"
  - alert: TransitAdapterErrorRate
     expr: increase(transit_adapter_fetch_failures_total[10m]) / increase(transit_adapter_cache_hits_total[10m]) > 0.01
     for: 10m
     labels:
        severity: critical
     annotations:
        summary: "Transit adapter error rate >1%"
  ```

- Review SLOs after load tests and adjust thresholds for production traffic.

### Cache Metrics & Redis Failover Testing

- Prometheus metrics: - `transit_adapter_cache_hits_total{type="redis|memory"}` - `transit_adapter_cache_misses_total{type="redis|memory"}`
- Monitor hit/miss rates to tune cache TTL and sizing.

#### Redis Failover Test

1. Start adapter with Redis enabled (`REDIS_URL`).
2. Stop Redis container/pod and observe adapter logs (should warn and fallback to memory cache).
3. Confirm continued operation and cache metrics switch to `type="memory"`.
4. Restart Redis and verify adapter resumes Redis caching.

## Distributed Caching (Redis)

Enable Redis to share cache across multiple adapter instances for consistent, fast feed responses.

### Setup

- Adapter auto-detects Redis if `REDIS_URL` is set (uses in-memory cache otherwise).
- Add Redis to your deployment: - Docker Compose: see `server/docker-compose.redis.yml` - Kubernetes: see `server/k8s-redis.yaml` and set `REDIS_URL` in ConfigMap or env.
- Use Redis 7+ for best performance and reliability.

### Configuration

- Set `REDIS_URL` (e.g., `redis://localhost:6379` or `redis://redis:6379` in Compose/k8s).
- Adapter will use Redis for all feed cache operations.

### Operational Notes

- Monitor Redis health and memory usage.
- Set up persistence (AOF or RDB) for cache durability if needed.
- Use Redis Sentinel or cloud-managed Redis for HA in production.
- Fallback to in-memory cache if Redis is unavailable (adapter logs warning).

### Monitoring & Failover

- Alert on Redis connection errors or high latency.
- Validate cache hit/miss rates via metrics and logs.

## Secrets Management & Rotation

Securely store and rotate all API keys and sensitive config using a secret manager. Integrate with CI/CD and cloud platforms for automated updates.

### GitHub Actions / CI

- Store secrets in repository settings (`Settings > Secrets and variables > Actions`).
- Reference secrets in workflows as `${{ secrets.MTA_API_KEY }}` etc.
- Rotate keys by updating in the UI or via GitHub CLI (`gh secret set ...`).

### Kubernetes

- Use k8s Secret manifests (see `server/k8s-secrets.yaml`).
- Rotate keys with `kubectl patch` or apply updated manifest.
- Use the provided script:

  ```bash
  ./server/scripts/rotate-secrets.sh MTA_API_KEY new-key-value
  ```

- Restart affected pods to pick up new secrets.

### Cloud Secret Managers

- AWS: Use Secrets Manager (`aws secretsmanager update-secret ...`).
- GCP: Use Secret Manager (`gcloud secrets versions add ...`).
- Azure: Use Key Vault (`az keyvault secret set ...`).
- Reference secrets in deployment config or inject as env vars.

### Rotation Procedures

1. Update secret in manager (UI, CLI, or script).
2. Redeploy or restart services to reload secrets.
3. Audit access and changes regularly.

### Audit Logging & Compliance

- Enable audit logging for all secret access and changes.
- Review logs for unauthorized access or failed rotations.
- Set up alerts for unexpected changes or access patterns.

### Best Practices

- Never commit secrets to source control.
- Use least privilege for secret access.
- Rotate keys regularly (monthly/quarterly or per policy).
- Document rotation schedule and responsible roles.

## Postgres Backup & Restore Runbook

Regular backups are essential for production reliability and compliance. Use the provided script and procedures to automate and monitor backups.

### Backup Script

- See `server/scripts/backup-postgres.sh` for a ready-to-use backup script.
- Usage:

  ```bash
  DATABASE_URL="postgres://postgres:postgres@localhost:5432/transit" ./server/scripts/backup-postgres.sh /path/to/backup_dir
  ```

- The script creates a timestamped, gzipped SQL dump in the specified directory.

### Restore Procedure

1. Stop the adapter and ensure Postgres is running.
2. Restore the backup:

   ```bash
   gunzip -c /path/to/backup_dir/transit_backup_YYYY-MM-DD_HH-MM-SS.sql.gz | psql "$DATABASE_URL"
   ```

3. (Optional) Re-import static GTFS if needed:

   ```bash
   node server/tools/import-static-gtfs.js path/to/gtfs.zip
   DATABASE_URL="$DATABASE_URL" node server/tools/import-to-postgres.js
   ```

### Automation

- Use a cron job or systemd timer to run the backup script nightly:

  ```cron
  0 3 * * * DATABASE_URL=... /path/to/backup-postgres.sh /path/to/backup_dir
  ```

- Store backups in a secure, offsite location with retention policy (e.g., 7-30 days).

### Monitoring & Alerting

- Monitor backup job exit codes and file creation.
- Alert if backup fails or is missing for >24h (Prometheus node exporter or file checks).

- Example Prometheus rule:

  ```yaml
  - alert: PostgresBackupMissing
     expr: absent(transit_backup_last_success_timestamp_seconds) or (time() - transit_backup_last_success_timestamp_seconds > 86400)
     for: 1h
     labels:
        severity: critical
     annotations:
        summary: "No successful Postgres backup in last 24h"
  ```

# Implementation highlights & design decisions

## Transit Adapter — Production Readiness & Integration

This document captures the design, implementation, tests, deployment guidance and immediate next steps
for the transit adapter and GTFS import pipelines built in this repository (branch: `feat/transit`). Use
this file as the canonical reference for future work.

## Overview

- Purpose: a server-side adapter that fetches GTFS-RT (realtime) feeds, normalizes them to a simple JSON
  schema for the client app, and enriches realtime trip updates using static GTFS data (stops, trips,
  routes) stored in Postgres or JSON indexes.

- Main components:
  - `server/index.js` — Express adapter exposing `/feeds/:region/:system.json`, `/health`, `/metrics`.

  - `server/adapter.js` — Feed decoding and normalization logic, async enrichment via `server/lib/gtfsStore-pg.js`.

  - `server/tools/import-static-gtfs.js` — CSV → JSON importer (zip-aware).

  - `server/tools/import-to-postgres.js` — JSON → Postgres importer (staging + swap pattern).

  - `server/tools/import-to-postgres-copy.js` — COPY-based CSV importer (fast; requires `psql`).

  - `server/db/schema.sql` — Minimal GTFS tables (routes, trips, stops, stop_times).

  - `server/lib/gtfsStore-pg.js` — Postgres-backed lookup helpers used by the adapter.

  - CI workflows: JSON-based smoke test and a Postgres-backed CI flow that spins up Postgres and validates enrichment.

## API Contract (adapter)

Endpoint: `GET /feeds/:region/:system.json`

- Query: `?mock=1` for demo/mock feed generation

- Header: `x-adapter-key` (required if `API_AUTH_KEY` is set)

Response shape:

```json
{
   "routes": [
      { "id", "tripId", "name", "systemId", "status", "nextArrival", "destination?", "nextStopName?" }
   ],
   "alerts": [ ... ],
   "lastModified": "..."
}
```

### Implementation details & design decisions

- Adapter decodes GTFS-RT protobufs using `gtfs-realtime-bindings`.

- Enrichment uses either a JSON-based store (`server/data/*.json`) or an async Postgres-backed store (`server/lib/gtfsStore-pg.js`) when `DATABASE_URL` is set.

- In-memory LRU cache for upstream feed fetches is used for short TTL; Postgres is recommended for production enrichment and fast queries.

- Import to Postgres uses a staging table + atomic swap pattern for zero-downtime updates.

- The adapter includes a `?mock=1` mode to enable local testing without upstream API keys.

## Tests

- Unit test for normalization + enrichment exists: `server/__tests__/adapter.enrichment.test.js` (Jest).

- A lightweight node runner is included: `server/tools/run-enrichment-unit-test.js` for running the enrichment check without installing Jest.

- CI includes Postgres-backed job that imports sample GTFS, starts the adapter, and asserts enrichment (the workflow was updated to assert using the mock feed).

## Observability

- Prometheus metrics: fetch duration histogram and fetch failures counter are implemented.

- Integration log added to `server/index.js` to log `enrichedRoutes` count per request using `console.info`. Consider replacing with structured logging in production.

## Security

- API keys are expected via env vars (e.g. `MTA_API_KEY`) and adapter-level protection via `API_AUTH_KEY` header.

- Keep these secrets in a secret manager; do not commit keys.

## Production checklist (must-have)

1. Store and rotate feed API keys and `API_AUTH_KEY` in a secret store.

1. Run scheduled static GTFS imports into Postgres (COPY path recommended). Use the staging/swap pattern.

1. Provide a production deployment (container image, k8s manifest / cloud run set up, LB + TLS termination).

1. Provide a background worker to refresh upstream feeds and warm the cache.
   (Done: background refresh loop with structured logs + refresh metrics in `server/index.js`.
   Controlled via `FEED_REFRESH_ENABLED` (default on) and `FEED_REFRESH_INTERVAL_SEC`).

1. Add metrics & alerts (enrichment rate, fetch failures, request latency).
   (In progress: request + refresh histograms & failure counters implemented.
   TODO: add alerting rules + `enriched_routes` SLO alert & error budget dashboard).

1. Ensure Postgres backups and a runbook for restore and re-import.

## Roadmap & next steps (priority)

## GTFS Import Automation

To keep static GTFS data fresh for enrichment, automate nightly imports using either GitHub Actions or Kubernetes CronJob.

### GitHub Actions (recommended for cloud-native repos)

- See `.github/workflows/nightly-gtfs-import.yml` for a ready-to-use workflow.
- Set `DATABASE_URL` and `GTFS_ZIP_URL` as repository secrets.
- The workflow downloads the GTFS zip, imports to JSON, then loads into Postgres (staging + swap).

### Kubernetes CronJob (recommended for k8s deployments)

- See `server/k8s-gtfs-import-cronjob.yaml` for a sample manifest.
- Reference secrets for `DATABASE_URL` and `GTFS_ZIP_URL`.
- The job runs nightly, importing GTFS and updating Postgres atomically.

### Manual/VM Automation

- Use a systemd timer or cron job to run:

  ```bash
  curl -L "$GTFS_ZIP_URL" -o gtfs.zip
  node server/tools/import-static-gtfs.js gtfs.zip
  DATABASE_URL="$DATABASE_URL" node server/tools/import-to-postgres.js
  DATABASE_URL="$DATABASE_URL" node server/tools/import-to-postgres-copy.js || echo "COPY import skipped"
  ```

### Notes

- Always use the staging + swap pattern for zero-downtime updates.
- Monitor import logs and set up alerting for failures.

## Request Latency SLO & Alerting Guidance

### SLO Targets

- **Request latency:** 95% of `/feeds/:region/:system.json` requests should complete in <1s (p99 <2s).
- **Enriched routes:** At least 90% of requests should return ≥1 enriched route (destination or nextStopName).

### Prometheus Metrics

- `transit_adapter_fetch_duration_seconds` — histogram of request fetch durations
- `transit_adapter_enriched_routes` — gauge of enriched routes per request

### Example Prometheus Alert Rules

```yaml
groups:
   - name: transit-adapter
      rules:
         - alert: TransitAdapterHighLatency
            expr: histogram_quantile(0.99, sum(rate(transit_adapter_fetch_duration_seconds_bucket[5m])) by (le)) > 2
            for: 5m
            labels:
               severity: warning
            annotations:
               summary: "Transit adapter p99 request latency >2s"
         - alert: TransitAdapterLowEnrichment
            expr: avg_over_time(transit_adapter_enriched_routes[10m]) < 1
            for: 10m
            labels:
               severity: critical
            annotations:
               summary: "Transit adapter returning no enriched routes"
```

### Operational Guidance

- Tune alert thresholds to match user experience goals and backend capacity.
- Add dashboards for latency, enrichment rate, and error budget burn.
- Review SLOs quarterly and adjust as needed for real-world load.

### Immediate

- Add Jest to `server` devDependencies and run unit tests in CI (done in this branch).

### Short-term

- Convert integration logs to structured JSON and emit `enriched_routes` metric. (Partial: enrichment log JSON already present; metric emitted via gauge.)

- Configure CI to run the COPY-based importer within a container (or install `psql` in runner). (In progress)

- Add Postgres-backed shapes ingestion and sampling (static JSON version complete; DB ingestion planned).

### Medium-term

- Add distributed caching (Redis) if running multiple adapter instances. (Implemented with auto-detect `REDIS_URL`.)
- Implement shape DB importer + server-side simplification pipeline.

### Long-term

- Load test and SLOs, surfacing any scaling issues; instrument and alert on enrichment regressions.

## How to run locally (quickstart)

1. Start Postgres

```bash
docker compose -f server/docker-compose.yml up -d
```

1. Apply schema

```bash
docker exec -i $(docker ps --filter name=server-db-1 --format '{{.ID}}') psql -U postgres -d transit -f - < server/db/schema.sql
```

1. Prepare & import static GTFS to JSON

```bash
node server/tools/prepare-sample-gtfs.js
node server/tools/import-static-gtfs.js server/static-gtfs
```

1. Import JSON -> Postgres

```bash
DATABASE_URL="postgres://postgres:postgres@localhost:5432/transit" node server/tools/import-to-postgres.js
```

1. Start adapter

```bash
DATABASE_URL="postgres://postgres:postgres@localhost:5432/transit" node server/index.js
```

1. Test mock endpoint

```bash
curl 'http://localhost:3001/feeds/nyc/mta-subway.json?mock=1' | jq '.'
```

## Contacts

Owner: transit adapter work — see PR #2 on this repo for history and recent commits.

---

This file was autogenerated from the feature branch work and local verification on the `feat/transit` branch. Update as the adapter evolves.
