-- Supabase SQL Schema & RLS Policies for EMS PWA Database

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'manager', 'employee')),
  work_mode TEXT NOT NULL DEFAULT 'WFH' CHECK (work_mode IN ('Full WFH', 'Hybrid', 'Full WFO')),
  department TEXT NOT NULL DEFAULT 'Engineering',
  password_plain TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Schedules Table
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0: Sun, 1: Mon, ...
  start_hour INT NOT NULL CHECK (start_hour BETWEEN 7 AND 22),
  end_hour INT NOT NULL CHECK (end_hour BETWEEN 8 AND 23),
  is_wfo_day BOOLEAN DEFAULT FALSE,
  locked_rest_block INT DEFAULT 12, -- 12 PM locked
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_hours CHECK (end_hour - start_hour >= 8)
);

-- 3. Time Logs (Check-in / Check-out & Status) Table
CREATE TABLE IF NOT EXISTS public.time_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  check_in_time TIMESTAMPTZ DEFAULT NOW(),
  check_out_time TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'Online' CHECK (status IN ('Online', 'Away', 'Offline')),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  within_geofence BOOLEAN DEFAULT TRUE,
  geofence_distance_meters DOUBLE PRECISION,
  total_duration_minutes INT DEFAULT 0
);

-- 4. Tickets Table
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  details TEXT,
  notes TEXT,
  deadline DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Todo' CHECK (status IN ('Todo', 'In Progress', 'Review', 'Done', 'Delayed', 'Issue')),
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  mentioned_users TEXT[], -- Array of employee IDs or departments
  division TEXT DEFAULT 'Engineering',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Chat Messages Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- Null for group/portal
  channel_type TEXT NOT NULL CHECK (channel_type IN ('DM', 'Group', 'Announcements', 'FunPortal')),
  channel_name TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'Normal' CHECK (priority IN ('Normal', 'Important', 'Urgent')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Attendance Anomalies Table
CREATE TABLE IF NOT EXISTS public.anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  anomaly_type TEXT NOT NULL CHECK (anomaly_type IN ('Late Clock-in', 'Geofence Breach', 'Missed Clock-out')),
  description TEXT NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anomalies ENABLE ROW LEVEL SECURITY;

-- Permissive policies for demo application access
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read schedules" ON public.schedules;
CREATE POLICY "Public read schedules" ON public.schedules FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read tickets" ON public.tickets;
CREATE POLICY "Public read tickets" ON public.tickets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read chat" ON public.chat_messages;
CREATE POLICY "Public read chat" ON public.chat_messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read announcements" ON public.announcements;
CREATE POLICY "Public read announcements" ON public.announcements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read anomalies" ON public.anomalies;
CREATE POLICY "Public read anomalies" ON public.anomalies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public update tickets" ON public.tickets;
CREATE POLICY "Public update tickets" ON public.tickets FOR ALL USING (true);

DROP POLICY IF EXISTS "Public update time_logs" ON public.time_logs;
CREATE POLICY "Public update time_logs" ON public.time_logs FOR ALL USING (true);

DROP POLICY IF EXISTS "Public insert chat" ON public.chat_messages;
CREATE POLICY "Public insert chat" ON public.chat_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public insert announcements" ON public.announcements;
CREATE POLICY "Public insert announcements" ON public.announcements FOR INSERT WITH CHECK (true);
