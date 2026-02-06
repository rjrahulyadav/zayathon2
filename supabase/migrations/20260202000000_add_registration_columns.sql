-- Add missing fields used by the app for registrations
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS problem_statement TEXT DEFAULT 'Not specified';

ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Backfill existing rows to ensure consistent values
UPDATE public.registrations
SET problem_statement = COALESCE(problem_statement, 'Not specified');

UPDATE public.registrations
SET status = COALESCE(status, 'pending');
