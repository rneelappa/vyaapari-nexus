-- Complete the migration by dropping old columns, renaming new ones, and adding constraints
-- The UUID columns already exist from the previous attempt

-- Drop old character varying columns and rename UUID columns
ALTER TABLE mst_attendance_type DROP COLUMN IF EXISTS company_id CASCADE, DROP COLUMN IF EXISTS division_id CASCADE;
ALTER TABLE mst_attendance_type RENAME COLUMN company_uuid TO company_id;
ALTER TABLE mst_attendance_type RENAME COLUMN division_uuid TO division_id;

ALTER TABLE mst_cost_category DROP COLUMN IF EXISTS company_id CASCADE, DROP COLUMN IF EXISTS division_id CASCADE;
ALTER TABLE mst_cost_category RENAME COLUMN company_uuid TO company_id;
ALTER TABLE mst_cost_category RENAME COLUMN division_uuid TO division_id;

ALTER TABLE mst_cost_centre DROP COLUMN IF EXISTS company_id CASCADE, DROP COLUMN IF EXISTS division_id CASCADE;
ALTER TABLE mst_cost_centre RENAME COLUMN company_uuid TO company_id;
ALTER TABLE mst_cost_centre RENAME COLUMN division_uuid TO division_id;

ALTER TABLE mst_employee DROP COLUMN IF EXISTS company_id CASCADE, DROP COLUMN IF EXISTS division_id CASCADE;
ALTER TABLE mst_employee RENAME COLUMN company_uuid TO company_id;
ALTER TABLE mst_employee RENAME COLUMN division_uuid TO division_id;

ALTER TABLE mst_godown DROP COLUMN IF EXISTS company_id CASCADE, DROP COLUMN IF EXISTS division_id CASCADE;
ALTER TABLE mst_godown RENAME COLUMN company_uuid TO company_id;
ALTER TABLE mst_godown RENAME COLUMN division_uuid TO division_id;

ALTER TABLE mst_group DROP COLUMN IF EXISTS company_id CASCADE, DROP COLUMN IF EXISTS division_id CASCADE;
ALTER TABLE mst_group RENAME COLUMN company_uuid TO company_id;
ALTER TABLE mst_group RENAME COLUMN division_uuid TO division_id;

ALTER TABLE mst_gst_effective_rate DROP COLUMN IF EXISTS company_id CASCADE, DROP COLUMN IF EXISTS division_id CASCADE;
ALTER TABLE mst_gst_effective_rate RENAME COLUMN company_uuid TO company_id;
ALTER TABLE mst_gst_effective_rate RENAME COLUMN division_uuid TO division_id;

ALTER TABLE mst_ledger DROP COLUMN IF EXISTS company_id CASCADE, DROP COLUMN IF EXISTS division_id CASCADE;
ALTER TABLE mst_ledger RENAME COLUMN company_uuid TO company_id;
ALTER TABLE mst_ledger RENAME COLUMN division_uuid TO division_id;

ALTER TABLE mst_opening_batch_allocation DROP COLUMN IF EXISTS company_id CASCADE, DROP COLUMN IF EXISTS division_id CASCADE;
ALTER TABLE mst_opening_batch_allocation RENAME COLUMN company_uuid TO company_id;
ALTER TABLE mst_opening_batch_allocation RENAME COLUMN division_uuid TO division_id;

ALTER TABLE mst_opening_bill_allocation DROP COLUMN IF EXISTS company_id CASCADE, DROP COLUMN IF EXISTS division_id CASCADE;
ALTER TABLE mst_opening_bill_allocation RENAME COLUMN company_uuid TO company_id;
ALTER TABLE mst_opening_bill_allocation RENAME COLUMN division_uuid TO division_id;

ALTER TABLE mst_payhead DROP COLUMN IF EXISTS company_id CASCADE, DROP COLUMN IF EXISTS division_id CASCADE;
ALTER TABLE mst_payhead RENAME COLUMN company_uuid TO company_id;
ALTER TABLE mst_payhead RENAME COLUMN division_uuid TO division_id;

ALTER TABLE mst_stock_group DROP COLUMN IF EXISTS company_id CASCADE, DROP COLUMN IF EXISTS division_id CASCADE;
ALTER TABLE mst_stock_group RENAME COLUMN company_uuid TO company_id;
ALTER TABLE mst_stock_group RENAME COLUMN division_uuid TO division_id;

