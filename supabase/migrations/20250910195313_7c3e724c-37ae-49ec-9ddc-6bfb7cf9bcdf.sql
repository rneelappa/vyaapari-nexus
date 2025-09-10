-- Fix RLS policies for mst_group and related Tally tables to prevent permission errors
-- The issue is that the current policy uses "true" which might not work with authenticated users

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Authenticated users can access Tally master data" ON public.mst_group;
DROP POLICY IF EXISTS "Allow authenticated users to access groups" ON public.mst_group;

-- Create proper RLS policies for mst_group table
CREATE POLICY "Users can read groups" 
ON public.mst_group 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert groups" 
ON public.mst_group 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update groups" 
ON public.mst_group 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete groups" 
ON public.mst_group 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Fix similar issues with other Tally tables that might have permission problems
-- Update mst_stock_item policies
DROP POLICY IF EXISTS "Allow authenticated users to access stock items" ON public.mst_stock_item;
DROP POLICY IF EXISTS "Authenticated users can access Tally master data" ON public.mst_stock_item;

CREATE POLICY "Users can read stock items" 
ON public.mst_stock_item 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert stock items" 
ON public.mst_stock_item 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update stock items" 
ON public.mst_stock_item 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete stock items" 
ON public.mst_stock_item 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Update mst_ledger policies
DROP POLICY IF EXISTS "Allow authenticated users to access ledgers" ON public.mst_ledger;
DROP POLICY IF EXISTS "Authenticated users can access Tally master data" ON public.mst_ledger;

CREATE POLICY "Users can read ledgers" 
ON public.mst_ledger 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert ledgers" 
ON public.mst_ledger 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update ledgers" 
ON public.mst_ledger 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete ledgers" 
ON public.mst_ledger 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Update other critical Tally tables
-- mst_cost_centre
DROP POLICY IF EXISTS "Allow authenticated users to access cost centres" ON public.mst_cost_centre;
DROP POLICY IF EXISTS "Authenticated users can access Tally master data" ON public.mst_cost_centre;

CREATE POLICY "Users can access cost centres" 
ON public.mst_cost_centre 
FOR ALL 
USING (auth.uid() IS NOT NULL) 
WITH CHECK (auth.uid() IS NOT NULL);

-- mst_employee
DROP POLICY IF EXISTS "Allow authenticated users to access employees" ON public.mst_employee;
DROP POLICY IF EXISTS "Authenticated users can access Tally master data" ON public.mst_employee;

CREATE POLICY "Users can access employees" 
ON public.mst_employee 
FOR ALL 
USING (auth.uid() IS NOT NULL) 
WITH CHECK (auth.uid() IS NOT NULL);

-- mst_godown
DROP POLICY IF EXISTS "Allow authenticated users to access godowns" ON public.mst_godown;
DROP POLICY IF EXISTS "Authenticated users can access Tally master data" ON public.mst_godown;

CREATE POLICY "Users can access godowns" 
ON public.mst_godown 
FOR ALL 
USING (auth.uid() IS NOT NULL) 
WITH CHECK (auth.uid() IS NOT NULL);