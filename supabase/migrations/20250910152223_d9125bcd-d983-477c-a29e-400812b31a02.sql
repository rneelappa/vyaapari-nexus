-- Fix Tally table foreign key relationships
-- Step 1: Add UUID columns and migrate data for all Tally tables

-- First, let's add new UUID columns to all Tally tables
ALTER TABLE mst_attendance_type 
ADD COLUMN company_uuid UUID,
ADD COLUMN division_uuid UUID;

ALTER TABLE mst_cost_category 
ADD COLUMN company_uuid UUID,
ADD COLUMN division_uuid UUID;

ALTER TABLE mst_cost_centre 
ADD COLUMN company_uuid UUID,
ADD COLUMN division_uuid UUID;

ALTER TABLE mst_employee 
ADD COLUMN company_uuid UUID,
ADD COLUMN division_uuid UUID;

ALTER TABLE mst_godown 
ADD COLUMN company_uuid UUID,
ADD COLUMN division_uuid UUID;

ALTER TABLE mst_group 
ADD COLUMN company_uuid UUID,
ADD COLUMN division_uuid UUID;

ALTER TABLE mst_gst_effective_rate 
ADD COLUMN company_uuid UUID,
ADD COLUMN division_uuid UUID;

ALTER TABLE mst_ledger 
ADD COLUMN company_uuid UUID,
ADD COLUMN division_uuid UUID;

ALTER TABLE mst_opening_batch_allocation 
ADD COLUMN company_uuid UUID,
ADD COLUMN division_uuid UUID;

ALTER TABLE mst_opening_bill_allocation 
ADD COLUMN company_uuid UUID,
ADD COLUMN division_uuid UUID;

ALTER TABLE mst_payhead 
ADD COLUMN company_uuid UUID,
ADD COLUMN division_uuid UUID;

ALTER TABLE mst_stock_group 
ADD COLUMN company_uuid UUID,
ADD COLUMN division_uuid UUID;

ALTER TABLE mst_stock_item 
ADD COLUMN company_uuid UUID,
ADD COLUMN division_uuid UUID;

ALTER TABLE mst_stockitem_standard_cost 
ADD COLUMN company_uuid UUID,
ADD COLUMN division_uuid UUID;

ALTER TABLE mst_stockitem_standard_price 
ADD COLUMN company_uuid UUID,
ADD COLUMN division_uuid UUID;

ALTER TABLE mst_uom 
ADD COLUMN company_uuid UUID,
ADD COLUMN division_uuid UUID;

ALTER TABLE mst_vouchertype 
ADD COLUMN company_uuid UUID,
ADD COLUMN division_uuid UUID;

ALTER TABLE tally_mst_group 
ADD COLUMN company_uuid UUID,
ADD COLUMN division_uuid UUID;

ALTER TABLE tally_mst_ledger 
ADD COLUMN company_uuid UUID,
ADD COLUMN division_uuid UUID;

ALTER TABLE tally_mst_stock_item 
ADD COLUMN company_uuid UUID,
ADD COLUMN division_uuid UUID;

ALTER TABLE tally_trn_voucher 
ADD COLUMN company_uuid UUID,
ADD COLUMN division_uuid UUID;

ALTER TABLE trn_accounting 
ADD COLUMN company_uuid UUID,
ADD COLUMN division_uuid UUID;

ALTER TABLE trn_attendance 
ADD COLUMN company_uuid UUID,
ADD COLUMN division_uuid UUID;

ALTER TABLE trn_bank 
ADD COLUMN company_uuid UUID,
ADD COLUMN division_uuid UUID;

ALTER TABLE trn_batch 
ADD COLUMN company_uuid UUID,
ADD COLUMN division_uuid UUID;

ALTER TABLE trn_bill 
ADD COLUMN company_uuid UUID,
ADD COLUMN division_uuid UUID;

ALTER TABLE trn_closingstock_ledger 
ADD COLUMN company_uuid UUID,
ADD COLUMN division_uuid UUID;

ALTER TABLE trn_cost_category_centre 
ADD COLUMN company_uuid UUID,
ADD COLUMN division_uuid UUID;

