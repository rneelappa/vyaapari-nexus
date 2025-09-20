-- Comprehensive Tally Schema Referential Integrity & Multi-Tenancy Implementation
-- Phase 1: Add Multi-tenancy Columns to All Tally Tables

-- Add company_id and division_id to group_table
ALTER TABLE tally.group_table 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id),
ADD COLUMN IF NOT EXISTS division_id UUID REFERENCES public.divisions(id),
ADD COLUMN IF NOT EXISTS parent_group_id BIGINT;

-- Add company_id and division_id to ledger
ALTER TABLE tally.ledger 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id),
ADD COLUMN IF NOT EXISTS division_id UUID REFERENCES public.divisions(id),
ADD COLUMN IF NOT EXISTS parent_group_id BIGINT;

-- Add company_id and division_id to stockitem
ALTER TABLE tally.stockitem 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id),
ADD COLUMN IF NOT EXISTS division_id UUID REFERENCES public.divisions(id),
ADD COLUMN IF NOT EXISTS parent_group_id BIGINT;

-- Add company_id and division_id to vouchertype
ALTER TABLE tally.vouchertype 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id),
ADD COLUMN IF NOT EXISTS division_id UUID REFERENCES public.divisions(id),
ADD COLUMN IF NOT EXISTS parent_type_id BIGINT;

-- Add company_id and division_id to voucher
ALTER TABLE tally.voucher 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id),
ADD COLUMN IF NOT EXISTS division_id UUID REFERENCES public.divisions(id),
ADD COLUMN IF NOT EXISTS voucher_type_id BIGINT;

-- Add company_id and division_id to ledgerentries
ALTER TABLE tally.ledgerentries 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id),
ADD COLUMN IF NOT EXISTS division_id UUID REFERENCES public.divisions(id),
ADD COLUMN IF NOT EXISTS voucher_id BIGINT,
ADD COLUMN IF NOT EXISTS ledger_id BIGINT;

-- Add company_id and division_id to inventoryentries
ALTER TABLE tally.inventoryentries 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id),
ADD COLUMN IF NOT EXISTS division_id UUID REFERENCES public.divisions(id),
ADD COLUMN IF NOT EXISTS voucher_id BIGINT,
ADD COLUMN IF NOT EXISTS stock_item_id BIGINT;

-- Phase 2: Populate Multi-tenancy Columns with SKM Steels Data
-- Update all tally tables with the SKM Steels company and division IDs

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

-- Phase 3: Populate Foreign Key Relationships
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

-- Phase 4: Make Multi-tenancy Columns NOT NULL
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

-- Phase 5: Add Foreign Key Constraints
-- Add foreign key constraints for referential integrity
ALTER TABLE tally.group_table 
ADD CONSTRAINT fk_group_parent_group 
FOREIGN KEY (parent_group_id) REFERENCES tally.group_table(id);

ALTER TABLE tally.ledger 
ADD CONSTRAINT fk_ledger_parent_group 
FOREIGN KEY (parent_group_id) REFERENCES tally.group_table(id);

ALTER TABLE tally.stockitem 
ADD CONSTRAINT fk_stockitem_parent_group 
FOREIGN KEY (parent_group_id) REFERENCES tally.group_table(id);

ALTER TABLE tally.voucher 
ADD CONSTRAINT fk_voucher_voucher_type 
FOREIGN KEY (voucher_type_id) REFERENCES tally.vouchertype(id);

ALTER TABLE tally.ledgerentries 
ADD CONSTRAINT fk_ledgerentries_voucher 
FOREIGN KEY (voucher_id) REFERENCES tally.voucher(id),
ADD CONSTRAINT fk_ledgerentries_ledger 
FOREIGN KEY (ledger_id) REFERENCES tally.ledger(id);

ALTER TABLE tally.inventoryentries 
ADD CONSTRAINT fk_inventoryentries_voucher 
FOREIGN KEY (voucher_id) REFERENCES tally.voucher(id),
ADD CONSTRAINT fk_inventoryentries_stockitem 
FOREIGN KEY (stock_item_id) REFERENCES tally.stockitem(id);

-- Phase 6: Add Unique Constraints for Multi-tenancy
-- Ensure unique names within company/division scope
ALTER TABLE tally.group_table 
ADD CONSTRAINT uk_group_name_company_division 
UNIQUE (name, company_id, division_id);

ALTER TABLE tally.ledger 
ADD CONSTRAINT uk_ledger_name_company_division 
UNIQUE (name, company_id, division_id);

ALTER TABLE tally.stockitem 
ADD CONSTRAINT uk_stockitem_name_company_division 
UNIQUE (name, company_id, division_id);

ALTER TABLE tally.vouchertype 
ADD CONSTRAINT uk_vouchertype_name_company_division 
UNIQUE (name, company_id, division_id);

-- Phase 7: Create Performance Indexes
-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_group_company_division ON tally.group_table(company_id, division_id);
CREATE INDEX IF NOT EXISTS idx_group_parent_id ON tally.group_table(parent_group_id);

CREATE INDEX IF NOT EXISTS idx_ledger_company_division ON tally.ledger(company_id, division_id);
CREATE INDEX IF NOT EXISTS idx_ledger_parent_group ON tally.ledger(parent_group_id);

CREATE INDEX IF NOT EXISTS idx_stockitem_company_division ON tally.stockitem(company_id, division_id);
CREATE INDEX IF NOT EXISTS idx_stockitem_parent_group ON tally.stockitem(parent_group_id);

CREATE INDEX IF NOT EXISTS idx_vouchertype_company_division ON tally.vouchertype(company_id, division_id);

CREATE INDEX IF NOT EXISTS idx_voucher_company_division ON tally.voucher(company_id, division_id);
CREATE INDEX IF NOT EXISTS idx_voucher_type_id ON tally.voucher(voucher_type_id);
CREATE INDEX IF NOT EXISTS idx_voucher_date ON tally.voucher(date);

CREATE INDEX IF NOT EXISTS idx_ledgerentries_company_division ON tally.ledgerentries(company_id, division_id);
CREATE INDEX IF NOT EXISTS idx_ledgerentries_voucher_id ON tally.ledgerentries(voucher_id);
CREATE INDEX IF NOT EXISTS idx_ledgerentries_ledger_id ON tally.ledgerentries(ledger_id);

CREATE INDEX IF NOT EXISTS idx_inventoryentries_company_division ON tally.inventoryentries(company_id, division_id);
CREATE INDEX IF NOT EXISTS idx_inventoryentries_voucher_id ON tally.inventoryentries(voucher_id);
CREATE INDEX IF NOT EXISTS idx_inventoryentries_stockitem_id ON tally.inventoryentries(stock_item_id);