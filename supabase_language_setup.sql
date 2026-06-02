-- 1. Add language columns
ALTER TABLE series ADD COLUMN IF NOT EXISTS content_language TEXT DEFAULT 'en';
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS content_language TEXT DEFAULT 'en';
ALTER TABLE shorts ADD COLUMN IF NOT EXISTS content_language TEXT DEFAULT 'en';
ALTER TABLE music_tracks ADD COLUMN IF NOT EXISTS content_language TEXT DEFAULT 'en';
ALTER TABLE banners ADD COLUMN IF NOT EXISTS content_language TEXT DEFAULT 'en';

-- 2. Truncate all content tables to start fresh
TRUNCATE TABLE banners CASCADE;
TRUNCATE TABLE music_tracks CASCADE;
TRUNCATE TABLE shorts CASCADE;
TRUNCATE TABLE episodes CASCADE;
TRUNCATE TABLE series CASCADE;