ALTER TABLE trn_cost_centre 
ADD COLUMN company_uuid UUID,
ADD COLUMN division_uuid UUID;

ALTER TABLE trn_cost_inventory_category_centre 
ADD COLUMN company_uuid UUID,
ADD COLUMN division_uuid UUID;

ALTER TABLE trn_employee 
ADD COLUMN company_uuid UUID,
ADD COLUMN division_uuid UUID;

-- Step 2: Update the UUID columns with proper mappings
-- This assumes the text company_id/division_id values can be mapped to UUIDs in mst_company/mst_division
UPDATE mst_attendance_type SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = mst_attendance_type.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = mst_attendance_type.division_id LIMIT 1);

-- Apply similar updates to all other tables (abbreviated for space, but would include all tables)
UPDATE mst_cost_category SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = mst_cost_category.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = mst_cost_category.division_id LIMIT 1);

UPDATE mst_cost_centre SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = mst_cost_centre.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = mst_cost_centre.division_id LIMIT 1);

UPDATE mst_employee SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = mst_employee.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = mst_employee.division_id LIMIT 1);

UPDATE mst_godown SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = mst_godown.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = mst_godown.division_id LIMIT 1);

UPDATE mst_group SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = mst_group.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = mst_group.division_id LIMIT 1);

UPDATE mst_gst_effective_rate SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = mst_gst_effective_rate.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = mst_gst_effective_rate.division_id LIMIT 1);

UPDATE mst_ledger SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = mst_ledger.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = mst_ledger.division_id LIMIT 1);

UPDATE mst_opening_batch_allocation SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = mst_opening_batch_allocation.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = mst_opening_batch_allocation.division_id LIMIT 1);

UPDATE mst_opening_bill_allocation SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = mst_opening_bill_allocation.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = mst_opening_bill_allocation.division_id LIMIT 1);

UPDATE mst_payhead SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = mst_payhead.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = mst_payhead.division_id LIMIT 1);

UPDATE mst_stock_group SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = mst_stock_group.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = mst_stock_group.division_id LIMIT 1);

UPDATE mst_stock_item SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = mst_stock_item.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = mst_stock_item.division_id LIMIT 1);

UPDATE mst_stockitem_standard_cost SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = mst_stockitem_standard_cost.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = mst_stockitem_standard_cost.division_id LIMIT 1);

UPDATE mst_stockitem_standard_price SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = mst_stockitem_standard_price.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = mst_stockitem_standard_price.division_id LIMIT 1);

UPDATE mst_uom SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = mst_uom.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = mst_uom.division_id LIMIT 1);

UPDATE mst_vouchertype SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = mst_vouchertype.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = mst_vouchertype.division_id LIMIT 1);

-- Update tally_* tables
UPDATE tally_mst_group SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = tally_mst_group.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = tally_mst_group.division_id LIMIT 1);

UPDATE tally_mst_ledger SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = tally_mst_ledger.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = tally_mst_ledger.division_id LIMIT 1);

UPDATE tally_mst_stock_item SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = tally_mst_stock_item.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = tally_mst_stock_item.division_id LIMIT 1);

UPDATE tally_trn_voucher SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = tally_trn_voucher.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = tally_trn_voucher.division_id LIMIT 1);

-- Update trn_* tables
UPDATE trn_accounting SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = trn_accounting.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = trn_accounting.division_id LIMIT 1);

UPDATE trn_attendance SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = trn_attendance.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = trn_attendance.division_id LIMIT 1);

UPDATE trn_bank SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = trn_bank.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = trn_bank.division_id LIMIT 1);

UPDATE trn_batch SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = trn_batch.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = trn_batch.division_id LIMIT 1);

UPDATE trn_bill SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = trn_bill.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = trn_bill.division_id LIMIT 1);

UPDATE trn_closingstock_ledger SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = trn_closingstock_ledger.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = trn_closingstock_ledger.division_id LIMIT 1);

UPDATE trn_cost_category_centre SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = trn_cost_category_centre.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = trn_cost_category_centre.division_id LIMIT 1);

UPDATE trn_cost_centre SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = trn_cost_centre.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = trn_cost_centre.division_id LIMIT 1);

