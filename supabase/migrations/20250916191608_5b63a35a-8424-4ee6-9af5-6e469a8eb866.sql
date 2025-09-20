-- Add archived column to companies table
ALTER TABLE companies 
ADD COLUMN archived boolean NOT NULL DEFAULT false;

-- Add index for better performance when filtering archived companies
CREATE INDEX idx_companies_archived ON companies(archived) WHERE archived = false;

-- Update companies that don't have tally-enabled divisions to be archived instead of deleted
UPDATE companies 
SET archived = true 
WHERE id NOT IN (
  SELECT DISTINCT d.company_id 
  FROM divisions d 
  WHERE d.tally_enabled = true 
  AND d.is_active = true
  AND d.company_id IS NOT NULL
);