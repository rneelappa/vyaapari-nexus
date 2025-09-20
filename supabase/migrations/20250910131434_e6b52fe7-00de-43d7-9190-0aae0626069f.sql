-- Add unique constraints for transaction tables and enable RLS on Tally tables

-- Transaction tables constraints
DO $$ 
BEGIN
    ALTER TABLE public.trn_accounting ADD CONSTRAINT trn_accounting_guid_company_division_unique UNIQUE (guid, company_id, division_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.trn_attendance ADD CONSTRAINT trn_attendance_guid_company_division_unique UNIQUE (guid, company_id, division_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.trn_bank ADD CONSTRAINT trn_bank_guid_company_division_unique UNIQUE (guid, company_id, division_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.trn_batch ADD CONSTRAINT trn_batch_guid_company_division_unique UNIQUE (guid, company_id, division_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.trn_bill ADD CONSTRAINT trn_bill_guid_company_division_unique UNIQUE (guid, company_id, division_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.trn_cost_category_centre ADD CONSTRAINT trn_cost_category_centre_guid_company_division_unique UNIQUE (guid, company_id, division_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.trn_cost_centre ADD CONSTRAINT trn_cost_centre_guid_company_division_unique UNIQUE (guid, company_id, division_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.trn_cost_inventory_category_centre ADD CONSTRAINT trn_cost_inventory_category_centre_guid_company_division_unique UNIQUE (guid, company_id, division_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.trn_employee ADD CONSTRAINT trn_employee_guid_company_division_unique UNIQUE (guid, company_id, division_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.trn_inventory ADD CONSTRAINT trn_inventory_guid_company_division_unique UNIQUE (guid, company_id, division_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.trn_inventory_accounting ADD CONSTRAINT trn_inventory_accounting_guid_company_division_unique UNIQUE (guid, company_id, division_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.trn_payhead ADD CONSTRAINT trn_payhead_guid_company_division_unique UNIQUE (guid, company_id, division_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.trn_voucher ADD CONSTRAINT trn_voucher_guid_company_division_unique UNIQUE (guid, company_id, division_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Simplified Tally tables constraints
DO $$ 
BEGIN
    ALTER TABLE public.tally_mst_group ADD CONSTRAINT tally_mst_group_guid_company_division_unique UNIQUE (guid, company_id, division_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.tally_mst_ledger ADD CONSTRAINT tally_mst_ledger_guid_company_division_unique UNIQUE (guid, company_id, division_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.tally_mst_stock_item ADD CONSTRAINT tally_mst_stock_item_guid_company_division_unique UNIQUE (guid, company_id, division_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.tally_trn_voucher ADD CONSTRAINT tally_trn_voucher_guid_company_division_unique UNIQUE (guid, company_id, division_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;