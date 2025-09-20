-- Add foreign key constraints with nullable relationships for now
-- We'll make these stricter later after ensuring data quality

-- Add foreign key constraints where UUID columns exist and are not null
ALTER TABLE mst_attendance_type 
ADD CONSTRAINT fk_mst_attendance_type_company FOREIGN KEY (company_id) REFERENCES companies(id);

ALTER TABLE mst_attendance_type 
ADD CONSTRAINT fk_mst_attendance_type_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_cost_category 
ADD CONSTRAINT fk_mst_cost_category_company FOREIGN KEY (company_id) REFERENCES companies(id);

ALTER TABLE mst_cost_category 
ADD CONSTRAINT fk_mst_cost_category_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_cost_centre 
ADD CONSTRAINT fk_mst_cost_centre_company FOREIGN KEY (company_id) REFERENCES companies(id);

ALTER TABLE mst_cost_centre 
ADD CONSTRAINT fk_mst_cost_centre_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_employee 
ADD CONSTRAINT fk_mst_employee_company FOREIGN KEY (company_id) REFERENCES companies(id);

ALTER TABLE mst_employee 
ADD CONSTRAINT fk_mst_employee_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_godown 
ADD CONSTRAINT fk_mst_godown_company FOREIGN KEY (company_id) REFERENCES companies(id);

ALTER TABLE mst_godown 
ADD CONSTRAINT fk_mst_godown_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_group 
ADD CONSTRAINT fk_mst_group_company FOREIGN KEY (company_id) REFERENCES companies(id);

ALTER TABLE mst_group 
ADD CONSTRAINT fk_mst_group_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_gst_effective_rate 
ADD CONSTRAINT fk_mst_gst_effective_rate_company FOREIGN KEY (company_id) REFERENCES companies(id);

ALTER TABLE mst_gst_effective_rate 
ADD CONSTRAINT fk_mst_gst_effective_rate_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_ledger 
ADD CONSTRAINT fk_mst_ledger_company FOREIGN KEY (company_id) REFERENCES companies(id);

ALTER TABLE mst_ledger 
ADD CONSTRAINT fk_mst_ledger_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_opening_batch_allocation 
ADD CONSTRAINT fk_mst_opening_batch_allocation_company FOREIGN KEY (company_id) REFERENCES companies(id);

ALTER TABLE mst_opening_batch_allocation 
ADD CONSTRAINT fk_mst_opening_batch_allocation_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_opening_bill_allocation 
ADD CONSTRAINT fk_mst_opening_bill_allocation_company FOREIGN KEY (company_id) REFERENCES companies(id);

ALTER TABLE mst_opening_bill_allocation 
ADD CONSTRAINT fk_mst_opening_bill_allocation_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_payhead 
ADD CONSTRAINT fk_mst_payhead_company FOREIGN KEY (company_id) REFERENCES companies(id);

ALTER TABLE mst_payhead 
ADD CONSTRAINT fk_mst_payhead_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_stock_group 
ADD CONSTRAINT fk_mst_stock_group_company FOREIGN KEY (company_id) REFERENCES companies(id);

ALTER TABLE mst_stock_group 
ADD CONSTRAINT fk_mst_stock_group_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_stock_item 
ADD CONSTRAINT fk_mst_stock_item_company FOREIGN KEY (company_id) REFERENCES companies(id);

ALTER TABLE mst_stock_item 
ADD CONSTRAINT fk_mst_stock_item_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_stockitem_standard_cost 
ADD CONSTRAINT fk_mst_stockitem_standard_cost_company FOREIGN KEY (company_id) REFERENCES companies(id);

ALTER TABLE mst_stockitem_standard_cost 
ADD CONSTRAINT fk_mst_stockitem_standard_cost_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_stockitem_standard_price 
ADD CONSTRAINT fk_mst_stockitem_standard_price_company FOREIGN KEY (company_id) REFERENCES companies(id);

ALTER TABLE mst_stockitem_standard_price 
ADD CONSTRAINT fk_mst_stockitem_standard_price_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_uom 
ADD CONSTRAINT fk_mst_uom_company FOREIGN KEY (company_id) REFERENCES companies(id);

ALTER TABLE mst_uom 
ADD CONSTRAINT fk_mst_uom_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_vouchertype 
ADD CONSTRAINT fk_mst_vouchertype_company FOREIGN KEY (company_id) REFERENCES companies(id);

ALTER TABLE mst_vouchertype 
ADD CONSTRAINT fk_mst_vouchertype_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE tally_mst_group 
ADD CONSTRAINT fk_tally_mst_group_company FOREIGN KEY (company_id) REFERENCES companies(id);

