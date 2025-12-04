-- Fix stations source constraint to include external data sources
-- This allows us to track where station data came from

-- Drop the old constraint
ALTER TABLE stations DROP CONSTRAINT IF EXISTS stations_source_check;

-- Add new constraint with more source types
ALTER TABLE stations ADD CONSTRAINT stations_source_check 
  CHECK (source IN (
    'seed',           -- Initial seed data
    'crowdsourced',   -- User submissions
    'cpo_api',        -- Direct from Charge Point Operator APIs
    'government',     -- Government data sources
    'openchargemap',  -- OpenChargeMap.org
    'openstreetmap',  -- OpenStreetMap (via Overpass API)
    'google_places',  -- Google Places API
    'plugshare',      -- PlugShare
    'manual',         -- Manually added (same as crowdsourced but explicit)
    'statiq',         -- Statiq API
    'ather',          -- Ather API
    'ola'             -- Ola Electric API
  ));

-- Create index on source for faster filtering
CREATE INDEX IF NOT EXISTS idx_stations_source ON stations(source);

