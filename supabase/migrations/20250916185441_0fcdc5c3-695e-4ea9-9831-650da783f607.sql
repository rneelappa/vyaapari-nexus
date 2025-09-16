-- Delete all companies and their data that are not tally enabled
-- This will clean up companies where no division has tally_enabled = true
-- Including all tally transaction and master data

DO $$
DECLARE
    non_tally_company_ids UUID[];
    non_tally_division_ids UUID[];
    company_record RECORD;
BEGIN
    -- First, identify companies that have NO tally-enabled divisions
    SELECT ARRAY_AGG(DISTINCT c.id) INTO non_tally_company_ids
    FROM companies c
    LEFT JOIN divisions d ON c.id = d.company_id AND d.tally_enabled = true
    WHERE d.id IS NULL;  -- No tally-enabled divisions found
    
    -- Get all division IDs for these companies
    SELECT ARRAY_AGG(d.id) INTO non_tally_division_ids
    FROM divisions d
    WHERE d.company_id = ANY(non_tally_company_ids);
    
    -- Log what we're about to delete
    RAISE NOTICE 'Found % companies without tally-enabled divisions to delete', array_length(non_tally_company_ids, 1);
    RAISE NOTICE 'Found % divisions to delete', array_length(non_tally_division_ids, 1);
    
    -- If no companies to delete, exit
    IF non_tally_company_ids IS NULL OR array_length(non_tally_company_ids, 1) = 0 THEN
        RAISE NOTICE 'No companies to delete - all companies have tally-enabled divisions';
        RETURN;
    END IF;
    
    -- Delete in proper order to respect foreign key constraints
    
    -- 1. Delete all tally transaction data first
    DELETE FROM trn_accounting WHERE company_id = ANY(non_tally_company_ids) OR division_id = ANY(non_tally_division_ids);
    DELETE FROM trn_address_details WHERE company_id = ANY(non_tally_company_ids) OR division_id = ANY(non_tally_division_ids);
    DELETE FROM trn_batch WHERE company_id = ANY(non_tally_company_ids) OR division_id = ANY(non_tally_division_ids);
    DELETE FROM trn_bill_allocations WHERE company_id = ANY(non_tally_company_ids) OR division_id = ANY(non_tally_division_ids);
    DELETE FROM trn_cost_allocations WHERE company_id = ANY(non_tally_company_ids) OR division_id = ANY(non_tally_division_ids);
    DELETE FROM trn_inventory WHERE company_id = ANY(non_tally_company_ids) OR division_id = ANY(non_tally_division_ids);
    DELETE FROM tally_trn_voucher WHERE company_id = ANY(non_tally_company_ids) OR division_id = ANY(non_tally_division_ids);
    
    -- 2. Delete all tally master data
    DELETE FROM mst_attendance_type WHERE company_id = ANY(non_tally_company_ids) OR division_id = ANY(non_tally_division_ids);
    DELETE FROM mst_cost_category WHERE company_id = ANY(non_tally_company_ids) OR division_id = ANY(non_tally_division_ids);
    DELETE FROM mst_cost_centre WHERE company_id = ANY(non_tally_company_ids) OR division_id = ANY(non_tally_division_ids);
    DELETE FROM mst_employee WHERE company_id = ANY(non_tally_company_ids) OR division_id = ANY(non_tally_division_ids);
    DELETE FROM mst_godown WHERE company_id = ANY(non_tally_company_ids) OR division_id = ANY(non_tally_division_ids);
    DELETE FROM mst_group WHERE company_id = ANY(non_tally_company_ids) OR division_id = ANY(non_tally_division_ids);
    DELETE FROM mst_gst_effective_rate WHERE company_id = ANY(non_tally_company_ids) OR division_id = ANY(non_tally_division_ids);
    DELETE FROM mst_ledger WHERE company_id = ANY(non_tally_company_ids) OR division_id = ANY(non_tally_division_ids);
    DELETE FROM mst_opening_batch_allocation WHERE company_id = ANY(non_tally_company_ids) OR division_id = ANY(non_tally_division_ids);
    DELETE FROM mst_opening_bill_allocation WHERE company_id = ANY(non_tally_company_ids) OR division_id = ANY(non_tally_division_ids);
    DELETE FROM mst_payhead WHERE company_id = ANY(non_tally_company_ids) OR division_id = ANY(non_tally_division_ids);
    DELETE FROM mst_stock_group WHERE company_id = ANY(non_tally_company_ids) OR division_id = ANY(non_tally_division_ids);
    DELETE FROM mst_stock_item WHERE company_id = ANY(non_tally_company_ids) OR division_id = ANY(non_tally_division_ids);
    DELETE FROM mst_stockitem_standard_cost WHERE company_id = ANY(non_tally_company_ids) OR division_id = ANY(non_tally_division_ids);
    DELETE FROM mst_stockitem_standard_price WHERE company_id = ANY(non_tally_company_ids) OR division_id = ANY(non_tally_division_ids);
    DELETE FROM mst_uom WHERE company_id = ANY(non_tally_company_ids) OR division_id = ANY(non_tally_division_ids);
    DELETE FROM mst_vouchertype WHERE company_id = ANY(non_tally_company_ids) OR division_id = ANY(non_tally_division_ids);
    DELETE FROM tally_mst_group WHERE company_id = ANY(non_tally_company_ids) OR division_id = ANY(non_tally_division_ids);
    DELETE FROM tally_mst_ledger WHERE company_id = ANY(non_tally_company_ids) OR division_id = ANY(non_tally_division_ids);
    DELETE FROM tally_mst_stock_item WHERE company_id = ANY(non_tally_company_ids) OR division_id = ANY(non_tally_division_ids);
    
    -- 3. Delete workspace members for workspaces in these companies
    DELETE FROM workspace_members 
    WHERE workspace_id IN (
        SELECT w.id 
        FROM workspaces w 
        JOIN divisions d ON w.division_id = d.id 
        WHERE d.company_id = ANY(non_tally_company_ids)
    );
    
    -- 4. Delete workspaces for divisions in these companies
    DELETE FROM workspaces 
    WHERE division_id = ANY(non_tally_division_ids);
    
    -- 5. Delete user roles associated with these companies and their divisions
    DELETE FROM user_roles 
    WHERE company_id = ANY(non_tally_company_ids)
       OR division_id = ANY(non_tally_division_ids);
    
    -- 6. Update profiles to remove company/division references
    UPDATE profiles 
    SET company_id = NULL, division_id = NULL 
    WHERE company_id = ANY(non_tally_company_ids)
       OR division_id = ANY(non_tally_division_ids);
    
    -- 7. Delete divisions in these companies
    DELETE FROM divisions 
    WHERE company_id = ANY(non_tally_company_ids);
    
    -- 8. Finally, delete the companies themselves
    DELETE FROM companies 
    WHERE id = ANY(non_tally_company_ids);
    
    -- Log completion
    RAISE NOTICE 'Successfully deleted % companies and all their associated data', array_length(non_tally_company_ids, 1);
    
END $$;