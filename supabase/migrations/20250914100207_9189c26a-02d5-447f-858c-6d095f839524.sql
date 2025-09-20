-- Enable RLS and add policies for voucher_views and voucher_type_views
-- Policies restrict access to users who have access to the company/division via get_user_company_access

-- voucher_views
ALTER TABLE IF EXISTS public.voucher_views ENABLE ROW LEVEL SECURITY;

-- SELECT policy: allow users to read views for their company/division OR global (both null)
CREATE POLICY IF NOT EXISTS "Users can view voucher views in scope or global" 
ON public.voucher_views
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.get_user_company_access(auth.uid()) a
      WHERE a.company_id = voucher_views.company_id AND a.division_id = voucher_views.division_id
    )
    OR (voucher_views.company_id IS NULL AND voucher_views.division_id IS NULL)
  )
);

-- INSERT policy: allow users to create views for company/division they have access to
CREATE POLICY IF NOT EXISTS "Users can insert voucher views in their scope" 
ON public.voucher_views
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.get_user_company_access(auth.uid()) a
    WHERE a.company_id = voucher_views.company_id AND a.division_id = voucher_views.division_id
  )
);

-- UPDATE policy: restrict updates within scope
CREATE POLICY IF NOT EXISTS "Users can update voucher views in their scope" 
ON public.voucher_views
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.get_user_company_access(auth.uid()) a
    WHERE a.company_id = voucher_views.company_id AND a.division_id = voucher_views.division_id
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.get_user_company_access(auth.uid()) a
    WHERE a.company_id = voucher_views.company_id AND a.division_id = voucher_views.division_id
  )
);

-- DELETE policy: restrict deletes within scope
CREATE POLICY IF NOT EXISTS "Users can delete voucher views in their scope" 
ON public.voucher_views
FOR DELETE
USING (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.get_user_company_access(auth.uid()) a
    WHERE a.company_id = voucher_views.company_id AND a.division_id = voucher_views.division_id
  )
);


-- voucher_type_views
ALTER TABLE IF EXISTS public.voucher_type_views ENABLE ROW LEVEL SECURITY;

-- SELECT policy
CREATE POLICY IF NOT EXISTS "Users can view voucher_type_views in scope or global" 
ON public.voucher_type_views
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.get_user_company_access(auth.uid()) a
      WHERE a.company_id = voucher_type_views.company_id AND a.division_id = voucher_type_views.division_id
    )
    OR (voucher_type_views.company_id IS NULL AND voucher_type_views.division_id IS NULL)
  )
);

-- INSERT policy
CREATE POLICY IF NOT EXISTS "Users can insert voucher_type_views in their scope" 
ON public.voucher_type_views
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.get_user_company_access(auth.uid()) a
    WHERE a.company_id = voucher_type_views.company_id AND a.division_id = voucher_type_views.division_id
  )
);

-- UPDATE policy
CREATE POLICY IF NOT EXISTS "Users can update voucher_type_views in their scope" 
ON public.voucher_type_views
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.get_user_company_access(auth.uid()) a
    WHERE a.company_id = voucher_type_views.company_id AND a.division_id = voucher_type_views.division_id
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.get_user_company_access(auth.uid()) a
    WHERE a.company_id = voucher_type_views.company_id AND a.division_id = voucher_type_views.division_id
  )
);

-- DELETE policy
CREATE POLICY IF NOT EXISTS "Users can delete voucher_type_views in their scope" 
ON public.voucher_type_views
FOR DELETE
USING (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.get_user_company_access(auth.uid()) a
    WHERE a.company_id = voucher_type_views.company_id AND a.division_id = voucher_type_views.division_id
  )
);