ALTER TABLE mst_stock_item DROP COLUMN IF EXISTS company_id CASCADE, DROP COLUMN IF EXISTS division_id CASCADE;
ALTER TABLE mst_stock_item RENAME COLUMN company_uuid TO company_id;
ALTER TABLE mst_stock_item RENAME COLUMN division_uuid TO division_id;

ALTER TABLE mst_stockitem_standard_cost DROP COLUMN IF EXISTS company_id CASCADE, DROP COLUMN IF EXISTS division_id CASCADE;
ALTER TABLE mst_stockitem_standard_cost RENAME COLUMN company_uuid TO company_id;
ALTER TABLE mst_stockitem_standard_cost RENAME COLUMN division_uuid TO division_id;

ALTER TABLE mst_stockitem_standard_price DROP COLUMN IF EXISTS company_id CASCADE, DROP COLUMN IF EXISTS division_id CASCADE;
ALTER TABLE mst_stockitem_standard_price RENAME COLUMN company_uuid TO company_id;
ALTER TABLE mst_stockitem_standard_price RENAME COLUMN division_uuid TO division_id;

ALTER TABLE mst_uom DROP COLUMN IF EXISTS company_id CASCADE, DROP COLUMN IF EXISTS division_id CASCADE;
ALTER TABLE mst_uom RENAME COLUMN company_uuid TO company_id;
ALTER TABLE mst_uom RENAME COLUMN division_uuid TO division_id;

ALTER TABLE mst_vouchertype DROP COLUMN IF EXISTS company_id CASCADE, DROP COLUMN IF EXISTS division_id CASCADE;
ALTER TABLE mst_vouchertype RENAME COLUMN company_uuid TO company_id;
ALTER TABLE mst_vouchertype RENAME COLUMN division_uuid TO division_id;

ALTER TABLE tally_mst_group DROP COLUMN IF EXISTS company_id CASCADE, DROP COLUMN IF EXISTS division_id CASCADE;
ALTER TABLE tally_mst_group RENAME COLUMN company_uuid TO company_id;
ALTER TABLE tally_mst_group RENAME COLUMN division_uuid TO division_id;

ALTER TABLE tally_mst_ledger DROP COLUMN IF EXISTS company_id CASCADE, DROP COLUMN IF EXISTS division_id CASCADE;
ALTER TABLE tally_mst_ledger RENAME COLUMN company_uuid TO company_id;
ALTER TABLE tally_mst_ledger RENAME COLUMN division_uuid TO division_id;

ALTER TABLE tally_mst_stock_item DROP COLUMN IF EXISTS company_id CASCADE, DROP COLUMN IF EXISTS division_id CASCADE;
ALTER TABLE tally_mst_stock_item RENAME COLUMN company_uuid TO company_id;
ALTER TABLE tally_mst_stock_item RENAME COLUMN division_uuid TO division_id;

ALTER TABLE tally_trn_voucher DROP COLUMN IF EXISTS company_id CASCADE, DROP COLUMN IF EXISTS division_id CASCADE;
ALTER TABLE tally_trn_voucher RENAME COLUMN company_uuid TO company_id;
ALTER TABLE tally_trn_voucher RENAME COLUMN division_uuid TO division_id;

ALTER TABLE trn_accounting DROP COLUMN IF EXISTS company_id CASCADE, DROP COLUMN IF EXISTS division_id CASCADE;
ALTER TABLE trn_accounting RENAME COLUMN company_uuid TO company_id;
ALTER TABLE trn_accounting RENAME COLUMN division_uuid TO division_id;

ALTER TABLE trn_attendance DROP COLUMN IF EXISTS company_id CASCADE, DROP COLUMN IF EXISTS division_id CASCADE;
ALTER TABLE trn_attendance RENAME COLUMN company_uuid TO company_id;
ALTER TABLE trn_attendance RENAME COLUMN division_uuid TO division_id;

ALTER TABLE trn_bank DROP COLUMN IF EXISTS company_id CASCADE, DROP COLUMN IF EXISTS division_id CASCADE;
ALTER TABLE trn_bank RENAME COLUMN company_uuid TO company_id;
ALTER TABLE trn_bank RENAME COLUMN division_uuid TO division_id;

ALTER TABLE trn_batch DROP COLUMN IF EXISTS company_id CASCADE, DROP COLUMN IF EXISTS division_id CASCADE;
ALTER TABLE trn_batch RENAME COLUMN company_uuid TO company_id;
ALTER TABLE trn_batch RENAME COLUMN division_uuid TO division_id;

