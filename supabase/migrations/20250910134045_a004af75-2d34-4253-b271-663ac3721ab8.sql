-- Enable RLS on Tally master and transaction tables
ALTER TABLE public.mst_company ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mst_division ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mst_group ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mst_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mst_stock_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mst_cost_centre ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mst_cost_category ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mst_godown ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mst_employee ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mst_payhead ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mst_attendance_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mst_uom ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mst_vouchertype ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mst_stock_group ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mst_gst_effective_rate ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mst_opening_batch_allocation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mst_opening_bill_allocation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mst_stockitem_standard_cost ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mst_stockitem_standard_price ENABLE ROW LEVEL SECURITY;

-- Enable RLS on transaction tables
ALTER TABLE public.trn_voucher ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trn_accounting ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trn_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trn_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trn_batch ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trn_bill ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trn_cost_centre ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trn_cost_category_centre ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trn_cost_inventory_category_centre ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trn_employee ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trn_payhead ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trn_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trn_inventory_accounting ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trn_closingstock_ledger ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for Tally data (authenticated users only)
CREATE POLICY "Authenticated users can access Tally master data" ON public.mst_company FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access Tally master data" ON public.mst_division FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access Tally master data" ON public.mst_group FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access Tally master data" ON public.mst_ledger FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access Tally master data" ON public.mst_stock_item FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access Tally master data" ON public.mst_cost_centre FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access Tally master data" ON public.mst_cost_category FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access Tally master data" ON public.mst_godown FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access Tally master data" ON public.mst_employee FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access Tally master data" ON public.mst_payhead FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access Tally master data" ON public.mst_attendance_type FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access Tally master data" ON public.mst_uom FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access Tally master data" ON public.mst_vouchertype FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access Tally master data" ON public.mst_stock_group FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access Tally master data" ON public.mst_gst_effective_rate FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access Tally master data" ON public.mst_opening_batch_allocation FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access Tally master data" ON public.mst_opening_bill_allocation FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access Tally master data" ON public.mst_stockitem_standard_cost FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access Tally master data" ON public.mst_stockitem_standard_price FOR ALL TO authenticated USING (true);

-- Create basic RLS policies for Tally transaction data (authenticated users only)
CREATE POLICY "Authenticated users can access Tally transaction data" ON public.trn_voucher FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access Tally transaction data" ON public.trn_accounting FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access Tally transaction data" ON public.trn_inventory FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access Tally transaction data" ON public.trn_bank FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access Tally transaction data" ON public.trn_batch FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access Tally transaction data" ON public.trn_bill FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access Tally transaction data" ON public.trn_cost_centre FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access Tally transaction data" ON public.trn_cost_category_centre FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access Tally transaction data" ON public.trn_cost_inventory_category_centre FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access Tally transaction data" ON public.trn_employee FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access Tally transaction data" ON public.trn_payhead FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access Tally transaction data" ON public.trn_attendance FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access Tally transaction data" ON public.trn_inventory_accounting FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access Tally transaction data" ON public.trn_closingstock_ledger FOR ALL TO authenticated USING (true);