-- Update tally schema tables to match tally_schema_definitions

-- First, let's add missing columns to existing tables

-- Update mst_group table to match schema definitions
ALTER TABLE tally.mst_group 
ADD COLUMN IF NOT EXISTS guid text,
ADD COLUMN IF NOT EXISTS parent text,
ADD COLUMN IF NOT EXISTS primary_group text,
ADD COLUMN IF NOT EXISTS is_revenue boolean,
ADD COLUMN IF NOT EXISTS is_deemedpositive boolean,
ADD COLUMN IF NOT EXISTS is_reserved boolean,
ADD COLUMN IF NOT EXISTS affects_gross_profit boolean,
ADD COLUMN IF NOT EXISTS sort_position integer;

-- Update mst_stock_item to match schema definitions
ALTER TABLE tally.mst_stock_item 
ADD COLUMN IF NOT EXISTS guid text,
ADD COLUMN IF NOT EXISTS parent text,
ADD COLUMN IF NOT EXISTS alias text,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS part_number text,
ADD COLUMN IF NOT EXISTS uom text,
ADD COLUMN IF NOT EXISTS alternate_uom text,
ADD COLUMN IF NOT EXISTS conversion integer,
ADD COLUMN IF NOT EXISTS opening_balance numeric,
ADD COLUMN IF NOT EXISTS opening_rate numeric,
ADD COLUMN IF NOT EXISTS opening_value numeric,
ADD COLUMN IF NOT EXISTS closing_balance numeric,
ADD COLUMN IF NOT EXISTS closing_rate numeric,
ADD COLUMN IF NOT EXISTS closing_value numeric,
ADD COLUMN IF NOT EXISTS costing_method text,
ADD COLUMN IF NOT EXISTS gst_type_of_supply text,
ADD COLUMN IF NOT EXISTS gst_hsn_code text,
ADD COLUMN IF NOT EXISTS gst_hsn_description text,
ADD COLUMN IF NOT EXISTS gst_rate numeric,
ADD COLUMN IF NOT EXISTS gst_taxability text;

-- Update trn_accounting to match schema definitions
ALTER TABLE tally.trn_accounting 
ADD COLUMN IF NOT EXISTS guid text,
ADD COLUMN IF NOT EXISTS voucher_guid text,
ADD COLUMN IF NOT EXISTS voucher_number text,
ADD COLUMN IF NOT EXISTS voucher_type text,
ADD COLUMN IF NOT EXISTS voucher_date date,
ADD COLUMN IF NOT EXISTS ledger text,
ADD COLUMN IF NOT EXISTS amount_forex numeric,
ADD COLUMN IF NOT EXISTS is_party_ledger boolean,
ADD COLUMN IF NOT EXISTS is_deemed_positive boolean;

-- Update trn_voucher to match schema definitions
ALTER TABLE tally.trn_voucher 
ADD COLUMN IF NOT EXISTS guid text,
ADD COLUMN IF NOT EXISTS voucher_number text,
ADD COLUMN IF NOT EXISTS voucher_type text,
ADD COLUMN IF NOT EXISTS date date,
ADD COLUMN IF NOT EXISTS reference text,
ADD COLUMN IF NOT EXISTS narration text,
ADD COLUMN IF NOT EXISTS party_ledger_name text,
ADD COLUMN IF NOT EXISTS basic_amount numeric,
ADD COLUMN IF NOT EXISTS discount_amount numeric,
ADD COLUMN IF NOT EXISTS total_amount numeric,
ADD COLUMN IF NOT EXISTS net_amount numeric,
ADD COLUMN IF NOT EXISTS tax_amount numeric,
ADD COLUMN IF NOT EXISTS final_amount numeric,
ADD COLUMN IF NOT EXISTS alterid bigint,
ADD COLUMN IF NOT EXISTS is_optional boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_cancelled boolean DEFAULT false;