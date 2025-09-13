-- Fix RLS policies causing permission denied on sync tables by making policies PERMISSIVE and scoping service role

-- Ensure RLS is enabled
ALTER TABLE public.tally_sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tally_sync_job_details ENABLE ROW LEVEL SECURITY;

-- Drop existing restrictive policies if they exist (tally_sync_jobs)
DROP POLICY IF EXISTS "Authenticated users can create sync jobs" ON public.tally_sync_jobs;
DROP POLICY IF EXISTS "Authenticated users can update sync jobs" ON public.tally_sync_jobs;
DROP POLICY IF EXISTS "Authenticated users can view sync jobs" ON public.tally_sync_jobs;
DROP POLICY IF EXISTS "Service role can manage all sync jobs" ON public.tally_sync_jobs;

-- Recreate PERMISSIVE policies for tally_sync_jobs
CREATE POLICY "Authenticated users can create sync jobs"
ON public.tally_sync_jobs
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update sync jobs"
ON public.tally_sync_jobs
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view sync jobs"
ON public.tally_sync_jobs
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Service role can manage all sync jobs"
ON public.tally_sync_jobs
AS PERMISSIVE
FOR ALL
TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Drop existing restrictive policies if they exist (tally_sync_job_details)
DROP POLICY IF EXISTS "Authenticated users can view job details" ON public.tally_sync_job_details;
DROP POLICY IF EXISTS "Service role can manage all job details" ON public.tally_sync_job_details;

-- Recreate PERMISSIVE policies for tally_sync_job_details
CREATE POLICY "Authenticated users can view job details"
ON public.tally_sync_job_details
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Service role can manage all job details"
ON public.tally_sync_job_details
AS PERMISSIVE
FOR ALL
TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');