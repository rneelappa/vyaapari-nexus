-- Insert dummy data for transaction tables for testing

-- Insert dummy accounting transactions
INSERT INTO public.trn_accounting (guid, ledger, _ledger, amount, amount_forex, currency, company_id, division_id) VALUES
('acc-001', 'Cash', 'Cash', 50000.00, 50000.00, 'INR', (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('acc-002', 'Bank HDFC', 'Bank HDFC', -25000.00, -25000.00, 'INR', (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('acc-003', 'Sales Account', 'Sales Account', 75000.00, 75000.00, 'INR', (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('acc-004', 'Purchase Account', 'Purchase Account', -30000.00, -30000.00, 'INR', (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('acc-005', 'Electricity Expenses', 'Electricity Expenses', -5000.00, -5000.00, 'INR', (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1));

-- Insert dummy attendance records
INSERT INTO public.trn_attendance (guid, employee_name, _employee_name, attendancetype_name, _attendancetype_name, type_value, time_value, company_id, division_id) VALUES
('att-001', 'John Doe', 'John Doe', 'Present', 'Present', 1.0, 8.0, (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('att-002', 'Jane Smith', 'Jane Smith', 'Present', 'Present', 1.0, 8.0, (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('att-003', 'Mike Johnson', 'Mike Johnson', 'Half Day', 'Half Day', 0.5, 4.0, (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('att-004', 'Sarah Wilson', 'Sarah Wilson', 'Overtime', 'Overtime', 1.0, 10.0, (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('att-005', 'David Brown', 'David Brown', 'Leave', 'Leave', 0.0, 0.0, (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1));

-- Insert dummy bank transactions
INSERT INTO public.trn_bank (guid, ledger, _ledger, transaction_type, amount, instrument_number, instrument_date, bankers_date, bank_name, company_id, division_id) VALUES
('bank-001', 'HDFC Bank', 'HDFC Bank', 'Cheque', 25000.00, 'CHQ001234', '2024-01-15', '2024-01-16', 'HDFC Bank Ltd', (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('bank-002', 'ICICI Bank', 'ICICI Bank', 'NEFT', 50000.00, 'NEFT567890', '2024-01-20', '2024-01-20', 'ICICI Bank Ltd', (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('bank-003', 'SBI Account', 'SBI Account', 'RTGS', 100000.00, 'RTGS123456', '2024-01-25', '2024-01-25', 'State Bank of India', (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('bank-004', 'Axis Bank', 'Axis Bank', 'DD', 15000.00, 'DD789012', '2024-01-30', '2024-01-31', 'Axis Bank Ltd', (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('bank-005', 'Kotak Bank', 'Kotak Bank', 'UPI', 5000.00, 'UPI345678', '2024-02-01', '2024-02-01', 'Kotak Mahindra Bank', (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1));

-- Insert dummy batch records  
INSERT INTO public.trn_batch (guid, name, item, _item, godown, _godown, destination_godown, _destination_godown, quantity, amount, tracking_number, company_id, division_id) VALUES
('batch-001', 'Batch-A-001', 'Widget A', 'Widget A', 'Main Warehouse', 'Main Warehouse', 'Retail Store', 'Retail Store', 100.0, 15000.00, 'TRK001', (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('batch-002', 'Batch-B-002', 'Widget B', 'Widget B', 'Main Warehouse', 'Main Warehouse', 'Wholesale Store', 'Wholesale Store', 250.0, 37500.00, 'TRK002', (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('batch-003', 'Batch-C-003', 'Component C', 'Component C', 'Secondary Warehouse', 'Secondary Warehouse', 'Main Warehouse', 'Main Warehouse', 500.0, 25000.00, 'TRK003', (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('batch-004', 'Batch-D-004', 'Raw Material D', 'Raw Material D', 'Raw Material Store', 'Raw Material Store', 'Production Unit', 'Production Unit', 1000.0, 50000.00, 'TRK004', (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('batch-005', 'Batch-E-005', 'Finished Good E', 'Finished Good E', 'Production Unit', 'Production Unit', 'Finished Goods Store', 'Finished Goods Store', 75.0, 112500.00, 'TRK005', (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1));

-- Insert dummy bill records
INSERT INTO public.trn_bill (guid, name, ledger, _ledger, billtype, amount, bill_credit_period, company_id, division_id) VALUES
('bill-001', 'INV-2024-001', 'ABC Suppliers', 'ABC Suppliers', 'New Ref', 25000.00, 30, (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('bill-002', 'INV-2024-002', 'XYZ Traders', 'XYZ Traders', 'On Account', 15000.00, 45, (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('bill-003', 'BILL-2024-003', 'DEF Services', 'DEF Services', 'Advance', 10000.00, 0, (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('bill-004', 'PO-2024-004', 'GHI Industries', 'GHI Industries', 'New Ref', 50000.00, 60, (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('bill-005', 'SERVICE-2024-005', 'JKL Consultants', 'JKL Consultants', 'On Account', 8000.00, 15, (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1));

-- Insert dummy cost centre transactions
INSERT INTO public.trn_cost_centre (guid, ledger, _ledger, costcentre, _costcentre, amount, company_id, division_id) VALUES
('cc-001', 'Salary Expenses', 'Salary Expenses', 'Admin Department', 'Admin Department', 150000.00, (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('cc-002', 'Marketing Expenses', 'Marketing Expenses', 'Marketing Department', 'Marketing Department', 75000.00, (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('cc-003', 'Production Expenses', 'Production Expenses', 'Production Department', 'Production Department', 200000.00, (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('cc-004', 'IT Expenses', 'IT Expenses', 'IT Department', 'IT Department', 50000.00, (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('cc-005', 'Travel Expenses', 'Travel Expenses', 'Sales Department', 'Sales Department', 25000.00, (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1));

-- Insert dummy cost category centre transactions
INSERT INTO public.trn_cost_category_centre (guid, ledger, _ledger, costcentre, _costcentre, costcategory, _costcategory, amount, company_id, division_id) VALUES
('ccc-001', 'Direct Labour', 'Direct Labour', 'Production Department', 'Production Department', 'Direct Cost', 'Direct Cost', 80000.00, (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('ccc-002', 'Indirect Labour', 'Indirect Labour', 'Production Department', 'Production Department', 'Indirect Cost', 'Indirect Cost', 40000.00, (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('ccc-003', 'Marketing Campaigns', 'Marketing Campaigns', 'Marketing Department', 'Marketing Department', 'Marketing Cost', 'Marketing Cost', 60000.00, (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('ccc-004', 'Office Supplies', 'Office Supplies', 'Admin Department', 'Admin Department', 'Administrative Cost', 'Administrative Cost', 15000.00, (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('ccc-005', 'Software Licenses', 'Software Licenses', 'IT Department', 'IT Department', 'Technology Cost', 'Technology Cost', 35000.00, (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1));

-- Insert dummy employee transactions
INSERT INTO public.trn_employee (guid, employee_name, _employee_name, category, _category, amount, employee_sort_order, company_id, division_id) VALUES
('emp-001', 'John Doe', 'John Doe', 'Basic Salary', 'Basic Salary', 45000.00, 1, (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('emp-002', 'Jane Smith', 'Jane Smith', 'Basic Salary', 'Basic Salary', 50000.00, 2, (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('emp-003', 'Mike Johnson', 'Mike Johnson', 'Overtime', 'Overtime', 8000.00, 3, (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('emp-004', 'Sarah Wilson', 'Sarah Wilson', 'Bonus', 'Bonus', 15000.00, 4, (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('emp-005', 'David Brown', 'David Brown', 'Allowance', 'Allowance', 5000.00, 5, (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1));

-- Insert dummy closing stock ledger records
INSERT INTO public.trn_closingstock_ledger (ledger, _ledger, stock_value, stock_date, company_id, division_id) VALUES
('Inventory - Widget A', 'Inventory - Widget A', 125000.00, '2024-01-31', (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('Inventory - Widget B', 'Inventory - Widget B', 187500.00, '2024-01-31', (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('Inventory - Component C', 'Inventory - Component C', 75000.00, '2024-01-31', (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('Inventory - Raw Material D', 'Inventory - Raw Material D', 250000.00, '2024-01-31', (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('Inventory - Finished Good E', 'Inventory - Finished Good E', 337500.00, '2024-01-31', (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1));

-- Insert dummy cost inventory category centre transactions
INSERT INTO public.trn_cost_inventory_category_centre (guid, ledger, _ledger, item, _item, costcentre, _costcentre, costcategory, _costcategory, amount, company_id, division_id) VALUES
('cicc-001', 'Raw Material Cost', 'Raw Material Cost', 'Widget A', 'Widget A', 'Production Department', 'Production Department', 'Direct Material', 'Direct Material', 45000.00, (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('cicc-002', 'Manufacturing Cost', 'Manufacturing Cost', 'Widget B', 'Widget B', 'Production Department', 'Production Department', 'Direct Labour', 'Direct Labour', 35000.00, (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('cicc-003', 'Overhead Cost', 'Overhead Cost', 'Component C', 'Component C', 'Production Department', 'Production Department', 'Manufacturing Overhead', 'Manufacturing Overhead', 12000.00, (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('cicc-004', 'Quality Control Cost', 'Quality Control Cost', 'Finished Good E', 'Finished Good E', 'Quality Department', 'Quality Department', 'Quality Assurance', 'Quality Assurance', 8000.00, (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1)),
('cicc-005', 'Packaging Cost', 'Packaging Cost', 'Widget A', 'Widget A', 'Packaging Department', 'Packaging Department', 'Packaging Material', 'Packaging Material', 5000.00, (SELECT id FROM companies LIMIT 1), (SELECT id FROM divisions LIMIT 1));