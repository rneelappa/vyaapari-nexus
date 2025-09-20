-- Phase 1: Core Entity Relationships
-- Add foreign keys for company_id and division_id across all master tables

-- First, ensure divisions table has proper foreign key to companies
ALTER TABLE public.divisions 
ADD CONSTRAINT fk_divisions_company_id 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

-- Master data tables - company and division relationships
ALTER TABLE public.mst_attendance_type 
ADD CONSTRAINT fk_mst_attendance_type_company_id 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.mst_attendance_type 
ADD CONSTRAINT fk_mst_attendance_type_division_id 
FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON DELETE CASCADE;

ALTER TABLE public.mst_cost_category 
ADD CONSTRAINT fk_mst_cost_category_company_id 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.mst_cost_category 
ADD CONSTRAINT fk_mst_cost_category_division_id 
FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON DELETE CASCADE;

ALTER TABLE public.mst_cost_centre 
ADD CONSTRAINT fk_mst_cost_centre_company_id 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.mst_cost_centre 
ADD CONSTRAINT fk_mst_cost_centre_division_id 
FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON DELETE CASCADE;

ALTER TABLE public.mst_employee 
ADD CONSTRAINT fk_mst_employee_company_id 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.mst_employee 
ADD CONSTRAINT fk_mst_employee_division_id 
FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON DELETE CASCADE;

ALTER TABLE public.mst_godown 
ADD CONSTRAINT fk_mst_godown_company_id 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.mst_godown 
ADD CONSTRAINT fk_mst_godown_division_id 
FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON DELETE CASCADE;

ALTER TABLE public.mst_group 
ADD CONSTRAINT fk_mst_group_company_id 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.mst_group 
ADD CONSTRAINT fk_mst_group_division_id 
FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON DELETE CASCADE;

ALTER TABLE public.mst_gst_effective_rate 
ADD CONSTRAINT fk_mst_gst_effective_rate_company_id 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.mst_gst_effective_rate 
ADD CONSTRAINT fk_mst_gst_effective_rate_division_id 
FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON DELETE CASCADE;

ALTER TABLE public.mst_ledger 
ADD CONSTRAINT fk_mst_ledger_company_id 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.mst_ledger 
ADD CONSTRAINT fk_mst_ledger_division_id 
FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON DELETE CASCADE;

ALTER TABLE public.mst_opening_batch_allocation 
ADD CONSTRAINT fk_mst_opening_batch_allocation_company_id 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.mst_opening_batch_allocation 
ADD CONSTRAINT fk_mst_opening_batch_allocation_division_id 
FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON DELETE CASCADE;

ALTER TABLE public.mst_opening_bill_allocation 
ADD CONSTRAINT fk_mst_opening_bill_allocation_company_id 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.mst_opening_bill_allocation 
ADD CONSTRAINT fk_mst_opening_bill_allocation_division_id 
FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON DELETE CASCADE;

ALTER TABLE public.mst_payhead 
ADD CONSTRAINT fk_mst_payhead_company_id 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.mst_payhead 
ADD CONSTRAINT fk_mst_payhead_division_id 
FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON DELETE CASCADE;

ALTER TABLE public.mst_stock_group 
ADD CONSTRAINT fk_mst_stock_group_company_id 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.mst_stock_group 
ADD CONSTRAINT fk_mst_stock_group_division_id 
FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON DELETE CASCADE;

ALTER TABLE public.mst_stock_item 
ADD CONSTRAINT fk_mst_stock_item_company_id 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.mst_stock_item 
ADD CONSTRAINT fk_mst_stock_item_division_id 
FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON DELETE CASCADE;

ALTER TABLE public.mst_stockitem_standard_cost 
ADD CONSTRAINT fk_mst_stockitem_standard_cost_company_id 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.mst_stockitem_standard_cost 
ADD CONSTRAINT fk_mst_stockitem_standard_cost_division_id 
FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON DELETE CASCADE;

ALTER TABLE public.mst_stockitem_standard_price 
ADD CONSTRAINT fk_mst_stockitem_standard_price_company_id 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.mst_stockitem_standard_price 
ADD CONSTRAINT fk_mst_stockitem_standard_price_division_id 
FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON DELETE CASCADE;

ALTER TABLE public.mst_uom 
ADD CONSTRAINT fk_mst_uom_company_id 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.mst_uom 
ADD CONSTRAINT fk_mst_uom_division_id 
FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON DELETE CASCADE;

ALTER TABLE public.mst_vouchertype 
ADD CONSTRAINT fk_mst_vouchertype_company_id 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.mst_vouchertype 
ADD CONSTRAINT fk_mst_vouchertype_division_id 
FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON DELETE CASCADE;

-- Transaction tables - company and division relationships
ALTER TABLE public.trn_accounting 
ADD CONSTRAINT fk_trn_accounting_company_id 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.trn_accounting 
ADD CONSTRAINT fk_trn_accounting_division_id 
FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON DELETE CASCADE;

ALTER TABLE public.trn_attendance 
ADD CONSTRAINT fk_trn_attendance_company_id 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.trn_attendance 
ADD CONSTRAINT fk_trn_attendance_division_id 
FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON DELETE CASCADE;

ALTER TABLE public.trn_bank 
ADD CONSTRAINT fk_trn_bank_company_id 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.trn_bank 
ADD CONSTRAINT fk_trn_bank_division_id 
FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON DELETE CASCADE;

