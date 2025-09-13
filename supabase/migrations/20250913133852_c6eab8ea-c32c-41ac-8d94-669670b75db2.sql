-- Ensure RLS is enabled on the target tables
ALTER TABLE IF EXISTS public.tally_sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tally_sync_job_details ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid "already exists" errors
DROP POLICY IF EXISTS "Authenticated users can view sync jobs" ON public.tally_sync_jobs;
DROP POLICY IF EXISTS "Authenticated users can create sync jobs" ON public.tally_sync_jobs;
DROP POLICY IF EXISTS "Authenticated users can update sync jobs" ON public.tally_sync_jobs;
DROP POLICY IF EXISTS "Service role can manage all sync jobs" ON public.tally_sync_jobs;

DROP POLICY IF EXISTS "Authenticated users can view job details" ON public.tally_sync_job_details;
DROP POLICY IF EXISTS "Service role can manage all job details" ON public.tally_sync_job_details;

-- Create clean, permissive policies for app usage and service role
CREATE POLICY "Authenticated users can view sync jobs"
ON public.tally_sync_jobs
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create sync jobs"
ON public.tally_sync_jobs
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update sync jobs"
ON public.tally_sync_jobs
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Service role can manage all sync jobs"
ON public.tally_sync_jobs
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can view job details"
ON public.tally_sync_job_details
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Service role can manage all job details"
ON public.tally_sync_job_details
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');