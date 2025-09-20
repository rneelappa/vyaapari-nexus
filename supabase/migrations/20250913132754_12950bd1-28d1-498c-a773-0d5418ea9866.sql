-- Fix RLS policies for tally_sync_jobs table
-- The current policy is too restrictive for edge functions

-- Drop existing policy
DROP POLICY IF EXISTS "Authenticated users can manage sync jobs" ON tally_sync_jobs;

-- Create more specific policies
-- Allow authenticated users to view sync jobs for their accessible divisions
CREATE POLICY "Users can view sync jobs for their divisions" 
ON tally_sync_jobs 
FOR SELECT 
USING (
  division_id IN (
    SELECT ur.division_id 
    FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.division_id IS NOT NULL
  )
);

-- Allow service role to manage all sync jobs (for edge functions)
CREATE POLICY "Service role can manage all sync jobs" 
ON tally_sync_jobs 
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Allow authenticated users to create sync jobs for their divisions
CREATE POLICY "Users can create sync jobs for their divisions" 
ON tally_sync_jobs 
FOR INSERT 
WITH CHECK (
  division_id IN (
    SELECT ur.division_id 
    FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.division_id IS NOT NULL
  )
);

-- Allow authenticated users to update sync jobs for their divisions
CREATE POLICY "Users can update sync jobs for their divisions" 
ON tally_sync_jobs 
FOR UPDATE 
USING (
  division_id IN (
    SELECT ur.division_id 
    FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.division_id IS NOT NULL
  )
);

-- Create a table for detailed sync job records if it doesn't exist
CREATE TABLE IF NOT EXISTS tally_sync_job_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES tally_sync_jobs(id) ON DELETE CASCADE,
  table_name varchar NOT NULL,
  action varchar NOT NULL CHECK (action IN ('inserted', 'updated', 'ignored', 'created_master', 'error')),
  record_guid varchar NOT NULL,
  voucher_number varchar,
  record_details jsonb,
  error_message text,
  processed_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on the new table
ALTER TABLE tally_sync_job_details ENABLE ROW LEVEL SECURITY;

-- Create policies for the details table
CREATE POLICY "Users can view job details for their divisions" 
ON tally_sync_job_details 
FOR SELECT 
USING (
  job_id IN (
    SELECT tsj.id 
    FROM tally_sync_jobs tsj 
    INNER JOIN user_roles ur ON tsj.division_id = ur.division_id
    WHERE ur.user_id = auth.uid()
  )
);

CREATE POLICY "Service role can manage all job details" 
ON tally_sync_job_details 
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');