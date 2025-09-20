-- Fix accounting entries linkage by updating voucher_guid based on voucher_number match
UPDATE public.trn_accounting 
SET voucher_guid = v.guid
FROM public.tally_trn_voucher v 
WHERE trn_accounting.voucher_number = v.voucher_number
  AND trn_accounting.company_id = v.company_id 
  AND trn_accounting.division_id = v.division_id
  AND (trn_accounting.voucher_guid IS NULL OR trn_accounting.voucher_guid = '');