UPDATE trn_cost_inventory_category_centre SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = trn_cost_inventory_category_centre.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = trn_cost_inventory_category_centre.division_id LIMIT 1);

UPDATE trn_employee SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = trn_employee.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = trn_employee.division_id LIMIT 1);

-- Step 3: Drop old columns and rename new ones
-- Drop old character varying columns
ALTER TABLE mst_attendance_type DROP COLUMN company_id, DROP COLUMN division_id;
ALTER TABLE mst_cost_category DROP COLUMN company_id, DROP COLUMN division_id;
ALTER TABLE mst_cost_centre DROP COLUMN company_id, DROP COLUMN division_id;
ALTER TABLE mst_employee DROP COLUMN company_id, DROP COLUMN division_id;
ALTER TABLE mst_godown DROP COLUMN company_id, DROP COLUMN division_id;
ALTER TABLE mst_group DROP COLUMN company_id, DROP COLUMN division_id;
ALTER TABLE mst_gst_effective_rate DROP COLUMN company_id, DROP COLUMN division_id;
ALTER TABLE mst_ledger DROP COLUMN company_id, DROP COLUMN division_id;
ALTER TABLE mst_opening_batch_allocation DROP COLUMN company_id, DROP COLUMN division_id;
ALTER TABLE mst_opening_bill_allocation DROP COLUMN company_id, DROP COLUMN division_id;
ALTER TABLE mst_payhead DROP COLUMN company_id, DROP COLUMN division_id;
ALTER TABLE mst_stock_group DROP COLUMN company_id, DROP COLUMN division_id;
ALTER TABLE mst_stock_item DROP COLUMN company_id, DROP COLUMN division_id;
ALTER TABLE mst_stockitem_standard_cost DROP COLUMN company_id, DROP COLUMN division_id;
ALTER TABLE mst_stockitem_standard_price DROP COLUMN company_id, DROP COLUMN division_id;
ALTER TABLE mst_uom DROP COLUMN company_id, DROP COLUMN division_id;
ALTER TABLE mst_vouchertype DROP COLUMN company_id, DROP COLUMN division_id;
ALTER TABLE tally_mst_group DROP COLUMN company_id, DROP COLUMN division_id;
ALTER TABLE tally_mst_ledger DROP COLUMN company_id, DROP COLUMN division_id;
ALTER TABLE tally_mst_stock_item DROP COLUMN company_id, DROP COLUMN division_id;
ALTER TABLE tally_trn_voucher DROP COLUMN company_id, DROP COLUMN division_id;
ALTER TABLE trn_accounting DROP COLUMN company_id, DROP COLUMN division_id;
ALTER TABLE trn_attendance DROP COLUMN company_id, DROP COLUMN division_id;
ALTER TABLE trn_bank DROP COLUMN company_id, DROP COLUMN division_id;
ALTER TABLE trn_batch DROP COLUMN company_id, DROP COLUMN division_id;
ALTER TABLE trn_bill DROP COLUMN company_id, DROP COLUMN division_id;
ALTER TABLE trn_closingstock_ledger DROP COLUMN company_id, DROP COLUMN division_id;
ALTER TABLE trn_cost_category_centre DROP COLUMN company_id, DROP COLUMN division_id;
ALTER TABLE trn_cost_centre DROP COLUMN company_id, DROP COLUMN division_id;
ALTER TABLE trn_cost_inventory_category_centre DROP COLUMN company_id, DROP COLUMN division_id;
ALTER TABLE trn_employee DROP COLUMN company_id, DROP COLUMN division_id;

