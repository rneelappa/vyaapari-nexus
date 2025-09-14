-- Comprehensive update of ALL Tally data to associate with SKM Steels and SKM Impex Chennai
-- Company ID: 629f49fb-983e-4141-8c48-e1423b39e921 (SKM Steels)
-- Division ID: 37f3cc0c-58ad-4baf-b309-360116ffc3cd (SKM Impex Chennai)

-- Update ALL transaction vouchers
UPDATE tally_trn_voucher 
SET 
  company_id = '629f49fb-983e-4141-8c48-e1423b39e921',
  division_id = '37f3cc0c-58ad-4baf-b309-360116ffc3cd'
WHERE company_id IS NULL OR division_id IS NULL OR 
      company_id != '629f49fb-983e-4141-8c48-e1423b39e921' OR 
      division_id != '37f3cc0c-58ad-4baf-b309-360116ffc3cd';

-- Update ALL accounting entries
UPDATE trn_accounting 
SET 
  company_id = '629f49fb-983e-4141-8c48-e1423b39e921',
  division_id = '37f3cc0c-58ad-4baf-b309-360116ffc3cd'
WHERE company_id IS NULL OR division_id IS NULL OR 
      company_id != '629f49fb-983e-4141-8c48-e1423b39e921' OR 
      division_id != '37f3cc0c-58ad-4baf-b309-360116ffc3cd';

-- Update ALL address details
UPDATE trn_address_details 
SET 
  company_id = '629f49fb-983e-4141-8c48-e1423b39e921',
  division_id = '37f3cc0c-58ad-4baf-b309-360116ffc3cd'
WHERE company_id IS NULL OR division_id IS NULL OR 
      company_id != '629f49fb-983e-4141-8c48-e1423b39e921' OR 
      division_id != '37f3cc0c-58ad-4baf-b309-360116ffc3cd';

-- Update ALL master tables
UPDATE mst_group 
SET 
  company_id = '629f49fb-983e-4141-8c48-e1423b39e921',
  division_id = '37f3cc0c-58ad-4baf-b309-360116ffc3cd'
WHERE company_id IS NULL OR division_id IS NULL OR 
      company_id != '629f49fb-983e-4141-8c48-e1423b39e921' OR 
      division_id != '37f3cc0c-58ad-4baf-b309-360116ffc3cd';

UPDATE mst_ledger 
SET 
  company_id = '629f49fb-983e-4141-8c48-e1423b39e921',
  division_id = '37f3cc0c-58ad-4baf-b309-360116ffc3cd'
WHERE company_id IS NULL OR division_id IS NULL OR 
      company_id != '629f49fb-983e-4141-8c48-e1423b39e921' OR 
      division_id != '37f3cc0c-58ad-4baf-b309-360116ffc3cd';

UPDATE mst_stock_item 
SET 
  company_id = '629f49fb-983e-4141-8c48-e1423b39e921',
  division_id = '37f3cc0c-58ad-4baf-b309-360116ffc3cd'
WHERE company_id IS NULL OR division_id IS NULL OR 
      company_id != '629f49fb-983e-4141-8c48-e1423b39e921' OR 
      division_id != '37f3cc0c-58ad-4baf-b309-360116ffc3cd';

UPDATE mst_vouchertype 
SET 
  company_id = '629f49fb-983e-4141-8c48-e1423b39e921',
  division_id = '37f3cc0c-58ad-4baf-b309-360116ffc3cd'
WHERE company_id IS NULL OR division_id IS NULL OR 
      company_id != '629f49fb-983e-4141-8c48-e1423b39e921' OR 
      division_id != '37f3cc0c-58ad-4baf-b309-360116ffc3cd';

UPDATE mst_cost_centre 
SET 
  company_id = '629f49fb-983e-4141-8c48-e1423b39e921',
  division_id = '37f3cc0c-58ad-4baf-b309-360116ffc3cd'
WHERE company_id IS NULL OR division_id IS NULL OR 
      company_id != '629f49fb-983e-4141-8c48-e1423b39e921' OR 
      division_id != '37f3cc0c-58ad-4baf-b309-360116ffc3cd';

UPDATE mst_cost_category 
SET 
  company_id = '629f49fb-983e-4141-8c48-e1423b39e921',
  division_id = '37f3cc0c-58ad-4baf-b309-360116ffc3cd'
WHERE company_id IS NULL OR division_id IS NULL OR 
      company_id != '629f49fb-983e-4141-8c48-e1423b39e921' OR 
      division_id != '37f3cc0c-58ad-4baf-b309-360116ffc3cd';

UPDATE mst_employee 
SET 
  company_id = '629f49fb-983e-4141-8c48-e1423b39e921',
  division_id = '37f3cc0c-58ad-4baf-b309-360116ffc3cd'
WHERE company_id IS NULL OR division_id IS NULL OR 
      company_id != '629f49fb-983e-4141-8c48-e1423b39e921' OR 
      division_id != '37f3cc0c-58ad-4baf-b309-360116ffc3cd';

UPDATE mst_godown 
SET 
  company_id = '629f49fb-983e-4141-8c48-e1423b39e921',
  division_id = '37f3cc0c-58ad-4baf-b309-360116ffc3cd'
WHERE company_id IS NULL OR division_id IS NULL OR 
      company_id != '629f49fb-983e-4141-8c48-e1423b39e921' OR 
      division_id != '37f3cc0c-58ad-4baf-b309-360116ffc3cd';

