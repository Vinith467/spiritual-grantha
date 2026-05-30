-- Run this entire script in your Supabase SQL Editor to fix the Admin Dashboard CRUD errors!

-- 1. Enable RLS on all tables (Best Practice)
ALTER TABLE IF EXISTS series ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS shorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS music_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Allow public read access" ON series;
DROP POLICY IF EXISTS "Allow public insert" ON series;
DROP POLICY IF EXISTS "Allow public update" ON series;
DROP POLICY IF EXISTS "Allow public delete" ON series;

-- 3. Create OPEN policies for all tables since authentication is handled via Frontend localStorage 
-- (Note: In a production app with sensitive data, you should use Supabase Auth. But for this custom admin panel, this allows the frontend to work).

-- For SERIES
CREATE POLICY "Public Access Series" ON series FOR ALL USING (true) WITH CHECK (true);

-- For EPISODES
CREATE POLICY "Public Access Episodes" ON episodes FOR ALL USING (true) WITH CHECK (true);

-- For SHORTS
CREATE POLICY "Public Access Shorts" ON shorts FOR ALL USING (true) WITH CHECK (true);

-- For MUSIC_TRACKS
CREATE POLICY "Public Access Music" ON music_tracks FOR ALL USING (true) WITH CHECK (true);

-- For BANNERS
CREATE POLICY "Public Access Banners" ON banners FOR ALL USING (true) WITH CHECK (true);

-- For PROFILES
CREATE POLICY "Public Access Profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);


-- 4. Create the 'images' storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Allow public access to upload and delete images in the bucket
CREATE POLICY "Public Access Storage" ON storage.objects FOR ALL USING (bucket_id = 'images') WITH CHECK (bucket_id = 'images');