-- Rename UUID columns to the original names
ALTER TABLE mst_attendance_type RENAME COLUMN company_uuid TO company_id;
ALTER TABLE mst_attendance_type RENAME COLUMN division_uuid TO division_id;
ALTER TABLE mst_cost_category RENAME COLUMN company_uuid TO company_id;
ALTER TABLE mst_cost_category RENAME COLUMN division_uuid TO division_id;
ALTER TABLE mst_cost_centre RENAME COLUMN company_uuid TO company_id;
ALTER TABLE mst_cost_centre RENAME COLUMN division_uuid TO division_id;
ALTER TABLE mst_employee RENAME COLUMN company_uuid TO company_id;
ALTER TABLE mst_employee RENAME COLUMN division_uuid TO division_id;
ALTER TABLE mst_godown RENAME COLUMN company_uuid TO company_id;
ALTER TABLE mst_godown RENAME COLUMN division_uuid TO division_id;
ALTER TABLE mst_group RENAME COLUMN company_uuid TO company_id;
ALTER TABLE mst_group RENAME COLUMN division_uuid TO division_id;
ALTER TABLE mst_gst_effective_rate RENAME COLUMN company_uuid TO company_id;
ALTER TABLE mst_gst_effective_rate RENAME COLUMN division_uuid TO division_id;
ALTER TABLE mst_ledger RENAME COLUMN company_uuid TO company_id;
ALTER TABLE mst_ledger RENAME COLUMN division_uuid TO division_id;
ALTER TABLE mst_opening_batch_allocation RENAME COLUMN company_uuid TO company_id;
ALTER TABLE mst_opening_batch_allocation RENAME COLUMN division_uuid TO division_id;
ALTER TABLE mst_opening_bill_allocation RENAME COLUMN company_uuid TO company_id;
ALTER TABLE mst_opening_bill_allocation RENAME COLUMN division_uuid TO division_id;
ALTER TABLE mst_payhead RENAME COLUMN company_uuid TO company_id;
ALTER TABLE mst_payhead RENAME COLUMN division_uuid TO division_id;
ALTER TABLE mst_stock_group RENAME COLUMN company_uuid TO company_id;
ALTER TABLE mst_stock_group RENAME COLUMN division_uuid TO division_id;
ALTER TABLE mst_stock_item RENAME COLUMN company_uuid TO company_id;
ALTER TABLE mst_stock_item RENAME COLUMN division_uuid TO division_id;
ALTER TABLE mst_stockitem_standard_cost RENAME COLUMN company_uuid TO company_id;
ALTER TABLE mst_stockitem_standard_cost RENAME COLUMN division_uuid TO division_id;
ALTER TABLE mst_stockitem_standard_price RENAME COLUMN company_uuid TO company_id;
ALTER TABLE mst_stockitem_standard_price RENAME COLUMN division_uuid TO division_id;
ALTER TABLE mst_uom RENAME COLUMN company_uuid TO company_id;
ALTER TABLE mst_uom RENAME COLUMN division_uuid TO division_id;
ALTER TABLE mst_vouchertype RENAME COLUMN company_uuid TO company_id;
ALTER TABLE mst_vouchertype RENAME COLUMN division_uuid TO division_id;
ALTER TABLE tally_mst_group RENAME COLUMN company_uuid TO company_id;
ALTER TABLE tally_mst_group RENAME COLUMN division_uuid TO division_id;
ALTER TABLE tally_mst_ledger RENAME COLUMN company_uuid TO company_id;
ALTER TABLE tally_mst_ledger RENAME COLUMN division_uuid TO division_id;
ALTER TABLE tally_mst_stock_item RENAME COLUMN company_uuid TO company_id;
ALTER TABLE tally_mst_stock_item RENAME COLUMN division_uuid TO division_id;
ALTER TABLE tally_trn_voucher RENAME COLUMN company_uuid TO company_id;
ALTER TABLE tally_trn_voucher RENAME COLUMN division_uuid TO division_id;
ALTER TABLE trn_accounting RENAME COLUMN company_uuid TO company_id;
ALTER TABLE trn_accounting RENAME COLUMN division_uuid TO division_id;
ALTER TABLE trn_attendance RENAME COLUMN company_uuid TO company_id;
ALTER TABLE trn_attendance RENAME COLUMN division_uuid TO division_id;
ALTER TABLE trn_bank RENAME COLUMN company_uuid TO company_id;
ALTER TABLE trn_bank RENAME COLUMN division_uuid TO division_id;
ALTER TABLE trn_batch RENAME COLUMN company_uuid TO company_id;
ALTER TABLE trn_batch RENAME COLUMN division_uuid TO division_id;
ALTER TABLE trn_bill RENAME COLUMN company_uuid TO company_id;
ALTER TABLE trn_bill RENAME COLUMN division_uuid TO division_id;
ALTER TABLE trn_closingstock_ledger RENAME COLUMN company_uuid TO company_id;
ALTER TABLE trn_closingstock_ledger RENAME COLUMN division_uuid TO division_id;
ALTER TABLE trn_cost_category_centre RENAME COLUMN company_uuid TO company_id;
ALTER TABLE trn_cost_category_centre RENAME COLUMN division_uuid TO division_id;
ALTER TABLE trn_cost_centre RENAME COLUMN company_uuid TO company_id;
ALTER TABLE trn_cost_centre RENAME COLUMN division_uuid TO division_id;
ALTER TABLE trn_cost_inventory_category_centre RENAME COLUMN company_uuid TO company_id;
ALTER TABLE trn_cost_inventory_category_centre RENAME COLUMN division_uuid TO division_id;
ALTER TABLE trn_employee RENAME COLUMN company_uuid TO company_id;
ALTER TABLE trn_employee RENAME COLUMN division_uuid TO division_id;