ALTER TABLE tally_mst_group 
ADD CONSTRAINT fk_tally_mst_group_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE tally_mst_ledger 
ADD CONSTRAINT fk_tally_mst_ledger_company FOREIGN KEY (company_id) REFERENCES companies(id);

ALTER TABLE tally_mst_ledger 
ADD CONSTRAINT fk_tally_mst_ledger_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE tally_mst_stock_item 
ADD CONSTRAINT fk_tally_mst_stock_item_company FOREIGN KEY (company_id) REFERENCES companies(id);

ALTER TABLE tally_mst_stock_item 
ADD CONSTRAINT fk_tally_mst_stock_item_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE tally_trn_voucher 
ADD CONSTRAINT fk_tally_trn_voucher_company FOREIGN KEY (company_id) REFERENCES companies(id);

ALTER TABLE tally_trn_voucher 
ADD CONSTRAINT fk_tally_trn_voucher_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE trn_accounting 
ADD CONSTRAINT fk_trn_accounting_company FOREIGN KEY (company_id) REFERENCES companies(id);

ALTER TABLE trn_accounting 
ADD CONSTRAINT fk_trn_accounting_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE trn_attendance 
ADD CONSTRAINT fk_trn_attendance_company FOREIGN KEY (company_id) REFERENCES companies(id);

ALTER TABLE trn_attendance 
ADD CONSTRAINT fk_trn_attendance_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE trn_bank 
ADD CONSTRAINT fk_trn_bank_company FOREIGN KEY (company_id) REFERENCES companies(id);

ALTER TABLE trn_bank 
ADD CONSTRAINT fk_trn_bank_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE trn_batch 
ADD CONSTRAINT fk_trn_batch_company FOREIGN KEY (company_id) REFERENCES companies(id);

ALTER TABLE trn_batch 
ADD CONSTRAINT fk_trn_batch_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE trn_bill 
ADD CONSTRAINT fk_trn_bill_company FOREIGN KEY (company_id) REFERENCES companies(id);

ALTER TABLE trn_bill 
ADD CONSTRAINT fk_trn_bill_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE trn_closingstock_ledger 
ADD CONSTRAINT fk_trn_closingstock_ledger_company FOREIGN KEY (company_id) REFERENCES companies(id);

ALTER TABLE trn_closingstock_ledger 
ADD CONSTRAINT fk_trn_closingstock_ledger_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE trn_cost_category_centre 
ADD CONSTRAINT fk_trn_cost_category_centre_company FOREIGN KEY (company_id) REFERENCES companies(id);

ALTER TABLE trn_cost_category_centre 
ADD CONSTRAINT fk_trn_cost_category_centre_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE trn_cost_centre 
ADD CONSTRAINT fk_trn_cost_centre_company FOREIGN KEY (company_id) REFERENCES companies(id);

ALTER TABLE trn_cost_centre 
ADD CONSTRAINT fk_trn_cost_centre_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE trn_cost_inventory_category_centre 
ADD CONSTRAINT fk_trn_cost_inventory_category_centre_company FOREIGN KEY (company_id) REFERENCES companies(id);

ALTER TABLE trn_cost_inventory_category_centre 
ADD CONSTRAINT fk_trn_cost_inventory_category_centre_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE trn_employee 
ADD CONSTRAINT fk_trn_employee_company FOREIGN KEY (company_id) REFERENCES companies(id);

ALTER TABLE trn_employee 
ADD CONSTRAINT fk_trn_employee_division FOREIGN KEY (division_id) REFERENCES divisions(id);

