-- Add scheduler fields to divisions table
ALTER TABLE public.divisions 
ADD COLUMN IF NOT EXISTS auto_sync_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sync_frequency VARCHAR(50) DEFAULT 'disabled',
ADD COLUMN IF NOT EXISTS last_sync_attempt TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_sync_success TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sync_status VARCHAR(50) DEFAULT 'idle';

-- Create a table to track sync jobs
CREATE TABLE IF NOT EXISTS public.tally_sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  division_id UUID NOT NULL REFERENCES public.divisions(id),
  company_id UUID NOT NULL,
  job_type VARCHAR(50) NOT NULL DEFAULT 'scheduled',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  records_processed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on sync jobs table
ALTER TABLE public.tally_sync_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for sync jobs
CREATE POLICY "Authenticated users can manage sync jobs" ON public.tally_sync_jobs FOR ALL USING (auth.uid() IS NOT NULL);

-- Create index for better performance
CREATE INDEX idx_tally_sync_jobs_division_id ON public.tally_sync_jobs(division_id);
CREATE INDEX idx_tally_sync_jobs_status ON public.tally_sync_jobs(status);
CREATE INDEX idx_tally_sync_jobs_started_at ON public.tally_sync_jobs(started_at);

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;