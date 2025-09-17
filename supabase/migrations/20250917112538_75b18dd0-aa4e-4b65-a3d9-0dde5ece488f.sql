-- Add essential performance indexes for Tally data sync
-- Focus only on existing columns and critical performance paths

-- Essential indexes for trn_accounting table
CREATE INDEX IF NOT EXISTS idx_trn_accounting_company_division ON trn_accounting(company_id, division_id);
CREATE INDEX IF NOT EXISTS idx_trn_accounting_guid ON trn_accounting(guid);

-- Essential indexes for trn_inventory table  
CREATE INDEX IF NOT EXISTS idx_trn_inventory_company_division ON trn_inventory(company_id, division_id);
CREATE INDEX IF NOT EXISTS idx_trn_inventory_guid ON trn_inventory(guid);

-- Essential indexes for tally_trn_voucher
CREATE INDEX IF NOT EXISTS idx_tally_trn_voucher_company_division ON tally_trn_voucher(company_id, division_id);
CREATE INDEX IF NOT EXISTS idx_tally_trn_voucher_guid ON tally_trn_voucher(guid);

-- Essential indexes for master tables
CREATE INDEX IF NOT EXISTS idx_mst_ledger_company_division ON mst_ledger(company_id, division_id);
CREATE INDEX IF NOT EXISTS idx_mst_group_company_division ON mst_group(company_id, division_id);
CREATE INDEX IF NOT EXISTS idx_mst_stock_item_company_division ON mst_stock_item(company_id, division_id);

-- Add trigger for trn_inventory updated_at
DROP TRIGGER IF EXISTS update_trn_inventory_updated_at ON trn_inventory;
CREATE TRIGGER update_trn_inventory_updated_at
    BEFORE UPDATE ON trn_inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();