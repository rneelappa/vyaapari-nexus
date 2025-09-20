-- Add Tally integration columns to divisions table
ALTER TABLE public.divisions ADD COLUMN IF NOT EXISTS tally_enabled boolean DEFAULT false;
ALTER TABLE public.divisions ADD COLUMN IF NOT EXISTS tally_url text;
ALTER TABLE public.divisions ADD COLUMN IF NOT EXISTS tally_company_id text;