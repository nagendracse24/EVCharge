-- ============================================
-- ADVANCED FEATURES: Analytics, Rewards, History
-- Run this in Supabase SQL Editor
-- ============================================

-- CHARGING HISTORY TABLE
CREATE TABLE IF NOT EXISTS charging_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  station_id UUID NOT NULL REFERENCES stations(id),
  booking_id UUID REFERENCES slot_bookings(id),
  
  -- Session details
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  energy_delivered_kwh DECIMAL(10, 2),
  cost_paid DECIMAL(10, 2),
  
  -- Environmental impact
  carbon_saved_kg DECIMAL(10, 2),
  trees_equivalent DECIMAL(10, 2),
  
  -- Connector used
  connector_type VARCHAR(50),
  power_kw DECIMAL(10, 2),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_charging_history_user ON charging_history(user_id);
CREATE INDEX idx_charging_history_station ON charging_history(station_id);
CREATE INDEX idx_charging_history_date ON charging_history(start_time DESC);

-- USER REWARDS/POINTS TABLE
CREATE TABLE IF NOT EXISTS user_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Points & Levels
  total_points INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  points_to_next_level INTEGER DEFAULT 100,
  
  -- Achievements
  total_sessions INTEGER DEFAULT 0,
  total_energy_kwh DECIMAL(10, 2) DEFAULT 0,
  total_carbon_saved_kg DECIMAL(10, 2) DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  
  -- Streaks
  current_streak_days INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0,
  last_charge_date DATE,
  
  -- Referrals
  referral_code VARCHAR(20) UNIQUE,
  referrals_count INTEGER DEFAULT 0,
  referral_points_earned INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_rewards_user ON user_rewards(user_id);
CREATE INDEX idx_user_rewards_level ON user_rewards(current_level DESC);
CREATE INDEX idx_user_rewards_points ON user_rewards(total_points DESC);

-- REWARDS TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS rewards_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Transaction details
  points_change INTEGER NOT NULL, -- Positive for earned, negative for redeemed
  transaction_type VARCHAR(50) NOT NULL, -- 'charge_complete', 'review', 'referral', 'redeem'
  description TEXT,
  
  -- Reference
  reference_id UUID, -- booking_id, review_id, etc.
  reference_type VARCHAR(50),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rewards_transactions_user ON rewards_transactions(user_id);
CREATE INDEX idx_rewards_transactions_date ON rewards_transactions(created_at DESC);

-- TRIP PLANNER TABLE
CREATE TABLE IF NOT EXISTS trip_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Trip details
  name VARCHAR(200),
  start_location JSONB, -- {lat, lng, address}
  end_location JSONB,
  waypoints JSONB, -- Array of {lat, lng, stationId}
  
  -- Vehicle & preferences
  vehicle_id UUID REFERENCES vehicles(id),
  battery_level_percent INTEGER, -- Starting battery
  target_battery_percent INTEGER DEFAULT 80,
  
  -- Calculated route
  total_distance_km DECIMAL(10, 2),
  total_duration_minutes INTEGER,
  estimated_cost DECIMAL(10, 2),
  charging_stops_count INTEGER,
  
  -- Status
  status VARCHAR(20) DEFAULT 'planned', -- planned, active, completed, cancelled
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trip_plans_user ON trip_plans(user_id);
CREATE INDEX idx_trip_plans_status ON trip_plans(status);
CREATE INDEX idx_trip_plans_date ON trip_plans(created_at DESC);

-- USER NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification details
  type VARCHAR(50) NOT NULL, -- 'booking_confirmed', 'charge_complete', 'reward_earned', 'price_alert'
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  
  -- Action
  action_url TEXT,
  action_label VARCHAR(50),
  
  -- Status
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  -- Reference
  reference_id UUID,
  reference_type VARCHAR(50),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON user_notifications(user_id);
CREATE INDEX idx_notifications_read ON user_notifications(read, created_at DESC);
CREATE INDEX idx_notifications_date ON user_notifications(created_at DESC);

-- PRICE ALERTS TABLE
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  
  -- Alert conditions
  target_price_kwh DECIMAL(10, 2) NOT NULL,
  connector_type VARCHAR(50),
  
  -- Status
  active BOOLEAN DEFAULT true,
  triggered_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_price_alerts_user ON price_alerts(user_id);
CREATE INDEX idx_price_alerts_station ON price_alerts(station_id);
CREATE INDEX idx_price_alerts_active ON price_alerts(active);

-- FUNCTIONS TO UPDATE STATS

-- Function to update user rewards after charging
CREATE OR REPLACE FUNCTION update_user_rewards_after_charge()
RETURNS TRIGGER AS $$
BEGIN
  -- Update rewards stats
  UPDATE user_rewards
  SET 
    total_sessions = total_sessions + 1,
    total_energy_kwh = total_energy_kwh + COALESCE(NEW.energy_delivered_kwh, 0),
    total_carbon_saved_kg = total_carbon_saved_kg + COALESCE(NEW.carbon_saved_kg, 0),
    total_spent = total_spent + COALESCE(NEW.cost_paid, 0),
    total_points = total_points + 10, -- 10 points per charge
    updated_at = NOW()
  WHERE user_id = NEW.user_id;
  
  -- Create rewards transaction
  INSERT INTO rewards_transactions (user_id, points_change, transaction_type, description, reference_id, reference_type)
  VALUES (NEW.user_id, 10, 'charge_complete', 'Completed charging session', NEW.id, 'charging_history');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for charging history
DROP TRIGGER IF EXISTS trigger_update_rewards_after_charge ON charging_history;
CREATE TRIGGER trigger_update_rewards_after_charge
  AFTER INSERT ON charging_history
  FOR EACH ROW
  EXECUTE FUNCTION update_user_rewards_after_charge();

-- Function to auto-create rewards account for new users
CREATE OR REPLACE FUNCTION create_user_rewards_account()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_rewards (user_id, referral_code)
  VALUES (
    NEW.id,
    UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8))
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new users
DROP TRIGGER IF EXISTS trigger_create_rewards_account ON auth.users;
CREATE TRIGGER trigger_create_rewards_account
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_rewards_account();

-- RLS Policies

ALTER TABLE charging_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

-- Charging History
CREATE POLICY "Users can view their own charging history"
  ON charging_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own charging history"
  ON charging_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User Rewards
CREATE POLICY "Users can view their own rewards"
  ON user_rewards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view all rewards for leaderboard"
  ON user_rewards FOR SELECT
  USING (true);

-- Rewards Transactions
CREATE POLICY "Users can view their own transactions"
  ON rewards_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Trip Plans
CREATE POLICY "Users can manage their own trips"
  ON trip_plans FOR ALL
  USING (auth.uid() = user_id);

-- Notifications
CREATE POLICY "Users can view their own notifications"
  ON user_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON user_notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Price Alerts
CREATE POLICY "Users can manage their own alerts"
  ON price_alerts FOR ALL
  USING (auth.uid() = user_id);

-- Verification
SELECT 'Advanced features tables created successfully!' as status;
SELECT tablename FROM pg_tables 
WHERE tablename IN ('charging_history', 'user_rewards', 'rewards_transactions', 'trip_plans', 'user_notifications', 'price_alerts');

