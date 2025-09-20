-- Fix RLS policies for all Tally master and transaction tables
-- Drop existing inconsistent policies and create unified ones

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "mst_group_all_policy" ON public.mst_group;
DROP POLICY IF EXISTS "mst_ledger_all_policy" ON public.mst_ledger;
DROP POLICY IF EXISTS "mst_cost_centre_all_policy" ON public.mst_cost_centre;
DROP POLICY IF EXISTS "mst_employee_all_policy" ON public.mst_employee;
DROP POLICY IF EXISTS "mst_godown_all_policy" ON public.mst_godown;
DROP POLICY IF EXISTS "mst_stock_item_all_policy" ON public.mst_stock_item;

-- Drop other Tally master table policies
DROP POLICY IF EXISTS "Authenticated users can access Tally master data" ON public.mst_attendance_type;
DROP POLICY IF EXISTS "Authenticated users can access Tally master data" ON public.mst_company;
DROP POLICY IF EXISTS "Authenticated users can access Tally master data" ON public.mst_cost_category;
DROP POLICY IF EXISTS "Authenticated users can access Tally master data" ON public.mst_division;
DROP POLICY IF EXISTS "Authenticated users can access Tally master data" ON public.mst_gst_effective_rate;
DROP POLICY IF EXISTS "Authenticated users can access Tally master data" ON public.mst_opening_batch_allocation;
DROP POLICY IF EXISTS "Authenticated users can access Tally master data" ON public.mst_opening_bill_allocation;
DROP POLICY IF EXISTS "Authenticated users can access Tally master data" ON public.mst_payhead;
DROP POLICY IF EXISTS "Authenticated users can access Tally master data" ON public.mst_stock_group;
DROP POLICY IF EXISTS "Authenticated users can access Tally master data" ON public.mst_uom;
DROP POLICY IF EXISTS "Authenticated users can access Tally master data" ON public.mst_vouchertype;

-- Drop transaction table policies
DROP POLICY IF EXISTS "Authenticated users can access Tally transaction data" ON public.trn_accounting;
DROP POLICY IF EXISTS "Authenticated users can access Tally transaction data" ON public.trn_attendance;
DROP POLICY IF EXISTS "Authenticated users can access Tally transaction data" ON public.trn_bank;
DROP POLICY IF EXISTS "Authenticated users can access Tally transaction data" ON public.trn_batch;
DROP POLICY IF EXISTS "Authenticated users can access Tally transaction data" ON public.trn_bill;
DROP POLICY IF EXISTS "Authenticated users can access Tally transaction data" ON public.trn_closingstock_ledger;
DROP POLICY IF EXISTS "Authenticated users can access Tally transaction data" ON public.trn_cost_category_centre;
DROP POLICY IF EXISTS "Authenticated users can access Tally transaction data" ON public.trn_cost_centre;
DROP POLICY IF EXISTS "Authenticated users can access Tally transaction data" ON public.trn_cost_inventory_category_centre;
DROP POLICY IF EXISTS "Authenticated users can access Tally transaction data" ON public.trn_employee;

-- Drop policies for tally_ prefixed tables
DROP POLICY IF EXISTS "Authenticated users can access Tally data" ON public.tally_mst_group;
DROP POLICY IF EXISTS "Authenticated users can access Tally data" ON public.tally_mst_ledger;
DROP POLICY IF EXISTS "Authenticated users can access Tally data" ON public.tally_mst_stock_item;
DROP POLICY IF EXISTS "Authenticated users can access Tally data" ON public.tally_trn_voucher;

-- Create unified policies for ALL Tally master tables
CREATE POLICY "Allow authenticated users full access" ON public.mst_group FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users full access" ON public.mst_ledger FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users full access" ON public.mst_cost_centre FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users full access" ON public.mst_employee FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users full access" ON public.mst_godown FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users full access" ON public.mst_stock_item FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users full access" ON public.mst_attendance_type FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users full access" ON public.mst_company FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users full access" ON public.mst_cost_category FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users full access" ON public.mst_division FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users full access" ON public.mst_gst_effective_rate FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users full access" ON public.mst_opening_batch_allocation FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users full access" ON public.mst_opening_bill_allocation FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users full access" ON public.mst_payhead FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users full access" ON public.mst_stock_group FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users full access" ON public.mst_uom FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users full access" ON public.mst_vouchertype FOR ALL USING (auth.uid() IS NOT NULL);

-- Create unified policies for ALL Tally transaction tables
CREATE POLICY "Allow authenticated users full access" ON public.trn_accounting FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users full access" ON public.trn_attendance FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users full access" ON public.trn_bank FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users full access" ON public.trn_batch FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users full access" ON public.trn_bill FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users full access" ON public.trn_closingstock_ledger FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users full access" ON public.trn_cost_category_centre FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users full access" ON public.trn_cost_centre FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users full access" ON public.trn_cost_inventory_category_centre FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users full access" ON public.trn_employee FOR ALL USING (auth.uid() IS NOT NULL);

-- Create unified policies for tally_ prefixed tables
CREATE POLICY "Allow authenticated users full access" ON public.tally_mst_group FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users full access" ON public.tally_mst_ledger FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users full access" ON public.tally_mst_stock_item FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users full access" ON public.tally_trn_voucher FOR ALL USING (auth.uid() IS NOT NULL);