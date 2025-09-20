-- Align foreign keys to Vyaapari master tables to avoid FK violations
-- 1) trn_inventory -> company_id/division_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema='public' AND table_name='trn_inventory'
      AND constraint_name='trn_inventory_company_id_fkey') THEN
    ALTER TABLE public.trn_inventory DROP CONSTRAINT trn_inventory_company_id_fkey;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema='public' AND table_name='trn_inventory'
      AND constraint_name='trn_inventory_division_id_fkey') THEN
    ALTER TABLE public.trn_inventory DROP CONSTRAINT trn_inventory_division_id_fkey;
  END IF;
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='trn_inventory')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='vyaapari_companies') THEN
    ALTER TABLE public.trn_inventory
      ADD CONSTRAINT trn_inventory_company_id_fkey
      FOREIGN KEY (company_id) REFERENCES public.vyaapari_companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='trn_inventory')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='vyaapari_divisions') THEN
    ALTER TABLE public.trn_inventory
      ADD CONSTRAINT trn_inventory_division_id_fkey
      FOREIGN KEY (division_id) REFERENCES public.vyaapari_divisions(id) ON UPDATE CASCADE ON DELETE RESTRICT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_trn_inventory_company_id ON public.trn_inventory (company_id);
CREATE INDEX IF NOT EXISTS idx_trn_inventory_division_id ON public.trn_inventory (division_id);

-- 2) trn_accounting -> company_id/division_id (these are inserted together with vouchers)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema='public' AND table_name='trn_accounting'
      AND constraint_name='trn_accounting_company_id_fkey') THEN
    ALTER TABLE public.trn_accounting DROP CONSTRAINT trn_accounting_company_id_fkey;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema='public' AND table_name='trn_accounting'
      AND constraint_name='trn_accounting_division_id_fkey') THEN
    ALTER TABLE public.trn_accounting DROP CONSTRAINT trn_accounting_division_id_fkey;
  END IF;
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='trn_accounting')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='vyaapari_companies') THEN
    ALTER TABLE public.trn_accounting
      ADD CONSTRAINT trn_accounting_company_id_fkey
      FOREIGN KEY (company_id) REFERENCES public.vyaapari_companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='trn_accounting')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='vyaapari_divisions') THEN
    ALTER TABLE public.trn_accounting
      ADD CONSTRAINT trn_accounting_division_id_fkey
      FOREIGN KEY (division_id) REFERENCES public.vyaapari_divisions(id) ON UPDATE CASCADE ON DELETE RESTRICT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_trn_accounting_company_id ON public.trn_accounting (company_id);
CREATE INDEX IF NOT EXISTS idx_trn_accounting_division_id ON public.trn_accounting (division_id);

-- 3) trn_batch -> company_id/division_id (inserted for tracking numbers)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema='public' AND table_name='trn_batch'
      AND constraint_name='trn_batch_company_id_fkey') THEN
    ALTER TABLE public.trn_batch DROP CONSTRAINT trn_batch_company_id_fkey;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema='public' AND table_name='trn_batch'
      AND constraint_name='trn_batch_division_id_fkey') THEN
    ALTER TABLE public.trn_batch DROP CONSTRAINT trn_batch_division_id_fkey;
  END IF;
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='trn_batch')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='vyaapari_companies') THEN
    ALTER TABLE public.trn_batch
      ADD CONSTRAINT trn_batch_company_id_fkey
      FOREIGN KEY (company_id) REFERENCES public.vyaapari_companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='trn_batch')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='vyaapari_divisions') THEN
    ALTER TABLE public.trn_batch
      ADD CONSTRAINT trn_batch_division_id_fkey
      FOREIGN KEY (division_id) REFERENCES public.vyaapari_divisions(id) ON UPDATE CASCADE ON DELETE RESTRICT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_trn_batch_company_id ON public.trn_batch (company_id);
CREATE INDEX IF NOT EXISTS idx_trn_batch_division_id ON public.trn_batch (division_id);
