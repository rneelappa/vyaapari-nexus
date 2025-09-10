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

-- Insert Tally workspace structure for each Tally workspace
WITH tally_workspaces AS (
  SELECT id FROM public.workspaces WHERE name = 'Tally'
)
INSERT INTO public.workspace_modules (workspace_id, parent_id, name, path, icon, sort_order, is_expandable)
SELECT ws.id, NULL, 'Masters', '/masters', 'FolderOpen', 1, true FROM tally_workspaces ws
UNION ALL
SELECT ws.id, NULL, 'Transactions', '/transactions', 'FileText', 2, true FROM tally_workspaces ws
UNION ALL  
SELECT ws.id, NULL, 'Display', '/display', 'Monitor', 3, true FROM tally_workspaces ws
UNION ALL
SELECT ws.id, NULL, 'Utilities', '/utilities', 'Settings', 4, true FROM tally_workspaces ws;

-- Insert Masters submenu items
WITH masters_modules AS (
  SELECT id, workspace_id FROM public.workspace_modules WHERE name = 'Masters'
)
INSERT INTO public.workspace_modules (workspace_id, parent_id, name, path, icon, sort_order, is_expandable)
SELECT mm.workspace_id, mm.id, 'Groups', '/masters/groups', 'Layers', 1, false FROM masters_modules mm
UNION ALL
SELECT mm.workspace_id, mm.id, 'Ledgers', '/masters/ledgers', 'Book', 2, false FROM masters_modules mm
UNION ALL
SELECT mm.workspace_id, mm.id, 'Stock Items', '/masters/stock-items', 'Package', 3, false FROM masters_modules mm
UNION ALL
SELECT mm.workspace_id, mm.id, 'Godowns', '/masters/godowns', 'Warehouse', 4, false FROM masters_modules mm
UNION ALL
SELECT mm.workspace_id, mm.id, 'Cost Centers', '/masters/cost-centers', 'Target', 5, false FROM masters_modules mm
UNION ALL
SELECT mm.workspace_id, mm.id, 'Voucher Types', '/masters/voucher-types', 'Receipt', 6, false FROM masters_modules mm;

-- Insert Transactions submenu items
WITH transactions_modules AS (
  SELECT id, workspace_id FROM public.workspace_modules WHERE name = 'Transactions'
)
INSERT INTO public.workspace_modules (workspace_id, parent_id, name, path, icon, sort_order, is_expandable)
SELECT tm.workspace_id, tm.id, 'Accounting', '/transactions/accounting', 'Calculator', 1, false FROM transactions_modules tm
UNION ALL
SELECT tm.workspace_id, tm.id, 'Non-Accounting', '/transactions/non-accounting', 'FileText', 2, false FROM transactions_modules tm
UNION ALL
SELECT tm.workspace_id, tm.id, 'Inventory', '/transactions/inventory', 'Package2', 3, false FROM transactions_modules tm;

-- Insert Display submenu items
WITH display_modules AS (
  SELECT id, workspace_id FROM public.workspace_modules WHERE name = 'Display'
)
INSERT INTO public.workspace_modules (workspace_id, parent_id, name, path, icon, sort_order, is_expandable)
SELECT dm.workspace_id, dm.id, 'DayBook', '/display/daybook', 'Calendar', 1, false FROM display_modules dm
UNION ALL
SELECT dm.workspace_id, dm.id, 'Statistics', '/display/statistics', 'BarChart3', 2, false FROM display_modules dm
UNION ALL
SELECT dm.workspace_id, dm.id, 'Financial Statements', '/display/financial-statements', 'FileBarChart', 3, false FROM display_modules dm
UNION ALL
SELECT dm.workspace_id, dm.id, 'Reports', '/display/reports', 'FileSearch', 4, false FROM display_modules dm;

-- Insert Utilities submenu items
WITH utilities_modules AS (
  SELECT id, workspace_id FROM public.workspace_modules WHERE name = 'Utilities'
)
INSERT INTO public.workspace_modules (workspace_id, parent_id, name, path, icon, sort_order, is_expandable)
SELECT um.workspace_id, um.id, 'Tally Configuration', '/utilities/configuration', 'Cog', 1, false FROM utilities_modules um;