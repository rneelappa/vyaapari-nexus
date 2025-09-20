-- Fix voucher views creation issues - Final

-- 1) Ensure RLS is enabled and grant table privileges
ALTER TABLE public.voucher_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voucher_type_views ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.voucher_views TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.voucher_type_views TO authenticated;

-- 2) Recreate policies with super_admin bypass and scoped access
-- Drop any previous policies we may have attempted
DROP POLICY IF EXISTS "Super admins can manage all voucher views" ON public.voucher_views;
DROP POLICY IF EXISTS "Company admins can manage voucher views in their scope" ON public.voucher_views;
DROP POLICY IF EXISTS "Global voucher views visible" ON public.voucher_views;

DROP POLICY IF EXISTS "Super admins can manage all voucher type views" ON public.voucher_type_views;
DROP POLICY IF EXISTS "Company admins can manage voucher type views in their scope" ON public.voucher_type_views;
DROP POLICY IF EXISTS "Global voucher type views visible" ON public.voucher_type_views;

-- Voucher Views policies
CREATE POLICY "Super admins can manage all voucher views"
ON public.voucher_views
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Company admins can manage voucher views in their scope"
ON public.voucher_views
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.company_id = voucher_views.company_id
      AND ur.division_id = voucher_views.division_id
      AND ur.role IN ('company_admin', 'division_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.company_id = voucher_views.company_id
      AND ur.division_id = voucher_views.division_id
      AND ur.role IN ('company_admin', 'division_admin')
  )
);

-- Optional global SELECT for default views
CREATE POLICY "Global voucher views visible"
ON public.voucher_views
FOR SELECT
TO authenticated
USING (company_id IS NULL AND division_id IS NULL);

-- Voucher Type Views policies
CREATE POLICY "Super admins can manage all voucher type views"
ON public.voucher_type_views
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Company admins can manage voucher type views in their scope"
ON public.voucher_type_views
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.company_id = voucher_type_views.company_id
      AND ur.division_id = voucher_type_views.division_id
      AND ur.role IN ('company_admin', 'division_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.company_id = voucher_type_views.company_id
      AND ur.division_id = voucher_type_views.division_id
      AND ur.role IN ('company_admin', 'division_admin')
  )
);

CREATE POLICY "Global voucher type views visible"
ON public.voucher_type_views
FOR SELECT
TO authenticated
USING (company_id IS NULL AND division_id IS NULL);

-- 3) Insert scoped role for the known user, without requiring a unique constraint
INSERT INTO public.user_roles (user_id, role, company_id, division_id)
SELECT 
  'bc37c1ea-1ec4-416a-ab7b-e324ed9ca41e'::uuid,
  'company_admin'::app_role,
  '629f49fb-983e-4141-8c48-e1423b39e921'::uuid,
  '37f3cc0c-58ad-4baf-b309-360116ffc3cd'::uuid
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = 'bc37c1ea-1ec4-416a-ab7b-e324ed9ca41e'::uuid
    AND ur.role = 'company_admin'::app_role
    AND ur.company_id = '629f49fb-983e-4141-8c48-e1423b39e921'::uuid
    AND ur.division_id = '37f3cc0c-58ad-4baf-b309-360116ffc3cd'::uuid
);
