-- Add Foreign Key Constraints and Performance Indexes

-- Add Foreign Key Constraints for Referential Integrity
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
FOREIGN KEY (stockitem_id) REFERENCES tally.stockitem(id);

-- Add Unique Constraints for Multi-tenancy
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

-- Create Performance Indexes
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
CREATE INDEX IF NOT EXISTS idx_inventoryentries_stockitem_id ON tally.inventoryentries(stockitem_id);