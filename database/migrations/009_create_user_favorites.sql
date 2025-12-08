-- Create user_favorites table
-- This table was referenced but never created!

CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate favorites
  UNIQUE(user_id, station_id)
);

-- Create index for faster lookups
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_station_id ON user_favorites(station_id);

-- Enable RLS
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own favorites"
  ON user_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites"
  ON user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorites"
  ON user_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Add some helpful comments
COMMENT ON TABLE user_favorites IS 'Stores user favorite charging stations';
COMMENT ON COLUMN user_favorites.user_id IS 'Reference to the user who favorited the station';
COMMENT ON COLUMN user_favorites.station_id IS 'Reference to the favorited station';





