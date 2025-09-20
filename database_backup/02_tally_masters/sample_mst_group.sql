-- Sample MST Group table backup (first 50 records)
-- Generated on: 2025-09-10
-- Note: This is a sample. Run full pg_dump for complete data.

INSERT INTO mst_group (guid, name, parent, primary_group, is_revenue, is_deemedpositive, is_reserved, affects_gross_profit, sort_position, company_id, division_id, _parent) VALUES
('d0cc09f9-2e7f-47ba-9127-f4cd1b560a58-000000cd', 'Administrative Expenses', 'Other Expenses', 'Other Expenses', 1, 1, 0, 0, 500, '629f49fb-983e-4141-8c48-e1423b39e921', '37f3cc0c-58ad-4baf-b309-360116ffc3cd', ''),
('d0cc09f9-2e7f-47ba-9127-f4cd1b560a58-00000016', 'Bank Accounts', 'Current Assets', 'Bank Accounts', 0, 1, 1, 0, 220, '629f49fb-983e-4141-8c48-e1423b39e921', '37f3cc0c-58ad-4baf-b309-360116ffc3cd', ''),
('d0cc09f9-2e7f-47ba-9127-f4cd1b560a58-0000000b', 'Bank OD A/c', 'Loans (Liability)', 'Bank OD A/c', 0, 0, 1, 0, 110, '629f49fb-983e-4141-8c48-e1423b39e921', '37f3cc0c-58ad-4baf-b309-360116ffc3cd', ''),
('d0cc09f9-2e7f-47ba-9127-f4cd1b560a58-00000007', 'Branch / Divisions', '', 'Branch / Divisions', 0, 0, 1, 0, 70, '629f49fb-983e-4141-8c48-e1423b39e921', '37f3cc0c-58ad-4baf-b309-360116ffc3cd', ''),
('d0cc09f9-2e7f-47ba-9127-f4cd1b560a58-00000001', 'Capital Account', '', 'Capital Account', 0, 0, 1, 0, 10, '629f49fb-983e-4141-8c48-e1423b39e921', '37f3cc0c-58ad-4baf-b309-360116ffc3cd', '');

-- Note: This table contains 100+ records. For complete backup, use:
-- pg_dump -h [host] -U [user] -d [database] -t mst_group --data-only --inserts > mst_group_full.sql