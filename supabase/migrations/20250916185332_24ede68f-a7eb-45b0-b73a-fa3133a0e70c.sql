-- Delete all companies and their data that are not tally enabled
-- This will clean up companies where no division has tally_enabled = true

DO $$
DECLARE
    non_tally_company_ids UUID[];
    company_record RECORD;
BEGIN
    -- First, identify companies that have NO tally-enabled divisions
    SELECT ARRAY_AGG(DISTINCT c.id) INTO non_tally_company_ids
    FROM companies c
    LEFT JOIN divisions d ON c.id = d.company_id AND d.tally_enabled = true
    WHERE d.id IS NULL;  -- No tally-enabled divisions found
    
    -- Log what we're about to delete
    RAISE NOTICE 'Found % companies without tally-enabled divisions to delete', array_length(non_tally_company_ids, 1);
    
    -- If no companies to delete, exit
    IF non_tally_company_ids IS NULL OR array_length(non_tally_company_ids, 1) = 0 THEN
        RAISE NOTICE 'No companies to delete - all companies have tally-enabled divisions';
        RETURN;
    END IF;
    
    -- Delete in proper order to respect foreign key constraints
    
    -- 1. Delete workspace members for workspaces in these companies
    DELETE FROM workspace_members 
    WHERE workspace_id IN (
        SELECT w.id 
        FROM workspaces w 
        JOIN divisions d ON w.division_id = d.id 
        WHERE d.company_id = ANY(non_tally_company_ids)
    );
    
    -- 2. Delete workspaces for divisions in these companies
    DELETE FROM workspaces 
    WHERE division_id IN (
        SELECT d.id 
        FROM divisions d 
        WHERE d.company_id = ANY(non_tally_company_ids)
    );
    
    -- 3. Delete user roles associated with these companies and their divisions
    DELETE FROM user_roles 
    WHERE company_id = ANY(non_tally_company_ids)
       OR division_id IN (
           SELECT d.id 
           FROM divisions d 
           WHERE d.company_id = ANY(non_tally_company_ids)
       );
    
    -- 4. Update profiles to remove company/division references
    UPDATE profiles 
    SET company_id = NULL, division_id = NULL 
    WHERE company_id = ANY(non_tally_company_ids)
       OR division_id IN (
           SELECT d.id 
           FROM divisions d 
           WHERE d.company_id = ANY(non_tally_company_ids)
       );
    
    -- 5. Delete divisions in these companies
    DELETE FROM divisions 
    WHERE company_id = ANY(non_tally_company_ids);
    
    -- 6. Finally, delete the companies themselves
    DELETE FROM companies 
    WHERE id = ANY(non_tally_company_ids);
    
    -- Log completion
    RAISE NOTICE 'Successfully deleted % companies and all their associated data', array_length(non_tally_company_ids, 1);
    
END $$;