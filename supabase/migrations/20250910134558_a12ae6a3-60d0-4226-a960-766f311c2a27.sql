-- Enable RLS and create policies for workspaces table
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policy for workspaces (authenticated users can access)
CREATE POLICY "Authenticated users can access workspaces" ON public.workspaces FOR ALL TO authenticated USING (true);