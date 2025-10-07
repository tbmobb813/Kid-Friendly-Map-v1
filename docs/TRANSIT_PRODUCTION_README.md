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

1. Add metrics & alerts (enrichment rate, fetch failures, request latency).

1. Ensure Postgres backups and a runbook for restore and re-import.

## Roadmap & next steps (priority)

### Immediate

- Add Jest to `server` devDependencies and run unit tests in CI (done in this branch).

### Short-term

- Convert integration logs to structured JSON and emit `enriched_routes` metric.

- Configure CI to run the COPY-based importer within a container (or install `psql` in runner).

- Add shape/geometry import (if you need polylines on the map).

### Medium-term

- Add distributed caching (Redis) if running multiple adapter instances.

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
