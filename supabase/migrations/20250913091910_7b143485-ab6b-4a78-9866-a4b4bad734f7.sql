-- Update foreign key on trn_voucher.company_id to reference vyaapari_companies(id)
DO $$
BEGIN
  -- Drop existing FK if it exists
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'trn_voucher'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND tc.constraint_name = 'trn_voucher_company_id_fkey'
  ) THEN
    ALTER TABLE public.trn_voucher DROP CONSTRAINT trn_voucher_company_id_fkey;
  END IF;
EXCEPTION WHEN undefined_table THEN
  -- Table might not exist in some environments; do nothing
  NULL;
END $$;

-- Recreate FK to point to vyaapari_companies(id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'trn_voucher'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'vyaapari_companies'
  ) THEN
    ALTER TABLE public.trn_voucher
      ADD CONSTRAINT trn_voucher_company_id_fkey
      FOREIGN KEY (company_id)
      REFERENCES public.vyaapari_companies(id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT;
  END IF;
END $$;

-- Helpful index to speed up joins/filters
CREATE INDEX IF NOT EXISTS idx_trn_voucher_company_id ON public.trn_voucher (company_id);
