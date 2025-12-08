-- Slot Booking System
-- Allows users to pre-book charging slots at stations

-- Create slot_bookings table
CREATE TABLE IF NOT EXISTS slot_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  connector_id UUID NOT NULL REFERENCES station_connectors(id) ON DELETE CASCADE,
  
  -- Booking details
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  
  -- Vehicle info
  vehicle_id UUID REFERENCES user_vehicles(id) ON DELETE SET NULL,
  vehicle_name VARCHAR(255),
  estimated_energy_kwh DECIMAL(6, 2),
  
  -- Status tracking
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- pending, confirmed, cancelled, completed, no_show
  
  -- Pricing
  estimated_cost DECIMAL(10, 2),
  actual_cost DECIMAL(10, 2),
  payment_status VARCHAR(20) DEFAULT 'unpaid',
  -- unpaid, paid, refunded
  
  -- Additional info
  special_instructions TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT valid_duration CHECK (duration_minutes > 0 AND duration_minutes <= 480),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  CONSTRAINT valid_payment_status CHECK (payment_status IN ('unpaid', 'paid', 'refunded'))
);

-- Index for fast lookups
CREATE INDEX idx_slot_bookings_user ON slot_bookings(user_id);
CREATE INDEX idx_slot_bookings_station ON slot_bookings(station_id);
CREATE INDEX idx_slot_bookings_date ON slot_bookings(booking_date);
CREATE INDEX idx_slot_bookings_status ON slot_bookings(status);
CREATE INDEX idx_slot_bookings_station_date ON slot_bookings(station_id, booking_date);

-- Create station_slot_config table (stations can define their slot config)
CREATE TABLE IF NOT EXISTS station_slot_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE UNIQUE,
  
  -- Slot settings
  enable_bookings BOOLEAN DEFAULT true,
  slot_duration_minutes INTEGER DEFAULT 60,
  advance_booking_days INTEGER DEFAULT 7, -- How many days in advance can book
  min_booking_notice_hours INTEGER DEFAULT 2, -- Minimum notice required
  max_booking_duration_minutes INTEGER DEFAULT 240,
  
  -- Availability
  operating_hours JSONB, -- {"monday": {"start": "08:00", "end": "22:00"}, ...}
  blackout_dates DATE[], -- Dates when booking is not available
  
  -- Cancellation policy
  allow_cancellation BOOLEAN DEFAULT true,
  cancellation_deadline_hours INTEGER DEFAULT 2, -- Must cancel X hours before
  cancellation_fee_percentage DECIMAL(5, 2) DEFAULT 0,
  
  -- Auto-confirmation
  auto_confirm BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to check slot availability
CREATE OR REPLACE FUNCTION check_slot_availability(
  p_station_id UUID,
  p_connector_id UUID,
  p_booking_date DATE,
  p_start_time TIME,
  p_end_time TIME
)
RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  -- Check if there's any overlapping booking
  SELECT COUNT(*) INTO conflict_count
  FROM slot_bookings
  WHERE station_id = p_station_id
    AND connector_id = p_connector_id
    AND booking_date = p_booking_date
    AND status IN ('pending', 'confirmed')
    AND (
      -- New slot starts during existing booking
      (p_start_time >= start_time AND p_start_time < end_time)
      OR
      -- New slot ends during existing booking
      (p_end_time > start_time AND p_end_time <= end_time)
      OR
      -- New slot completely encompasses existing booking
      (p_start_time <= start_time AND p_end_time >= end_time)
    );
  
  RETURN conflict_count = 0;
END;
$$ LANGUAGE plpgsql;

-- Function to get available time slots for a station
CREATE OR REPLACE FUNCTION get_available_slots(
  p_station_id UUID,
  p_connector_id UUID,
  p_booking_date DATE,
  p_slot_duration_minutes INTEGER DEFAULT 60
)
RETURNS TABLE(
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN
) AS $$
DECLARE
  operating_start TIME := '08:00';
  operating_end TIME := '22:00';
  current_slot_start TIME;
  current_slot_end TIME;
BEGIN
  -- Generate slots from 8 AM to 10 PM
  current_slot_start := operating_start;
  
  WHILE current_slot_start < operating_end LOOP
    current_slot_end := current_slot_start + (p_slot_duration_minutes || ' minutes')::INTERVAL;
    
    IF current_slot_end <= operating_end THEN
      RETURN QUERY SELECT 
        current_slot_start,
        current_slot_end,
        check_slot_availability(p_station_id, p_connector_id, p_booking_date, current_slot_start, current_slot_end);
    END IF;
    
    current_slot_start := current_slot_end;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE slot_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings"
  ON slot_bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings"
  ON slot_bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
  ON slot_bookings FOR UPDATE
  USING (auth.uid() = user_id);

-- Station owners can view all bookings for their stations (future feature)
-- CREATE POLICY "Station owners can view bookings"
--   ON slot_bookings FOR SELECT
--   USING (EXISTS (
--     SELECT 1 FROM station_owners
--     WHERE station_owners.station_id = slot_bookings.station_id
--       AND station_owners.user_id = auth.uid()
--   ));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_slot_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER slot_bookings_updated_at
  BEFORE UPDATE ON slot_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_slot_bookings_updated_at();

CREATE TRIGGER station_slot_config_updated_at
  BEFORE UPDATE ON station_slot_config
  FOR EACH ROW
  EXECUTE FUNCTION update_slot_bookings_updated_at();

-- Insert default slot config for existing stations
INSERT INTO station_slot_config (station_id, enable_bookings, slot_duration_minutes, operating_hours)
SELECT 
  id,
  true,
  60,
  '{"monday": {"start": "08:00", "end": "22:00"}, "tuesday": {"start": "08:00", "end": "22:00"}, "wednesday": {"start": "08:00", "end": "22:00"}, "thursday": {"start": "08:00", "end": "22:00"}, "friday": {"start": "08:00", "end": "22:00"}, "saturday": {"start": "08:00", "end": "22:00"}, "sunday": {"start": "08:00", "end": "22:00"}}'::jsonb
FROM stations
ON CONFLICT (station_id) DO NOTHING;





