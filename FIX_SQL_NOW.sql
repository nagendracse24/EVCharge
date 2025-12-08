-- Drop existing indexes and policies if they exist
DROP INDEX IF EXISTS idx_user_favorites_user_id;
DROP INDEX IF EXISTS idx_user_favorites_station_id;

DROP POLICY IF EXISTS "Users can view their own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can add their own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can remove their own favorites" ON user_favorites;

-- Create indexes (if not already there)
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_station_id ON user_favorites(station_id);

-- Enable RLS
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view their own favorites"
  ON user_favorites FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites"
  ON user_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorites"
  ON user_favorites FOR DELETE USING (auth.uid() = user_id);





