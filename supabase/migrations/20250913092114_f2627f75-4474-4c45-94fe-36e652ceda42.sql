-- Update foreign key on trn_voucher.division_id to reference vyaapari_divisions(id)
DO $$
BEGIN
  -- Drop existing FK if it exists
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'trn_voucher'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND tc.constraint_name = 'trn_voucher_division_id_fkey'
  ) THEN
    ALTER TABLE public.trn_voucher DROP CONSTRAINT trn_voucher_division_id_fkey;
  END IF;
EXCEPTION WHEN undefined_table THEN
  NULL;
END $$;

-- Recreate FK to point to vyaapari_divisions(id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'trn_voucher'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'vyaapari_divisions'
  ) THEN
    ALTER TABLE public.trn_voucher
      ADD CONSTRAINT trn_voucher_division_id_fkey
      FOREIGN KEY (division_id)
      REFERENCES public.vyaapari_divisions(id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_trn_voucher_division_id ON public.trn_voucher (division_id);
