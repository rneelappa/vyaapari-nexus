-- Fix voucher views creation issues
-- 1. Grant table privileges to authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.voucher_views TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.voucher_type_views TO authenticated;

-- 2. Drop existing RLS policies for voucher_views
DROP POLICY IF EXISTS "Users can manage voucher views in their company/division" ON public.voucher_views;

-- 3. Create new RLS policies for voucher_views with super_admin bypass
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

-- 4. Drop existing RLS policies for voucher_type_views
DROP POLICY IF EXISTS "Users can manage voucher type views in their company/division" ON public.voucher_type_views;

-- 5. Create new RLS policies for voucher_type_views with super_admin bypass
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

-- 6. Add explicit user role for current user (using known user_id)
INSERT INTO public.user_roles (user_id, role, company_id, division_id)
VALUES (
  'bc37c1ea-1ec4-416a-ab7b-e324ed9ca41e'::uuid,
  'company_admin'::app_role,
  '629f49fb-983e-4141-8c48-e1423b39e921'::uuid,
  '37f3cc0c-58ad-4baf-b309-360116ffc3cd'::uuid
)
ON CONFLICT (user_id, role, company_id, division_id) DO NOTHING;