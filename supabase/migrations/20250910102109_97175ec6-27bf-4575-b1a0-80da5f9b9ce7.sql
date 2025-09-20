-- Drop all existing policies for companies, divisions, and workspaces
DROP POLICY IF EXISTS "Super admins can manage all companies" ON public.companies;
DROP POLICY IF EXISTS "Authenticated users can view companies" ON public.companies;
DROP POLICY IF EXISTS "Users can view companies they have access to" ON public.companies;

DROP POLICY IF EXISTS "Super admins can manage all divisions" ON public.divisions;
DROP POLICY IF EXISTS "Authenticated users can view divisions" ON public.divisions;
DROP POLICY IF EXISTS "Users can view divisions they have access to" ON public.divisions;

DROP POLICY IF EXISTS "Super admins can manage all workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Authenticated users can view workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Users can view workspaces they have access to" ON public.workspaces;

-- Create simple, working policies for authenticated users
CREATE POLICY "Allow authenticated users to view companies"
ON public.companies
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to view divisions"
ON public.divisions  
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to view workspaces"
ON public.workspaces
FOR SELECT
TO authenticated
USING (true);

-- Also allow super admins to manage everything
CREATE POLICY "Super admins can manage companies"
ON public.companies
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can manage divisions"
ON public.divisions
FOR ALL  
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can manage workspaces"
ON public.workspaces
FOR ALL
TO authenticated  
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));