-- Step 4: Make columns NOT NULL where appropriate and add foreign key constraints
ALTER TABLE mst_attendance_type 
ALTER COLUMN company_id SET NOT NULL,
ALTER COLUMN division_id SET NOT NULL,
ADD CONSTRAINT fk_mst_attendance_type_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_mst_attendance_type_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_cost_category 
ALTER COLUMN company_id SET NOT NULL,
ALTER COLUMN division_id SET NOT NULL,
ADD CONSTRAINT fk_mst_cost_category_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_mst_cost_category_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_cost_centre 
ALTER COLUMN company_id SET NOT NULL,
ALTER COLUMN division_id SET NOT NULL,
ADD CONSTRAINT fk_mst_cost_centre_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_mst_cost_centre_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_employee 
ALTER COLUMN company_id SET NOT NULL,
ALTER COLUMN division_id SET NOT NULL,
ADD CONSTRAINT fk_mst_employee_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_mst_employee_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_godown 
ALTER COLUMN company_id SET NOT NULL,
ALTER COLUMN division_id SET NOT NULL,
ADD CONSTRAINT fk_mst_godown_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_mst_godown_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_group 
ALTER COLUMN company_id SET NOT NULL,
ALTER COLUMN division_id SET NOT NULL,
ADD CONSTRAINT fk_mst_group_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_mst_group_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_gst_effective_rate 
ALTER COLUMN company_id SET NOT NULL,
ALTER COLUMN division_id SET NOT NULL,
ADD CONSTRAINT fk_mst_gst_effective_rate_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_mst_gst_effective_rate_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_ledger 
ALTER COLUMN company_id SET NOT NULL,
ALTER COLUMN division_id SET NOT NULL,
ADD CONSTRAINT fk_mst_ledger_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_mst_ledger_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_opening_batch_allocation 
ALTER COLUMN company_id SET NOT NULL,
ALTER COLUMN division_id SET NOT NULL,
ADD CONSTRAINT fk_mst_opening_batch_allocation_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_mst_opening_batch_allocation_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_opening_bill_allocation 
ALTER COLUMN company_id SET NOT NULL,
ALTER COLUMN division_id SET NOT NULL,
ADD CONSTRAINT fk_mst_opening_bill_allocation_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_mst_opening_bill_allocation_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_payhead 
ALTER COLUMN company_id SET NOT NULL,
ALTER COLUMN division_id SET NOT NULL,
ADD CONSTRAINT fk_mst_payhead_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_mst_payhead_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_stock_group 
ALTER COLUMN company_id SET NOT NULL,
ALTER COLUMN division_id SET NOT NULL,
ADD CONSTRAINT fk_mst_stock_group_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_mst_stock_group_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_stock_item 
ALTER COLUMN company_id SET NOT NULL,
ALTER COLUMN division_id SET NOT NULL,
ADD CONSTRAINT fk_mst_stock_item_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_mst_stock_item_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_stockitem_standard_cost 
ALTER COLUMN company_id SET NOT NULL,
ALTER COLUMN division_id SET NOT NULL,
ADD CONSTRAINT fk_mst_stockitem_standard_cost_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_mst_stockitem_standard_cost_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_stockitem_standard_price 
ALTER COLUMN company_id SET NOT NULL,
ALTER COLUMN division_id SET NOT NULL,
ADD CONSTRAINT fk_mst_stockitem_standard_price_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_mst_stockitem_standard_price_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_uom 
ALTER COLUMN company_id SET NOT NULL,
ALTER COLUMN division_id SET NOT NULL,
ADD CONSTRAINT fk_mst_uom_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_mst_uom_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE mst_vouchertype 
ALTER COLUMN company_id SET NOT NULL,
ALTER COLUMN division_id SET NOT NULL,
ADD CONSTRAINT fk_mst_vouchertype_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_mst_vouchertype_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE tally_mst_group 
ALTER COLUMN company_id SET NOT NULL,
ALTER COLUMN division_id SET NOT NULL,
ADD CONSTRAINT fk_tally_mst_group_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_tally_mst_group_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE tally_mst_ledger 
ALTER COLUMN company_id SET NOT NULL,
ALTER COLUMN division_id SET NOT NULL,
ADD CONSTRAINT fk_tally_mst_ledger_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_tally_mst_ledger_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE tally_mst_stock_item 
ALTER COLUMN company_id SET NOT NULL,
ALTER COLUMN division_id SET NOT NULL,
ADD CONSTRAINT fk_tally_mst_stock_item_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_tally_mst_stock_item_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE tally_trn_voucher 
ALTER COLUMN company_id SET NOT NULL,
ALTER COLUMN division_id SET NOT NULL,
ADD CONSTRAINT fk_tally_trn_voucher_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_tally_trn_voucher_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE trn_accounting 
ALTER COLUMN company_id SET NOT NULL,
ALTER COLUMN division_id SET NOT NULL,
ADD CONSTRAINT fk_trn_accounting_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_trn_accounting_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE trn_attendance 
ALTER COLUMN company_id SET NOT NULL,
ALTER COLUMN division_id SET NOT NULL,
ADD CONSTRAINT fk_trn_attendance_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_trn_attendance_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE trn_bank 
ALTER COLUMN company_id SET NOT NULL,
ALTER COLUMN division_id SET NOT NULL,
ADD CONSTRAINT fk_trn_bank_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_trn_bank_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE trn_batch 
ALTER COLUMN company_id SET NOT NULL,
ALTER COLUMN division_id SET NOT NULL,
ADD CONSTRAINT fk_trn_batch_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_trn_batch_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE trn_bill 
ALTER COLUMN company_id SET NOT NULL,
ALTER COLUMN division_id SET NOT NULL,
ADD CONSTRAINT fk_trn_bill_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_trn_bill_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE trn_closingstock_ledger 
ALTER COLUMN company_id SET NOT NULL,
ALTER COLUMN division_id SET NOT NULL,
ADD CONSTRAINT fk_trn_closingstock_ledger_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_trn_closingstock_ledger_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE trn_cost_category_centre 
ALTER COLUMN company_id SET NOT NULL,
ALTER COLUMN division_id SET NOT NULL,
ADD CONSTRAINT fk_trn_cost_category_centre_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_trn_cost_category_centre_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE trn_cost_centre 
ALTER COLUMN company_id SET NOT NULL,
ALTER COLUMN division_id SET NOT NULL,
ADD CONSTRAINT fk_trn_cost_centre_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_trn_cost_centre_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE trn_cost_inventory_category_centre 
ALTER COLUMN company_id SET NOT NULL,
ALTER COLUMN division_id SET NOT NULL,
ADD CONSTRAINT fk_trn_cost_inventory_category_centre_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_trn_cost_inventory_category_centre_division FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE trn_employee 
ALTER COLUMN company_id SET NOT NULL,
ALTER COLUMN division_id SET NOT NULL,
ADD CONSTRAINT fk_trn_employee_company FOREIGN KEY (company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_trn_employee_division FOREIGN KEY (division_id) REFERENCES divisions(id);

-- Step 5: Create indexes for performance
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