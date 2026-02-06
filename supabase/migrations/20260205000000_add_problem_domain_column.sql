-- Add problem_domain column to registrations table
ALTER TABLE registrations
ADD COLUMN problem_domain TEXT;

-- Add comment to the column
COMMENT ON COLUMN registrations.problem_domain IS 'Problem domain selected by the team (Agentic AI, Robotics, Cybersecurity, etc.)';

-- Create index for faster queries on problem_domain
CREATE INDEX idx_registrations_problem_domain ON registrations(problem_domain);
