# Transit Adapter

Lightweight Express adapter that fetches GTFS-RT (protobuf) feeds, decodes them with `gtfs-realtime-bindings`, normalizes the results to a small JSON schema, and caches responses for a short TTL.

## Quick start

1. From `server/` install dependencies:

```bash
npm install
```

1. Run (provide MTA_API_KEY in env if needed):

```bash
MTA_API_KEY=your_key npm start
```

1. Example request (adapter will accept feed URL as query param):

```http
GET /feeds/nyc/mta-subway.json?url=https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace&key=YOUR_KEY
```

## Notes

- This is intentionally minimal. For production use you should:
  - Map region/system -> feed URL server-side instead of accepting the URL from the client
  - Store API keys securely (env vars or secret manager)
  - Add monitoring & logging and a health endpoint
  - Harden caching, add retries/backoff and circuit-breaker logic
