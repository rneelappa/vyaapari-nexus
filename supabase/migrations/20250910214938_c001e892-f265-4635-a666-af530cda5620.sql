-- Grant full CRUD permissions (INSERT, UPDATE, DELETE) to authenticated users on master data tables
-- (SELECT was already granted in previous migration)

-- Master data tables
GRANT INSERT, UPDATE, DELETE ON TABLE public.mst_group TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.mst_ledger TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.mst_stock_item TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.mst_cost_centre TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.mst_cost_category TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.mst_godown TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.mst_employee TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.mst_payhead TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.mst_uom TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.mst_vouchertype TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.mst_attendance_type TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.mst_gst_effective_rate TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.mst_opening_batch_allocation TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.mst_opening_bill_allocation TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.mst_stock_group TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.mst_stockitem_standard_cost TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.mst_stockitem_standard_price TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.mst_company TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.mst_division TO authenticated;

-- Transaction tables
GRANT INSERT, UPDATE, DELETE ON TABLE public.trn_accounting TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.trn_attendance TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.trn_bank TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.trn_batch TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.trn_bill TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.trn_closingstock_ledger TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.trn_cost_category_centre TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.trn_cost_centre TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.trn_cost_inventory_category_centre TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.trn_employee TO authenticated;

-- Tally-specific tables
GRANT INSERT, UPDATE, DELETE ON TABLE public.tally_mst_group TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.tally_mst_ledger TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.tally_mst_stock_item TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.tally_trn_voucher TO authenticated;