UPDATE mst_payhead 
SET 
  company_id = '629f49fb-983e-4141-8c48-e1423b39e921',
  division_id = '37f3cc0c-58ad-4baf-b309-360116ffc3cd'
WHERE company_id IS NULL OR division_id IS NULL OR 
      company_id != '629f49fb-983e-4141-8c48-e1423b39e921' OR 
      division_id != '37f3cc0c-58ad-4baf-b309-360116ffc3cd';

UPDATE mst_uom 
SET 
  company_id = '629f49fb-983e-4141-8c48-e1423b39e921',
  division_id = '37f3cc0c-58ad-4baf-b309-360116ffc3cd'
WHERE company_id IS NULL OR division_id IS NULL OR 
      company_id != '629f49fb-983e-4141-8c48-e1423b39e921' OR 
      division_id != '37f3cc0c-58ad-4baf-b309-360116ffc3cd';

UPDATE mst_stock_group 
SET 
  company_id = '629f49fb-983e-4141-8c48-e1423b39e921',
  division_id = '37f3cc0c-58ad-4baf-b309-360116ffc3cd'
WHERE company_id IS NULL OR division_id IS NULL OR 
      company_id != '629f49fb-983e-4141-8c48-e1423b39e921' OR 
      division_id != '37f3cc0c-58ad-4baf-b309-360116ffc3cd';

UPDATE mst_attendance_type 
SET 
  company_id = '629f49fb-983e-4141-8c48-e1423b39e921',
  division_id = '37f3cc0c-58ad-4baf-b309-360116ffc3cd'
WHERE company_id IS NULL OR division_id IS NULL OR 
      company_id != '629f49fb-983e-4141-8c48-e1423b39e921' OR 
      division_id != '37f3cc0c-58ad-4baf-b309-360116ffc3cd';

-- Update additional master tables
UPDATE mst_gst_effective_rate 
SET 
  company_id = '629f49fb-983e-4141-8c48-e1423b39e921',
  division_id = '37f3cc0c-58ad-4baf-b309-360116ffc3cd'
WHERE company_id IS NULL OR division_id IS NULL OR 
      company_id != '629f49fb-983e-4141-8c48-e1423b39e921' OR 
      division_id != '37f3cc0c-58ad-4baf-b309-360116ffc3cd';

UPDATE mst_opening_batch_allocation 
SET 
  company_id = '629f49fb-983e-4141-8c48-e1423b39e921',
  division_id = '37f3cc0c-58ad-4baf-b309-360116ffc3cd'
WHERE company_id IS NULL OR division_id IS NULL OR 
      company_id != '629f49fb-983e-4141-8c48-e1423b39e921' OR 
      division_id != '37f3cc0c-58ad-4baf-b309-360116ffc3cd';

UPDATE mst_opening_bill_allocation 
SET 
  company_id = '629f49fb-983e-4141-8c48-e1423b39e921',
  division_id = '37f3cc0c-58ad-4baf-b309-360116ffc3cd'
WHERE company_id IS NULL OR division_id IS NULL OR 
      company_id != '629f49fb-983e-4141-8c48-e1423b39e921' OR 
      division_id != '37f3cc0c-58ad-4baf-b309-360116ffc3cd';

UPDATE mst_stockitem_standard_cost 
SET 
  company_id = '629f49fb-983e-4141-8c48-e1423b39e921',
  division_id = '37f3cc0c-58ad-4baf-b309-360116ffc3cd'
WHERE company_id IS NULL OR division_id IS NULL OR 
      company_id != '629f49fb-983e-4141-8c48-e1423b39e921' OR 
      division_id != '37f3cc0c-58ad-4baf-b309-360116ffc3cd';

UPDATE mst_stockitem_standard_price 
SET 
  company_id = '629f49fb-983e-4141-8c48-e1423b39e921',
  division_id = '37f3cc0c-58ad-4baf-b309-360116ffc3cd'
WHERE company_id IS NULL OR division_id IS NULL OR 
      company_id != '629f49fb-983e-4141-8c48-e1423b39e921' OR 
      division_id != '37f3cc0c-58ad-4baf-b309-360116ffc3cd';

-- Update prefixed tally tables
UPDATE tally_mst_group 
SET 
  company_id = '629f49fb-983e-4141-8c48-e1423b39e921',
  division_id = '37f3cc0c-58ad-4baf-b309-360116ffc3cd'
WHERE company_id IS NULL OR division_id IS NULL OR 
      company_id != '629f49fb-983e-4141-8c48-e1423b39e921' OR 
      division_id != '37f3cc0c-58ad-4baf-b309-360116ffc3cd';

UPDATE tally_mst_ledger 
SET 
  company_id = '629f49fb-983e-4141-8c48-e1423b39e921',
  division_id = '37f3cc0c-58ad-4baf-b309-360116ffc3cd'
WHERE company_id IS NULL OR division_id IS NULL OR 
      company_id != '629f49fb-983e-4141-8c48-e1423b39e921' OR 
      division_id != '37f3cc0c-58ad-4baf-b309-360116ffc3cd';

UPDATE tally_mst_stock_item 
SET 
  company_id = '629f49fb-983e-4141-8c48-e1423b39e921',
  division_id = '37f3cc0c-58ad-4baf-b309-360116ffc3cd'
WHERE company_id IS NULL OR division_id IS NULL OR 
      company_id != '629f49fb-983e-4141-8c48-e1423b39e921' OR 
      division_id != '37f3cc0c-58ad-4baf-b309-360116ffc3cd';