-- Fix database permissions for API service role
-- Grant permissions to supabase_admin (service role) for all Tally tables

-- Master tables permissions
GRANT ALL ON TABLE public.mst_company TO supabase_admin;
GRANT ALL ON TABLE public.mst_division TO supabase_admin;
GRANT ALL ON TABLE public.mst_attendance_type TO supabase_admin;
GRANT ALL ON TABLE public.mst_cost_category TO supabase_admin;
GRANT ALL ON TABLE public.mst_cost_centre TO supabase_admin;
GRANT ALL ON TABLE public.mst_employee TO supabase_admin;
GRANT ALL ON TABLE public.mst_godown TO supabase_admin;
GRANT ALL ON TABLE public.mst_group TO supabase_admin;
GRANT ALL ON TABLE public.mst_gst_effective_rate TO supabase_admin;
GRANT ALL ON TABLE public.mst_ledger TO supabase_admin;
GRANT ALL ON TABLE public.mst_opening_batch_allocation TO supabase_admin;
GRANT ALL ON TABLE public.mst_opening_bill_allocation TO supabase_admin;
GRANT ALL ON TABLE public.mst_payhead TO supabase_admin;
GRANT ALL ON TABLE public.mst_stock_group TO supabase_admin;
GRANT ALL ON TABLE public.mst_stock_item TO supabase_admin;
GRANT ALL ON TABLE public.mst_stockitem_standard_cost TO supabase_admin;
GRANT ALL ON TABLE public.mst_stockitem_standard_price TO supabase_admin;
GRANT ALL ON TABLE public.mst_uom TO supabase_admin;
GRANT ALL ON TABLE public.mst_vouchertype TO supabase_admin;

-- Transaction tables permissions
GRANT ALL ON TABLE public.trn_accounting TO supabase_admin;
GRANT ALL ON TABLE public.trn_attendance TO supabase_admin;
GRANT ALL ON TABLE public.trn_bank TO supabase_admin;
GRANT ALL ON TABLE public.trn_batch TO supabase_admin;
GRANT ALL ON TABLE public.trn_bill TO supabase_admin;
GRANT ALL ON TABLE public.trn_closingstock_ledger TO supabase_admin;
GRANT ALL ON TABLE public.trn_cost_category_centre TO supabase_admin;
GRANT ALL ON TABLE public.trn_cost_centre TO supabase_admin;
GRANT ALL ON TABLE public.trn_cost_inventory_category_centre TO supabase_admin;
GRANT ALL ON TABLE public.trn_employee TO supabase_admin;
GRANT ALL ON TABLE public.trn_inventory TO supabase_admin;
GRANT ALL ON TABLE public.trn_inventory_accounting TO supabase_admin;
GRANT ALL ON TABLE public.trn_payhead TO supabase_admin;
GRANT ALL ON TABLE public.trn_voucher TO supabase_admin;

-- Simplified Tally tables permissions
GRANT ALL ON TABLE public.tally_mst_group TO supabase_admin;
GRANT ALL ON TABLE public.tally_mst_ledger TO supabase_admin;
GRANT ALL ON TABLE public.tally_mst_stock_item TO supabase_admin;
GRANT ALL ON TABLE public.tally_trn_voucher TO supabase_admin;

-- Add unique constraints for upsert operations on GUID fields
-- Master tables constraints
ALTER TABLE public.mst_attendance_type ADD CONSTRAINT IF NOT EXISTS mst_attendance_type_guid_company_division_unique UNIQUE (guid, company_id, division_id);
ALTER TABLE public.mst_cost_category ADD CONSTRAINT IF NOT EXISTS mst_cost_category_guid_company_division_unique UNIQUE (guid, company_id, division_id);
ALTER TABLE public.mst_cost_centre ADD CONSTRAINT IF NOT EXISTS mst_cost_centre_guid_company_division_unique UNIQUE (guid, company_id, division_id);
ALTER TABLE public.mst_employee ADD CONSTRAINT IF NOT EXISTS mst_employee_guid_company_division_unique UNIQUE (guid, company_id, division_id);
ALTER TABLE public.mst_godown ADD CONSTRAINT IF NOT EXISTS mst_godown_guid_company_division_unique UNIQUE (guid, company_id, division_id);
ALTER TABLE public.mst_group ADD CONSTRAINT IF NOT EXISTS mst_group_guid_company_division_unique UNIQUE (guid, company_id, division_id);
ALTER TABLE public.mst_ledger ADD CONSTRAINT IF NOT EXISTS mst_ledger_guid_company_division_unique UNIQUE (guid, company_id, division_id);
ALTER TABLE public.mst_payhead ADD CONSTRAINT IF NOT EXISTS mst_payhead_guid_company_division_unique UNIQUE (guid, company_id, division_id);
ALTER TABLE public.mst_stock_group ADD CONSTRAINT IF NOT EXISTS mst_stock_group_guid_company_division_unique UNIQUE (guid, company_id, division_id);
ALTER TABLE public.mst_stock_item ADD CONSTRAINT IF NOT EXISTS mst_stock_item_guid_company_division_unique UNIQUE (guid, company_id, division_id);
ALTER TABLE public.mst_uom ADD CONSTRAINT IF NOT EXISTS mst_uom_guid_company_division_unique UNIQUE (guid, company_id, division_id);
ALTER TABLE public.mst_vouchertype ADD CONSTRAINT IF NOT EXISTS mst_vouchertype_guid_company_division_unique UNIQUE (guid, company_id, division_id);

