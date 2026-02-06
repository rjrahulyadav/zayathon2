-- Allow public updates to registrations (for dev mode and payment updates)
-- This allows anyone to update registration status and payment screenshot
-- In production, you should restrict this to only allow updating specific fields
CREATE POLICY "Allow public update for registrations" ON public.registrations
  FOR UPDATE USING (true)
  WITH CHECK (true);

-- Add comment
COMMENT ON POLICY "Allow public update for registrations" ON public.registrations 
IS 'Allows public updates for registrations. In production, consider restricting to specific fields only.';
