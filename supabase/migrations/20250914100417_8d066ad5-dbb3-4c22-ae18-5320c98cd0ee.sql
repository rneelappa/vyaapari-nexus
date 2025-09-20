-- Grant access to current user for SKM Steels company and SKM Impex Chennai division
-- This will allow them to create voucher views for this company/division

INSERT INTO public.user_roles (user_id, role, company_id, division_id)
SELECT 
  auth.uid(),
  'admin'::app_role,
  '629f49fb-983e-4141-8c48-e1423b39e921'::uuid,
  '37f3cc0c-58ad-4baf-b309-360116ffc3cd'::uuid
WHERE auth.uid() IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
      AND company_id = '629f49fb-983e-4141-8c48-e1423b39e921'
      AND division_id = '37f3cc0c-58ad-4baf-b309-360116ffc3cd'
  );