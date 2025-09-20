-- Phase 1: Fix RLS Policy Conflicts (Fixed version)
-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can create workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can delete workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can update workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can view workspaces" ON workspaces;
DROP POLICY IF EXISTS "Workspace members can manage workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can view workspaces they belong to" ON workspaces;
DROP POLICY IF EXISTS "Authenticated users can view workspaces they belong to" ON workspaces;
DROP POLICY IF EXISTS "Authenticated users can create workspaces" ON workspaces;
DROP POLICY IF EXISTS "Workspace admins can update workspaces" ON workspaces;
DROP POLICY IF EXISTS "Workspace admins can delete workspaces" ON workspaces;

DROP POLICY IF EXISTS "Users can create workspace members" ON workspace_members;
DROP POLICY IF EXISTS "Users can delete workspace members" ON workspace_members;
DROP POLICY IF EXISTS "Users can update workspace members" ON workspace_members;
DROP POLICY IF EXISTS "Users can view workspace members" ON workspace_members;
DROP POLICY IF EXISTS "Workspace members can view other members" ON workspace_members;
DROP POLICY IF EXISTS "Users can view workspace members for their workspaces" ON workspace_members;
DROP POLICY IF EXISTS "Workspace admins can manage members" ON workspace_members;

-- Create simple policies for workspaces
CREATE POLICY "workspace_select_policy" 
ON workspaces FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "workspace_insert_policy" 
ON workspaces FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

CREATE POLICY "workspace_update_policy" 
ON workspaces FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND 
  id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "workspace_delete_policy" 
ON workspaces FOR DELETE 
USING (
  auth.uid() IS NOT NULL AND 
  id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create simple policies for workspace_members  
CREATE POLICY "workspace_members_select_policy" 
ON workspace_members FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  workspace_id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "workspace_members_all_policy" 
ON workspace_members FOR INSERT, UPDATE, DELETE
USING (
  auth.uid() IS NOT NULL AND 
  workspace_id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Fix master data table policies to be simple
DROP POLICY IF EXISTS "Users can delete groups" ON mst_group;
DROP POLICY IF EXISTS "Users can insert groups" ON mst_group;
DROP POLICY IF EXISTS "Users can read groups" ON mst_group;
DROP POLICY IF EXISTS "Users can update groups" ON mst_group;
DROP POLICY IF EXISTS "Authenticated users can access groups" ON mst_group;

CREATE POLICY "mst_group_all_policy" 
ON mst_group FOR ALL 
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can delete ledgers" ON mst_ledger;
DROP POLICY IF EXISTS "Users can insert ledgers" ON mst_ledger;
DROP POLICY IF EXISTS "Users can read ledgers" ON mst_ledger;
DROP POLICY IF EXISTS "Users can update ledgers" ON mst_ledger;
DROP POLICY IF EXISTS "Authenticated users can access ledgers" ON mst_ledger;

CREATE POLICY "mst_ledger_all_policy" 
ON mst_ledger FOR ALL 
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can delete stock items" ON mst_stock_item;
DROP POLICY IF EXISTS "Users can insert stock items" ON mst_stock_item;
DROP POLICY IF EXISTS "Users can read stock items" ON mst_stock_item;
DROP POLICY IF EXISTS "Users can update stock items" ON mst_stock_item;
DROP POLICY IF EXISTS "Authenticated users can access stock items" ON mst_stock_item;

CREATE POLICY "mst_stock_item_all_policy" 
ON mst_stock_item FOR ALL 
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can access cost centres" ON mst_cost_centre;
DROP POLICY IF EXISTS "Authenticated users can access cost centres" ON mst_cost_centre;

CREATE POLICY "mst_cost_centre_all_policy" 
ON mst_cost_centre FOR ALL 
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can access employees" ON mst_employee;
DROP POLICY IF EXISTS "Authenticated users can access employees" ON mst_employee;

CREATE POLICY "mst_employee_all_policy" 
ON mst_employee FOR ALL 
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can access godowns" ON mst_godown;
DROP POLICY IF EXISTS "Authenticated users can access godowns" ON mst_godown;

CREATE POLICY "mst_godown_all_policy" 
ON mst_godown FOR ALL 
USING (auth.uid() IS NOT NULL);