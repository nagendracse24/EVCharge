-- ============================================
-- COMPLETE FIX FOR USER_FAVORITES TABLE
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Drop everything that might exist (safe - won't error if doesn't exist)
DROP POLICY IF EXISTS "Users can view their own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can add their own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can remove their own favorites" ON user_favorites;
DROP INDEX IF EXISTS idx_user_favorites_user_id;
DROP INDEX IF EXISTS idx_user_favorites_station_id;
DROP TABLE IF EXISTS user_favorites CASCADE;

-- Step 2: Create fresh user_favorites table
CREATE TABLE user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate favorites
  UNIQUE(user_id, station_id)
);

-- Step 3: Create indexes for performance
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_station_id ON user_favorites(station_id);

-- Step 4: Enable RLS
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies
CREATE POLICY "Users can view their own favorites"
  ON user_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites"
  ON user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorites"
  ON user_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Step 6: Add helpful comments
COMMENT ON TABLE user_favorites IS 'Stores user favorite charging stations';
COMMENT ON COLUMN user_favorites.user_id IS 'Reference to the user who favorited the station';
COMMENT ON COLUMN user_favorites.station_id IS 'Reference to the favorited station';

-- ============================================
-- VERIFICATION QUERIES (Run after the above)
-- ============================================

-- Check if table exists
SELECT 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_favorites';

-- Check policies
SELECT 
  policyname, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'user_favorites';

-- Should show 3 policies:
-- 1. Users can view their own favorites (SELECT)
-- 2. Users can add their own favorites (INSERT)
-- 3. Users can remove their own favorites (DELETE)




