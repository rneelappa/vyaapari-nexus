-- Phase 1: Add Multi-tenancy Columns to All Tally Tables (without triggers)

-- Add company_id and division_id to group_table
ALTER TABLE tally.group_table 
ADD COLUMN IF NOT EXISTS company_id UUID,
ADD COLUMN IF NOT EXISTS division_id UUID,
ADD COLUMN IF NOT EXISTS parent_group_id BIGINT;

-- Add company_id and division_id to ledger
ALTER TABLE tally.ledger 
ADD COLUMN IF NOT EXISTS company_id UUID,
ADD COLUMN IF NOT EXISTS division_id UUID,
ADD COLUMN IF NOT EXISTS parent_group_id BIGINT;

-- Add company_id and division_id to stockitem
ALTER TABLE tally.stockitem 
ADD COLUMN IF NOT EXISTS company_id UUID,
ADD COLUMN IF NOT EXISTS division_id UUID,
ADD COLUMN IF NOT EXISTS parent_group_id BIGINT;

-- Add company_id and division_id to vouchertype
ALTER TABLE tally.vouchertype 
ADD COLUMN IF NOT EXISTS company_id UUID,
ADD COLUMN IF NOT EXISTS division_id UUID,
ADD COLUMN IF NOT EXISTS parent_type_id BIGINT;

-- Add company_id and division_id to voucher
ALTER TABLE tally.voucher 
ADD COLUMN IF NOT EXISTS company_id UUID,
ADD COLUMN IF NOT EXISTS division_id UUID,
ADD COLUMN IF NOT EXISTS voucher_type_id BIGINT;

-- Add company_id and division_id to ledgerentries
ALTER TABLE tally.ledgerentries 
ADD COLUMN IF NOT EXISTS company_id UUID,
ADD COLUMN IF NOT EXISTS division_id UUID,
ADD COLUMN IF NOT EXISTS voucher_id BIGINT,
ADD COLUMN IF NOT EXISTS ledger_id BIGINT;

-- Add company_id and division_id to inventoryentries
ALTER TABLE tally.inventoryentries 
ADD COLUMN IF NOT EXISTS company_id UUID,
ADD COLUMN IF NOT EXISTS division_id UUID,
ADD COLUMN IF NOT EXISTS voucher_id BIGINT,
ADD COLUMN IF NOT EXISTS stock_item_id BIGINT;

-- Phase 2: Populate Multi-tenancy Columns with SKM Steels Data
UPDATE tally.group_table 
SET company_id = '629f49fb-983e-4141-8c48-e1423b39e921',
    division_id = '37f3cc0c-58ad-4baf-b309-360116ffc3cd'
WHERE company_id IS NULL;

UPDATE tally.ledger 
SET company_id = '629f49fb-983e-4141-8c48-e1423b39e921',
    division_id = '37f3cc0c-58ad-4baf-b309-360116ffc3cd'
WHERE company_id IS NULL;

UPDATE tally.stockitem 
SET company_id = '629f49fb-983e-4141-8c48-e1423b39e921',
    division_id = '37f3cc0c-58ad-4baf-b309-360116ffc3cd'
WHERE company_id IS NULL;

UPDATE tally.vouchertype 
SET company_id = '629f49fb-983e-4141-8c48-e1423b39e921',
    division_id = '37f3cc0c-58ad-4baf-b309-360116ffc3cd'
WHERE company_id IS NULL;

UPDATE tally.voucher 
SET company_id = '629f49fb-983e-4141-8c48-e1423b39e921',
    division_id = '37f3cc0c-58ad-4baf-b309-360116ffc3cd'
WHERE company_id IS NULL;

UPDATE tally.ledgerentries 
SET company_id = '629f49fb-983e-4141-8c48-e1423b39e921',
    division_id = '37f3cc0c-58ad-4baf-b309-360116ffc3cd'
WHERE company_id IS NULL;

UPDATE tally.inventoryentries 
SET company_id = '629f49fb-983e-4141-8c48-e1423b39e921',
    division_id = '37f3cc0c-58ad-4baf-b309-360116ffc3cd'
WHERE company_id IS NULL;