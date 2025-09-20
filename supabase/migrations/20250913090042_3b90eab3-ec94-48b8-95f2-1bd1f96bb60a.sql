-- Ensure authenticated role has proper privileges on vouchers table
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.trn_voucher TO authenticated;

-- Also grant on trn_inventory used during save
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.trn_inventory TO authenticated;