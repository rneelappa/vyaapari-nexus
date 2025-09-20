-- Add indexes for better performance on large Tally tables
-- These will significantly improve query performance for the sync operations

-- Add indexes on commonly queried columns for trn_accounting
CREATE INDEX IF NOT EXISTS idx_trn_accounting_voucher_guid ON trn_accounting(voucher_guid);
CREATE INDEX IF NOT EXISTS idx_trn_accounting_ledger ON trn_accounting(ledger);
CREATE INDEX IF NOT EXISTS idx_trn_accounting_company_division ON trn_accounting(company_id, division_id);
CREATE INDEX IF NOT EXISTS idx_trn_accounting_voucher_date ON trn_accounting(voucher_date);

-- Add indexes for trn_inventory
CREATE INDEX IF NOT EXISTS idx_trn_inventory_voucher_guid ON trn_inventory(voucher_guid);
CREATE INDEX IF NOT EXISTS idx_trn_inventory_item ON trn_inventory(item);
CREATE INDEX IF NOT EXISTS idx_trn_inventory_company_division ON trn_inventory(company_id, division_id);
CREATE INDEX IF NOT EXISTS idx_trn_inventory_voucher_date ON trn_inventory(voucher_date);

-- Add indexes for tally_trn_voucher for better joins
CREATE INDEX IF NOT EXISTS idx_tally_trn_voucher_company_division ON tally_trn_voucher(company_id, division_id);
CREATE INDEX IF NOT EXISTS idx_tally_trn_voucher_date ON tally_trn_voucher(date);
CREATE INDEX IF NOT EXISTS idx_tally_trn_voucher_voucher_type ON tally_trn_voucher(voucher_type);
CREATE INDEX IF NOT EXISTS idx_tally_trn_voucher_party ON tally_trn_voucher(party_ledger_name);

-- Add indexes for master tables
CREATE INDEX IF NOT EXISTS idx_mst_ledger_company_division ON mst_ledger(company_id, division_id);
CREATE INDEX IF NOT EXISTS idx_mst_ledger_parent ON mst_ledger(parent);
CREATE INDEX IF NOT EXISTS idx_mst_group_company_division ON mst_group(company_id, division_id);
CREATE INDEX IF NOT EXISTS idx_mst_stock_item_company_division ON mst_stock_item(company_id, division_id);

-- Add composite index for sync job tracking
CREATE INDEX IF NOT EXISTS idx_tally_sync_jobs_status_company ON tally_sync_jobs(status, company_id, division_id);

-- Add updated_at trigger for trn_inventory (without IF NOT EXISTS for triggers)
DROP TRIGGER IF EXISTS update_trn_inventory_updated_at ON trn_inventory;
CREATE TRIGGER update_trn_inventory_updated_at
    BEFORE UPDATE ON trn_inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();