ALTER TABLE trn_bill DROP COLUMN IF EXISTS company_id CASCADE, DROP COLUMN IF EXISTS division_id CASCADE;
ALTER TABLE trn_bill RENAME COLUMN company_uuid TO company_id;
ALTER TABLE trn_bill RENAME COLUMN division_uuid TO division_id;

ALTER TABLE trn_closingstock_ledger DROP COLUMN IF EXISTS company_id CASCADE, DROP COLUMN IF EXISTS division_id CASCADE;
ALTER TABLE trn_closingstock_ledger RENAME COLUMN company_uuid TO company_id;
ALTER TABLE trn_closingstock_ledger RENAME COLUMN division_uuid TO division_id;

ALTER TABLE trn_cost_category_centre DROP COLUMN IF EXISTS company_id CASCADE, DROP COLUMN IF EXISTS division_id CASCADE;
ALTER TABLE trn_cost_category_centre RENAME COLUMN company_uuid TO company_id;
ALTER TABLE trn_cost_category_centre RENAME COLUMN division_uuid TO division_id;

ALTER TABLE trn_cost_centre DROP COLUMN IF EXISTS company_id CASCADE, DROP COLUMN IF EXISTS division_id CASCADE;
ALTER TABLE trn_cost_centre RENAME COLUMN company_uuid TO company_id;
ALTER TABLE trn_cost_centre RENAME COLUMN division_uuid TO division_id;

ALTER TABLE trn_cost_inventory_category_centre DROP COLUMN IF EXISTS company_id CASCADE, DROP COLUMN IF EXISTS division_id CASCADE;
ALTER TABLE trn_cost_inventory_category_centre RENAME COLUMN company_uuid TO company_id;
ALTER TABLE trn_cost_inventory_category_centre RENAME COLUMN division_uuid TO division_id;

ALTER TABLE trn_employee DROP COLUMN IF EXISTS company_id CASCADE, DROP COLUMN IF EXISTS division_id CASCADE;
ALTER TABLE trn_employee RENAME COLUMN company_uuid TO company_id;
ALTER TABLE trn_employee RENAME COLUMN division_uuid TO division_id;

