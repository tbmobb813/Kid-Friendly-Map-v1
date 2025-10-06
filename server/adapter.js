// Use global fetch when available (Node 18+). Otherwise dynamically import node-fetch.
let fetchFn = globalThis.fetch;
if (!fetchFn) {
  fetchFn = async (...args) => {
    const m = await import('node-fetch');
    return m.default(...args);
  };
}
const GtfsRealtimeBindings = require('gtfs-realtime-bindings');
let gtfsStore;
try {
  gtfsStore = require('./lib/gtfsStore');
} catch (e) {
  gtfsStore = null;
}

// Normalize a GTFS-RT FeedMessage into { routes, alerts }
function normalizeFeedMessage(feed, systemId) {
  const routes = [];
  const alerts = [];

  if (!feed || !feed.entity) return { routes, alerts };

  for (const entity of feed.entity) {
    if (entity.trip_update) {
      const tu = entity.trip_update;
      const routeId = tu.trip && tu.trip.route_id ? tu.trip.route_id : (tu.vehicle && tu.vehicle.trip && tu.vehicle.trip.route_id) || null;
      let nextArrival = null;
      if (tu.stop_time_update && tu.stop_time_update.length) {
        const now = Math.floor(Date.now() / 1000);
        const next = tu.stop_time_update.find(stu => stu.arrival && stu.arrival.time && stu.arrival.time > now);
        if (next) {
          nextArrival = Math.max(0, Math.floor((next.arrival.time - now) / 60));
        }
      }

      routes.push({
        id: `${systemId}-${tu.trip.trip_id || entity.id || Math.random().toString(36).slice(2)}`,
        name: routeId || tu.trip.route_id || 'unknown',
        systemId,
        status: nextArrival === null ? 'unknown' : (nextArrival > 5 ? 'delayed' : 'on-time'),
        nextArrival,
        // enrich with static GTFS where possible
        destination: undefined,
        nextStopName: undefined
      });
      // populate nextStopName using stop_time_update + gtfsStore if available
      if (gtfsStore && tu.stop_time_update && tu.stop_time_update.length) {
        try {
          if (typeof gtfsStore.getNextStopsForTrip === 'function') {
            const nextStops = gtfsStore.getNextStopsForTrip(tu.trip && tu.trip.trip_id, 1);
            if (nextStops && nextStops.length) normalized.routes[normalized.routes.length - 1].nextStopName = nextStops[0].stop_name;
          }
        } catch (e) {
          // ignore missing static GTFS
        }
      }
      if (gtfsStore && tu.trip && tu.trip.trip_id) {
        try {
          if (typeof gtfsStore.getTrip === 'function') {
            const t = gtfsStore.getTrip(tu.trip.trip_id);
            if (t && t.trip_headsign) normalized.routes[normalized.routes.length - 1].destination = t.trip_headsign;
          }
        } catch (e) {
          // ignore
        }
      }
    }

    if (entity.alert) {
      const a = entity.alert;
      alerts.push({
        id: entity.id || Math.random().toString(36).slice(2),
        systemId,
        type: 'alert',
        message: a && a.header_text && a.header_text.translation && a.header_text.translation[0] && a.header_text.translation[0].text || 'Service alert',
        severity: 'low',
        affectedRoutes: a && a.informed_entity ? a.informed_entity.map(e => e.route_id).filter(Boolean) : []
      });
    }
  }

  return { routes, alerts };
}

async function fetchGtfsRt(url, apiKeyHeader, apiKey) {
  const headers = apiKey ? { [apiKeyHeader || 'x-api-key']: apiKey } : {};
  const res = await fetchFn(url, { headers });
  if (!res.ok) throw new Error(`Feed fetch failed: ${res.status} ${res.statusText}`);

  const buffer = await res.arrayBuffer();
  const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer));
  return feed;
}

module.exports = { normalizeFeedMessage, fetchGtfsRt };
