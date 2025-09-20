-- Drop existing policy and recreate with proper permissions
DROP POLICY IF EXISTS "Authenticated users can access workspaces" ON public.workspaces;

-- Create comprehensive RLS policies for workspaces
CREATE POLICY "Authenticated users can view workspaces" 
ON public.workspaces 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can create workspaces" 
ON public.workspaces 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update workspaces" 
ON public.workspaces 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can delete workspaces" 
ON public.workspaces 
FOR DELETE 
TO authenticated 
USING (true);