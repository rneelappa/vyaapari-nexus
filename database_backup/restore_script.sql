-- Complete Database Restore Script
-- Run this after creating the schema with recreate_schema.sql

-- 1. Core application tables
\i 01_core_tables/companies.sql
\i 01_core_tables/divisions.sql  
\i 01_core_tables/profiles.sql
\i 01_core_tables/user_roles.sql
\i 01_core_tables/workspaces.sql
\i 01_core_tables/workspace_members.sql

-- 2. Sample Tally master data (replace with full backup files if needed)
\i 02_tally_masters/sample_mst_ledger.sql
\i 02_tally_masters/sample_mst_group.sql

-- 3. Update sequences (important for auto-increment columns)
-- Note: Adjust these based on your actual data
SELECT setval('profiles_id_seq', (SELECT MAX(id) FROM profiles));
SELECT setval('user_roles_id_seq', (SELECT MAX(id) FROM user_roles));

-- 4. Verify data
SELECT 'Companies: ' || count(*) FROM companies;
SELECT 'Divisions: ' || count(*) FROM divisions;
SELECT 'Profiles: ' || count(*) FROM profiles;
SELECT 'User Roles: ' || count(*) FROM user_roles;
SELECT 'Workspaces: ' || count(*) FROM workspaces;
SELECT 'Workspace Members: ' || count(*) FROM workspace_members;
SELECT 'Ledgers: ' || count(*) FROM mst_ledger;
SELECT 'Groups: ' || count(*) FROM mst_group;