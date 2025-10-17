# Deploying the Transit Adapter

This guide shows how to build and deploy the Transit Adapter server using Docker and a simple GitHub Actions workflow. It covers local testing, CI secrets, and recommended production considerations.

## Local build & run

Build the image locally:

```bash
cd server
# build image with tag
docker build -t transit-adapter:local .

# run container (mount .env or pass env variables)
docker run -p 3001:3001 -e MTA_API_KEY="$MTA_API_KEY" transit-adapter:local
```

Then call the endpoint (without mock):

```bash
curl 'http://localhost:3001/feeds/nyc/mta-subway.json'
```

For local demo/testing without an MTA key use the mock flag:

```bash
curl 'http://localhost:3001/feeds/nyc/mta-subway.json?mock=1'
```

## GitHub Actions: build & push to Docker Hub (example)

Create a workflow `.github/workflows/deploy-transit-adapter.yml` in your repo with the following snippet (adjust registry and image name):

```yaml
name: Build and push transit adapter
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up QEMU
        uses: docker/setup-qemu-action@v2
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          registry: docker.io
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: ./server
          push: true
          tags: ${{ secrets.DOCKERHUB_USERNAME }}/transit-adapter:latest
```

### Required Secrets (GitHub repository settings)

- `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` (or use GitHub Container Registry credentials instead).
- `MTA_API_KEY` — set this in your deployment environment or CI if you want to hit the real MTA feed from CI (optional for build, required for runtime in production).

### Optional Environment Variables (runtime)

- `API_AUTH_KEY` — if set, clients must send this value via `x-adapter-key` header or `_key` query param.
- `FEED_REFRESH_ENABLED` — set to `false` to disable the background refresh loop (default: enabled).
- `FEED_REFRESH_INTERVAL_SEC` — interval for background refresh worker (default: `30`).
- `PORT` — adapter listen port (default: `3001`).

## Running on a simple cloud VM or container service

- Pull the image and run it with the MTA key set as an environment variable.
- Example (Docker Hub):
  - `docker run -d -p 3001:3001 -e MTA_API_KEY=... youruser/transit-adapter:latest`

## Kubernetes / Cloud Run / App Service notes

- Ensure the `MTA_API_KEY` is stored in the platform's secret manager and injected as an env variable.
- Configure a readiness probe hitting `/feeds/nyc/mta-subway.json?mock=1` or add a separate `/health` endpoint.
- Lock down network access and use a VPC / firewall to restrict who can call the adapter in production (or sit it behind an API gateway with authentication).

## Production hardening checklist

- Add retries and exponential backoff for upstream fetch failures.
- Instrument metrics (Prometheus or cloud metrics) and structured logging.
- Add circuit breaker for failing upstream or rate-limited feeds.
- Enforce TLS and use a reverse proxy or API Gateway for authentication and rate limiting.
- Configure appropriate cache TTLs per-feed.

## GTFS files and MTA API notes

To run the adapter against MTA feeds you will need:

- An MTA API key (register at <https://datamine.mta.info/>) — set this value as the env var named in `feeds.json` (default `MTA_API_KEY`).
- Static GTFS files (optional but recommended) — download the agency-provided GTFS zip(s) and either:
  - place extracted files in `server/static-gtfs/` and run `node tools/import-static-gtfs.js`, or
  - place the GTFS zip and run `node tools/import-static-gtfs.js path/to/gtfs.zip`.

Required GTFS files for the importer:

- `routes.txt`
- `trips.txt`
- `stops.txt`
- `stop_times.txt`

If you plan to use a Postgres-backed store (recommended for production):

- Use `server/db/schema.sql` to create the schema, then either run
  `server/tools/import-to-postgres.js` (simple inserts) or
  `server/tools/import-to-postgres-copy.js` (COPY-based, faster) to load the
  JSON indexes into Postgres.
- The CI workflow `ci-postgres-transit-adapter.yml` demonstrates running
  migrations and importing JSON indexes into Postgres in CI.

## docker-compose (local dev)

Use the included `server/docker-compose.yml` to run a local Postgres and persist data:

```bash
cd server
docker-compose up -d db
# wait for DB, then load schema and import
PG_CONN=postgres://postgres:postgres@localhost:5432/transit
psql $PG_CONN -f db/schema.sql
node tools/import-to-postgres.js # set DATABASE_URL env if needed
node index.js
```

## Reverse proxy and TLS

We include a sample `server/nginx/nginx.conf.sample` that demonstrates a simple
reverse proxy. In production you should terminate TLS at the proxy and forward
traffic to the adapter over a private network. Use your certificate provider
(Let's Encrypt, ACM, etc.) and point the proxy to the adapter process.

To require a client key for the adapter endpoints, set `API_AUTH_KEY` in the adapter environment and clients must include it as `x-adapter-key` header or `_key` query param.

---

If you want, I can also scaffold the GitHub Actions workflow file in the repo (disabled by default) and a simple systemd unit file for a VM. Which do you prefer next?
