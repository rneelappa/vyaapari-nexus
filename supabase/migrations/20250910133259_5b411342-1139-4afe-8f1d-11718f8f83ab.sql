-- Create Tally workspace for SKM Impex Chennai with correct schema

-- Grant permissions to authenticated role for workspaces
GRANT ALL ON TABLE public.workspaces TO authenticated;
GRANT ALL ON TABLE public.workspace_members TO authenticated;

-- Create a Tally workspace for SKM Impex Chennai division if it doesn't exist
INSERT INTO public.workspaces (
  id,
  company_id,
  division_id,
  name, 
  description,
  is_default,
  created_at,
  updated_at,
  created_by
) 
SELECT 
  gen_random_uuid(),
  '629f49fb-983e-4141-8c48-e1423b39e921', -- SKM Steels company ID
  '37f3cc0c-58ad-4baf-b309-360116ffc3cd', -- SKM Impex Chennai division ID
  'Tally ERP Integration',
  'Tally ERP data integration and management workspace for SKM Impex Chennai',
  true,
  now(),
  now(),
  'bc37c1ea-1ec4-416a-ab7b-e324ed9ca41e' -- Current user ID from network logs
WHERE NOT EXISTS (
  SELECT 1 FROM public.workspaces 
  WHERE division_id = '37f3cc0c-58ad-4baf-b309-360116ffc3cd' 
  AND name = 'Tally ERP Integration'
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
AND w.name = 'Tally ERP Integration'
AND NOT EXISTS (
  SELECT 1 FROM public.workspace_members wm 
  WHERE wm.workspace_id = w.id 
  AND wm.user_id = 'bc37c1ea-1ec4-416a-ab7b-e324ed9ca41e'
);