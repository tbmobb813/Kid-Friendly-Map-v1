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
    branches: [ main ]

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

---
If you want, I can also scaffold the GitHub Actions workflow file in the repo (disabled by default) and a simple systemd unit file for a VM. Which do you prefer next?
