-- Create unique indexes for upserts using composite keys (guid, company_id, division_id)
-- These ensure PostgREST upserts with on_conflict work reliably

-- mst_group
CREATE UNIQUE INDEX IF NOT EXISTS uq_mst_group_guid_company_division 
ON public.mst_group (guid, company_id, division_id);

-- mst_ledger
CREATE UNIQUE INDEX IF NOT EXISTS uq_mst_ledger_guid_company_division 
ON public.mst_ledger (guid, company_id, division_id);

-- mst_stock_item
CREATE UNIQUE INDEX IF NOT EXISTS uq_mst_stock_item_guid_company_division 
ON public.mst_stock_item (guid, company_id, division_id);

-- mst_vouchertype
CREATE UNIQUE INDEX IF NOT EXISTS uq_mst_vouchertype_guid_company_division 
ON public.mst_vouchertype (guid, company_id, division_id);

-- mst_uom
CREATE UNIQUE INDEX IF NOT EXISTS uq_mst_uom_guid_company_division 
ON public.mst_uom (guid, company_id, division_id);

-- mst_godown
CREATE UNIQUE INDEX IF NOT EXISTS uq_mst_godown_guid_company_division 
ON public.mst_godown (guid, company_id, division_id);

-- mst_cost_centre
CREATE UNIQUE INDEX IF NOT EXISTS uq_mst_cost_centre_guid_company_division 
ON public.mst_cost_centre (guid, company_id, division_id);

-- tally_trn_voucher
CREATE UNIQUE INDEX IF NOT EXISTS uq_tally_trn_voucher_guid_company_division 
ON public.tally_trn_voucher (guid, company_id, division_id);

-- trn_accounting
CREATE UNIQUE INDEX IF NOT EXISTS uq_trn_accounting_guid_company_division 
ON public.trn_accounting (guid, company_id, division_id);

-- trn_inventory
CREATE UNIQUE INDEX IF NOT EXISTS uq_trn_inventory_guid_company_division 
ON public.trn_inventory (guid, company_id, division_id);

-- Helpful indexes for filters
CREATE INDEX IF NOT EXISTS idx_tally_trn_voucher_company_division_date 
ON public.tally_trn_voucher (company_id, division_id, date);
CREATE INDEX IF NOT EXISTS idx_trn_accounting_company_division_voucher 
ON public.trn_accounting (company_id, division_id, voucher_guid);
