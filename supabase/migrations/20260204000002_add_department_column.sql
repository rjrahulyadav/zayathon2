-- Add department column to registrations table
ALTER TABLE registrations
ADD COLUMN department TEXT;

-- Add comment to the column
COMMENT ON COLUMN registrations.department IS 'Department of the team leader (CSE, AIML, CSD, CSBE, IT, ECE, BME, EEE, CIVIL, AIDS, MEC, MECH)';
