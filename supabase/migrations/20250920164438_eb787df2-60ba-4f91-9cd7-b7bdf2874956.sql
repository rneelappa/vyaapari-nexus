-- Disable change tracking triggers temporarily to allow schema modifications
DROP TRIGGER IF EXISTS track_changes_trigger ON tally.group_table;
DROP TRIGGER IF EXISTS track_changes_trigger ON tally.ledger;
DROP TRIGGER IF EXISTS track_changes_trigger ON tally.stockitem;
DROP TRIGGER IF EXISTS track_changes_trigger ON tally.vouchertype;
DROP TRIGGER IF EXISTS track_changes_trigger ON tally.voucher;
DROP TRIGGER IF EXISTS track_changes_trigger ON tally.ledgerentries;
DROP TRIGGER IF EXISTS track_changes_trigger ON tally.inventoryentries;

-- Drop the problematic function
DROP FUNCTION IF EXISTS tally.track_table_changes() CASCADE;