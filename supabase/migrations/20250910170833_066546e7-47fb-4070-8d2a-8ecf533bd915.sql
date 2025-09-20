-- Fix RLS policies for Tally master tables
-- Drop existing policies and recreate them with proper authentication checks

-- Drop existing policies for mst_group
DROP POLICY IF EXISTS "Authenticated users can access Tally master data" ON public.mst_group;

-- Create new RLS policy for mst_group
CREATE POLICY "Allow authenticated users to access groups" 
ON public.mst_group 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Drop and recreate policies for other Tally master tables
DROP POLICY IF EXISTS "Authenticated users can access Tally master data" ON public.mst_ledger;
CREATE POLICY "Allow authenticated users to access ledgers" 
ON public.mst_ledger 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can access Tally master data" ON public.mst_stock_item;
CREATE POLICY "Allow authenticated users to access stock items" 
ON public.mst_stock_item 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can access Tally master data" ON public.mst_cost_centre;
CREATE POLICY "Allow authenticated users to access cost centres" 
ON public.mst_cost_centre 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can access Tally master data" ON public.mst_godown;
CREATE POLICY "Allow authenticated users to access godowns" 
ON public.mst_godown 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can access Tally master data" ON public.mst_employee;
CREATE POLICY "Allow authenticated users to access employees" 
ON public.mst_employee 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Fix workspaces table RLS as well
CREATE POLICY "Allow authenticated users to access workspaces" 
ON public.workspaces 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);