-- User-reported real-time data tables
-- This allows users to report current prices and availability

-- User-reported pricing updates
CREATE TABLE IF NOT EXISTS user_price_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connector_type VARCHAR(50) NOT NULL,
  price_per_kwh DECIMAL(6,2) NOT NULL,
  report_time TIMESTAMPTZ DEFAULT NOW(),
  verified BOOLEAN DEFAULT false,
  upvotes INT DEFAULT 0,
  downvotes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_reports_station ON user_price_reports(station_id);
CREATE INDEX IF NOT EXISTS idx_price_reports_time ON user_price_reports(report_time DESC);
CREATE INDEX IF NOT EXISTS idx_price_reports_verified ON user_price_reports(verified);

-- User-reported availability updates
CREATE TABLE IF NOT EXISTS user_availability_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('available', 'busy', 'offline', 'partially_available')),
  available_count INT DEFAULT 0,
  total_count INT NOT NULL,
  wait_time_minutes INT,
  report_time TIMESTAMPTZ DEFAULT NOW(),
  verified BOOLEAN DEFAULT false,
  upvotes INT DEFAULT 0,
  downvotes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_availability_reports_station ON user_availability_reports(station_id);
CREATE INDEX IF NOT EXISTS idx_availability_reports_time ON user_availability_reports(report_time DESC);
CREATE INDEX IF NOT EXISTS idx_availability_reports_verified ON user_availability_reports(verified);

-- Materialized view for latest verified reports (for fast queries)
CREATE MATERIALIZED VIEW IF NOT EXISTS latest_station_reports AS
SELECT 
  s.id as station_id,
  
  -- Latest price report
  (SELECT jsonb_build_object(
    'price_per_kwh', pr.price_per_kwh,
    'connector_type', pr.connector_type,
    'updated_at', pr.report_time,
    'age_minutes', EXTRACT(EPOCH FROM (NOW() - pr.report_time)) / 60
  )
  FROM user_price_reports pr
  WHERE pr.station_id = s.id 
    AND pr.verified = true
    AND pr.report_time > NOW() - INTERVAL '24 hours'
  ORDER BY pr.report_time DESC
  LIMIT 1
  ) as latest_price,
  
  -- Latest availability report
  (SELECT jsonb_build_object(
    'status', ar.status,
    'available_count', ar.available_count,
    'total_count', ar.total_count,
    'wait_time_minutes', ar.wait_time_minutes,
    'updated_at', ar.report_time,
    'age_minutes', EXTRACT(EPOCH FROM (NOW() - ar.report_time)) / 60
  )
  FROM user_availability_reports ar
  WHERE ar.station_id = s.id 
    AND ar.verified = true
    AND ar.report_time > NOW() - INTERVAL '4 hours'
  ORDER BY ar.report_time DESC
  LIMIT 1
  ) as latest_availability

FROM stations s;

CREATE UNIQUE INDEX IF NOT EXISTS idx_latest_reports_station ON latest_station_reports(station_id);

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_latest_reports()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY latest_station_reports;
END;
$$ LANGUAGE plpgsql;

-- User reputation system for accurate reporting
CREATE TABLE IF NOT EXISTS user_reputation (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_reports INT DEFAULT 0,
  verified_reports INT DEFAULT 0,
  accuracy_score DECIMAL(5,2) DEFAULT 0.0,
  badges JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_reputation_score ON user_reputation(accuracy_score DESC);

-- Vote tracking (prevent multiple votes from same user)
CREATE TABLE IF NOT EXISTS report_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_id UUID NOT NULL,
  report_type VARCHAR(20) NOT NULL CHECK (report_type IN ('price', 'availability')),
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, report_id, report_type)
);

CREATE INDEX IF NOT EXISTS idx_report_votes_report ON report_votes(report_id, report_type);

-- Enable RLS
ALTER TABLE user_price_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_availability_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for price reports
CREATE POLICY "Anyone can view price reports" ON user_price_reports FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create price reports" ON user_price_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reports" ON user_price_reports FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for availability reports
CREATE POLICY "Anyone can view availability reports" ON user_availability_reports FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create availability reports" ON user_availability_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reports" ON user_availability_reports FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for reputation
CREATE POLICY "Anyone can view reputation" ON user_reputation FOR SELECT USING (true);
CREATE POLICY "Users can view own reputation" ON user_reputation FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for votes
CREATE POLICY "Anyone can view votes" ON report_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON report_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own votes" ON report_votes FOR UPDATE USING (auth.uid() = user_id);


