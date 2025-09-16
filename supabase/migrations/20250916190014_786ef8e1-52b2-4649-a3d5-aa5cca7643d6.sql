-- Delete specific companies that are not tally enabled
-- Based on the analysis, these companies have no tally-enabled divisions:
-- Acme Corporation, SKM Steels, TechStart Inc

DO $$
BEGIN
    -- Delete companies and all their data that are not tally enabled
    -- We'll delete the specific company IDs that don't have tally-enabled divisions
    
    RAISE NOTICE 'Starting deletion of non-tally companies...';
    
    -- 1. Delete workspace members first
    DELETE FROM workspace_members 
    WHERE workspace_id IN (
        SELECT w.id 
        FROM workspaces w 
        JOIN divisions d ON w.division_id = d.id 
        WHERE d.company_id IN (
            '550e8400-e29b-41d4-a716-446655440000',  -- Acme Corporation
            'bc90d453-0c64-4f6f-8bbe-dca32aba40d1',  -- SKM Steels
            '550e8400-e29b-41d4-a716-446655440001'   -- TechStart Inc
        )
    );
    
    -- 2. Delete workspaces
    DELETE FROM workspaces 
    WHERE division_id IN (
        SELECT d.id 
        FROM divisions d 
        WHERE d.company_id IN (
            '550e8400-e29b-41d4-a716-446655440000',
            'bc90d453-0c64-4f6f-8bbe-dca32aba40d1',
            '550e8400-e29b-41d4-a716-446655440001'
        )
    );
    
    -- 3. Delete user roles
    DELETE FROM user_roles 
    WHERE company_id IN (
        '550e8400-e29b-41d4-a716-446655440000',
        'bc90d453-0c64-4f6f-8bbe-dca32aba40d1',
        '550e8400-e29b-41d4-a716-446655440001'
    ) OR division_id IN (
        SELECT d.id 
        FROM divisions d 
        WHERE d.company_id IN (
            '550e8400-e29b-41d4-a716-446655440000',
            'bc90d453-0c64-4f6f-8bbe-dca32aba40d1',
            '550e8400-e29b-41d4-a716-446655440001'
        )
    );
    
    -- 4. Update profiles to remove references
    UPDATE profiles 
    SET company_id = NULL, division_id = NULL 
    WHERE company_id IN (
        '550e8400-e29b-41d4-a716-446655440000',
        'bc90d453-0c64-4f6f-8bbe-dca32aba40d1',
        '550e8400-e29b-41d4-a716-446655440001'
    ) OR division_id IN (
        SELECT d.id 
        FROM divisions d 
        WHERE d.company_id IN (
            '550e8400-e29b-41d4-a716-446655440000',
            'bc90d453-0c64-4f6f-8bbe-dca32aba40d1',
            '550e8400-e29b-41d4-a716-446655440001'
        )
    );
    
    -- 5. Delete divisions
    DELETE FROM divisions 
    WHERE company_id IN (
        '550e8400-e29b-41d4-a716-446655440000',
        'bc90d453-0c64-4f6f-8bbe-dca32aba40d1',
        '550e8400-e29b-41d4-a716-446655440001'
    );
    
    -- 6. Finally delete the companies
    DELETE FROM companies 
    WHERE id IN (
        '550e8400-e29b-41d4-a716-446655440000',
        'bc90d453-0c64-4f6f-8bbe-dca32aba40d1',
        '550e8400-e29b-41d4-a716-446655440001'
    );
    
    RAISE NOTICE 'Successfully deleted 3 non-tally companies and all their associated data';
    
END $$;