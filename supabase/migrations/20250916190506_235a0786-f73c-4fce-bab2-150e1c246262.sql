-- Robust deletion of companies without tally-enabled divisions and their data
-- Uses join-based deletes to avoid type mismatches

DO $$
DECLARE
  _company_ids UUID[];
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

  RAISE NOTICE 'Deleting data for % companies', array_length(_company_ids,1);

  -- 1) Transactional tables (use joins to match by division/company)
  DELETE FROM trn_batch b USING divisions d
    WHERE b.division_id = d.id AND d.company_id = ANY(_company_ids);

  DELETE FROM trn_inventory i USING divisions d
    WHERE i.division_id = d.id::text AND d.company_id = ANY(_company_ids);

  DELETE FROM trn_inventory_accounting i USING divisions d
    WHERE i.division_id = d.id::text AND d.company_id = ANY(_company_ids);

  DELETE FROM trn_accounting a WHERE a.company_id = ANY(_company_ids)
     OR a.division_id IN (SELECT id FROM divisions WHERE company_id = ANY(_company_ids));

  DELETE FROM trn_address_details t WHERE t.company_id = ANY(_company_ids)
     OR t.division_id IN (SELECT id FROM divisions WHERE company_id = ANY(_company_ids));

  DELETE FROM tally_trn_voucher v WHERE v.company_id = ANY(_company_ids)
     OR v.division_id IN (SELECT id FROM divisions WHERE company_id = ANY(_company_ids));

  -- 2) Master data
  DELETE FROM mst_ledger m WHERE m.company_id = ANY(_company_ids)
     OR m.division_id IN (SELECT id FROM divisions WHERE company_id = ANY(_company_ids));
  DELETE FROM mst_group m WHERE m.company_id = ANY(_company_ids)
     OR m.division_id IN (SELECT id FROM divisions WHERE company_id = ANY(_company_ids));
  DELETE FROM mst_godown m WHERE m.company_id = ANY(_company_ids)
     OR m.division_id IN (SELECT id FROM divisions WHERE company_id = ANY(_company_ids));
  DELETE FROM mst_stock_item m WHERE m.company_id = ANY(_company_ids)
     OR m.division_id IN (SELECT id FROM divisions WHERE company_id = ANY(_company_ids));
  DELETE FROM mst_stock_group m WHERE m.company_id = ANY(_company_ids)
     OR m.division_id IN (SELECT id FROM divisions WHERE company_id = ANY(_company_ids));
  DELETE FROM mst_uom m WHERE m.company_id = ANY(_company_ids)
     OR m.division_id IN (SELECT id FROM divisions WHERE company_id = ANY(_company_ids));
  DELETE FROM mst_payhead m WHERE m.company_id = ANY(_company_ids)
     OR m.division_id IN (SELECT id FROM divisions WHERE company_id = ANY(_company_ids));
  DELETE FROM mst_cost_category m WHERE m.company_id = ANY(_company_ids)
     OR m.division_id IN (SELECT id FROM divisions WHERE company_id = ANY(_company_ids));
  DELETE FROM mst_cost_centre m WHERE m.company_id = ANY(_company_ids)
     OR m.division_id IN (SELECT id FROM divisions WHERE company_id = ANY(_company_ids));
  DELETE FROM mst_employee m WHERE m.company_id = ANY(_company_ids)
     OR m.division_id IN (SELECT id FROM divisions WHERE company_id = ANY(_company_ids));
  DELETE FROM mst_opening_batch_allocation m WHERE m.company_id = ANY(_company_ids)
     OR m.division_id IN (SELECT id FROM divisions WHERE company_id = ANY(_company_ids));
  DELETE FROM mst_opening_bill_allocation m WHERE m.company_id = ANY(_company_ids)
     OR m.division_id IN (SELECT id FROM divisions WHERE company_id = ANY(_company_ids));
  DELETE FROM mst_attendance_type m WHERE m.company_id = ANY(_company_ids)
     OR m.division_id IN (SELECT id FROM divisions WHERE company_id = ANY(_company_ids));
  DELETE FROM mst_gst_effective_rate m WHERE m.company_id = ANY(_company_ids)
     OR m.division_id IN (SELECT id FROM divisions WHERE company_id = ANY(_company_ids));
  DELETE FROM mst_stockitem_standard_cost m WHERE m.company_id = ANY(_company_ids)
     OR m.division_id IN (SELECT id FROM divisions WHERE company_id = ANY(_company_ids));
  DELETE FROM mst_stockitem_standard_price m WHERE m.company_id = ANY(_company_ids)
     OR m.division_id IN (SELECT id FROM divisions WHERE company_id = ANY(_company_ids));
  DELETE FROM mst_vouchertype m WHERE m.company_id = ANY(_company_ids)
     OR m.division_id IN (SELECT id FROM divisions WHERE company_id = ANY(_company_ids));

  DELETE FROM tally_mst_ledger m WHERE m.company_id = ANY(_company_ids)
     OR m.division_id IN (SELECT id FROM divisions WHERE company_id = ANY(_company_ids));
  DELETE FROM tally_mst_group m WHERE m.company_id = ANY(_company_ids)
     OR m.division_id IN (SELECT id FROM divisions WHERE company_id = ANY(_company_ids));
  DELETE FROM tally_mst_stock_item m WHERE m.company_id = ANY(_company_ids)
     OR m.division_id IN (SELECT id FROM divisions WHERE company_id = ANY(_company_ids));

  -- 3) Tally sync data
  DELETE FROM tally_sync_job_details d WHERE d.job_id IN (
    SELECT j.id FROM tally_sync_jobs j
    WHERE j.company_id = ANY(_company_ids)
       OR j.division_id IN (SELECT id FROM divisions WHERE company_id = ANY(_company_ids))
  );
  DELETE FROM tally_sync_jobs j
    WHERE j.company_id = ANY(_company_ids)
       OR j.division_id IN (SELECT id FROM divisions WHERE company_id = ANY(_company_ids));

  -- 4) Workspaces & memberships
  DELETE FROM workspace_members wm
   USING workspaces w, divisions d
   WHERE wm.workspace_id = w.id AND w.division_id = d.id AND d.company_id = ANY(_company_ids);

  DELETE FROM workspaces w USING divisions d
   WHERE w.division_id = d.id AND d.company_id = ANY(_company_ids);

  -- 5) Roles & profiles cleanup
  DELETE FROM user_roles ur
   WHERE ur.company_id = ANY(_company_ids)
      OR ur.division_id IN (SELECT id FROM divisions WHERE company_id = ANY(_company_ids));

  UPDATE profiles p
     SET company_id = NULL, division_id = NULL
   WHERE p.company_id = ANY(_company_ids)
      OR p.division_id IN (SELECT id FROM divisions WHERE company_id = ANY(_company_ids));

  -- 6) Finally remove divisions then companies
  DELETE FROM divisions d WHERE d.company_id = ANY(_company_ids);
  DELETE FROM companies c WHERE c.id = ANY(_company_ids);

  RAISE NOTICE 'Deletion complete for non‑tally companies.';
END $$;