-- Phase 1: Fix RLS Policy Conflicts
-- Drop all conflicting policies on workspaces and workspace_members
DROP POLICY IF EXISTS "Users can create workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can delete workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can update workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can view workspaces" ON workspaces;
DROP POLICY IF EXISTS "Workspace members can manage workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can view workspaces they belong to" ON workspaces;

DROP POLICY IF EXISTS "Users can create workspace members" ON workspace_members;
DROP POLICY IF EXISTS "Users can delete workspace members" ON workspace_members;
DROP POLICY IF EXISTS "Users can update workspace members" ON workspace_members;
DROP POLICY IF EXISTS "Users can view workspace members" ON workspace_members;
DROP POLICY IF EXISTS "Workspace members can view other members" ON workspace_members;
DROP POLICY IF EXISTS "Users can view workspace members for their workspaces" ON workspace_members;

-- Create single, clear policies for workspaces
CREATE POLICY "Authenticated users can view workspaces they belong to" 
ON workspaces FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can create workspaces" 
ON workspaces FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

CREATE POLICY "Workspace admins can update workspaces" 
ON workspaces FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND 
  id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Workspace admins can delete workspaces" 
ON workspaces FOR DELETE 
USING (
  auth.uid() IS NOT NULL AND 
  id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create single, clear policies for workspace_members
CREATE POLICY "Users can view workspace members for their workspaces" 
ON workspace_members FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  workspace_id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Workspace admins can manage members" 
ON workspace_members FOR ALL 
USING (
  auth.uid() IS NOT NULL AND 
  workspace_id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Fix master data table policies to be simple and clear
DROP POLICY IF EXISTS "Users can delete groups" ON mst_group;
DROP POLICY IF EXISTS "Users can insert groups" ON mst_group;
DROP POLICY IF EXISTS "Users can read groups" ON mst_group;
DROP POLICY IF EXISTS "Users can update groups" ON mst_group;

CREATE POLICY "Authenticated users can access groups" 
ON mst_group FOR ALL 
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can delete ledgers" ON mst_ledger;
DROP POLICY IF EXISTS "Users can insert ledgers" ON mst_ledger;
DROP POLICY IF EXISTS "Users can read ledgers" ON mst_ledger;
DROP POLICY IF EXISTS "Users can update ledgers" ON mst_ledger;

CREATE POLICY "Authenticated users can access ledgers" 
ON mst_ledger FOR ALL 
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can delete stock items" ON mst_stock_item;
DROP POLICY IF EXISTS "Users can insert stock items" ON mst_stock_item;
DROP POLICY IF EXISTS "Users can read stock items" ON mst_stock_item;
DROP POLICY IF EXISTS "Users can update stock items" ON mst_stock_item;

CREATE POLICY "Authenticated users can access stock items" 
ON mst_stock_item FOR ALL 
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can access cost centres" ON mst_cost_centre;
CREATE POLICY "Authenticated users can access cost centres" 
ON mst_cost_centre FOR ALL 
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can access employees" ON mst_employee;
CREATE POLICY "Authenticated users can access employees" 
ON mst_employee FOR ALL 
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can access godowns" ON mst_godown;
CREATE POLICY "Authenticated users can access godowns" 
ON mst_godown FOR ALL 
USING (auth.uid() IS NOT NULL);