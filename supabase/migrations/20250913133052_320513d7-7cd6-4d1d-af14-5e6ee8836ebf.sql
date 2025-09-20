-- Add permissive SELECT policies to resolve UI permission errors
-- Allow all authenticated users to view sync jobs
CREATE POLICY IF NOT EXISTS "Authenticated users can view sync jobs"
ON tally_sync_jobs
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Allow all authenticated users to view sync job details
CREATE POLICY IF NOT EXISTS "Authenticated users can view job details"
ON tally_sync_job_details
FOR SELECT
USING (auth.uid() IS NOT NULL);