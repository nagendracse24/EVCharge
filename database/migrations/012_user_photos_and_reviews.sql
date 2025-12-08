-- ============================================
-- USER PHOTOS AND REVIEWS SYSTEM
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- STATION PHOTOS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS station_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- References
  station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Photo details
  photo_url TEXT NOT NULL,
  storage_path TEXT NOT NULL, -- Supabase Storage path
  caption TEXT,
  
  -- Moderation
  is_approved BOOLEAN DEFAULT true,
  is_reported BOOLEAN DEFAULT false,
  report_reason TEXT,
  
  -- Metadata
  file_size_bytes INTEGER,
  mime_type VARCHAR(50),
  width INTEGER,
  height INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_station_photos_station_id ON station_photos(station_id);
CREATE INDEX idx_station_photos_user_id ON station_photos(user_id);
CREATE INDEX idx_station_photos_approved ON station_photos(is_approved);
CREATE INDEX idx_station_photos_created_at ON station_photos(created_at DESC);

-- Enable RLS
ALTER TABLE station_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view approved photos"
  ON station_photos FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Users can view their own photos"
  ON station_photos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can upload photos"
  ON station_photos FOR INSERT
  WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own photos"
  ON station_photos FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can report photos"
  ON station_photos FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ============================================
-- STATION REVIEWS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS station_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- References
  station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Review content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  comment TEXT,
  
  -- Review categories (optional detailed ratings)
  cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
  reliability_rating INTEGER CHECK (reliability_rating >= 1 AND reliability_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  
  -- Verification
  is_verified_booking BOOLEAN DEFAULT false, -- Did they actually book here?
  booking_id UUID REFERENCES slot_bookings(id),
  
  -- Moderation
  is_approved BOOLEAN DEFAULT true,
  is_reported BOOLEAN DEFAULT false,
  report_reason TEXT,
  
  -- Helpful votes
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate reviews (one review per user per station)
  UNIQUE(station_id, user_id)
);

-- Indexes
CREATE INDEX idx_station_reviews_station_id ON station_reviews(station_id);
CREATE INDEX idx_station_reviews_user_id ON station_reviews(user_id);
CREATE INDEX idx_station_reviews_rating ON station_reviews(rating);
CREATE INDEX idx_station_reviews_approved ON station_reviews(is_approved);
CREATE INDEX idx_station_reviews_created_at ON station_reviews(created_at DESC);

-- Enable RLS
ALTER TABLE station_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view approved reviews"
  ON station_reviews FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Users can view their own reviews"
  ON station_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create reviews"
  ON station_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own reviews"
  ON station_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON station_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- REVIEW HELPFULNESS VOTES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS review_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  review_id UUID NOT NULL REFERENCES station_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  is_helpful BOOLEAN NOT NULL, -- true = helpful, false = not helpful
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One vote per user per review
  UNIQUE(review_id, user_id)
);

-- Indexes
CREATE INDEX idx_review_votes_review_id ON review_votes(review_id);
CREATE INDEX idx_review_votes_user_id ON review_votes(user_id);

-- Enable RLS
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all votes"
  ON review_votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can vote"
  ON review_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes"
  ON review_votes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
  ON review_votes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- UPDATE STATIONS TABLE
-- ============================================

-- Add review stats to stations table
ALTER TABLE stations ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(3, 2);
ALTER TABLE stations ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;
ALTER TABLE stations ADD COLUMN IF NOT EXISTS total_photos INTEGER DEFAULT 0;

-- ============================================
-- FUNCTIONS FOR AUTO-UPDATING STATS
-- ============================================

-- Function to update station review stats
CREATE OR REPLACE FUNCTION update_station_review_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE stations
  SET 
    avg_rating = (
      SELECT AVG(rating)::DECIMAL(3,2)
      FROM station_reviews
      WHERE station_id = NEW.station_id AND is_approved = true
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM station_reviews
      WHERE station_id = NEW.station_id AND is_approved = true
    )
  WHERE id = NEW.station_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new reviews
CREATE TRIGGER update_review_stats_on_insert
  AFTER INSERT ON station_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_station_review_stats();

-- Trigger for updated reviews
CREATE TRIGGER update_review_stats_on_update
  AFTER UPDATE ON station_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_station_review_stats();

-- Function to update photo count
CREATE OR REPLACE FUNCTION update_station_photo_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE stations
  SET total_photos = (
    SELECT COUNT(*)
    FROM station_photos
    WHERE station_id = NEW.station_id AND is_approved = true
  )
  WHERE id = NEW.station_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new photos
CREATE TRIGGER update_photo_count_on_insert
  AFTER INSERT ON station_photos
  FOR EACH ROW
  EXECUTE FUNCTION update_station_photo_count();

-- Function to update review helpfulness counts
CREATE OR REPLACE FUNCTION update_review_helpfulness()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE station_reviews
  SET 
    helpful_count = (
      SELECT COUNT(*)
      FROM review_votes
      WHERE review_id = NEW.review_id AND is_helpful = true
    ),
    not_helpful_count = (
      SELECT COUNT(*)
      FROM review_votes
      WHERE review_id = NEW.review_id AND is_helpful = false
    )
  WHERE id = NEW.review_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for helpfulness votes
CREATE TRIGGER update_helpfulness_on_vote
  AFTER INSERT OR UPDATE OR DELETE ON review_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_review_helpfulness();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE station_photos IS 'User-uploaded photos of charging stations';
COMMENT ON TABLE station_reviews IS 'User reviews and ratings for charging stations';
COMMENT ON TABLE review_votes IS 'Helpful/Not helpful votes for reviews';

-- ============================================
-- VERIFICATION
-- ============================================

-- Check tables created
SELECT tablename FROM pg_tables 
WHERE tablename IN ('station_photos', 'station_reviews', 'review_votes');

-- Check triggers
SELECT tgname FROM pg_trigger 
WHERE tgname LIKE 'update_%_stats%' OR tgname LIKE 'update_%_count%';




