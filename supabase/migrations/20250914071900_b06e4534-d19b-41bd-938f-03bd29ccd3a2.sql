-- Drop the unused public.trn_voucher table
DROP TABLE IF EXISTS public.trn_voucher;

-- Insert all records from tallydb.trn_voucher to public.tally_trn_voucher
-- Map column names correctly from tallydb schema to public schema
INSERT INTO public.tally_trn_voucher (
    guid, voucher_number, voucher_type, date, party_ledger_name, 
    narration, company_id, division_id, created_at
)
SELECT 
    tv.guid,
    tv.voucher_number,
    tv.voucher_type,
    tv.date,
    tv.party_name, -- Map party_name to party_ledger_name
    tv.narration,
    -- Map company_id from VARCHAR to UUID using mst_company lookup
    COALESCE(mc.vyaapari_company_id, '00000000-0000-0000-0000-000000000000'::uuid),
    -- Map division_id from VARCHAR to UUID using mst_division lookup  
    COALESCE(md.vyaapari_division_id, '00000000-0000-0000-0000-000000000000'::uuid),
    CURRENT_TIMESTAMP
FROM tallydb.trn_voucher tv
LEFT JOIN public.mst_company mc ON tv.company_id = mc.company_id
LEFT JOIN public.mst_division md ON tv.division_id = md.division_id
WHERE tv.guid NOT IN (
    SELECT guid FROM public.tally_trn_voucher
);