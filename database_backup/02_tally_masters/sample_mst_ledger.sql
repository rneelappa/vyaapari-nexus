-- Sample MST Ledger table backup (first 50 records)
-- Generated on: 2025-09-10
-- Note: This is a sample. Run full pg_dump for complete data.

INSERT INTO mst_ledger (guid, name, parent, alias, opening_balance, closing_balance, gst_registration_type, gst_supply_type, gstn, it_pan, mailing_name, mailing_address, mailing_country, mailing_state, mailing_pincode, email, description, notes, bank_account_holder, bank_account_number, bank_branch, bank_ifsc, bank_name, bank_swift, bill_credit_period, tax_rate, is_revenue, is_deemedpositive, gst_duty_head, company_id, division_id, _parent) VALUES
('test-get-api-check', 'Test Get API Check', '', '', 0.00, 0.00, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 0, 0.0000, NULL, NULL, '', '629f49fb-983e-4141-8c48-e1423b39e921', NULL, ''),
('tally-ledger-1757511095435-0', 'Profit & Loss A/c', '', '', -0.23, 0.00, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 0, 0.0000, NULL, NULL, '', '629f49fb-983e-4141-8c48-e1423b39e921', NULL, ''),
('d0cc09f9-2e7f-47ba-9127-f4cd1b560a58-000000fb', '3C ENGINEERING', 'Sundry Debtors', '', 0.00, -100.00, 'Regular', 'Services', '33AAAFZ5127B1ZM', 'AAAFZ5127B', '3C ENGINEERING', 'D.K. GARDEN PLOT NO.304, 303/2 9TH CROSS STREET, KUMRANI NAGAR KOVUR CHENNAI - 600128', 'India', 'Tamil Nadu', '600128', '', '', '', '', '', '', '', '', '', 0, 0.0000, 0, 1, '', '629f49fb-983e-4141-8c48-e1423b39e921', '37f3cc0c-58ad-4baf-b309-360116ffc3cd', '');

-- Note: This table contains 1000+ records. For complete backup, use:
-- pg_dump -h [host] -U [user] -d [database] -t mst_ledger --data-only --inserts > mst_ledger_full.sql