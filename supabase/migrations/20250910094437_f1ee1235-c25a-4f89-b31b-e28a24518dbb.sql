-- Add tally_company_id column to divisions table
ALTER TABLE public.divisions 
ADD COLUMN tally_company_id text;