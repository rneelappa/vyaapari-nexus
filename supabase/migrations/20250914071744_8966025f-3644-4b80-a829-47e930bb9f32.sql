-- Drop the unused public.trn_voucher table
DROP TABLE IF EXISTS public.trn_voucher;

-- Insert all records from tallydb.trn_voucher to public.tally_trn_voucher
-- Handle schema differences by mapping VARCHAR company_id/division_id to UUID
INSERT INTO public.tally_trn_voucher (
    guid, voucher_number, voucher_type, date, party_ledger_name, 
    total_amount, basic_amount, discount_amount, tax_amount, net_amount, 
    final_amount, narration, reference, currency, exchange_rate, 
    due_date, voucher_number_prefix, voucher_number_suffix, 
    order_reference, consignment_note, receipt_reference, 
    altered_by, altered_on, is_cancelled, is_optional, 
    persistedview, company_id, division_id, created_at
)
SELECT 
    tv.guid,
    tv.voucher_number,
    tv.voucher_type,
    tv.date,
    tv.party_ledger_name,
    tv.total_amount,
    tv.basic_amount,
    tv.discount_amount,
    tv.tax_amount,
    tv.net_amount,
    tv.final_amount,
    tv.narration,
    tv.reference,
    tv.currency,
    tv.exchange_rate,
    tv.due_date,
    tv.voucher_number_prefix,
    tv.voucher_number_suffix,
    tv.order_reference,
    tv.consignment_note,
    tv.receipt_reference,
    tv.altered_by,
    tv.altered_on,
    tv.is_cancelled,
    tv.is_optional,
    tv.persistedview,
    -- Map company_id from VARCHAR to UUID using mst_company lookup
    COALESCE(mc.vyaapari_company_id, '00000000-0000-0000-0000-000000000000'::uuid),
    -- Map division_id from VARCHAR to UUID using mst_division lookup  
    COALESCE(md.vyaapari_division_id, '00000000-0000-0000-0000-000000000000'::uuid),
    COALESCE(tv.created_at, CURRENT_TIMESTAMP)
FROM tallydb.trn_voucher tv
LEFT JOIN public.mst_company mc ON tv.company_id = mc.company_id
LEFT JOIN public.mst_division md ON tv.division_id = md.division_id
WHERE tv.guid NOT IN (
    SELECT guid FROM public.tally_trn_voucher
);