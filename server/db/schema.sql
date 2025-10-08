CREATE TABLE IF NOT EXISTS routes (
  route_id TEXT PRIMARY KEY,
  route_short_name TEXT,
  route_long_name TEXT,
  route_type INTEGER
);

CREATE TABLE IF NOT EXISTS trips (
  trip_id TEXT PRIMARY KEY,
  route_id TEXT NOT NULL,
  service_id TEXT,
  trip_headsign TEXT
);
CREATE INDEX IF NOT EXISTS idx_trips_route_id ON trips(route_id);

CREATE TABLE IF NOT EXISTS stops (
  stop_id TEXT PRIMARY KEY,
  stop_name TEXT,
  stop_lat DOUBLE PRECISION,
  stop_lon DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS stop_times (
  trip_id TEXT NOT NULL,
  stop_sequence INTEGER NOT NULL,
  stop_id TEXT NOT NULL,
  arrival_time TEXT,
  departure_time TEXT
);
CREATE INDEX IF NOT EXISTS idx_stop_times_trip ON stop_times(trip_id);
CREATE INDEX IF NOT EXISTS idx_stop_times_trip_seq ON stop_times(trip_id, stop_sequence);

-- Shapes table for polylines
CREATE TABLE IF NOT EXISTS shapes (
  shape_id TEXT NOT NULL,
  shape_pt_lat DOUBLE PRECISION NOT NULL,
  shape_pt_lon DOUBLE PRECISION NOT NULL,
  shape_pt_sequence INTEGER NOT NULL,
  PRIMARY KEY(shape_id, shape_pt_sequence)
);
CREATE INDEX IF NOT EXISTS idx_shapes_id ON shapes(shape_id);
-- server/db/schema.sql
CREATE TABLE IF NOT EXISTS routes (
  route_id TEXT PRIMARY KEY,
  route_short_name TEXT,
  route_long_name TEXT,
  route_type INTEGER
);

CREATE TABLE IF NOT EXISTS trips (
  trip_id TEXT PRIMARY KEY,
  route_id TEXT NOT NULL,
  service_id TEXT,
  trip_headsign TEXT
);
CREATE INDEX IF NOT EXISTS idx_trips_route_id ON trips(route_id);

CREATE TABLE IF NOT EXISTS stops (
  stop_id TEXT PRIMARY KEY,
  stop_name TEXT,
  stop_lat DOUBLE PRECISION,
  stop_lon DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS stop_times (
  trip_id TEXT NOT NULL,
  stop_sequence INTEGER NOT NULL,
  stop_id TEXT NOT NULL,
  arrival_time TEXT,
  departure_time TEXT
);
CREATE INDEX IF NOT EXISTS idx_stop_times_trip ON stop_times(trip_id);
CREATE INDEX IF NOT EXISTS idx_stop_times_trip_seq ON stop_times(trip_id, stop_sequence);