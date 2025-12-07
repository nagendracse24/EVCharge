-- Fix RLS for user_favorites table
-- Allow authenticated users to manage their own favorites

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can add their own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can remove their own favorites" ON user_favorites;

-- Enable RLS
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own favorites
CREATE POLICY "Users can view their own favorites"
  ON user_favorites
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can add favorites
CREATE POLICY "Users can add their own favorites"
  ON user_favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can remove favorites
CREATE POLICY "Users can remove their own favorites"
  ON user_favorites
  FOR DELETE
  USING (auth.uid() = user_id);


