-- Add primary key and indexes to mst_group table for better performance and Table Editor support
ALTER TABLE public.mst_group ADD COLUMN IF NOT EXISTS id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_mst_group_company_id ON public.mst_group(company_id);
CREATE INDEX IF NOT EXISTS idx_mst_group_division_id ON public.mst_group(division_id);
CREATE INDEX IF NOT EXISTS idx_mst_group_name ON public.mst_group(name);
CREATE INDEX IF NOT EXISTS idx_mst_group_parent ON public.mst_group(parent);

-- Similarly improve mst_ledger table
ALTER TABLE public.mst_ledger ADD COLUMN IF NOT EXISTS id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY;
CREATE INDEX IF NOT EXISTS idx_mst_ledger_company_id ON public.mst_ledger(company_id);
CREATE INDEX IF NOT EXISTS idx_mst_ledger_division_id ON public.mst_ledger(division_id);
CREATE INDEX IF NOT EXISTS idx_mst_ledger_name ON public.mst_ledger(name);
CREATE INDEX IF NOT EXISTS idx_mst_ledger_parent ON public.mst_ledger(parent);