-- Final comprehensive deletion of companies without tally-enabled divisions
-- Includes all transaction tables that reference divisions

DO $$
DECLARE
  _company_ids UUID[];
  _division_ids UUID[];
BEGIN
  -- Collect companies where no division is tally_enabled
  SELECT ARRAY_AGG(c.id) INTO _company_ids
  FROM companies c
  LEFT JOIN divisions d ON d.company_id = c.id AND d.tally_enabled = true
  WHERE d.id IS NULL;

  IF _company_ids IS NULL OR array_length(_company_ids,1) = 0 THEN
    RAISE NOTICE 'No non‑tally companies found.';
    RETURN;
  END IF;

  -- Get all division IDs for these companies
  SELECT ARRAY_AGG(d.id) INTO _division_ids
  FROM divisions d WHERE d.company_id = ANY(_company_ids);

  RAISE NOTICE 'Deleting data for % companies with % divisions', 
    array_length(_company_ids,1), COALESCE(array_length(_division_ids,1), 0);

  -- 1) Delete all transaction data that references divisions
  DELETE FROM trn_batch WHERE division_id = ANY(_division_ids);
  DELETE FROM trn_bank WHERE division_id = ANY(_division_ids);
  DELETE FROM trn_bill WHERE division_id = ANY(_division_ids);
  DELETE FROM trn_attendance WHERE division_id = ANY(_division_ids);
  DELETE FROM trn_category_allocation WHERE division_id = ANY(_division_ids);
  DELETE FROM trn_closingstock_ledger WHERE division_id = ANY(_division_ids);
  DELETE FROM trn_cost_category_centre WHERE division_id = ANY(_division_ids);
  DELETE FROM trn_cost_centre WHERE division_id = ANY(_division_ids);
  DELETE FROM trn_cost_inventory_category_centre WHERE division_id = ANY(_division_ids);
  DELETE FROM trn_due_date WHERE division_id = ANY(_division_ids);
  DELETE FROM trn_employee WHERE division_id = ANY(_division_ids);
  DELETE FROM trn_gst_details WHERE division_id = ANY(_division_ids);
  DELETE FROM trn_payhead WHERE division_id = ANY(_division_ids);
  DELETE FROM trn_party_details WHERE division_id = ANY(_division_ids);
  DELETE FROM trn_reference WHERE division_id = ANY(_division_ids);
  DELETE FROM trn_shipping_details WHERE division_id = ANY(_division_ids);
  DELETE FROM trn_tax_details WHERE division_id = ANY(_division_ids);
  
  -- Handle tables with string division_id
  DELETE FROM trn_inventory WHERE division_id IN (SELECT id::text FROM divisions WHERE id = ANY(_division_ids));
  DELETE FROM trn_inventory_accounting WHERE division_id IN (SELECT id::text FROM divisions WHERE id = ANY(_division_ids));
  
  -- Handle UUID division_id tables
  DELETE FROM trn_accounting WHERE division_id = ANY(_division_ids) OR company_id = ANY(_company_ids);
  DELETE FROM trn_address_details WHERE division_id = ANY(_division_ids) OR company_id = ANY(_company_ids);
  DELETE FROM tally_trn_voucher WHERE division_id = ANY(_division_ids) OR company_id = ANY(_company_ids);

  -- 2) Delete all master data
  DELETE FROM mst_ledger WHERE division_id = ANY(_division_ids) OR company_id = ANY(_company_ids);
  DELETE FROM mst_group WHERE division_id = ANY(_division_ids) OR company_id = ANY(_company_ids);
  DELETE FROM mst_godown WHERE division_id = ANY(_division_ids) OR company_id = ANY(_company_ids);
  DELETE FROM mst_stock_item WHERE division_id = ANY(_division_ids) OR company_id = ANY(_company_ids);
  DELETE FROM mst_stock_group WHERE division_id = ANY(_division_ids) OR company_id = ANY(_company_ids);
  DELETE FROM mst_uom WHERE division_id = ANY(_division_ids) OR company_id = ANY(_company_ids);
  DELETE FROM mst_payhead WHERE division_id = ANY(_division_ids) OR company_id = ANY(_company_ids);
  DELETE FROM mst_cost_category WHERE division_id = ANY(_division_ids) OR company_id = ANY(_company_ids);
  DELETE FROM mst_cost_centre WHERE division_id = ANY(_division_ids) OR company_id = ANY(_company_ids);
  DELETE FROM mst_employee WHERE division_id = ANY(_division_ids) OR company_id = ANY(_company_ids);
  DELETE FROM mst_opening_batch_allocation WHERE division_id = ANY(_division_ids) OR company_id = ANY(_company_ids);
  DELETE FROM mst_opening_bill_allocation WHERE division_id = ANY(_division_ids) OR company_id = ANY(_company_ids);
  DELETE FROM mst_attendance_type WHERE division_id = ANY(_division_ids) OR company_id = ANY(_company_ids);
  DELETE FROM mst_gst_effective_rate WHERE division_id = ANY(_division_ids) OR company_id = ANY(_company_ids);
  DELETE FROM mst_stockitem_standard_cost WHERE division_id = ANY(_division_ids) OR company_id = ANY(_company_ids);
  DELETE FROM mst_stockitem_standard_price WHERE division_id = ANY(_division_ids) OR company_id = ANY(_company_ids);
  DELETE FROM mst_vouchertype WHERE division_id = ANY(_division_ids) OR company_id = ANY(_company_ids);

  DELETE FROM tally_mst_ledger WHERE division_id = ANY(_division_ids) OR company_id = ANY(_company_ids);
  DELETE FROM tally_mst_group WHERE division_id = ANY(_division_ids) OR company_id = ANY(_company_ids);
  DELETE FROM tally_mst_stock_item WHERE division_id = ANY(_division_ids) OR company_id = ANY(_company_ids);

  -- 3) Tally sync data
  DELETE FROM tally_sync_job_details d WHERE d.job_id IN (
    SELECT j.id FROM tally_sync_jobs j
    WHERE j.company_id = ANY(_company_ids) OR j.division_id = ANY(_division_ids)
  );
  DELETE FROM tally_sync_jobs WHERE company_id = ANY(_company_ids) OR division_id = ANY(_division_ids);

  -- 4) Workspaces & memberships
  DELETE FROM workspace_members WHERE workspace_id IN (
    SELECT w.id FROM workspaces w WHERE w.division_id = ANY(_division_ids)
  );
  DELETE FROM workspaces WHERE division_id = ANY(_division_ids);

  -- 5) Roles & profiles cleanup
  DELETE FROM user_roles WHERE company_id = ANY(_company_ids) OR division_id = ANY(_division_ids);
  UPDATE profiles SET company_id = NULL, division_id = NULL 
  WHERE company_id = ANY(_company_ids) OR division_id = ANY(_division_ids);

  -- 6) Finally remove divisions then companies
  DELETE FROM divisions WHERE company_id = ANY(_company_ids);
  DELETE FROM companies WHERE id = ANY(_company_ids);

  RAISE NOTICE 'Deletion complete for % non‑tally companies.', array_length(_company_ids,1);
END $$;