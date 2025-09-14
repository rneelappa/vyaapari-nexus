-- Create helper function to check scoped access without triggering RLS on user_roles
CREATE OR REPLACE FUNCTION public.has_company_division_access(_user_id uuid, _company_id uuid, _division_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.company_id = _company_id
      AND ur.division_id = _division_id
      AND ur.role IN ('company_admin','division_admin')
  );
$$;

-- Recreate RLS policies on voucher_views to use the definer functions instead of direct table reads
ALTER TABLE public.voucher_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Select voucher views with role checks" ON public.voucher_views;
DROP POLICY IF EXISTS "Mutate voucher views with role checks - insert" ON public.voucher_views;
DROP POLICY IF EXISTS "Mutate voucher views with role checks - update" ON public.voucher_views;
DROP POLICY IF EXISTS "Mutate voucher views with role checks - delete" ON public.voucher_views;
DROP POLICY IF EXISTS "Super admins can manage all voucher views" ON public.voucher_views;
DROP POLICY IF EXISTS "Company admins can manage voucher views in their scope" ON public.voucher_views;
DROP POLICY IF EXISTS "Global voucher views visible" ON public.voucher_views;

-- SELECT: allow super_admin, scoped access, or global (null) views
CREATE POLICY "Select voucher views with role checks"
ON public.voucher_views
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin')
  OR public.has_company_division_access(auth.uid(), company_id, division_id)
  OR (company_id IS NULL AND division_id IS NULL)
);

-- INSERT: allow super_admin or scoped access only
CREATE POLICY "Mutate voucher views with role checks - insert"
ON public.voucher_views
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin')
  OR public.has_company_division_access(auth.uid(), company_id, division_id)
);

-- UPDATE: allow super_admin or scoped access only
CREATE POLICY "Mutate voucher views with role checks - update"
ON public.voucher_views
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin')
  OR public.has_company_division_access(auth.uid(), company_id, division_id)
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin')
  OR public.has_company_division_access(auth.uid(), company_id, division_id)
);

-- DELETE: allow super_admin or scoped access only
CREATE POLICY "Mutate voucher views with role checks - delete"
ON public.voucher_views
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin')
  OR public.has_company_division_access(auth.uid(), company_id, division_id)
);

-- Recreate RLS policies on voucher_type_views similarly
ALTER TABLE public.voucher_type_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Select voucher type views with role checks" ON public.voucher_type_views;
DROP POLICY IF EXISTS "Mutate voucher type views with role checks - insert" ON public.voucher_type_views;
DROP POLICY IF EXISTS "Mutate voucher type views with role checks - update" ON public.voucher_type_views;
DROP POLICY IF EXISTS "Mutate voucher type views with role checks - delete" ON public.voucher_type_views;
DROP POLICY IF EXISTS "Super admins can manage all voucher type views" ON public.voucher_type_views;
DROP POLICY IF EXISTS "Company admins can manage voucher type views in their scope" ON public.voucher_type_views;
DROP POLICY IF EXISTS "Global voucher type views visible" ON public.voucher_type_views;

-- SELECT: allow super_admin, scoped access, or global (null) views
CREATE POLICY "Select voucher type views with role checks"
ON public.voucher_type_views
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin')
  OR public.has_company_division_access(auth.uid(), company_id, division_id)
  OR (company_id IS NULL AND division_id IS NULL)
);

-- INSERT: allow super_admin or scoped access only
CREATE POLICY "Mutate voucher type views with role checks - insert"
ON public.voucher_type_views
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin')
  OR public.has_company_division_access(auth.uid(), company_id, division_id)
);

-- UPDATE: allow super_admin or scoped access only
CREATE POLICY "Mutate voucher type views with role checks - update"
ON public.voucher_type_views
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin')
  OR public.has_company_division_access(auth.uid(), company_id, division_id)
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin')
  OR public.has_company_division_access(auth.uid(), company_id, division_id)
);

-- DELETE: allow super_admin or scoped access only
CREATE POLICY "Mutate voucher type views with role checks - delete"
ON public.voucher_type_views
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin')
  OR public.has_company_division_access(auth.uid(), company_id, division_id)
);
