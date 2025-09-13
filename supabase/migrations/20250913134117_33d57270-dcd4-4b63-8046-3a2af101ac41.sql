-- Add health check fields to divisions table
ALTER TABLE public.divisions 
ADD COLUMN IF NOT EXISTS tally_health_status character varying DEFAULT 'unknown',
ADD COLUMN IF NOT EXISTS last_health_check timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS health_check_response_time integer DEFAULT NULL; -- in milliseconds

-- Create index for efficient health status queries
CREATE INDEX IF NOT EXISTS idx_divisions_tally_health ON public.divisions(tally_health_status, tally_enabled);

-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;