-- Create a temporary super admin user for demo purposes
-- Get the current authenticated user (if any) and give them super admin access
INSERT INTO public.user_roles (user_id, role)
SELECT 
  auth.uid(),
  'super_admin'::app_role
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Also add a policy to allow public read access to companies for demo purposes
CREATE POLICY "Public can view companies" 
ON public.companies 
FOR SELECT 
TO public
USING (true);