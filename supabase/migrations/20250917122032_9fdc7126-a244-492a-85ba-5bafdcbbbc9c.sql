-- Clean up duplicate entries in trn_accounting before creating unique index
-- Keep only the first occurrence of each duplicate (guid, company_id, division_id) combination

WITH ranked_records AS (
  SELECT *,
    ROW_NUMBER() OVER (
      PARTITION BY guid, company_id, division_id 
      ORDER BY voucher_date DESC, amount DESC
    ) as row_num
  FROM public.trn_accounting
  WHERE guid IS NOT NULL AND company_id IS NOT NULL AND division_id IS NOT NULL
)
DELETE FROM public.trn_accounting
WHERE (guid, company_id, division_id, voucher_guid, ledger, amount) IN (
  SELECT guid, company_id, division_id, voucher_guid, ledger, amount
  FROM ranked_records
  WHERE row_num > 1
);

-- Now create the unique indexes after deduplication
CREATE UNIQUE INDEX IF NOT EXISTS uq_mst_group_guid_company_division 
ON public.mst_group (guid, company_id, division_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_mst_ledger_guid_company_division 
ON public.mst_ledger (guid, company_id, division_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_mst_stock_item_guid_company_division 
ON public.mst_stock_item (guid, company_id, division_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_mst_vouchertype_guid_company_division 
ON public.mst_vouchertype (guid, company_id, division_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_mst_uom_guid_company_division 
ON public.mst_uom (guid, company_id, division_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_mst_godown_guid_company_division 
ON public.mst_godown (guid, company_id, division_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_mst_cost_centre_guid_company_division 
ON public.mst_cost_centre (guid, company_id, division_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_tally_trn_voucher_guid_company_division 
ON public.tally_trn_voucher (guid, company_id, division_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_trn_accounting_guid_company_division 
ON public.trn_accounting (guid, company_id, division_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_trn_inventory_guid_company_division 
ON public.trn_inventory (guid, company_id, division_id);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_tally_trn_voucher_company_division_date 
ON public.tally_trn_voucher (company_id, division_id, date);
CREATE INDEX IF NOT EXISTS idx_trn_accounting_company_division_voucher 
ON public.trn_accounting (company_id, division_id, voucher_guid);