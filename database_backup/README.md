# Database Backup Files

This folder contains backup files for your Supabase database.

## Structure

### 01_core_tables/
Contains the main application tables:
- `companies.sql` - Company records
- `divisions.sql` - Division records  
- `profiles.sql` - User profile data
- `user_roles.sql` - User role assignments
- `workspaces.sql` - Workspace definitions
- `workspace_members.sql` - Workspace membership data

### 02_tally_masters/
Contains sample Tally ERP master data:
- `sample_mst_ledger.sql` - Sample ledger entries (first few records)
- `sample_mst_group.sql` - Sample group entries (first few records)

## For Complete Tally Data Backup

The Tally master tables contain thousands of records. For complete backup, use pg_dump:

```bash
# Complete ledger backup
pg_dump -h [supabase_host] -U postgres -d postgres -t mst_ledger --data-only --inserts > mst_ledger_full.sql

# Complete group backup  
pg_dump -h [supabase_host] -U postgres -d postgres -t mst_group --data-only --inserts > mst_group_full.sql

# All Tally tables at once
pg_dump -h [supabase_host] -U postgres -d postgres -t "mst_*" -t "trn_*" --data-only --inserts > tally_complete_backup.sql
```

## Restore Instructions

1. First run the schema recreation script: `recreate_schema.sql`
2. Then run these data files in order:
   - All files in `01_core_tables/`
   - Sample files in `02_tally_masters/` (or your complete backup files)

## Generated on: 2025-09-10