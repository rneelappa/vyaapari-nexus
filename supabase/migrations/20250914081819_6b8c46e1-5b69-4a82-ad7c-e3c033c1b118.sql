-- Fix duplicate foreign key constraints on Tally tables
-- First drop all existing constraints that are duplicates, then add clean ones

-- Drop duplicate constraints from mst_ledger
ALTER TABLE mst_ledger DROP CONSTRAINT IF EXISTS fk_mst_ledger_company;
ALTER TABLE mst_ledger DROP CONSTRAINT IF EXISTS fk_mst_ledger_division;

-- Drop duplicate constraints from mst_group  
ALTER TABLE mst_group DROP CONSTRAINT IF EXISTS fk_mst_group_company;
ALTER TABLE mst_group DROP CONSTRAINT IF EXISTS fk_mst_group_division;

-- Drop duplicate constraints from mst_vouchertype
ALTER TABLE mst_vouchertype DROP CONSTRAINT IF EXISTS fk_mst_vouchertype_company;
ALTER TABLE mst_vouchertype DROP CONSTRAINT IF EXISTS fk_mst_vouchertype_division;

-- Drop duplicate constraints from mst_uom
ALTER TABLE mst_uom DROP CONSTRAINT IF EXISTS fk_mst_uom_company;
ALTER TABLE mst_uom DROP CONSTRAINT IF EXISTS fk_mst_uom_division;

-- Drop duplicate constraints from mst_godown
ALTER TABLE mst_godown DROP CONSTRAINT IF EXISTS fk_mst_godown_company;
ALTER TABLE mst_godown DROP CONSTRAINT IF EXISTS fk_mst_godown_division;

-- Drop duplicate constraints from mst_stock_group
ALTER TABLE mst_stock_group DROP CONSTRAINT IF EXISTS fk_mst_stock_group_company;
ALTER TABLE mst_stock_group DROP CONSTRAINT IF EXISTS fk_mst_stock_group_division;

-- Drop duplicate constraints from mst_stock_item
ALTER TABLE mst_stock_item DROP CONSTRAINT IF EXISTS fk_mst_stock_item_company;
ALTER TABLE mst_stock_item DROP CONSTRAINT IF EXISTS fk_mst_stock_item_division;

-- Drop duplicate constraints from mst_employee
ALTER TABLE mst_employee DROP CONSTRAINT IF EXISTS fk_mst_employee_company;
ALTER TABLE mst_employee DROP CONSTRAINT IF EXISTS fk_mst_employee_division;

-- Drop duplicate constraints from mst_cost_centre
ALTER TABLE mst_cost_centre DROP CONSTRAINT IF EXISTS fk_mst_cost_centre_company;
ALTER TABLE mst_cost_centre DROP CONSTRAINT IF EXISTS fk_mst_cost_centre_division;

-- Drop duplicate constraints from mst_cost_category
ALTER TABLE mst_cost_category DROP CONSTRAINT IF EXISTS fk_mst_cost_category_company;
ALTER TABLE mst_cost_category DROP CONSTRAINT IF EXISTS fk_mst_cost_category_division;

-- Drop duplicate constraints from mst_payhead
ALTER TABLE mst_payhead DROP CONSTRAINT IF EXISTS fk_mst_payhead_company;
ALTER TABLE mst_payhead DROP CONSTRAINT IF EXISTS fk_mst_payhead_division;

-- Drop duplicate constraints from mst_attendance_type
ALTER TABLE mst_attendance_type DROP CONSTRAINT IF EXISTS fk_mst_attendance_type_company;
ALTER TABLE mst_attendance_type DROP CONSTRAINT IF EXISTS fk_mst_attendance_type_division;

-- Drop duplicate constraints from all trn_ tables
ALTER TABLE trn_accounting DROP CONSTRAINT IF EXISTS fk_trn_accounting_company;
ALTER TABLE trn_accounting DROP CONSTRAINT IF EXISTS fk_trn_accounting_division;

ALTER TABLE trn_address_details DROP CONSTRAINT IF EXISTS fk_trn_address_details_company;
ALTER TABLE trn_address_details DROP CONSTRAINT IF EXISTS fk_trn_address_details_division;

-- Drop duplicate constraints from tally_trn_voucher
ALTER TABLE tally_trn_voucher DROP CONSTRAINT IF EXISTS fk_tally_trn_voucher_company;
ALTER TABLE tally_trn_voucher DROP CONSTRAINT IF EXISTS fk_tally_trn_voucher_division;

-- Drop duplicate constraints from tally_mst tables
ALTER TABLE tally_mst_ledger DROP CONSTRAINT IF EXISTS fk_tally_mst_ledger_company;
ALTER TABLE tally_mst_ledger DROP CONSTRAINT IF EXISTS fk_tally_mst_ledger_division;

ALTER TABLE tally_mst_group DROP CONSTRAINT IF EXISTS fk_tally_mst_group_company;
ALTER TABLE tally_mst_group DROP CONSTRAINT IF EXISTS fk_tally_mst_group_division;

ALTER TABLE tally_mst_stock_item DROP CONSTRAINT IF EXISTS fk_tally_mst_stock_item_company;
ALTER TABLE tally_mst_stock_item DROP CONSTRAINT IF EXISTS fk_tally_mst_stock_item_division;

-- Now the constraints that remain are the ones with _id suffix, which should work properly
-- Let's verify that company_id and division_id columns allow NULL values since Tally data may not always have them
ALTER TABLE mst_ledger ALTER COLUMN company_id DROP NOT NULL;
ALTER TABLE mst_ledger ALTER COLUMN division_id DROP NOT NULL;

ALTER TABLE mst_group ALTER COLUMN company_id DROP NOT NULL;
ALTER TABLE mst_group ALTER COLUMN division_id DROP NOT NULL;

ALTER TABLE mst_stock_item ALTER COLUMN company_id DROP NOT NULL;
ALTER TABLE mst_stock_item ALTER COLUMN division_id DROP NOT NULL;

ALTER TABLE mst_vouchertype ALTER COLUMN company_id DROP NOT NULL;
ALTER TABLE mst_vouchertype ALTER COLUMN division_id DROP NOT NULL;

ALTER TABLE tally_trn_voucher ALTER COLUMN company_id DROP NOT NULL;
ALTER TABLE tally_trn_voucher ALTER COLUMN division_id DROP NOT NULL;

ALTER TABLE tally_mst_ledger ALTER COLUMN company_id DROP NOT NULL;
ALTER TABLE tally_mst_ledger ALTER COLUMN division_id DROP NOT NULL;

ALTER TABLE tally_mst_group ALTER COLUMN company_id DROP NOT NULL;
ALTER TABLE tally_mst_group ALTER COLUMN division_id DROP NOT NULL;

ALTER TABLE tally_mst_stock_item ALTER COLUMN company_id DROP NOT NULL;
ALTER TABLE tally_mst_stock_item ALTER COLUMN division_id DROP NOT NULL;

ALTER TABLE trn_accounting ALTER COLUMN company_id DROP NOT NULL;
ALTER TABLE trn_accounting ALTER COLUMN division_id DROP NOT NULL;