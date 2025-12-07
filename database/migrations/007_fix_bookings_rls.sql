-- Fix RLS for slot_bookings table
-- Allow authenticated users to create their own bookings

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can create their own bookings" ON slot_bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON slot_bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON slot_bookings;

-- Enable RLS (if not already enabled)
ALTER TABLE slot_bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can create their own bookings
CREATE POLICY "Users can create their own bookings"
  ON slot_bookings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own bookings
CREATE POLICY "Users can view their own bookings"
  ON slot_bookings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their own bookings (for cancellation)
CREATE POLICY "Users can update their own bookings"
  ON slot_bookings
  FOR UPDATE
  USING (auth.uid() = user_id);


