-- Populate Foreign Key Relationships and Add Constraints

-- Update parent_group_id in group_table based on parent name
UPDATE tally.group_table gt1 
SET parent_group_id = gt2.id
FROM tally.group_table gt2
WHERE gt1.parent = gt2.name 
  AND gt1.company_id = gt2.company_id 
  AND gt1.division_id = gt2.division_id
  AND gt1.parent IS NOT NULL 
  AND gt1.parent != '';

-- Update parent_group_id in ledger based on parent name
UPDATE tally.ledger l
SET parent_group_id = gt.id
FROM tally.group_table gt
WHERE l.parent = gt.name 
  AND l.company_id = gt.company_id 
  AND l.division_id = gt.division_id
  AND l.parent IS NOT NULL 
  AND l.parent != '';

-- Update parent_group_id in stockitem based on parent name
UPDATE tally.stockitem si
SET parent_group_id = gt.id
FROM tally.group_table gt
WHERE si.parent = gt.name 
  AND si.company_id = gt.company_id 
  AND si.division_id = gt.division_id
  AND si.parent IS NOT NULL 
  AND si.parent != '';

-- Update voucher_type_id in voucher based on vouchertype name
UPDATE tally.voucher v
SET voucher_type_id = vt.id
FROM tally.vouchertype vt
WHERE v.vouchertype = vt.name 
  AND v.company_id = vt.company_id 
  AND v.division_id = vt.division_id
  AND v.vouchertype IS NOT NULL 
  AND v.vouchertype != '';

-- Update voucher_id in ledgerentries based on voucher_guid
UPDATE tally.ledgerentries le
SET voucher_id = v.id
FROM tally.voucher v
WHERE le.voucher_guid = v.guid 
  AND le.company_id = v.company_id 
  AND le.division_id = v.division_id
  AND le.voucher_guid IS NOT NULL 
  AND le.voucher_guid != '';

-- Update ledger_id in ledgerentries based on ledger name
UPDATE tally.ledgerentries le
SET ledger_id = l.id
FROM tally.ledger l
WHERE le.ledger = l.name 
  AND le.company_id = l.company_id 
  AND le.division_id = l.division_id
  AND le.ledger IS NOT NULL 
  AND le.ledger != '';

-- Update voucher_id in inventoryentries based on voucher_guid
UPDATE tally.inventoryentries ie
SET voucher_id = v.id
FROM tally.voucher v
WHERE ie.voucher_guid = v.guid 
  AND ie.company_id = v.company_id 
  AND ie.division_id = v.division_id
  AND ie.voucher_guid IS NOT NULL 
  AND ie.voucher_guid != '';

-- Update stock_item_id in inventoryentries based on stockitem name
UPDATE tally.inventoryentries ie
SET stock_item_id = si.id
FROM tally.stockitem si
WHERE ie.stockitem = si.name 
  AND ie.company_id = si.company_id 
  AND ie.division_id = si.division_id
  AND ie.stockitem IS NOT NULL 
  AND ie.stockitem != '';

-- Make Multi-tenancy Columns NOT NULL
ALTER TABLE tally.group_table 
ALTER COLUMN company_id SET NOT NULL,
ALTER COLUMN division_id SET NOT NULL;

ALTER TABLE tally.ledger 
ALTER COLUMN company_id SET NOT NULL,
ALTER COLUMN division_id SET NOT NULL;

ALTER TABLE tally.stockitem 
ALTER COLUMN company_id SET NOT NULL,
ALTER COLUMN division_id SET NOT NULL;

ALTER TABLE tally.vouchertype 
ALTER COLUMN company_id SET NOT NULL,
ALTER COLUMN division_id SET NOT NULL;

ALTER TABLE tally.voucher 
ALTER COLUMN company_id SET NOT NULL,
ALTER COLUMN division_id SET NOT NULL;

ALTER TABLE tally.ledgerentries 
ALTER COLUMN company_id SET NOT NULL,
ALTER COLUMN division_id SET NOT NULL;

ALTER TABLE tally.inventoryentries 
ALTER COLUMN company_id SET NOT NULL,
ALTER COLUMN division_id SET NOT NULL;