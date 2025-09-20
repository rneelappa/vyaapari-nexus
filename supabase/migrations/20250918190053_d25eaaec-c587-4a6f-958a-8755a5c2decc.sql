-- Fix security issue: Set proper search_path for the tally.update_timestamp function
CREATE OR REPLACE FUNCTION tally.update_timestamp() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = tally;