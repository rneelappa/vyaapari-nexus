-- Grant SELECT permissions on all master data tables to authenticated users
GRANT SELECT ON TABLE public.mst_group TO authenticated;
GRANT SELECT ON TABLE public.mst_stock_item TO authenticated;
GRANT SELECT ON TABLE public.mst_cost_centre TO authenticated;
GRANT SELECT ON TABLE public.mst_cost_category TO authenticated;
GRANT SELECT ON TABLE public.mst_godown TO authenticated;
GRANT SELECT ON TABLE public.mst_employee TO authenticated;
GRANT SELECT ON TABLE public.mst_payhead TO authenticated;
GRANT SELECT ON TABLE public.mst_uom TO authenticated;
GRANT SELECT ON TABLE public.mst_vouchertype TO authenticated;
GRANT SELECT ON TABLE public.mst_attendance_type TO authenticated;
GRANT SELECT ON TABLE public.mst_gst_effective_rate TO authenticated;
GRANT SELECT ON TABLE public.mst_opening_batch_allocation TO authenticated;
GRANT SELECT ON TABLE public.mst_opening_bill_allocation TO authenticated;
GRANT SELECT ON TABLE public.mst_stock_group TO authenticated;
GRANT SELECT ON TABLE public.mst_stockitem_standard_cost TO authenticated;
GRANT SELECT ON TABLE public.mst_stockitem_standard_price TO authenticated;
GRANT SELECT ON TABLE public.mst_company TO authenticated;
GRANT SELECT ON TABLE public.mst_division TO authenticated;

-- Grant SELECT permissions on transaction tables to authenticated users
GRANT SELECT ON TABLE public.trn_accounting TO authenticated;
GRANT SELECT ON TABLE public.trn_attendance TO authenticated;
GRANT SELECT ON TABLE public.trn_bank TO authenticated;
GRANT SELECT ON TABLE public.trn_batch TO authenticated;
GRANT SELECT ON TABLE public.trn_bill TO authenticated;
GRANT SELECT ON TABLE public.trn_closingstock_ledger TO authenticated;
GRANT SELECT ON TABLE public.trn_cost_category_centre TO authenticated;
GRANT SELECT ON TABLE public.trn_cost_centre TO authenticated;
GRANT SELECT ON TABLE public.trn_cost_inventory_category_centre TO authenticated;
GRANT SELECT ON TABLE public.trn_employee TO authenticated;

-- Grant SELECT permissions on Tally prefixed tables to authenticated users
GRANT SELECT ON TABLE public.tally_mst_group TO authenticated;
GRANT SELECT ON TABLE public.tally_mst_ledger TO authenticated;
GRANT SELECT ON TABLE public.tally_mst_stock_item TO authenticated;
GRANT SELECT ON TABLE public.tally_trn_voucher TO authenticated;

-- Grant SELECT permissions to anon users for public access if needed
GRANT SELECT ON TABLE public.mst_group TO anon;
GRANT SELECT ON TABLE public.mst_stock_item TO anon;
GRANT SELECT ON TABLE public.mst_cost_centre TO anon;
GRANT SELECT ON TABLE public.mst_cost_category TO anon;
GRANT SELECT ON TABLE public.mst_godown TO anon;
GRANT SELECT ON TABLE public.mst_employee TO anon;
GRANT SELECT ON TABLE public.mst_payhead TO anon;
GRANT SELECT ON TABLE public.mst_uom TO anon;
GRANT SELECT ON TABLE public.mst_vouchertype TO anon;
GRANT SELECT ON TABLE public.mst_attendance_type TO anon;
GRANT SELECT ON TABLE public.mst_gst_effective_rate TO anon;
GRANT SELECT ON TABLE public.mst_opening_batch_allocation TO anon;
GRANT SELECT ON TABLE public.mst_opening_bill_allocation TO anon;
GRANT SELECT ON TABLE public.mst_stock_group TO anon;
GRANT SELECT ON TABLE public.mst_stockitem_standard_cost TO anon;
GRANT SELECT ON TABLE public.mst_stockitem_standard_price TO anon;
GRANT SELECT ON TABLE public.mst_company TO anon;
GRANT SELECT ON TABLE public.mst_division TO anon;
GRANT SELECT ON TABLE public.trn_accounting TO anon;
GRANT SELECT ON TABLE public.trn_attendance TO anon;
GRANT SELECT ON TABLE public.trn_bank TO anon;
GRANT SELECT ON TABLE public.trn_batch TO anon;
GRANT SELECT ON TABLE public.trn_bill TO anon;
GRANT SELECT ON TABLE public.trn_closingstock_ledger TO anon;
GRANT SELECT ON TABLE public.trn_cost_category_centre TO anon;
GRANT SELECT ON TABLE public.trn_cost_centre TO anon;
GRANT SELECT ON TABLE public.trn_cost_inventory_category_centre TO anon;
GRANT SELECT ON TABLE public.trn_employee TO anon;
GRANT SELECT ON TABLE public.tally_mst_group TO anon;
GRANT SELECT ON TABLE public.tally_mst_ledger TO anon;
GRANT SELECT ON TABLE public.tally_mst_stock_item TO anon;
GRANT SELECT ON TABLE public.tally_trn_voucher TO anon;