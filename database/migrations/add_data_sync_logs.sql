-- Data sync logs table
CREATE TABLE IF NOT EXISTS data_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id TEXT NOT NULL,
  inserted_count INT DEFAULT 0,
  updated_count INT DEFAULT 0,
  error_count INT DEFAULT 0,
  duration_seconds FLOAT DEFAULT 0,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying sync history
CREATE INDEX IF NOT EXISTS idx_data_sync_logs_source ON data_sync_logs(source_id);
CREATE INDEX IF NOT EXISTS idx_data_sync_logs_synced_at ON data_sync_logs(synced_at DESC);

-- Add external_id to stations for tracking source identity
ALTER TABLE stations ADD COLUMN IF NOT EXISTS external_id TEXT;
CREATE INDEX IF NOT EXISTS idx_stations_external_id ON stations(external_id);

-- Add indexes for faster geospatial queries
CREATE INDEX IF NOT EXISTS idx_stations_lat_lng ON stations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_stations_city ON stations(city);
CREATE INDEX IF NOT EXISTS idx_stations_network ON stations(network);
CREATE INDEX IF NOT EXISTS idx_stations_source ON stations(source);

-- Function to find nearby stations (for de-duplication)
CREATE OR REPLACE FUNCTION find_nearby_stations(
  p_lat FLOAT,
  p_lng FLOAT,
  p_radius_m FLOAT DEFAULT 50
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  latitude FLOAT,
  longitude FLOAT,
  distance_m FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.name,
    s.latitude,
    s.longitude,
    (
      6371000 * acos(
        cos(radians(p_lat)) * cos(radians(s.latitude)) *
        cos(radians(s.longitude) - radians(p_lng)) +
        sin(radians(p_lat)) * sin(radians(s.latitude))
      )
    ) AS distance_m
  FROM stations s
  WHERE (
    6371000 * acos(
      cos(radians(p_lat)) * cos(radians(s.latitude)) *
      cos(radians(s.longitude) - radians(p_lng)) +
      sin(radians(p_lat)) * sin(radians(s.latitude))
    )
  ) <= p_radius_m
  ORDER BY distance_m;
END;
$$ LANGUAGE plpgsql;



