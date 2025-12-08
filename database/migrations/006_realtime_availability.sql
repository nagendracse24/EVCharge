-- Migration: Add Real-time Availability System
-- Created: 2025-12-05
-- Description: Add tables for real-time station status and user check-ins

-- Create enum for station status
CREATE TYPE station_status_enum AS ENUM ('available', 'occupied', 'offline', 'unknown');

-- Create enum for check-in status
CREATE TYPE checkin_status_enum AS ENUM ('arrived', 'charging', 'completed', 'cancelled');

-- Table: stations_status_live
-- Stores real-time status reports from users
CREATE TABLE IF NOT EXISTS stations_status_live (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  connector_id UUID REFERENCES station_connectors(id) ON DELETE SET NULL,
  status station_status_enum NOT NULL DEFAULT 'unknown',
  reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confidence_score FLOAT NOT NULL DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '2 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: check_ins
-- Tracks user check-ins at charging stations
CREATE TABLE IF NOT EXISTS check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  connector_id UUID REFERENCES station_connectors(id) ON DELETE SET NULL,
  status checkin_status_enum NOT NULL DEFAULT 'arrived',
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  checked_out_at TIMESTAMPTZ,
  charging_started_at TIMESTAMPTZ,
  charging_ended_at TIMESTAMPTZ,
  energy_delivered_kwh FLOAT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: status_aggregation
-- Aggregated status by station (for quick queries)
CREATE TABLE IF NOT EXISTS status_aggregation (
  station_id UUID PRIMARY KEY REFERENCES stations(id) ON DELETE CASCADE,
  total_connectors INT NOT NULL DEFAULT 0,
  available_count INT NOT NULL DEFAULT 0,
  occupied_count INT NOT NULL DEFAULT 0,
  offline_count INT NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confidence_score FLOAT NOT NULL DEFAULT 0.5,
  active_checkins INT NOT NULL DEFAULT 0
);

-- Indexes for performance
CREATE INDEX idx_status_live_station ON stations_status_live(station_id);
CREATE INDEX idx_status_live_expires ON stations_status_live(expires_at);
CREATE INDEX idx_status_live_reported ON stations_status_live(reported_at DESC);
CREATE INDEX idx_checkins_user ON check_ins(user_id);
CREATE INDEX idx_checkins_station ON check_ins(station_id);
CREATE INDEX idx_checkins_status ON check_ins(status);
CREATE INDEX idx_checkins_active ON check_ins(station_id, status) WHERE status IN ('arrived', 'charging');

-- Function: Update status aggregation
CREATE OR REPLACE FUNCTION update_status_aggregation()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate aggregation for the affected station
  INSERT INTO status_aggregation (station_id, total_connectors, available_count, occupied_count, offline_count, active_checkins, last_updated)
  SELECT 
    NEW.station_id,
    COUNT(DISTINCT sc.id) as total_connectors,
    COUNT(DISTINCT sc.id) FILTER (WHERE sl.status = 'available') as available_count,
    COUNT(DISTINCT sc.id) FILTER (WHERE sl.status = 'occupied') as occupied_count,
    COUNT(DISTINCT sc.id) FILTER (WHERE sl.status = 'offline') as offline_count,
    COUNT(DISTINCT ci.id) FILTER (WHERE ci.status IN ('arrived', 'charging')) as active_checkins,
    NOW()
  FROM stations s
  LEFT JOIN station_connectors sc ON sc.station_id = s.id
  LEFT JOIN stations_status_live sl ON sl.connector_id = sc.id AND sl.expires_at > NOW()
  LEFT JOIN check_ins ci ON ci.station_id = s.id AND ci.status IN ('arrived', 'charging')
  WHERE s.id = NEW.station_id
  GROUP BY s.id
  ON CONFLICT (station_id) 
  DO UPDATE SET
    total_connectors = EXCLUDED.total_connectors,
    available_count = EXCLUDED.available_count,
    occupied_count = EXCLUDED.occupied_count,
    offline_count = EXCLUDED.offline_count,
    active_checkins = EXCLUDED.active_checkins,
    last_updated = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update aggregation on status changes
CREATE TRIGGER trigger_update_status_aggregation
AFTER INSERT OR UPDATE ON stations_status_live
FOR EACH ROW
EXECUTE FUNCTION update_status_aggregation();

-- Trigger: Auto-update aggregation on check-ins
CREATE TRIGGER trigger_update_status_checkin
AFTER INSERT OR UPDATE ON check_ins
FOR EACH ROW
EXECUTE FUNCTION update_status_aggregation();

-- Function: Clean up expired status reports
CREATE OR REPLACE FUNCTION cleanup_expired_status()
RETURNS void AS $$
BEGIN
  DELETE FROM stations_status_live 
  WHERE expires_at < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- RLS Policies

-- stations_status_live: Anyone can read, authenticated users can insert
ALTER TABLE stations_status_live ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view live status"
  ON stations_status_live FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can report status"
  ON stations_status_live FOR INSERT
  WITH CHECK (auth.uid() = reported_by);

-- check_ins: Users can only see and manage their own check-ins
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own check-ins"
  ON check_ins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own check-ins"
  ON check_ins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own check-ins"
  ON check_ins FOR UPDATE
  USING (auth.uid() = user_id);

-- status_aggregation: Read-only for everyone
ALTER TABLE status_aggregation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view status aggregation"
  ON status_aggregation FOR SELECT
  USING (true);

-- Comments
COMMENT ON TABLE stations_status_live IS 'Real-time status reports from users about station/connector availability';
COMMENT ON TABLE check_ins IS 'User check-ins at charging stations for live tracking';
COMMENT ON TABLE status_aggregation IS 'Pre-aggregated status data for fast queries';
COMMENT ON FUNCTION update_status_aggregation() IS 'Automatically updates aggregated status when reports or check-ins change';
COMMENT ON FUNCTION cleanup_expired_status() IS 'Removes old status reports (run daily via cron)';





