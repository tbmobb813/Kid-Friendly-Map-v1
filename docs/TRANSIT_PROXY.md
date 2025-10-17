# Transit Proxy (server + client hook)

This project includes a small transit adapter server under `server/` and a lightweight React hook and
preview component to consume it.

What was added in this change:

- `hooks/useTransitFeed.ts` — React Query hook to fetch `/feeds/:region/:system.json` from the adapter.

- `components/TransitPreview.tsx` — tiny UI component that uses the hook in `mock` mode.

Server notes:

- The server is already present under `server/` and exposes `/feeds/:region/:system.json` (see `server/feeds.json`).

- By default, the `nyc` -> `mta-subway` entry points to the MTA GTFS-RT ACE feed. If your target feed is
  public, you can leave `MTA_API_KEY` unset; otherwise set it in your environment when starting the
  server.

- Start the server from `server/`:

```bash
cd server
npm install
npm start
```

Using the client hook:

- The hook defaults to `baseUrl=http://localhost:3001` and will fetch `/feeds/nyc/mta-subway.json`.

- Use mock mode to render sample data without calling MTA: `useTransitFeed({ mock: true })` or set the `mock` option in the hook call.

Next steps / improvements:

- Add TypeScript types to the server responses for stronger client typing.

- Add `stations.json` generation/import scripts (MTAPI has `make_stations_csv.py` if you want full station grouping).

- Add an authenticated proxy token if you plan to expose the proxy to the public.
