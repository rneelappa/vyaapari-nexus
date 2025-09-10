-- Create a more permissive policy temporarily to debug the authentication issue
-- First, let's make companies table accessible to test
DROP POLICY IF EXISTS "Users can view companies they have access to" ON public.companies;

-- Create a temporary policy that allows authenticated users to see companies
CREATE POLICY "Authenticated users can view companies" 
ON public.companies 
FOR SELECT 
TO authenticated
USING (true);

-- Do the same for divisions and workspaces
DROP POLICY IF EXISTS "Users can view divisions they have access to" ON public.divisions;
CREATE POLICY "Authenticated users can view divisions" 
ON public.divisions 
FOR SELECT 
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can view workspaces they have access to" ON public.workspaces;
CREATE POLICY "Authenticated users can view workspaces" 
ON public.workspaces 
FOR SELECT 
TO authenticated
USING (true);