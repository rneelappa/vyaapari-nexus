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