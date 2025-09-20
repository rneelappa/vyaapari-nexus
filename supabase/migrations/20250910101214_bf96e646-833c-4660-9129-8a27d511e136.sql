-- Update RLS policies to allow super admins to access all data properly

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can view their company" ON public.companies;
DROP POLICY IF EXISTS "Users can view divisions in their company" ON public.divisions;
DROP POLICY IF EXISTS "Users can view workspaces they have access to" ON public.workspaces;

-- Create comprehensive policies for super admins
CREATE POLICY "Users can view companies they have access to" 
ON public.companies 
FOR SELECT 
USING (
  -- Super admins can see all companies
  has_role(auth.uid(), 'super_admin'::app_role) OR
  -- Regular users can see companies they have access to
  id IN (
    SELECT company_id FROM get_user_company_access(auth.uid()) 
    WHERE company_id IS NOT NULL
  )
);

CREATE POLICY "Users can view divisions they have access to" 
ON public.divisions 
FOR SELECT 
USING (
  -- Super admins can see all divisions
  has_role(auth.uid(), 'super_admin'::app_role) OR
  -- Regular users can see divisions in their companies
  company_id IN (
    SELECT company_id FROM get_user_company_access(auth.uid()) 
    WHERE company_id IS NOT NULL
  )
);

CREATE POLICY "Users can view workspaces they have access to" 
ON public.workspaces 
FOR SELECT 
USING (
  -- Super admins can see all workspaces
  has_role(auth.uid(), 'super_admin'::app_role) OR
  -- Regular users can see workspaces in their companies/divisions
  company_id IN (
    SELECT company_id FROM get_user_company_access(auth.uid()) 
    WHERE company_id IS NOT NULL
  ) OR
  id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid()
  )
);