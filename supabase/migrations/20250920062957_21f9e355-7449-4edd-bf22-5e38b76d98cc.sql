-- Rename all Tally tables in public schema with bkp_ prefix
-- This preserves existing data while transitioning to tally schema only

-- Master Data Tables (mst_*)
ALTER TABLE public.mst_attendance_type RENAME TO bkp_mst_attendance_type;
ALTER TABLE public.mst_company RENAME TO bkp_mst_company;
ALTER TABLE public.mst_cost_category RENAME TO bkp_mst_cost_category;
ALTER TABLE public.mst_cost_centre RENAME TO bkp_mst_cost_centre;
ALTER TABLE public.mst_division RENAME TO bkp_mst_division;
ALTER TABLE public.mst_employee RENAME TO bkp_mst_employee;
ALTER TABLE public.mst_godown RENAME TO bkp_mst_godown;
ALTER TABLE public.mst_group RENAME TO bkp_mst_group;
ALTER TABLE public.mst_gst_effective_rate RENAME TO bkp_mst_gst_effective_rate;
ALTER TABLE public.mst_ledger RENAME TO bkp_mst_ledger;
ALTER TABLE public.mst_opening_batch_allocation RENAME TO bkp_mst_opening_batch_allocation;
ALTER TABLE public.mst_opening_bill_allocation RENAME TO bkp_mst_opening_bill_allocation;
ALTER TABLE public.mst_payhead RENAME TO bkp_mst_payhead;
ALTER TABLE public.mst_stock_group RENAME TO bkp_mst_stock_group;
ALTER TABLE public.mst_stock_item RENAME TO bkp_mst_stock_item;
ALTER TABLE public.mst_stockitem_standard_cost RENAME TO bkp_mst_stockitem_standard_cost;
ALTER TABLE public.mst_stockitem_standard_price RENAME TO bkp_mst_stockitem_standard_price;
ALTER TABLE public.mst_uom RENAME TO bkp_mst_uom;
ALTER TABLE public.mst_vouchertype RENAME TO bkp_mst_vouchertype;

-- Transaction Tables (trn_*)
ALTER TABLE public.trn_accounting RENAME TO bkp_trn_accounting;
ALTER TABLE public.trn_address_details RENAME TO bkp_trn_address_details;
ALTER TABLE public.trn_attendance RENAME TO bkp_trn_attendance;
ALTER TABLE public.trn_bank RENAME TO bkp_trn_bank;
ALTER TABLE public.trn_batch RENAME TO bkp_trn_batch;
ALTER TABLE public.trn_bill RENAME TO bkp_trn_bill;
ALTER TABLE public.trn_category_allocation RENAME TO bkp_trn_category_allocation;
ALTER TABLE public.trn_closingstock_ledger RENAME TO bkp_trn_closingstock_ledger;
ALTER TABLE public.trn_cost_category_centre RENAME TO bkp_trn_cost_category_centre;
ALTER TABLE public.trn_cost_centre RENAME TO bkp_trn_cost_centre;
ALTER TABLE public.trn_cost_inventory_category_centre RENAME TO bkp_trn_cost_inventory_category_centre;
ALTER TABLE public.trn_due_date RENAME TO bkp_trn_due_date;
ALTER TABLE public.trn_employee RENAME TO bkp_trn_employee;
ALTER TABLE public.trn_gst_details RENAME TO bkp_trn_gst_details;
ALTER TABLE public.trn_inventory RENAME TO bkp_trn_inventory;
ALTER TABLE public.trn_inventory_accounting RENAME TO bkp_trn_inventory_accounting;
ALTER TABLE public.trn_party_details RENAME TO bkp_trn_party_details;
ALTER TABLE public.trn_payhead RENAME TO bkp_trn_payhead;
ALTER TABLE public.trn_reference RENAME TO bkp_trn_reference;
ALTER TABLE public.trn_shipping_details RENAME TO bkp_trn_shipping_details;
ALTER TABLE public.trn_tax_details RENAME TO bkp_trn_tax_details;

-- Tally-Specific Tables
ALTER TABLE public.tally_mst_group RENAME TO bkp_tally_mst_group;
ALTER TABLE public.tally_mst_ledger RENAME TO bkp_tally_mst_ledger;
ALTER TABLE public.tally_mst_stock_item RENAME TO bkp_tally_mst_stock_item;
ALTER TABLE public.tally_schema_definitions RENAME TO bkp_tally_schema_definitions;
ALTER TABLE public.tally_sync_job_details RENAME TO bkp_tally_sync_job_details;
ALTER TABLE public.tally_sync_jobs RENAME TO bkp_tally_sync_jobs;
ALTER TABLE public.tally_trn_voucher RENAME TO bkp_tally_trn_voucher;

-- Keep the backup table that was already renamed
-- bkp_tally_schema_definitions already exists, so skip it

-- Update any RLS policies that might reference these tables
-- Note: Most policies should continue to work as they reference auth functions