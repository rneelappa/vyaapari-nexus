-- Create Tally workspace for SKM Impex Chennai and fix permissions

-- Grant permissions to authenticated role for workspaces
GRANT ALL ON TABLE public.workspaces TO authenticated;
GRANT ALL ON TABLE public.workspace_members TO authenticated;

-- Create a Tally workspace for SKM Impex Chennai division if it doesn't exist
INSERT INTO public.workspaces (
  id,
  name, 
  description,
  type,
  division_id,
  is_active,
  created_at,
  updated_at
) 
SELECT 
  gen_random_uuid(),
  'Tally ERP Integration',
  'Tally ERP data integration and management workspace for SKM Impex Chennai',
  'tally',
  '37f3cc0c-58ad-4baf-b309-360116ffc3cd',
  true,
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.workspaces 
  WHERE division_id = '37f3cc0c-58ad-4baf-b309-360116ffc3cd' 
  AND type = 'tally'
);

-- Add workspace member relationship
INSERT INTO public.workspace_members (
  workspace_id,
  user_id,
  role,
  joined_at
)
SELECT 
  w.id,
  'bc37c1ea-1ec4-416a-ab7b-e324ed9ca41e', -- Current user ID from network logs
  'admin',
  now()
FROM public.workspaces w 
WHERE w.division_id = '37f3cc0c-58ad-4baf-b309-360116ffc3cd' 
AND w.type = 'tally'
AND NOT EXISTS (
  SELECT 1 FROM public.workspace_members wm 
  WHERE wm.workspace_id = w.id 
  AND wm.user_id = 'bc37c1ea-1ec4-416a-ab7b-e324ed9ca41e'
);