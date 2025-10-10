-- Create tables for user syncable objects and change feed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- Example table: pins (user-created map pins)
CREATE TABLE IF NOT EXISTS pins (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  properties jsonb DEFAULT '{}'::jsonb,
  geom geometry(Point,4326),
  version bigint DEFAULT 1,
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pins_geom_gist ON pins USING GIST (geom);
CREATE INDEX IF NOT EXISTS pins_user_id_idx ON pins (user_id);

-- Changes feed (append-only) for sync and change stream
CREATE TABLE IF NOT EXISTS changes (
  id bigserial PRIMARY KEY,
  op_id uuid UNIQUE DEFAULT uuid_generate_v4(),
  created_at timestamptz DEFAULT now(),
  user_id uuid,
  object_type text NOT NULL,
  object_id uuid,
  operation text NOT NULL,
  payload jsonb,
  version bigint
);

-- Trigger helper: notify channel when changes inserted
CREATE OR REPLACE FUNCTION notify_change() RETURNS trigger AS $$
DECLARE
  payload json;
BEGIN
  payload := json_build_object('object_type', NEW.object_type, 'object_id', NEW.object_id, 'op_id', NEW.op_id, 'operation', NEW.operation, 'id', NEW.id);
  PERFORM pg_notify('changes_channel', payload::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS changes_notify_trigger ON changes;
CREATE TRIGGER changes_notify_trigger AFTER INSERT ON changes
  FOR EACH ROW EXECUTE PROCEDURE notify_change();
