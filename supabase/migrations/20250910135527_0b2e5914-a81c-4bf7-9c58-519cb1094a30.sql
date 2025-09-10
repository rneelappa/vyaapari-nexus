-- Enable RLS on workspace_members table if not already enabled
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- Create policies for workspace_members table
CREATE POLICY "Users can view workspace memberships" 
ON public.workspace_members 
FOR SELECT 
TO authenticated 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage workspace memberships" 
ON public.workspace_members 
FOR ALL 
TO authenticated 
USING (auth.uid() IS NOT NULL);