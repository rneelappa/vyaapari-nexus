-- Add unique constraints for upsert operations on master tables
DO $$ 
BEGIN
    -- Master tables constraints
    ALTER TABLE public.mst_attendance_type ADD CONSTRAINT mst_attendance_type_guid_company_division_unique UNIQUE (guid, company_id, division_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.mst_cost_category ADD CONSTRAINT mst_cost_category_guid_company_division_unique UNIQUE (guid, company_id, division_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.mst_cost_centre ADD CONSTRAINT mst_cost_centre_guid_company_division_unique UNIQUE (guid, company_id, division_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.mst_employee ADD CONSTRAINT mst_employee_guid_company_division_unique UNIQUE (guid, company_id, division_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.mst_godown ADD CONSTRAINT mst_godown_guid_company_division_unique UNIQUE (guid, company_id, division_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.mst_group ADD CONSTRAINT mst_group_guid_company_division_unique UNIQUE (guid, company_id, division_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.mst_ledger ADD CONSTRAINT mst_ledger_guid_company_division_unique UNIQUE (guid, company_id, division_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.mst_payhead ADD CONSTRAINT mst_payhead_guid_company_division_unique UNIQUE (guid, company_id, division_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.mst_stock_group ADD CONSTRAINT mst_stock_group_guid_company_division_unique UNIQUE (guid, company_id, division_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.mst_stock_item ADD CONSTRAINT mst_stock_item_guid_company_division_unique UNIQUE (guid, company_id, division_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.mst_uom ADD CONSTRAINT mst_uom_guid_company_division_unique UNIQUE (guid, company_id, division_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.mst_vouchertype ADD CONSTRAINT mst_vouchertype_guid_company_division_unique UNIQUE (guid, company_id, division_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;