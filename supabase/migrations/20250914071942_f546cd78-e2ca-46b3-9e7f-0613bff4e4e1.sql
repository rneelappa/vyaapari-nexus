-- Drop the unused public.trn_voucher table
DROP TABLE IF EXISTS public.trn_voucher;

-- Insert all records from tallydb.trn_voucher to public.tally_trn_voucher
-- Use NULL for company_id and division_id since the mapping tables don't have the right structure
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
    NULL::uuid, -- Set to NULL for now since mapping is complex
    NULL::uuid, -- Set to NULL for now since mapping is complex
    CURRENT_TIMESTAMP
FROM tallydb.trn_voucher tv
WHERE tv.guid NOT IN (
    SELECT guid FROM public.tally_trn_voucher
);