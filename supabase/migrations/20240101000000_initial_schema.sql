-- Create registrations table
CREATE TABLE public.registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Changed to SET NULL for public registrations
  team_name TEXT NOT NULL,
  team_members JSONB NOT NULL, -- Array of team member objects
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  institution TEXT,
  year_of_study TEXT,
  experience_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create problem_statements table
CREATE TABLE public.problem_statements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  difficulty TEXT,
  attachments JSONB, -- Array of file URLs or metadata
  max_team_size INTEGER DEFAULT 4,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create results table
CREATE TABLE public.results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id UUID REFERENCES public.registrations(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  prize TEXT,
  feedback TEXT,
  announced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create admin_users table for role-based access
CREATE TABLE public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Registrations: Allow public insert, users can view their own, admins can view all
CREATE POLICY "Allow public insert for registrations" ON public.registrations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read for registrations" ON public.registrations
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage registrations" ON public.registrations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Problem statements: Everyone can view active ones, admins can manage
CREATE POLICY "Everyone can view active problem statements" ON public.problem_statements
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage problem statements" ON public.problem_statements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Results: Everyone can view announced results, admins can manage
CREATE POLICY "Everyone can view announced results" ON public.results
  FOR SELECT USING (announced_at IS NOT NULL);

CREATE POLICY "Admins can manage results" ON public.results
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Admin users: Only admins can view
CREATE POLICY "Admins can view admin users" ON public.admin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Functions for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER handle_updated_at_registrations
  BEFORE UPDATE ON public.registrations
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_problem_statements
  BEFORE UPDATE ON public.problem_statements
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_results
  BEFORE UPDATE ON public.results
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
