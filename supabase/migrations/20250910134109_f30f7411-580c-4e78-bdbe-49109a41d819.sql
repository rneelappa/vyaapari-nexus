-- Enable RLS on remaining Tally tables
ALTER TABLE public.tally_mst_group ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tally_mst_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tally_mst_stock_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tally_trn_voucher ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for the remaining tables
CREATE POLICY "Authenticated users can access Tally data" ON public.tally_mst_group FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access Tally data" ON public.tally_mst_ledger FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access Tally data" ON public.tally_mst_stock_item FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access Tally data" ON public.tally_trn_voucher FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access config data" ON public.config FOR ALL TO authenticated USING (true);