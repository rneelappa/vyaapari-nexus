-- Add voucher_guid column to trn_inventory table to link inventory entries to vouchers
ALTER TABLE public.trn_inventory 
ADD COLUMN voucher_guid character varying NOT NULL DEFAULT '';

-- Create index for better performance on voucher_guid lookups
CREATE INDEX idx_trn_inventory_voucher_guid ON public.trn_inventory(voucher_guid);

-- Update existing records to set voucher_guid based on company/division if needed
-- (This assumes existing data might need to be linked - adjust as needed)
UPDATE public.trn_inventory 
SET voucher_guid = 'orphaned-' || guid::text 
WHERE voucher_guid = '' OR voucher_guid IS NULL;