-- Transaction tables constraints
ALTER TABLE public.trn_accounting ADD CONSTRAINT IF NOT EXISTS trn_accounting_guid_company_division_unique UNIQUE (guid, company_id, division_id);
ALTER TABLE public.trn_attendance ADD CONSTRAINT IF NOT EXISTS trn_attendance_guid_company_division_unique UNIQUE (guid, company_id, division_id);
ALTER TABLE public.trn_bank ADD CONSTRAINT IF NOT EXISTS trn_bank_guid_company_division_unique UNIQUE (guid, company_id, division_id);
ALTER TABLE public.trn_batch ADD CONSTRAINT IF NOT EXISTS trn_batch_guid_company_division_unique UNIQUE (guid, company_id, division_id);
ALTER TABLE public.trn_bill ADD CONSTRAINT IF NOT EXISTS trn_bill_guid_company_division_unique UNIQUE (guid, company_id, division_id);
ALTER TABLE public.trn_cost_category_centre ADD CONSTRAINT IF NOT EXISTS trn_cost_category_centre_guid_company_division_unique UNIQUE (guid, company_id, division_id);
ALTER TABLE public.trn_cost_centre ADD CONSTRAINT IF NOT EXISTS trn_cost_centre_guid_company_division_unique UNIQUE (guid, company_id, division_id);
ALTER TABLE public.trn_cost_inventory_category_centre ADD CONSTRAINT IF NOT EXISTS trn_cost_inventory_category_centre_guid_company_division_unique UNIQUE (guid, company_id, division_id);
ALTER TABLE public.trn_employee ADD CONSTRAINT IF NOT EXISTS trn_employee_guid_company_division_unique UNIQUE (guid, company_id, division_id);
ALTER TABLE public.trn_inventory ADD CONSTRAINT IF NOT EXISTS trn_inventory_guid_company_division_unique UNIQUE (guid, company_id, division_id);
ALTER TABLE public.trn_inventory_accounting ADD CONSTRAINT IF NOT EXISTS trn_inventory_accounting_guid_company_division_unique UNIQUE (guid, company_id, division_id);
ALTER TABLE public.trn_payhead ADD CONSTRAINT IF NOT EXISTS trn_payhead_guid_company_division_unique UNIQUE (guid, company_id, division_id);
ALTER TABLE public.trn_voucher ADD CONSTRAINT IF NOT EXISTS trn_voucher_guid_company_division_unique UNIQUE (guid, company_id, division_id);

-- Simplified Tally tables constraints
ALTER TABLE public.tally_mst_group ADD CONSTRAINT IF NOT EXISTS tally_mst_group_guid_company_division_unique UNIQUE (guid, company_id, division_id);
ALTER TABLE public.tally_mst_ledger ADD CONSTRAINT IF NOT EXISTS tally_mst_ledger_guid_company_division_unique UNIQUE (guid, company_id, division_id);
ALTER TABLE public.tally_mst_stock_item ADD CONSTRAINT IF NOT EXISTS tally_mst_stock_item_guid_company_division_unique UNIQUE (guid, company_id, division_id);
ALTER TABLE public.tally_trn_voucher ADD CONSTRAINT IF NOT EXISTS tally_trn_voucher_guid_company_division_unique UNIQUE (guid, company_id, division_id);