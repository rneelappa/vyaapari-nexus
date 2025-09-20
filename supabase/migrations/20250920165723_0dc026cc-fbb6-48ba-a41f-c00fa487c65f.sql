-- Phase 1: Add missing status columns to tally.voucher table
ALTER TABLE tally.voucher 
ADD COLUMN IF NOT EXISTS is_cancelled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_optional boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS total_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS party_name varchar(255) DEFAULT '';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_voucher_is_cancelled ON tally.voucher(is_cancelled);
CREATE INDEX IF NOT EXISTS idx_voucher_party_name ON tally.voucher(party_name);
CREATE INDEX IF NOT EXISTS idx_voucher_total_amount ON tally.voucher(total_amount);

-- Add comments for clarity
COMMENT ON COLUMN tally.voucher.is_cancelled IS 'Flag indicating if voucher is cancelled';
COMMENT ON COLUMN tally.voucher.is_optional IS 'Flag indicating if voucher is optional';
COMMENT ON COLUMN tally.voucher.total_amount IS 'Total amount of the voucher';
COMMENT ON COLUMN tally.voucher.party_name IS 'Name of the party associated with voucher';