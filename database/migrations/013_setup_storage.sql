-- ============================================
-- SETUP SUPABASE STORAGE FOR PHOTOS
-- Run this in Supabase SQL Editor
-- ============================================

-- Create storage bucket for station photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('station-photos', 'station-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Anyone can view station photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'station-photos');

CREATE POLICY "Authenticated users can upload station photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'station-photos' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'station-photos' AND
  auth.uid() = owner
);

-- Verify
SELECT * FROM storage.buckets WHERE id = 'station-photos';




