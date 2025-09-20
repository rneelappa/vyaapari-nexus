-- Voucher Views feature migration (idempotent)
-- 1) Create tables if not exist
create table if not exists public.voucher_views (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  company_id uuid references public.companies(id),
  division_id uuid references public.divisions(id),
  is_default boolean default false,
  view_config jsonb not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.voucher_type_views (
  id uuid primary key default gen_random_uuid(),
  voucher_type_name text not null,
  voucher_view_id uuid not null references public.voucher_views(id) on delete cascade,
  company_id uuid references public.companies(id),
  division_id uuid references public.divisions(id),
  created_at timestamptz not null default now(),
  unique (voucher_type_name, company_id, division_id)
);

-- 2) RLS enable (safe if already enabled)
alter table public.voucher_views enable row level security;
alter table public.voucher_type_views enable row level security;

-- 3) Policies (create only if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'voucher_views' AND policyname = 'Authenticated users can manage voucher views'
  ) THEN
    CREATE POLICY "Authenticated users can manage voucher views"
    ON public.voucher_views
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'voucher_type_views' AND policyname = 'Authenticated users can manage voucher type views'
  ) THEN
    CREATE POLICY "Authenticated users can manage voucher type views"
    ON public.voucher_type_views
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END$$;

-- 4) updated_at trigger for voucher_views (only if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_voucher_views_updated_at'
  ) THEN
    CREATE TRIGGER update_voucher_views_updated_at
    BEFORE UPDATE ON public.voucher_views
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

-- 5) Helpful indexes
create index if not exists idx_voucher_views_company_division on public.voucher_views(company_id, division_id);
create index if not exists idx_voucher_type_views_type on public.voucher_type_views(voucher_type_name);
create index if not exists idx_voucher_type_views_view on public.voucher_type_views(voucher_view_id);