-- Fix schema mismatches for Railway sync
-- Add missing columns to existing tables

-- Fix mst_ledger missing alterid column
ALTER TABLE mst_ledger ADD COLUMN IF NOT EXISTS alterid bigint DEFAULT 0;

-- Fix mst_stock_item missing additional_units column  
ALTER TABLE mst_stock_item ADD COLUMN IF NOT EXISTS additional_units character varying DEFAULT '';

-- Fix mst_group missing created_at column
ALTER TABLE mst_group ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();

-- Fix mst_vouchertype missing created_at column
ALTER TABLE mst_vouchertype ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();

-- Fix mst_godown missing created_at column
ALTER TABLE mst_godown ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();

-- Create missing trn_inventory table that Railway is trying to sync
CREATE TABLE IF NOT EXISTS trn_inventory (
    guid character varying NOT NULL,
    voucher_guid character varying,
    voucher_type character varying DEFAULT '',
    voucher_number character varying DEFAULT '',
    voucher_date date,
    item character varying NOT NULL DEFAULT '',
    _item character varying NOT NULL DEFAULT '',
    godown character varying DEFAULT '',
    _godown character varying DEFAULT '',
    batch character varying DEFAULT '',
    quantity numeric DEFAULT 0,
    rate numeric DEFAULT 0,
    value numeric DEFAULT 0,
    actual_quantity numeric DEFAULT 0,
    billed_quantity numeric DEFAULT 0,
    tracking_number character varying DEFAULT '',
    order_duedate date,
    order_status character varying DEFAULT '',
    company_id uuid,
    division_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (guid)
);

-- Enable RLS on the new table
ALTER TABLE trn_inventory ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Allow authenticated users full access to inventory" 
ON trn_inventory FOR ALL 
USING (auth.uid() IS NOT NULL);