-- Run this script in your Supabase SQL Editor to create the Watch & Earn tables

-- 1. Create earn_sessions table
CREATE TABLE IF NOT EXISTS earn_sessions (
  id uuid default gen_random_uuid() primary key,
  devotee_email text not null,
  video_id text,
  start_time timestamp with time zone default timezone('utc'::text, now()) not null,
  end_time timestamp with time zone,
  status text default 'pending', -- pending, approved, rejected
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create earn_frames table
CREATE TABLE IF NOT EXISTS earn_frames (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references earn_sessions(id) on delete cascade not null,
  image_url text not null,
  captured_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable RLS
ALTER TABLE earn_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE earn_frames ENABLE ROW LEVEL SECURITY;

-- 4. Create OPEN policies for frontend and native app access
CREATE POLICY "Public Access Earn Sessions" ON earn_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Earn Frames" ON earn_frames FOR ALL USING (true) WITH CHECK (true);

-- 5. Create the 'screencasts' storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('screencasts', 'screencasts', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Allow public access to upload and read screencast frames
CREATE POLICY "Public Access Screencasts" ON storage.objects FOR ALL USING (bucket_id = 'screencasts') WITH CHECK (bucket_id = 'screencasts');
