-- Enable RLS and add policies for trn_voucher (fix permission denied)
DO $$ BEGIN
  -- Enable RLS
  EXECUTE 'ALTER TABLE public.trn_voucher ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN others THEN NULL; END $$;

-- SELECT policy
DO $$ BEGIN
  CREATE POLICY "Authenticated users can view vouchers"
  ON public.trn_voucher
  FOR SELECT
  USING (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- INSERT policy
DO $$ BEGIN
  CREATE POLICY "Authenticated users can insert vouchers"
  ON public.trn_voucher
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- UPDATE policy (future-proofing edits)
DO $$ BEGIN
  CREATE POLICY "Authenticated users can update vouchers"
  ON public.trn_voucher
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Optional: DELETE policy if needed later
-- DO $$ BEGIN
--   CREATE POLICY "Authenticated users can delete vouchers"
--   ON public.trn_voucher
--   FOR DELETE
--   USING (auth.uid() IS NOT NULL);
-- EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Also ensure inventory entries can be saved (often part of voucher save flow)
DO $$ BEGIN
  EXECUTE 'ALTER TABLE public.trn_inventory ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can manage inventory"
  ON public.trn_inventory
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
