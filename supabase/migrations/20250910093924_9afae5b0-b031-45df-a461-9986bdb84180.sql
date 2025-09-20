-- Add Tally integration fields to divisions table
ALTER TABLE public.divisions 
ADD COLUMN tally_enabled boolean NOT NULL DEFAULT false,
ADD COLUMN tally_url text,
ADD COLUMN tally_last_sync timestamp with time zone;

-- Add index for better performance when filtering tally-enabled divisions
CREATE INDEX idx_divisions_tally_enabled ON public.divisions(tally_enabled) WHERE tally_enabled = true;

-- Update some example divisions to have Tally enabled for testing
UPDATE public.divisions 
SET tally_enabled = true, tally_url = 'http://localhost:9000'
WHERE name = 'Engineering';

-- Add comment for documentation
COMMENT ON COLUMN public.divisions.tally_enabled IS 'Whether Tally integration is enabled for this division';
COMMENT ON COLUMN public.divisions.tally_url IS 'URL of the Tally server for this division';
COMMENT ON COLUMN public.divisions.tally_last_sync IS 'Timestamp of the last successful Tally data sync';