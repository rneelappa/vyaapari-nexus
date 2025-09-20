-- Populate Foreign Key Relationships with correct column names

-- Update voucher_id in ledgerentries based on voucher_guid (using existing integer voucher_id column)
UPDATE tally.ledgerentries le
SET voucher_id = v.id
FROM tally.voucher v
WHERE le.voucher_guid = v.guid 
  AND le.company_id = v.company_id 
  AND le.division_id = v.division_id
  AND le.voucher_guid IS NOT NULL 
  AND le.voucher_guid != '';

-- Update ledger_id in ledgerentries based on ledger_name (using existing integer ledger_id column)
UPDATE tally.ledgerentries le
SET ledger_id = l.id
FROM tally.ledger l
WHERE le.ledger_name = l.name 
  AND le.company_id = l.company_id 
  AND le.division_id = l.division_id
  AND le.ledger_name IS NOT NULL 
  AND le.ledger_name != '';

-- Update voucher_id in inventoryentries based on voucher_guid (using existing integer voucher_id column)
UPDATE tally.inventoryentries ie
SET voucher_id = v.id
FROM tally.voucher v
WHERE ie.voucher_guid = v.guid 
  AND ie.company_id = v.company_id 
  AND ie.division_id = v.division_id
  AND ie.voucher_guid IS NOT NULL 
  AND ie.voucher_guid != '';

-- Update stockitem_id in inventoryentries based on stockitem_name (using existing integer stockitem_id column)
UPDATE tally.inventoryentries ie
SET stockitem_id = si.id
FROM tally.stockitem si
WHERE ie.stockitem_name = si.name 
  AND ie.company_id = si.company_id 
  AND ie.division_id = si.division_id
  AND ie.stockitem_name IS NOT NULL 
  AND ie.stockitem_name != '';

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