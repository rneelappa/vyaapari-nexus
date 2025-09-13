-- Grant table privileges that are required before RLS policies can be evaluated

-- Grant SELECT privileges to authenticated role on sync tables
GRANT SELECT ON public.tally_sync_jobs TO authenticated;
GRANT SELECT ON public.tally_sync_job_details TO authenticated;

-- Grant ALL privileges to service_role on sync tables
GRANT ALL ON public.tally_sync_jobs TO service_role;
GRANT ALL ON public.tally_sync_job_details TO service_role;

-- Set default privileges for future tables to avoid this issue
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;