ALTER TABLE public.trn_batch 
ADD CONSTRAINT fk_trn_batch_company_id 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.trn_batch 
ADD CONSTRAINT fk_trn_batch_division_id 
FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON DELETE CASCADE;

ALTER TABLE public.trn_bill 
ADD CONSTRAINT fk_trn_bill_company_id 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.trn_bill 
ADD CONSTRAINT fk_trn_bill_division_id 
FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON DELETE CASCADE;

ALTER TABLE public.trn_closingstock_ledger 
ADD CONSTRAINT fk_trn_closingstock_ledger_company_id 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.trn_closingstock_ledger 
ADD CONSTRAINT fk_trn_closingstock_ledger_division_id 
FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON DELETE CASCADE;

ALTER TABLE public.trn_cost_category_centre 
ADD CONSTRAINT fk_trn_cost_category_centre_company_id 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.trn_cost_category_centre 
ADD CONSTRAINT fk_trn_cost_category_centre_division_id 
FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON DELETE CASCADE;

ALTER TABLE public.trn_cost_centre 
ADD CONSTRAINT fk_trn_cost_centre_company_id 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.trn_cost_centre 
ADD CONSTRAINT fk_trn_cost_centre_division_id 
FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON DELETE CASCADE;

ALTER TABLE public.trn_cost_inventory_category_centre 
ADD CONSTRAINT fk_trn_cost_inventory_category_centre_company_id 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.trn_cost_inventory_category_centre 
ADD CONSTRAINT fk_trn_cost_inventory_category_centre_division_id 
FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON DELETE CASCADE;

ALTER TABLE public.trn_employee 
ADD CONSTRAINT fk_trn_employee_company_id 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.trn_employee 
ADD CONSTRAINT fk_trn_employee_division_id 
FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON DELETE CASCADE;

-- Tally mirror tables - company and division relationships
ALTER TABLE public.tally_mst_group 
ADD CONSTRAINT fk_tally_mst_group_company_id 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.tally_mst_group 
ADD CONSTRAINT fk_tally_mst_group_division_id 
FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON DELETE CASCADE;

ALTER TABLE public.tally_mst_ledger 
ADD CONSTRAINT fk_tally_mst_ledger_company_id 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.tally_mst_ledger 
ADD CONSTRAINT fk_tally_mst_ledger_division_id 
FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON DELETE CASCADE;

ALTER TABLE public.tally_mst_stock_item 
ADD CONSTRAINT fk_tally_mst_stock_item_company_id 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.tally_mst_stock_item 
ADD CONSTRAINT fk_tally_mst_stock_item_division_id 
FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON DELETE CASCADE;

ALTER TABLE public.tally_trn_voucher 
ADD CONSTRAINT fk_tally_trn_voucher_company_id 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.tally_trn_voucher 
ADD CONSTRAINT fk_tally_trn_voucher_division_id 
FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON DELETE CASCADE;

-- Create indexes on foreign key columns for better performance
CREATE INDEX IF NOT EXISTS idx_mst_attendance_type_company_id ON public.mst_attendance_type(company_id);
CREATE INDEX IF NOT EXISTS idx_mst_attendance_type_division_id ON public.mst_attendance_type(division_id);
CREATE INDEX IF NOT EXISTS idx_mst_cost_category_company_id ON public.mst_cost_category(company_id);
CREATE INDEX IF NOT EXISTS idx_mst_cost_category_division_id ON public.mst_cost_category(division_id);
CREATE INDEX IF NOT EXISTS idx_mst_cost_centre_company_id ON public.mst_cost_centre(company_id);
CREATE INDEX IF NOT EXISTS idx_mst_cost_centre_division_id ON public.mst_cost_centre(division_id);
CREATE INDEX IF NOT EXISTS idx_mst_employee_company_id ON public.mst_employee(company_id);
CREATE INDEX IF NOT EXISTS idx_mst_employee_division_id ON public.mst_employee(division_id);
CREATE INDEX IF NOT EXISTS idx_mst_godown_company_id ON public.mst_godown(company_id);
CREATE INDEX IF NOT EXISTS idx_mst_godown_division_id ON public.mst_godown(division_id);
CREATE INDEX IF NOT EXISTS idx_mst_group_company_id ON public.mst_group(company_id);
CREATE INDEX IF NOT EXISTS idx_mst_group_division_id ON public.mst_group(division_id);
CREATE INDEX IF NOT EXISTS idx_mst_gst_effective_rate_company_id ON public.mst_gst_effective_rate(company_id);
CREATE INDEX IF NOT EXISTS idx_mst_gst_effective_rate_division_id ON public.mst_gst_effective_rate(division_id);
CREATE INDEX IF NOT EXISTS idx_mst_ledger_company_id ON public.mst_ledger(company_id);
CREATE INDEX IF NOT EXISTS idx_mst_ledger_division_id ON public.mst_ledger(division_id);
CREATE INDEX IF NOT EXISTS idx_mst_stock_item_company_id ON public.mst_stock_item(company_id);
CREATE INDEX IF NOT EXISTS idx_mst_stock_item_division_id ON public.mst_stock_item(division_id);
CREATE INDEX IF NOT EXISTS idx_trn_accounting_company_id ON public.trn_accounting(company_id);
CREATE INDEX IF NOT EXISTS idx_trn_accounting_division_id ON public.trn_accounting(division_id);
CREATE INDEX IF NOT EXISTS idx_trn_batch_company_id ON public.trn_batch(company_id);
CREATE INDEX IF NOT EXISTS idx_trn_batch_division_id ON public.trn_batch(division_id);