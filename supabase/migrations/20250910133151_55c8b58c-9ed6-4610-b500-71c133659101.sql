-- Fix workspaces table permissions and create Tally workspace for SKM Impex Chennai

-- First, ensure workspaces table has proper RLS enabled
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for workspaces
CREATE POLICY "Users can view workspaces they have access to" 
ON public.workspaces 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.workspace_members 
    WHERE workspace_members.workspace_id = workspaces.id 
    AND workspace_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create workspaces" 
ON public.workspaces 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update workspaces they have access to" 
ON public.workspaces 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.workspace_members 
    WHERE workspace_members.workspace_id = workspaces.id 
    AND workspace_members.user_id = auth.uid()
  )
);

-- Grant permissions to authenticated role
GRANT ALL ON TABLE public.workspaces TO authenticated;
GRANT ALL ON TABLE public.workspace_members TO authenticated;

-- Create a Tally workspace for SKM Impex Chennai division
INSERT INTO public.workspaces (
  id,
  name, 
  description,
  type,
  division_id,
  is_active
) VALUES (
  gen_random_uuid(),
  'Tally ERP Integration',
  'Tally ERP data integration and management workspace',
  'tally',
  '37f3cc0c-58ad-4baf-b309-360116ffc3cd', -- SKM Impex Chennai division ID
  true
) ON CONFLICT DO NOTHING;

-- Add current user as workspace member for the new Tally workspace
INSERT INTO public.workspace_members (
  workspace_id,
  user_id,
  role
) 
SELECT 
  w.id,
  auth.uid(),
  'admin'
FROM public.workspaces w 
WHERE w.division_id = '37f3cc0c-58ad-4baf-b309-360116ffc3cd' 
AND w.type = 'tally'
AND NOT EXISTS (
  SELECT 1 FROM public.workspace_members wm 
  WHERE wm.workspace_id = w.id AND wm.user_id = auth.uid()
);