-- Add foreign key constraints (nullable to handle cases where mapping failed)
ALTER TABLE mst_attendance_type 
ADD CONSTRAINT fk_mst_attendance_type_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_mst_attendance_type_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_cost_category 
ADD CONSTRAINT fk_mst_cost_category_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_mst_cost_category_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_cost_centre 
ADD CONSTRAINT fk_mst_cost_centre_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_mst_cost_centre_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_employee 
ADD CONSTRAINT fk_mst_employee_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_mst_employee_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_godown 
ADD CONSTRAINT fk_mst_godown_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_mst_godown_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_group 
ADD CONSTRAINT fk_mst_group_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_mst_group_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_gst_effective_rate 
ADD CONSTRAINT fk_mst_gst_effective_rate_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_mst_gst_effective_rate_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_ledger 
ADD CONSTRAINT fk_mst_ledger_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_mst_ledger_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_opening_batch_allocation 
ADD CONSTRAINT fk_mst_opening_batch_allocation_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_mst_opening_batch_allocation_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_opening_bill_allocation 
ADD CONSTRAINT fk_mst_opening_bill_allocation_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_mst_opening_bill_allocation_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_payhead 
ADD CONSTRAINT fk_mst_payhead_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_mst_payhead_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_stock_group 
ADD CONSTRAINT fk_mst_stock_group_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_mst_stock_group_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_stock_item 
ADD CONSTRAINT fk_mst_stock_item_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_mst_stock_item_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_stockitem_standard_cost 
ADD CONSTRAINT fk_mst_stockitem_standard_cost_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_mst_stockitem_standard_cost_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_stockitem_standard_price 
ADD CONSTRAINT fk_mst_stockitem_standard_price_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_mst_stockitem_standard_price_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_uom 
ADD CONSTRAINT fk_mst_uom_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_mst_uom_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_vouchertype 
ADD CONSTRAINT fk_mst_vouchertype_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_mst_vouchertype_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE tally_mst_group 
ADD CONSTRAINT fk_tally_mst_group_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_tally_mst_group_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE tally_mst_ledger 
ADD CONSTRAINT fk_tally_mst_ledger_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_tally_mst_ledger_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE tally_mst_stock_item 
ADD CONSTRAINT fk_tally_mst_stock_item_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_tally_mst_stock_item_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE tally_trn_voucher 
ADD CONSTRAINT fk_tally_trn_voucher_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_tally_trn_voucher_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE trn_accounting 
ADD CONSTRAINT fk_trn_accounting_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_trn_accounting_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE trn_attendance 
ADD CONSTRAINT fk_trn_attendance_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_trn_attendance_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE trn_bank 
ADD CONSTRAINT fk_trn_bank_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_trn_bank_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE trn_batch 
ADD CONSTRAINT fk_trn_batch_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_trn_batch_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE trn_bill 
ADD CONSTRAINT fk_trn_bill_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_trn_bill_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE trn_closingstock_ledger 
ADD CONSTRAINT fk_trn_closingstock_ledger_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_trn_closingstock_ledger_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE trn_cost_category_centre 
ADD CONSTRAINT fk_trn_cost_category_centre_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_trn_cost_category_centre_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE trn_cost_centre 
ADD CONSTRAINT fk_trn_cost_centre_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_trn_cost_centre_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE trn_cost_inventory_category_centre 
ADD CONSTRAINT fk_trn_cost_inventory_category_centre_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_trn_cost_inventory_category_centre_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE trn_employee 
ADD CONSTRAINT fk_trn_employee_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_trn_employee_division FOREIGN KEY (division_id) REFERENCES divisions(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mst_attendance_type_company_id ON mst_attendance_type(company_id);
CREATE INDEX IF NOT EXISTS idx_mst_attendance_type_division_id ON mst_attendance_type(division_id);
CREATE INDEX IF NOT EXISTS idx_mst_cost_category_company_id ON mst_cost_category(company_id);
CREATE INDEX IF NOT EXISTS idx_mst_cost_category_division_id ON mst_cost_category(division_id);
CREATE INDEX IF NOT EXISTS idx_mst_cost_centre_company_id ON mst_cost_centre(company_id);
CREATE INDEX IF NOT EXISTS idx_mst_cost_centre_division_id ON mst_cost_centre(division_id);
CREATE INDEX IF NOT EXISTS idx_mst_employee_company_id ON mst_employee(company_id);
CREATE INDEX IF NOT EXISTS idx_mst_employee_division_id ON mst_employee(division_id);
CREATE INDEX IF NOT EXISTS idx_mst_godown_company_id ON mst_godown(company_id);
CREATE INDEX IF NOT EXISTS idx_mst_godown_division_id ON mst_godown(division_id);
CREATE INDEX IF NOT EXISTS idx_mst_group_company_id ON mst_group(company_id);
CREATE INDEX IF NOT EXISTS idx_mst_group_division_id ON mst_group(division_id);
CREATE INDEX IF NOT EXISTS idx_mst_gst_effective_rate_company_id ON mst_gst_effective_rate(company_id);
CREATE INDEX IF NOT EXISTS idx_mst_gst_effective_rate_division_id ON mst_gst_effective_rate(division_id);
CREATE INDEX IF NOT EXISTS idx_mst_ledger_company_id ON mst_ledger(company_id);
CREATE INDEX IF NOT EXISTS idx_mst_ledger_division_id ON mst_ledger(division_id);
CREATE INDEX IF NOT EXISTS idx_mst_opening_batch_allocation_company_id ON mst_opening_batch_allocation(company_id);
CREATE INDEX IF NOT EXISTS idx_mst_opening_batch_allocation_division_id ON mst_opening_batch_allocation(division_id);
CREATE INDEX IF NOT EXISTS idx_mst_opening_bill_allocation_company_id ON mst_opening_bill_allocation(company_id);
CREATE INDEX IF NOT EXISTS idx_mst_opening_bill_allocation_division_id ON mst_opening_bill_allocation(division_id);
CREATE INDEX IF NOT EXISTS idx_mst_payhead_company_id ON mst_payhead(company_id);
CREATE INDEX IF NOT EXISTS idx_mst_payhead_division_id ON mst_payhead(division_id);
CREATE INDEX IF NOT EXISTS idx_mst_stock_group_company_id ON mst_stock_group(company_id);
CREATE INDEX IF NOT EXISTS idx_mst_stock_group_division_id ON mst_stock_group(division_id);
CREATE INDEX IF NOT EXISTS idx_mst_stock_item_company_id ON mst_stock_item(company_id);
CREATE INDEX IF NOT EXISTS idx_mst_stock_item_division_id ON mst_stock_item(division_id);
CREATE INDEX IF NOT EXISTS idx_mst_stockitem_standard_cost_company_id ON mst_stockitem_standard_cost(company_id);
CREATE INDEX IF NOT EXISTS idx_mst_stockitem_standard_cost_division_id ON mst_stockitem_standard_cost(division_id);
CREATE INDEX IF NOT EXISTS idx_mst_stockitem_standard_price_company_id ON mst_stockitem_standard_price(company_id);
CREATE INDEX IF NOT EXISTS idx_mst_stockitem_standard_price_division_id ON mst_stockitem_standard_price(division_id);
CREATE INDEX IF NOT EXISTS idx_mst_uom_company_id ON mst_uom(company_id);
CREATE INDEX IF NOT EXISTS idx_mst_uom_division_id ON mst_uom(division_id);
CREATE INDEX IF NOT EXISTS idx_mst_vouchertype_company_id ON mst_vouchertype(company_id);
CREATE INDEX IF NOT EXISTS idx_mst_vouchertype_division_id ON mst_vouchertype(division_id);
CREATE INDEX IF NOT EXISTS idx_tally_mst_group_company_id ON tally_mst_group(company_id);
CREATE INDEX IF NOT EXISTS idx_tally_mst_group_division_id ON tally_mst_group(division_id);
CREATE INDEX IF NOT EXISTS idx_tally_mst_ledger_company_id ON tally_mst_ledger(company_id);
CREATE INDEX IF NOT EXISTS idx_tally_mst_ledger_division_id ON tally_mst_ledger(division_id);
CREATE INDEX IF NOT EXISTS idx_tally_mst_stock_item_company_id ON tally_mst_stock_item(company_id);
CREATE INDEX IF NOT EXISTS idx_tally_mst_stock_item_division_id ON tally_mst_stock_item(division_id);
CREATE INDEX IF NOT EXISTS idx_tally_trn_voucher_company_id ON tally_trn_voucher(company_id);
CREATE INDEX IF NOT EXISTS idx_tally_trn_voucher_division_id ON tally_trn_voucher(division_id);
CREATE INDEX IF NOT EXISTS idx_trn_accounting_company_id ON trn_accounting(company_id);
CREATE INDEX IF NOT EXISTS idx_trn_accounting_division_id ON trn_accounting(division_id);
CREATE INDEX IF NOT EXISTS idx_trn_attendance_company_id ON trn_attendance(company_id);
CREATE INDEX IF NOT EXISTS idx_trn_attendance_division_id ON trn_attendance(division_id);
CREATE INDEX IF NOT EXISTS idx_trn_bank_company_id ON trn_bank(company_id);
CREATE INDEX IF NOT EXISTS idx_trn_bank_division_id ON trn_bank(division_id);
CREATE INDEX IF NOT EXISTS idx_trn_batch_company_id ON trn_batch(company_id);
CREATE INDEX IF NOT EXISTS idx_trn_batch_division_id ON trn_batch(division_id);
CREATE INDEX IF NOT EXISTS idx_trn_bill_company_id ON trn_bill(company_id);
CREATE INDEX IF NOT EXISTS idx_trn_bill_division_id ON trn_bill(division_id);
CREATE INDEX IF NOT EXISTS idx_trn_closingstock_ledger_company_id ON trn_closingstock_ledger(company_id);
CREATE INDEX IF NOT EXISTS idx_trn_closingstock_ledger_division_id ON trn_closingstock_ledger(division_id);
CREATE INDEX IF NOT EXISTS idx_trn_cost_category_centre_company_id ON trn_cost_category_centre(company_id);
CREATE INDEX IF NOT EXISTS idx_trn_cost_category_centre_division_id ON trn_cost_category_centre(division_id);
CREATE INDEX IF NOT EXISTS idx_trn_cost_centre_company_id ON trn_cost_centre(company_id);
CREATE INDEX IF NOT EXISTS idx_trn_cost_centre_division_id ON trn_cost_centre(division_id);
CREATE INDEX IF NOT EXISTS idx_trn_cost_inventory_category_centre_company_id ON trn_cost_inventory_category_centre(company_id);
CREATE INDEX IF NOT EXISTS idx_trn_cost_inventory_category_centre_division_id ON trn_cost_inventory_category_centre(division_id);
CREATE INDEX IF NOT EXISTS idx_trn_employee_company_id ON trn_employee(company_id);
CREATE INDEX IF NOT EXISTS idx_trn_employee_division_id ON trn_employee(division_id);