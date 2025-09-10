-- Add a unique constraint to user_roles for ON CONFLICT to work
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);

-- Create a policy to allow public read access to companies for demo purposes
CREATE POLICY "Public can view companies" 
ON public.companies 
FOR SELECT 
TO public
USING (true);

-- Also allow public read access to divisions for consistency
CREATE POLICY "Public can view divisions" 
ON public.divisions 
FOR SELECT 
TO public
USING (true);