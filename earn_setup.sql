-- Run this in your Supabase SQL Editor

-- 1. Create earn_sessions table
CREATE TABLE public.earn_sessions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    devotee_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    devotee_email text NOT NULL,
    video_id text NOT NULL,
    start_time timestamp with time zone DEFAULT now(),
    end_time timestamp with time zone,
    status text DEFAULT 'active' CHECK (status IN ('active', 'pending_review', 'approved', 'rejected')),
    verified_duration integer DEFAULT 0, -- in seconds
    created_at timestamp with time zone DEFAULT now()
);

-- 2. Create earn_frames table
CREATE TABLE public.earn_frames (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id uuid REFERENCES public.earn_sessions(id) ON DELETE CASCADE,
    frame_base64 text NOT NULL, -- Storing base64 strings because they are small, low-res thumbnails
    timestamp timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

-- 3. Add Earn columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_earned_hours integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS today_earned_hours integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_earn_date date;

-- 4. Enable RLS
ALTER TABLE public.earn_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earn_frames ENABLE ROW LEVEL SECURITY;

-- 5. Open Policies (Since this is a custom admin/frontend setup without strict Auth enforced yet)
CREATE POLICY "Public Access Earn Sessions" ON public.earn_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Earn Frames" ON public.earn_frames FOR ALL USING (true) WITH CHECK (true);

-- 6. Enable Realtime on earn_frames for the Admin Monitor
alter publication supabase_realtime add table public.earn_frames;
