-- Add problem_domain column to registrations table
ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS problem_domain TEXT;

-- Add comment to the column
COMMENT ON COLUMN public.registrations.problem_domain IS 'Problem domain selected by the team (Agentic AI, Robotics, Cybersecurity, etc.)';

-- Create index for faster queries on problem_domain
CREATE INDEX IF NOT EXISTS idx_registrations_problem_domain ON public.registrations(problem_domain);
