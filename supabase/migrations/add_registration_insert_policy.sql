CREATE POLICY "Allow public insert for registrations" ON public.registrations
  FOR INSERT WITH CHECK (true);