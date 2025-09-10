-- Create Tally workspaces for all existing divisions
INSERT INTO public.workspaces (id, company_id, division_id, name, description, is_default)
SELECT 
  gen_random_uuid(),
  d.company_id,
  d.id,
  'Tally',
  'Tally ERP workspace with Masters, Transactions, Display & Utilities',
  true
FROM public.divisions d
WHERE NOT EXISTS (
  SELECT 1 FROM public.workspaces w 
  WHERE w.division_id = d.id AND w.name = 'Tally'
);

-- Create workspace structure table for hierarchical navigation
CREATE TABLE public.workspace_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.workspace_modules(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  path TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_expandable BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on workspace_modules
ALTER TABLE public.workspace_modules ENABLE ROW LEVEL SECURITY;

-- RLS Policy for workspace_modules
CREATE POLICY "Users can view modules in their workspaces" ON public.workspace_modules
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members 
      WHERE user_id = auth.uid()
    ) OR
    workspace_id IN (
      SELECT w.id FROM public.workspaces w
      WHERE w.company_id IN (
        SELECT company_id FROM public.get_user_company_access(auth.uid())
        WHERE company_id IS NOT NULL
      )
    )
  );

-- Insert Tally workspace main modules (top level)
INSERT INTO public.workspace_modules (workspace_id, parent_id, name, path, icon, sort_order, is_expandable)
SELECT 
  ws.id, 
  NULL::UUID, 
  'Masters', 
  '/masters', 
  'FolderOpen', 
  1, 
  true 
FROM public.workspaces ws WHERE ws.name = 'Tally'
UNION ALL
SELECT 
  ws.id, 
  NULL::UUID, 
  'Transactions', 
  '/transactions', 
  'FileText', 
  2, 
  true 
FROM public.workspaces ws WHERE ws.name = 'Tally'
UNION ALL
SELECT 
  ws.id, 
  NULL::UUID, 
  'Display', 
  '/display', 
  'Monitor', 
  3, 
  true 
FROM public.workspaces ws WHERE ws.name = 'Tally'
UNION ALL
SELECT 
  ws.id, 
  NULL::UUID, 
  'Utilities', 
  '/utilities', 
  'Settings', 
  4, 
  true 
FROM public.workspaces ws WHERE ws.name = 'Tally';