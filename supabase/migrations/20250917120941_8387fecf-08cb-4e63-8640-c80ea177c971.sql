-- Add missing columns to fix Railway API sync schema mismatches

-- Add alterid column to mst_group
ALTER TABLE public.mst_group 
ADD COLUMN IF NOT EXISTS alterid bigint DEFAULT 0;

-- Add alterid column to tally_trn_voucher  
ALTER TABLE public.tally_trn_voucher
ADD COLUMN IF NOT EXISTS alterid bigint DEFAULT 0;

-- Add alterid column to trn_accounting
ALTER TABLE public.trn_accounting
ADD COLUMN IF NOT EXISTS alterid bigint DEFAULT 0;

-- Add id column to mst_godown
ALTER TABLE public.mst_godown
ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();

-- Add id column to mst_vouchertype
ALTER TABLE public.mst_vouchertype
ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();

-- Add base_units column to mst_stock_item
ALTER TABLE public.mst_stock_item
ADD COLUMN IF NOT EXISTS base_units character varying DEFAULT '';

-- Add bill_credit_limit column to mst_ledger
ALTER TABLE public.mst_ledger
ADD COLUMN IF NOT EXISTS bill_credit_limit numeric DEFAULT 0;

-- Create trn_inventory table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.trn_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guid character varying NOT NULL DEFAULT '',
  voucher_type character varying DEFAULT '',
  voucher_number character varying DEFAULT '',
  voucher_date date,
  item_name character varying NOT NULL DEFAULT '',
  godown character varying DEFAULT '',
  quantity numeric DEFAULT 0,
  rate numeric DEFAULT 0,
  amount numeric DEFAULT 0,
  company_id uuid,
  division_id uuid,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on trn_inventory
ALTER TABLE public.trn_inventory ENABLE ROW LEVEL SECURITY;

-- Enable RLS on trn_address_details if not already enabled  
ALTER TABLE public.trn_address_details ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for trn_address_details if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'trn_address_details'
        AND policyname = 'Allow authenticated users full access to address details'
    ) THEN
        CREATE POLICY "Allow authenticated users full access to address details" 
        ON public.trn_address_details 
        FOR ALL 
        USING (auth.uid() IS NOT NULL)
        WITH CHECK (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- Create indexes for better performance on new columns
CREATE INDEX IF NOT EXISTS idx_mst_group_alterid ON public.mst_group(alterid);
CREATE INDEX IF NOT EXISTS idx_tally_trn_voucher_alterid ON public.tally_trn_voucher(alterid);
CREATE INDEX IF NOT EXISTS idx_trn_accounting_alterid ON public.trn_accounting(alterid);
CREATE INDEX IF NOT EXISTS idx_trn_inventory_company_division ON public.trn_inventory(company_id, division_id);