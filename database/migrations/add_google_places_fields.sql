-- Add Google Places integration fields to stations table
-- Run this in Supabase SQL Editor BEFORE importing stations

ALTER TABLE stations
ADD COLUMN IF NOT EXISTS google_place_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS google_rating DECIMAL(2,1),
ADD COLUMN IF NOT EXISTS google_reviews_count INTEGER;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_stations_google_place_id ON stations(google_place_id);

-- Add comment
COMMENT ON COLUMN stations.google_place_id IS 'Google Places API place ID for de-duplication and updates';
COMMENT ON COLUMN stations.google_rating IS 'Google Maps rating (1-5)';
COMMENT ON COLUMN stations.google_reviews_count IS 'Number of Google reviews';

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'stations' 
AND column_name LIKE 'google%';



