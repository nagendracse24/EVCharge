-- ============================================
-- USER REPORTS SYSTEM (Optional - only if reports not working)
-- Run this in Supabase SQL Editor if price/availability reports fail
-- ============================================

-- User Price Reports Table
CREATE TABLE IF NOT EXISTS user_price_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  station_id UUID REFERENCES stations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  connector_type VARCHAR(50) NOT NULL,
  price_per_kwh DECIMAL(10, 2) NOT NULL,
  verified BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  report_time TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_reports_station ON user_price_reports(station_id);
CREATE INDEX IF NOT EXISTS idx_price_reports_user ON user_price_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_price_reports_time ON user_price_reports(report_time DESC);

-- User Availability Reports Table
CREATE TABLE IF NOT EXISTS user_availability_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  station_id UUID REFERENCES stations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL, -- available, busy, offline, partially_available
  available_count INTEGER DEFAULT 0,
  total_count INTEGER NOT NULL,
  wait_time_minutes INTEGER,
  verified BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  report_time TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_availability_reports_station ON user_availability_reports(station_id);
CREATE INDEX IF NOT EXISTS idx_availability_reports_user ON user_availability_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_availability_reports_time ON user_availability_reports(report_time DESC);

-- Report Votes Table
CREATE TABLE IF NOT EXISTS report_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  report_id UUID NOT NULL,
  report_type VARCHAR(20) NOT NULL, -- 'price' or 'availability'
  vote_type VARCHAR(20) NOT NULL, -- 'upvote' or 'downvote'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, report_id, report_type)
);

CREATE INDEX IF NOT EXISTS idx_report_votes_report ON report_votes(report_id);
CREATE INDEX IF NOT EXISTS idx_report_votes_user ON report_votes(user_id);

-- Verification
SELECT 'Reports tables created successfully!' as status;
SELECT tablename FROM pg_tables 
WHERE tablename IN ('user_price_reports', 'user_availability_reports', 'report_votes');

