-- Handle null values in Tally tables by making foreign keys nullable first
-- Then we'll clean up the data

-- First, let's see what tables have null company_id or division_id values
-- We'll handle this by making the foreign keys nullable initially

-- Add UUID columns but keep them nullable for now
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

-- Update UUID columns where we can map them (only update non-null values)
UPDATE mst_attendance_type SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = mst_attendance_type.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = mst_attendance_type.division_id LIMIT 1)
WHERE company_id IS NOT NULL AND division_id IS NOT NULL;

UPDATE mst_cost_category SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = mst_cost_category.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = mst_cost_category.division_id LIMIT 1)
WHERE company_id IS NOT NULL AND division_id IS NOT NULL;

UPDATE mst_cost_centre SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = mst_cost_centre.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = mst_cost_centre.division_id LIMIT 1)
WHERE company_id IS NOT NULL AND division_id IS NOT NULL;

UPDATE mst_employee SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = mst_employee.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = mst_employee.division_id LIMIT 1)
WHERE company_id IS NOT NULL AND division_id IS NOT NULL;

UPDATE mst_godown SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = mst_godown.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = mst_godown.division_id LIMIT 1)
WHERE company_id IS NOT NULL AND division_id IS NOT NULL;

UPDATE mst_group SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = mst_group.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = mst_group.division_id LIMIT 1)
WHERE company_id IS NOT NULL AND division_id IS NOT NULL;

UPDATE mst_gst_effective_rate SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = mst_gst_effective_rate.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = mst_gst_effective_rate.division_id LIMIT 1)
WHERE company_id IS NOT NULL AND division_id IS NOT NULL;

UPDATE mst_ledger SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = mst_ledger.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = mst_ledger.division_id LIMIT 1)
WHERE company_id IS NOT NULL AND division_id IS NOT NULL;

UPDATE mst_opening_batch_allocation SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = mst_opening_batch_allocation.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = mst_opening_batch_allocation.division_id LIMIT 1)
WHERE company_id IS NOT NULL AND division_id IS NOT NULL;

UPDATE mst_opening_bill_allocation SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = mst_opening_bill_allocation.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = mst_opening_bill_allocation.division_id LIMIT 1)
WHERE company_id IS NOT NULL AND division_id IS NOT NULL;

UPDATE mst_payhead SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = mst_payhead.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = mst_payhead.division_id LIMIT 1)
WHERE company_id IS NOT NULL AND division_id IS NOT NULL;

UPDATE mst_stock_group SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = mst_stock_group.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = mst_stock_group.division_id LIMIT 1)
WHERE company_id IS NOT NULL AND division_id IS NOT NULL;

UPDATE mst_stock_item SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = mst_stock_item.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = mst_stock_item.division_id LIMIT 1)
WHERE company_id IS NOT NULL AND division_id IS NOT NULL;

UPDATE mst_stockitem_standard_cost SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = mst_stockitem_standard_cost.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = mst_stockitem_standard_cost.division_id LIMIT 1)
WHERE company_id IS NOT NULL AND division_id IS NOT NULL;

UPDATE mst_stockitem_standard_price SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = mst_stockitem_standard_price.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = mst_stockitem_standard_price.division_id LIMIT 1)
WHERE company_id IS NOT NULL AND division_id IS NOT NULL;

UPDATE mst_uom SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = mst_uom.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = mst_uom.division_id LIMIT 1)
WHERE company_id IS NOT NULL AND division_id IS NOT NULL;

UPDATE mst_vouchertype SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = mst_vouchertype.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = mst_vouchertype.division_id LIMIT 1)
WHERE company_id IS NOT NULL AND division_id IS NOT NULL;

-- Update tally_* tables
UPDATE tally_mst_group SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = tally_mst_group.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = tally_mst_group.division_id LIMIT 1)
WHERE company_id IS NOT NULL AND division_id IS NOT NULL;

UPDATE tally_mst_ledger SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = tally_mst_ledger.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = tally_mst_ledger.division_id LIMIT 1)
WHERE company_id IS NOT NULL AND division_id IS NOT NULL;

UPDATE tally_mst_stock_item SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = tally_mst_stock_item.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = tally_mst_stock_item.division_id LIMIT 1)
WHERE company_id IS NOT NULL AND division_id IS NOT NULL;

UPDATE tally_trn_voucher SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = tally_trn_voucher.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = tally_trn_voucher.division_id LIMIT 1)
WHERE company_id IS NOT NULL AND division_id IS NOT NULL;

-- Update trn_* tables  
UPDATE trn_accounting SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = trn_accounting.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = trn_accounting.division_id LIMIT 1)
WHERE company_id IS NOT NULL AND division_id IS NOT NULL;

UPDATE trn_attendance SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = trn_attendance.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = trn_attendance.division_id LIMIT 1)
WHERE company_id IS NOT NULL AND division_id IS NOT NULL;

UPDATE trn_bank SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = trn_bank.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = trn_bank.division_id LIMIT 1)
WHERE company_id IS NOT NULL AND division_id IS NOT NULL;

UPDATE trn_batch SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = trn_batch.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = trn_batch.division_id LIMIT 1)
WHERE company_id IS NOT NULL AND division_id IS NOT NULL;

UPDATE trn_bill SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = trn_bill.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = trn_bill.division_id LIMIT 1)
WHERE company_id IS NOT NULL AND division_id IS NOT NULL;

UPDATE trn_closingstock_ledger SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = trn_closingstock_ledger.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = trn_closingstock_ledger.division_id LIMIT 1)
WHERE company_id IS NOT NULL AND division_id IS NOT NULL;

UPDATE trn_cost_category_centre SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = trn_cost_category_centre.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = trn_cost_category_centre.division_id LIMIT 1)
WHERE company_id IS NOT NULL AND division_id IS NOT NULL;

UPDATE trn_cost_centre SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = trn_cost_centre.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = trn_cost_centre.division_id LIMIT 1)
WHERE company_id IS NOT NULL AND division_id IS NOT NULL;

UPDATE trn_cost_inventory_category_centre SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = trn_cost_inventory_category_centre.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = trn_cost_inventory_category_centre.division_id LIMIT 1)
WHERE company_id IS NOT NULL AND division_id IS NOT NULL;

UPDATE trn_employee SET 
  company_uuid = (SELECT c.id FROM companies c JOIN mst_company mc ON c.name = mc.company_name WHERE mc.company_id = trn_employee.company_id LIMIT 1),
  division_uuid = (SELECT d.id FROM divisions d JOIN mst_division md ON d.name = md.division_name WHERE md.division_id = trn_employee.division_id LIMIT 1)
WHERE company_id IS NOT NULL AND division_id IS NOT NULL;