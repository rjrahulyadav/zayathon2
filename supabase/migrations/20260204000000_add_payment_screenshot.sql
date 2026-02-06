-- Add payment_screenshot column to registrations table
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS payment_screenshot TEXT;

-- Create storage bucket for payment screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('payments', 'payments', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the payments bucket
-- Allow public read access
CREATE POLICY "Public Access for Payment Screenshots"
ON storage.objects FOR SELECT
USING (bucket_id = 'payments');

-- Allow authenticated users and public to upload
CREATE POLICY "Anyone can upload payment screenshots"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'payments');

-- Allow users to update their own uploads
CREATE POLICY "Users can update their own payment screenshots"
ON storage.objects FOR UPDATE
USING (bucket_id = 'payments');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own payment screenshots"
ON storage.objects FOR DELETE
USING (bucket_id = 'payments');

-- Add comment
COMMENT ON COLUMN public.registrations.payment_screenshot IS 'URL to the payment screenshot stored in Supabase Storage';
