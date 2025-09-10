-- Seed vouchertype 'Contra' if missing
INSERT INTO mst_vouchertype (guid, name, parent, numbering_method, is_deemedpositive, affects_stock)
SELECT gen_random_uuid()::text, 'Contra', 'Contra', 'Automatic', 0, 0
WHERE NOT EXISTS (
  SELECT 1 FROM mst_vouchertype WHERE name = 'Contra'
);

-- Notify PostgREST/clients to reload schema if required
NOTIFY pgrst, 'reload schema';