-- Create indexes for performance
CREATE INDEX idx_mst_attendance_type_company_id ON mst_attendance_type(company_id);
CREATE INDEX idx_mst_attendance_type_division_id ON mst_attendance_type(division_id);
CREATE INDEX idx_mst_cost_category_company_id ON mst_cost_category(company_id);
CREATE INDEX idx_mst_cost_category_division_id ON mst_cost_category(division_id);
CREATE INDEX idx_mst_cost_centre_company_id ON mst_cost_centre(company_id);
CREATE INDEX idx_mst_cost_centre_division_id ON mst_cost_centre(division_id);
CREATE INDEX idx_mst_employee_company_id ON mst_employee(company_id);
CREATE INDEX idx_mst_employee_division_id ON mst_employee(division_id);
CREATE INDEX idx_mst_godown_company_id ON mst_godown(company_id);
CREATE INDEX idx_mst_godown_division_id ON mst_godown(division_id);
CREATE INDEX idx_mst_group_company_id ON mst_group(company_id);
CREATE INDEX idx_mst_group_division_id ON mst_group(division_id);
CREATE INDEX idx_mst_gst_effective_rate_company_id ON mst_gst_effective_rate(company_id);
CREATE INDEX idx_mst_gst_effective_rate_division_id ON mst_gst_effective_rate(division_id);
CREATE INDEX idx_mst_ledger_company_id ON mst_ledger(company_id);
CREATE INDEX idx_mst_ledger_division_id ON mst_ledger(division_id);
CREATE INDEX idx_mst_opening_batch_allocation_company_id ON mst_opening_batch_allocation(company_id);
CREATE INDEX idx_mst_opening_batch_allocation_division_id ON mst_opening_batch_allocation(division_id);
CREATE INDEX idx_mst_opening_bill_allocation_company_id ON mst_opening_bill_allocation(company_id);
CREATE INDEX idx_mst_opening_bill_allocation_division_id ON mst_opening_bill_allocation(division_id);
CREATE INDEX idx_mst_payhead_company_id ON mst_payhead(company_id);
CREATE INDEX idx_mst_payhead_division_id ON mst_payhead(division_id);
CREATE INDEX idx_mst_stock_group_company_id ON mst_stock_group(company_id);
CREATE INDEX idx_mst_stock_group_division_id ON mst_stock_group(division_id);
CREATE INDEX idx_mst_stock_item_company_id ON mst_stock_item(company_id);
CREATE INDEX idx_mst_stock_item_division_id ON mst_stock_item(division_id);
CREATE INDEX idx_mst_stockitem_standard_cost_company_id ON mst_stockitem_standard_cost(company_id);
CREATE INDEX idx_mst_stockitem_standard_cost_division_id ON mst_stockitem_standard_cost(division_id);
CREATE INDEX idx_mst_stockitem_standard_price_company_id ON mst_stockitem_standard_price(company_id);
CREATE INDEX idx_mst_stockitem_standard_price_division_id ON mst_stockitem_standard_price(division_id);
CREATE INDEX idx_mst_uom_company_id ON mst_uom(company_id);
CREATE INDEX idx_mst_uom_division_id ON mst_uom(division_id);
CREATE INDEX idx_mst_vouchertype_company_id ON mst_vouchertype(company_id);
CREATE INDEX idx_mst_vouchertype_division_id ON mst_vouchertype(division_id);
CREATE INDEX idx_tally_mst_group_company_id ON tally_mst_group(company_id);
CREATE INDEX idx_tally_mst_group_division_id ON tally_mst_group(division_id);
CREATE INDEX idx_tally_mst_ledger_company_id ON tally_mst_ledger(company_id);
CREATE INDEX idx_tally_mst_ledger_division_id ON tally_mst_ledger(division_id);
CREATE INDEX idx_tally_mst_stock_item_company_id ON tally_mst_stock_item(company_id);
CREATE INDEX idx_tally_mst_stock_item_division_id ON tally_mst_stock_item(division_id);
CREATE INDEX idx_tally_trn_voucher_company_id ON tally_trn_voucher(company_id);
CREATE INDEX idx_tally_trn_voucher_division_id ON tally_trn_voucher(division_id);
CREATE INDEX idx_trn_accounting_company_id ON trn_accounting(company_id);
CREATE INDEX idx_trn_accounting_division_id ON trn_accounting(division_id);
CREATE INDEX idx_trn_attendance_company_id ON trn_attendance(company_id);
CREATE INDEX idx_trn_attendance_division_id ON trn_attendance(division_id);
CREATE INDEX idx_trn_bank_company_id ON trn_bank(company_id);
CREATE INDEX idx_trn_bank_division_id ON trn_bank(division_id);
CREATE INDEX idx_trn_batch_company_id ON trn_batch(company_id);
CREATE INDEX idx_trn_batch_division_id ON trn_batch(division_id);
CREATE INDEX idx_trn_bill_company_id ON trn_bill(company_id);
CREATE INDEX idx_trn_bill_division_id ON trn_bill(division_id);
CREATE INDEX idx_trn_closingstock_ledger_company_id ON trn_closingstock_ledger(company_id);
CREATE INDEX idx_trn_closingstock_ledger_division_id ON trn_closingstock_ledger(division_id);
CREATE INDEX idx_trn_cost_category_centre_company_id ON trn_cost_category_centre(company_id);
CREATE INDEX idx_trn_cost_category_centre_division_id ON trn_cost_category_centre(division_id);
CREATE INDEX idx_trn_cost_centre_company_id ON trn_cost_centre(company_id);
CREATE INDEX idx_trn_cost_centre_division_id ON trn_cost_centre(division_id);
CREATE INDEX idx_trn_cost_inventory_category_centre_company_id ON trn_cost_inventory_category_centre(company_id);
CREATE INDEX idx_trn_cost_inventory_category_centre_division_id ON trn_cost_inventory_category_centre(division_id);
CREATE INDEX idx_trn_employee_company_id ON trn_employee(company_id);
CREATE INDEX idx_trn_employee_division_id ON trn_employee(division_id);