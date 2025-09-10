-- Insert Masters submenu items
INSERT INTO public.workspace_modules (workspace_id, parent_id, name, path, icon, sort_order, is_expandable)
SELECT 
  mm.workspace_id, 
  mm.id, 
  'Groups', 
  '/masters/groups', 
  'Layers', 
  1, 
  false 
FROM public.workspace_modules mm WHERE mm.name = 'Masters'
UNION ALL
SELECT 
  mm.workspace_id, 
  mm.id, 
  'Ledgers', 
  '/masters/ledgers', 
  'Book', 
  2, 
  false 
FROM public.workspace_modules mm WHERE mm.name = 'Masters'
UNION ALL
SELECT 
  mm.workspace_id, 
  mm.id, 
  'Stock Items', 
  '/masters/stock-items', 
  'Package', 
  3, 
  false 
FROM public.workspace_modules mm WHERE mm.name = 'Masters'
UNION ALL
SELECT 
  mm.workspace_id, 
  mm.id, 
  'Godowns', 
  '/masters/godowns', 
  'Warehouse', 
  4, 
  false 
FROM public.workspace_modules mm WHERE mm.name = 'Masters'
UNION ALL
SELECT 
  mm.workspace_id, 
  mm.id, 
  'Cost Centers', 
  '/masters/cost-centers', 
  'Target', 
  5, 
  false 
FROM public.workspace_modules mm WHERE mm.name = 'Masters'
UNION ALL
SELECT 
  mm.workspace_id, 
  mm.id, 
  'Voucher Types', 
  '/masters/voucher-types', 
  'Receipt', 
  6, 
  false 
FROM public.workspace_modules mm WHERE mm.name = 'Masters';

-- Insert Transactions submenu items
INSERT INTO public.workspace_modules (workspace_id, parent_id, name, path, icon, sort_order, is_expandable)
SELECT 
  tm.workspace_id, 
  tm.id, 
  'Accounting', 
  '/transactions/accounting', 
  'Calculator', 
  1, 
  false 
FROM public.workspace_modules tm WHERE tm.name = 'Transactions'
UNION ALL
SELECT 
  tm.workspace_id, 
  tm.id, 
  'Non-Accounting', 
  '/transactions/non-accounting', 
  'FileText', 
  2, 
  false 
FROM public.workspace_modules tm WHERE tm.name = 'Transactions'
UNION ALL
SELECT 
  tm.workspace_id, 
  tm.id, 
  'Inventory', 
  '/transactions/inventory', 
  'Package2', 
  3, 
  false 
FROM public.workspace_modules tm WHERE tm.name = 'Transactions';

-- Insert Display submenu items
INSERT INTO public.workspace_modules (workspace_id, parent_id, name, path, icon, sort_order, is_expandable)
SELECT 
  dm.workspace_id, 
  dm.id, 
  'DayBook', 
  '/display/daybook', 
  'Calendar', 
  1, 
  false 
FROM public.workspace_modules dm WHERE dm.name = 'Display'
UNION ALL
SELECT 
  dm.workspace_id, 
  dm.id, 
  'Statistics', 
  '/display/statistics', 
  'BarChart3', 
  2, 
  false 
FROM public.workspace_modules dm WHERE dm.name = 'Display'
UNION ALL
SELECT 
  dm.workspace_id, 
  dm.id, 
  'Financial Statements', 
  '/display/financial-statements', 
  'FileBarChart', 
  3, 
  false 
FROM public.workspace_modules dm WHERE dm.name = 'Display'
UNION ALL
SELECT 
  dm.workspace_id, 
  dm.id, 
  'Reports', 
  '/display/reports', 
  'FileSearch', 
  4, 
  false 
FROM public.workspace_modules dm WHERE dm.name = 'Display';

-- Insert Utilities submenu items
INSERT INTO public.workspace_modules (workspace_id, parent_id, name, path, icon, sort_order, is_expandable)
SELECT 
  um.workspace_id, 
  um.id, 
  'Tally Configuration', 
  '/utilities/configuration', 
  'Cog', 
  1, 
  false 
FROM public.workspace_modules um WHERE um.name = 'Utilities';