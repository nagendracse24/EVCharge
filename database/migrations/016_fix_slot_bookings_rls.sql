-- Fix slot_bookings RLS policies
-- This ensures authenticated users can create and manage their bookings

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own bookings" ON slot_bookings;
DROP POLICY IF EXISTS "Users can create their own bookings" ON slot_bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON slot_bookings;

-- Enable RLS
ALTER TABLE slot_bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own bookings
CREATE POLICY "Users can view their own bookings"
ON slot_bookings
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can create bookings
CREATE POLICY "Users can create their own bookings"
ON slot_bookings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own bookings (for status changes)
CREATE POLICY "Users can update their own bookings"
ON slot_bookings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete/cancel their own bookings
CREATE POLICY "Users can cancel their own bookings"
ON slot_bookings
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON slot_bookings TO authenticated;

