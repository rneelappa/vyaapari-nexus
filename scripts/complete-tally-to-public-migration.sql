-- ============================================
-- COMPLETE TALLY SCHEMA TO PUBLIC SCHEMA MIGRATION
-- ============================================
-- This script migrates all Tally data from various sources to standardized public schema tables
-- Sources: VT tables, existing public tables, backup tables

-- Drop existing public schema Tally tables if they exist (with CASCADE to handle dependencies)
DROP TABLE IF EXISTS public.tally_trn_accounting CASCADE;
DROP TABLE IF EXISTS public.tally_trn_inventory CASCADE;
DROP TABLE IF EXISTS public.tally_trn_voucher CASCADE;
DROP TABLE IF EXISTS public.tally_mst_ledger CASCADE;
DROP TABLE IF EXISTS public.tally_mst_group CASCADE;
DROP TABLE IF EXISTS public.tally_mst_stock_item CASCADE;
DROP TABLE IF EXISTS public.tally_mst_vouchertype CASCADE;
DROP TABLE IF EXISTS public.tally_mst_company CASCADE;
DROP TABLE IF EXISTS public.tally_mst_godown CASCADE;
DROP TABLE IF EXISTS public.tally_mst_cost_centre CASCADE;
DROP TABLE IF EXISTS public.tally_mst_employee CASCADE;

-- Also drop any existing indexes that might cause conflicts
DROP INDEX IF EXISTS idx_tally_voucher_date;
DROP INDEX IF EXISTS idx_tally_voucher_type;
DROP INDEX IF EXISTS idx_tally_voucher_company;
DROP INDEX IF EXISTS idx_tally_voucher_division;
DROP INDEX IF EXISTS idx_tally_voucher_party;
DROP INDEX IF EXISTS idx_tally_ledger_name;
DROP INDEX IF EXISTS idx_tally_ledger_parent;
DROP INDEX IF EXISTS idx_tally_ledger_company;
DROP INDEX IF EXISTS idx_tally_group_name;
DROP INDEX IF EXISTS idx_tally_group_parent;
DROP INDEX IF EXISTS idx_tally_accounting_voucher;
DROP INDEX IF EXISTS idx_tally_accounting_ledger;
DROP INDEX IF EXISTS idx_tally_accounting_date;
DROP INDEX IF EXISTS idx_tally_inventory_voucher;
DROP INDEX IF EXISTS idx_tally_inventory_item;
DROP INDEX IF EXISTS idx_tally_inventory_date;

-- ============================================
-- 1. VOUCHERS TABLE (Primary Transaction Data)
-- ============================================
CREATE TABLE public.tally_trn_voucher (
    id SERIAL PRIMARY KEY,
    guid VARCHAR NOT NULL UNIQUE,
    alterid BIGINT DEFAULT 0,
    company_id UUID,
    division_id UUID,
    date DATE,
    voucher_type VARCHAR,
    voucher_number VARCHAR,
    reference VARCHAR DEFAULT '',
    narration TEXT DEFAULT '',
    party_ledger_name VARCHAR DEFAULT '',
    party_name VARCHAR DEFAULT '',
    place_of_supply VARCHAR DEFAULT '',
    currency VARCHAR DEFAULT 'INR',
    exchange_rate NUMERIC DEFAULT 1.0,
    
    -- Amount fields
    basic_amount NUMERIC DEFAULT 0,
    discount_amount NUMERIC DEFAULT 0,
    tax_amount NUMERIC DEFAULT 0,
    net_amount NUMERIC DEFAULT 0,
    final_amount NUMERIC DEFAULT 0,
    total_amount NUMERIC DEFAULT 0,
    amount NUMERIC DEFAULT 0,
    
    -- Status fields
    is_cancelled BOOLEAN DEFAULT false,
    is_optional BOOLEAN DEFAULT false,
    is_invoice BOOLEAN DEFAULT false,
    is_accounting_voucher BOOLEAN DEFAULT true,
    is_inventory_voucher BOOLEAN DEFAULT false,
    is_order_voucher BOOLEAN DEFAULT false,
    
    -- Additional fields
    due_date DATE,
    effective_date DATE,
    persistedview INTEGER DEFAULT 0,
    altered_by VARCHAR DEFAULT '',
    altered_on TIMESTAMP,
    
    -- Reference fields
    receipt_reference VARCHAR DEFAULT '',
    consignment_note VARCHAR DEFAULT '',
    voucher_number_prefix VARCHAR DEFAULT '',
    order_reference VARCHAR DEFAULT '',
    voucher_number_suffix VARCHAR DEFAULT '',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. LEDGERS TABLE (Chart of Accounts)
-- ============================================
CREATE TABLE public.tally_mst_ledger (
    id SERIAL PRIMARY KEY,
    guid VARCHAR NOT NULL UNIQUE,
    alterid BIGINT DEFAULT 0,
    company_id UUID,
    division_id UUID,
    name VARCHAR NOT NULL,
    alias VARCHAR DEFAULT '',
    parent VARCHAR DEFAULT '',
    _parent VARCHAR DEFAULT '',
    
    -- Financial fields
    opening_balance NUMERIC DEFAULT 0,
    closing_balance NUMERIC DEFAULT 0,
    is_revenue BOOLEAN DEFAULT false,
    is_deemedpositive BOOLEAN DEFAULT false,
    
    -- Contact information
    mailing_name VARCHAR DEFAULT '',
    mailing_address TEXT DEFAULT '',
    mailing_state VARCHAR DEFAULT '',
    mailing_country VARCHAR DEFAULT '',
    mailing_pincode VARCHAR DEFAULT '',
    email VARCHAR DEFAULT '',
    ledger_contact VARCHAR DEFAULT '',
    ledger_mobile VARCHAR DEFAULT '',
    ledger_fax VARCHAR DEFAULT '',
    ledger_website VARCHAR DEFAULT '',
    
    -- Tax information
    gstn VARCHAR DEFAULT '',
    it_pan VARCHAR DEFAULT '',
    gst_registration_type VARCHAR DEFAULT '',
    gst_supply_type VARCHAR DEFAULT '',
    gst_duty_head VARCHAR DEFAULT '',
    sales_tax_number VARCHAR DEFAULT '',
    excise_registration_number VARCHAR DEFAULT '',
    service_tax_number VARCHAR DEFAULT '',
    income_tax_number VARCHAR DEFAULT '',
    tax_rate NUMERIC DEFAULT 0,
    
    -- Banking information
    bank_name VARCHAR DEFAULT '',
    bank_branch VARCHAR DEFAULT '',
    bank_account_number VARCHAR DEFAULT '',
    bank_account_holder VARCHAR DEFAULT '',
    bank_ifsc VARCHAR DEFAULT '',
    bank_swift VARCHAR DEFAULT '',
    
    -- Credit terms
    credit_limit NUMERIC DEFAULT 0,
    credit_days INTEGER DEFAULT 0,
    bill_credit_limit NUMERIC DEFAULT 0,
    bill_credit_period INTEGER DEFAULT 0,
    
    -- Classification
    buyer_type VARCHAR DEFAULT '',
    buyer_category VARCHAR DEFAULT '',
    
    -- Descriptions
    description TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. GROUPS TABLE (Ledger Groups)
-- ============================================
CREATE TABLE public.tally_mst_group (
    id SERIAL PRIMARY KEY,
    guid VARCHAR NOT NULL UNIQUE,
    alterid BIGINT DEFAULT 0,
    company_id UUID,
    division_id UUID,
    name VARCHAR NOT NULL,
    parent VARCHAR DEFAULT '',
    _parent VARCHAR DEFAULT '',
    primary_group VARCHAR DEFAULT '',
    
    -- Group properties
    is_revenue BOOLEAN DEFAULT false,
    is_deemedpositive BOOLEAN DEFAULT false,
    is_reserved BOOLEAN DEFAULT false,
    affects_gross_profit BOOLEAN DEFAULT false,
    sort_position INTEGER,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. STOCK ITEMS TABLE (Inventory Items)
-- ============================================
CREATE TABLE public.tally_mst_stock_item (
    id SERIAL PRIMARY KEY,
    guid VARCHAR NOT NULL UNIQUE,
    alterid BIGINT DEFAULT 0,
    company_id UUID,
    division_id UUID,
    name VARCHAR NOT NULL,
    alias VARCHAR DEFAULT '',
    parent VARCHAR DEFAULT '',
    _parent VARCHAR DEFAULT '',
    
    -- Units
    uom VARCHAR DEFAULT '',
    _uom VARCHAR DEFAULT '',
    alternate_uom VARCHAR DEFAULT '',
    _alternate_uom VARCHAR DEFAULT '',
    conversion INTEGER DEFAULT 0,
    base_units VARCHAR DEFAULT '',
    additional_units VARCHAR DEFAULT '',
    
    -- Inventory levels
    opening_balance NUMERIC DEFAULT 0,
    opening_rate NUMERIC DEFAULT 0,
    opening_value NUMERIC DEFAULT 0,
    closing_balance NUMERIC DEFAULT 0,
    closing_rate NUMERIC DEFAULT 0,
    closing_value NUMERIC DEFAULT 0,
    
    -- Stock levels
    minimum_level NUMERIC DEFAULT 0,
    maximum_level NUMERIC DEFAULT 0,
    reorder_level NUMERIC DEFAULT 0,
    
    -- Item properties
    part_number VARCHAR DEFAULT '',
    description TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    costing_method VARCHAR DEFAULT '',
    
    -- Physical properties
    weight NUMERIC DEFAULT 0,
    weight_unit VARCHAR DEFAULT '',
    volume NUMERIC DEFAULT 0,
    volume_unit VARCHAR DEFAULT '',
    shelf_life_days INTEGER DEFAULT 0,
    
    -- Classification
    item_category VARCHAR DEFAULT '',
    item_classification VARCHAR DEFAULT '',
    manufacturer VARCHAR DEFAULT '',
    brand VARCHAR DEFAULT '',
    model VARCHAR DEFAULT '',
    size VARCHAR DEFAULT '',
    color VARCHAR DEFAULT '',
    
    -- GST Information
    gst_hsn_code VARCHAR DEFAULT '',
    gst_hsn_description VARCHAR DEFAULT '',
    gst_type_of_supply VARCHAR DEFAULT '',
    gst_taxability VARCHAR DEFAULT '',
    gst_rate NUMERIC DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. VOUCHER TYPES TABLE
-- ============================================
CREATE TABLE public.tally_mst_vouchertype (
    id SERIAL PRIMARY KEY,
    guid VARCHAR NOT NULL UNIQUE,
    company_id UUID,
    division_id UUID,
    name VARCHAR NOT NULL,
    parent VARCHAR DEFAULT '',
    _parent VARCHAR DEFAULT '',
    numbering_method VARCHAR DEFAULT '',
    affects_stock BOOLEAN DEFAULT false,
    is_deemedpositive BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 6. ACCOUNTING ENTRIES TABLE
-- ============================================
CREATE TABLE public.tally_trn_accounting (
    id SERIAL PRIMARY KEY,
    guid VARCHAR NOT NULL,
    voucher_guid VARCHAR,
    company_id UUID,
    division_id UUID,
    
    -- Entry details
    ledger VARCHAR NOT NULL,
    _ledger VARCHAR DEFAULT '',
    amount NUMERIC NOT NULL DEFAULT 0,
    amount_forex NUMERIC DEFAULT 0,
    amount_cleared NUMERIC DEFAULT 0,
    currency VARCHAR DEFAULT 'INR',
    
    -- Classification
    is_party_ledger BOOLEAN DEFAULT false,
    is_deemed_positive BOOLEAN DEFAULT false,
    
    -- Cost allocation
    cost_centre VARCHAR DEFAULT '',
    cost_category VARCHAR DEFAULT '',
    
    -- Bill allocations
    bill_allocations TEXT DEFAULT '',
    
    -- Voucher reference
    voucher_number VARCHAR DEFAULT '',
    voucher_type VARCHAR DEFAULT '',
    voucher_date DATE,
    
    alterid BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 7. INVENTORY ENTRIES TABLE
-- ============================================
CREATE TABLE public.tally_trn_inventory (
    id SERIAL PRIMARY KEY,
    guid VARCHAR NOT NULL,
    voucher_guid VARCHAR,
    company_id UUID,
    division_id UUID,
    
    -- Item details
    item VARCHAR NOT NULL,
    _item VARCHAR DEFAULT '',
    quantity NUMERIC DEFAULT 0,
    rate NUMERIC DEFAULT 0,
    amount NUMERIC DEFAULT 0,
    
    -- Additional quantities
    billed_quantity NUMERIC DEFAULT 0,
    actual_quantity NUMERIC DEFAULT 0,
    
    -- Discounts
    discount_percent NUMERIC DEFAULT 0,
    discount_amount NUMERIC DEFAULT 0,
    
    -- Godown information
    godown VARCHAR DEFAULT '',
    _godown VARCHAR DEFAULT '',
    destination_godown VARCHAR DEFAULT '',
    _destination_godown VARCHAR DEFAULT '',
    
    -- Voucher reference
    voucher_number VARCHAR DEFAULT '',
    voucher_type VARCHAR DEFAULT '',
    voucher_date DATE,
    
    -- Additional details
    batch_serial_number VARCHAR DEFAULT '',
    tracking_number VARCHAR DEFAULT '',
    additional_details TEXT DEFAULT '',
    
    alterid BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 8. COMPANIES TABLE
-- ============================================
CREATE TABLE public.tally_mst_company (
    id SERIAL PRIMARY KEY,
    company_id VARCHAR NOT NULL UNIQUE,
    company_name VARCHAR NOT NULL,
    vyaapari_company_id UUID,
    vyaapari_division_id UUID,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 9. GODOWNS TABLE (Warehouses)
-- ============================================
CREATE TABLE public.tally_mst_godown (
    id SERIAL PRIMARY KEY,
    guid VARCHAR NOT NULL UNIQUE,
    company_id UUID,
    division_id UUID,
    name VARCHAR NOT NULL,
    parent VARCHAR DEFAULT '',
    _parent VARCHAR DEFAULT '',
    address TEXT DEFAULT '',
    
    -- Godown properties
    godown_type VARCHAR DEFAULT '',
    storage_type VARCHAR DEFAULT '',
    capacity NUMERIC DEFAULT 0,
    capacity_unit VARCHAR DEFAULT '',
    location_code VARCHAR DEFAULT '',
    
    -- Management
    manager_name VARCHAR DEFAULT '',
    contact_number VARCHAR DEFAULT '',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 10. COST CENTRES TABLE
-- ============================================
CREATE TABLE public.tally_mst_cost_centre (
    id SERIAL PRIMARY KEY,
    guid VARCHAR NOT NULL UNIQUE,
    company_id UUID,
    division_id UUID,
    name VARCHAR NOT NULL,
    parent VARCHAR DEFAULT '',
    _parent VARCHAR DEFAULT '',
    category VARCHAR DEFAULT '',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 11. EMPLOYEES TABLE
-- ============================================
CREATE TABLE public.tally_mst_employee (
    id SERIAL PRIMARY KEY,
    guid VARCHAR NOT NULL UNIQUE,
    company_id UUID,
    division_id UUID,
    name VARCHAR NOT NULL,
    parent VARCHAR DEFAULT '',
    _parent VARCHAR DEFAULT '',
    
    -- Personal Information
    id_number VARCHAR DEFAULT '',
    designation VARCHAR DEFAULT '',
    function_role VARCHAR DEFAULT '',
    location VARCHAR DEFAULT '',
    gender VARCHAR DEFAULT '',
    blood_group VARCHAR DEFAULT '',
    father_mother_name VARCHAR DEFAULT '',
    spouse_name VARCHAR DEFAULT '',
    address TEXT DEFAULT '',
    mobile VARCHAR DEFAULT '',
    email VARCHAR DEFAULT '',
    
    -- Official Information
    date_of_birth DATE,
    date_of_joining DATE,
    date_of_release DATE,
    
    -- PF Information
    pf_number VARCHAR DEFAULT '',
    pf_joining_date DATE,
    pf_relieving_date DATE,
    uan VARCHAR DEFAULT '',
    pr_account_number VARCHAR DEFAULT '',
    
    -- Identity
    pan VARCHAR DEFAULT '',
    aadhar VARCHAR DEFAULT '',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- DATA MIGRATION SECTION
-- ============================================

-- Migrate Vouchers from VT tables
INSERT INTO public.tally_trn_voucher (
    guid, alterid, date, voucher_type, voucher_number, reference, narration, 
    party_name, place_of_supply, amount, is_invoice, is_accounting_voucher, 
    is_inventory_voucher, is_order_voucher, effective_date, created_at
)
SELECT 
    COALESCE(guid, gen_random_uuid()::text),
    alterid,
    date,
    voucher_type,
    voucher_number,
    reference_number,
    narration,
    party_name,
    place_of_supply,
    amount,
    COALESCE(is_invoice, false),
    COALESCE(is_accounting_voucher, true),
    COALESCE(is_inventory_voucher, false),
    COALESCE(is_order_voucher, false),
    effective_date,
    COALESCE(created_at, CURRENT_TIMESTAMP)
FROM vt_voucher
ON CONFLICT (guid) DO NOTHING;

-- Migrate Ledgers from VT tables
INSERT INTO public.tally_mst_ledger (
    guid, name, parent, _parent, opening_balance, closing_balance,
    mailing_name, mailing_address, email, created_at
)
SELECT 
    COALESCE(guid, gen_random_uuid()::text),
    name,
    COALESCE(parent, ''),
    COALESCE(_parent, ''),
    COALESCE(opening_balance, 0),
    COALESCE(closing_balance, 0),
    COALESCE(mailing_name, ''),
    COALESCE(mailing_address, ''),
    COALESCE(email, ''),
    COALESCE(created_at, CURRENT_TIMESTAMP)
FROM vt_ledger
ON CONFLICT (guid) DO NOTHING;

-- Migrate Groups from VT tables
INSERT INTO public.tally_mst_group (
    guid, name, parent, _parent, primary_group, is_revenue, 
    is_deemedpositive, sort_position, created_at
)
SELECT 
    COALESCE(guid, gen_random_uuid()::text),
    name,
    COALESCE(parent, ''),
    COALESCE(_parent, ''),
    COALESCE(primary_group, ''),
    COALESCE(is_revenue::boolean, false),
    COALESCE(is_deemedpositive::boolean, false),
    sort_position,
    COALESCE(created_at, CURRENT_TIMESTAMP)
FROM vt_group_table
ON CONFLICT (guid) DO NOTHING;

-- Migrate Stock Items from VT tables (if exists)
INSERT INTO public.tally_mst_stock_item (
    guid, name, parent, _parent, uom, opening_balance, 
    opening_rate, opening_value, closing_balance, closing_rate, 
    closing_value, created_at
)
SELECT 
    COALESCE(guid, gen_random_uuid()::text),
    name,
    COALESCE(parent, ''),
    COALESCE(_parent, ''),
    COALESCE(uom, ''),
    COALESCE(opening_balance, 0),
    COALESCE(opening_rate, 0),
    COALESCE(opening_value, 0),
    COALESCE(closing_balance, 0),
    COALESCE(closing_rate, 0),
    COALESCE(closing_value, 0),
    COALESCE(created_at, CURRENT_TIMESTAMP)
FROM vt_stockitem
WHERE guid IS NOT NULL
ON CONFLICT (guid) DO NOTHING;

-- Migrate Voucher Types from VT tables
INSERT INTO public.tally_mst_vouchertype (
    guid, name, parent, _parent, numbering_method, affects_stock, 
    is_deemedpositive, created_at
)
SELECT 
    COALESCE(guid, gen_random_uuid()::text),
    name,
    COALESCE(parent, ''),
    COALESCE(_parent, ''),
    COALESCE(numbering_method, ''),
    COALESCE(affects_stock::boolean, false),
    COALESCE(is_deemedpositive::boolean, false),
    COALESCE(created_at, CURRENT_TIMESTAMP)
FROM vt_vouchertype
ON CONFLICT (guid) DO NOTHING;

-- Migrate Companies from VT tables
INSERT INTO public.tally_mst_company (
    company_id, company_name, vyaapari_company_id, vyaapari_division_id, created_at
)
SELECT 
    COALESCE(company_id, gen_random_uuid()::text),
    company_name,
    vyaapari_company_id,
    vyaapari_division_id,
    COALESCE(created_at, CURRENT_TIMESTAMP)
FROM vt_company
ON CONFLICT (company_id) DO NOTHING;

-- Migrate Godowns from VT tables
INSERT INTO public.tally_mst_godown (
    guid, name, parent, _parent, address, godown_type, 
    storage_type, capacity, capacity_unit, location_code, 
    manager_name, contact_number, created_at
)
SELECT 
    COALESCE(guid, gen_random_uuid()::text),
    name,
    COALESCE(parent, ''),
    COALESCE(_parent, ''),
    COALESCE(address, ''),
    COALESCE(godown_type, ''),
    COALESCE(storage_type, ''),
    COALESCE(capacity, 0),
    COALESCE(capacity_unit, ''),
    COALESCE(location_code, ''),
    COALESCE(manager_name, ''),
    COALESCE(contact_number, ''),
    COALESCE(created_at, CURRENT_TIMESTAMP)
FROM vt_godown
WHERE guid IS NOT NULL
ON CONFLICT (guid) DO NOTHING;

-- ============================================
-- MIGRATE FROM EXISTING PUBLIC SCHEMA TABLES
-- ============================================

-- Migrate additional data from existing mst_ledger if exists
INSERT INTO public.tally_mst_ledger (
    guid, alterid, company_id, division_id, name, alias, parent, _parent,
    opening_balance, closing_balance, is_revenue, is_deemedpositive,
    mailing_name, mailing_address, mailing_state, mailing_country, 
    mailing_pincode, email, ledger_contact, ledger_mobile, ledger_fax,
    ledger_website, gstn, it_pan, gst_registration_type, gst_supply_type,
    gst_duty_head, sales_tax_number, excise_registration_number, 
    service_tax_number, income_tax_number, tax_rate, bank_name, bank_branch,
    bank_account_number, bank_account_holder, bank_ifsc, bank_swift,
    credit_limit, credit_days, bill_credit_limit, bill_credit_period,
    buyer_type, buyer_category, description, notes
)
SELECT 
    guid, alterid, company_id, division_id, name, alias, parent, _parent,
    opening_balance, closing_balance, is_revenue, is_deemedpositive,
    mailing_name, mailing_address, mailing_state, mailing_country,
    mailing_pincode, email, ledger_contact, ledger_mobile, ledger_fax,
    ledger_website, gstn, it_pan, gst_registration_type, gst_supply_type,
    gst_duty_head, sales_tax_number, excise_registration_number,
    service_tax_number, income_tax_number, tax_rate, bank_name, bank_branch,
    bank_account_number, bank_account_holder, bank_ifsc, bank_swift,
    credit_limit, credit_days, bill_credit_limit, bill_credit_period,
    buyer_type, buyer_category, description, notes
FROM mst_ledger
ON CONFLICT (guid) DO UPDATE SET
    alterid = EXCLUDED.alterid,
    company_id = EXCLUDED.company_id,
    division_id = EXCLUDED.division_id,
    alias = EXCLUDED.alias,
    opening_balance = EXCLUDED.opening_balance,
    closing_balance = EXCLUDED.closing_balance,
    is_revenue = EXCLUDED.is_revenue,
    is_deemedpositive = EXCLUDED.is_deemedpositive,
    mailing_name = EXCLUDED.mailing_name,
    mailing_address = EXCLUDED.mailing_address,
    mailing_state = EXCLUDED.mailing_state,
    mailing_country = EXCLUDED.mailing_country,
    mailing_pincode = EXCLUDED.mailing_pincode,
    email = EXCLUDED.email,
    ledger_contact = EXCLUDED.ledger_contact,
    ledger_mobile = EXCLUDED.ledger_mobile,
    ledger_fax = EXCLUDED.ledger_fax,
    ledger_website = EXCLUDED.ledger_website,
    gstn = EXCLUDED.gstn,
    it_pan = EXCLUDED.it_pan,
    gst_registration_type = EXCLUDED.gst_registration_type,
    gst_supply_type = EXCLUDED.gst_supply_type,
    gst_duty_head = EXCLUDED.gst_duty_head,
    sales_tax_number = EXCLUDED.sales_tax_number,
    excise_registration_number = EXCLUDED.excise_registration_number,
    service_tax_number = EXCLUDED.service_tax_number,
    income_tax_number = EXCLUDED.income_tax_number,
    tax_rate = EXCLUDED.tax_rate,
    bank_name = EXCLUDED.bank_name,
    bank_branch = EXCLUDED.bank_branch,
    bank_account_number = EXCLUDED.bank_account_number,
    bank_account_holder = EXCLUDED.bank_account_holder,
    bank_ifsc = EXCLUDED.bank_ifsc,
    bank_swift = EXCLUDED.bank_swift,
    credit_limit = EXCLUDED.credit_limit,
    credit_days = EXCLUDED.credit_days,
    bill_credit_limit = EXCLUDED.bill_credit_limit,
    bill_credit_period = EXCLUDED.bill_credit_period,
    buyer_type = EXCLUDED.buyer_type,
    buyer_category = EXCLUDED.buyer_category,
    description = EXCLUDED.description,
    notes = EXCLUDED.notes;

-- Migrate additional groups from existing mst_group
INSERT INTO public.tally_mst_group (
    guid, alterid, company_id, division_id, name, parent, _parent,
    primary_group, is_revenue, is_deemedpositive, is_reserved,
    affects_gross_profit, sort_position
)
SELECT 
    guid, alterid, company_id, division_id, name, parent, _parent,
    primary_group, is_revenue, is_deemedpositive, is_reserved,
    affects_gross_profit, sort_position
FROM mst_group
ON CONFLICT (guid) DO UPDATE SET
    alterid = EXCLUDED.alterid,
    company_id = EXCLUDED.company_id,
    division_id = EXCLUDED.division_id,
    primary_group = EXCLUDED.primary_group,
    is_revenue = EXCLUDED.is_revenue,
    is_deemedpositive = EXCLUDED.is_deemedpositive,
    is_reserved = EXCLUDED.is_reserved,
    affects_gross_profit = EXCLUDED.affects_gross_profit,
    sort_position = EXCLUDED.sort_position;

-- Migrate vouchers from existing trn_voucher
INSERT INTO public.tally_trn_voucher (
    guid, alterid, company_id, division_id, date, voucher_type, voucher_number,
    reference, narration, party_ledger_name, currency, exchange_rate,
    basic_amount, discount_amount, tax_amount, net_amount, final_amount,
    total_amount, is_cancelled, is_optional, due_date, persistedview,
    altered_by, altered_on, receipt_reference, consignment_note,
    voucher_number_prefix, order_reference, voucher_number_suffix
)
SELECT 
    guid, alterid, company_id, division_id, date, voucher_type, voucher_number,
    reference, narration, party_ledger_name, currency, exchange_rate,
    basic_amount, discount_amount, tax_amount, net_amount, final_amount,
    total_amount, is_cancelled, is_optional, due_date, persistedview,
    altered_by, altered_on, receipt_reference, consignment_note,
    voucher_number_prefix, order_reference, voucher_number_suffix
FROM trn_voucher
ON CONFLICT (guid) DO UPDATE SET
    alterid = EXCLUDED.alterid,
    company_id = EXCLUDED.company_id,
    division_id = EXCLUDED.division_id,
    date = EXCLUDED.date,
    voucher_type = EXCLUDED.voucher_type,
    voucher_number = EXCLUDED.voucher_number,
    reference = EXCLUDED.reference,
    narration = EXCLUDED.narration,
    party_ledger_name = EXCLUDED.party_ledger_name,
    currency = EXCLUDED.currency,
    exchange_rate = EXCLUDED.exchange_rate,
    basic_amount = EXCLUDED.basic_amount,
    discount_amount = EXCLUDED.discount_amount,
    tax_amount = EXCLUDED.tax_amount,
    net_amount = EXCLUDED.net_amount,
    final_amount = EXCLUDED.final_amount,
    total_amount = EXCLUDED.total_amount,
    is_cancelled = EXCLUDED.is_cancelled,
    is_optional = EXCLUDED.is_optional,
    due_date = EXCLUDED.due_date,
    persistedview = EXCLUDED.persistedview,
    altered_by = EXCLUDED.altered_by,
    altered_on = EXCLUDED.altered_on,
    receipt_reference = EXCLUDED.receipt_reference,
    consignment_note = EXCLUDED.consignment_note,
    voucher_number_prefix = EXCLUDED.voucher_number_prefix,
    order_reference = EXCLUDED.order_reference,
    voucher_number_suffix = EXCLUDED.voucher_number_suffix;

-- Migrate accounting entries from trn_accounting
INSERT INTO public.tally_trn_accounting (
    guid, voucher_guid, company_id, division_id, ledger, _ledger,
    amount, amount_forex, amount_cleared, currency, is_party_ledger,
    is_deemed_positive, cost_centre, cost_category, bill_allocations,
    voucher_number, voucher_type, voucher_date, alterid
)
SELECT 
    guid, voucher_guid, company_id, division_id, ledger, _ledger,
    amount, amount_forex, amount_cleared, currency, is_party_ledger,
    is_deemed_positive, cost_centre, cost_category, bill_allocations,
    voucher_number, voucher_type, voucher_date, alterid
FROM trn_accounting;

-- Migrate inventory entries from trn_inventory
INSERT INTO public.tally_trn_inventory (
    guid, voucher_guid, company_id, division_id, item, _item,
    quantity, rate, amount, billed_quantity, actual_quantity,
    discount_percent, discount_amount, godown, _godown,
    destination_godown, _destination_godown, voucher_number,
    voucher_type, voucher_date, alterid
)
SELECT 
    guid, voucher_guid, company_id, division_id, item, _item,
    quantity, rate, amount, billed_quantity, actual_quantity,
    discount_percent, discount_amount, godown, _godown,
    destination_godown, _destination_godown, voucher_number,
    voucher_type, voucher_date, alterid
FROM trn_inventory;

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Vouchers indexes
CREATE INDEX IF NOT EXISTS idx_tally_voucher_date ON public.tally_trn_voucher(date);
CREATE INDEX IF NOT EXISTS idx_tally_voucher_type ON public.tally_trn_voucher(voucher_type);
CREATE INDEX IF NOT EXISTS idx_tally_voucher_company ON public.tally_trn_voucher(company_id);
CREATE INDEX IF NOT EXISTS idx_tally_voucher_division ON public.tally_trn_voucher(division_id);
CREATE INDEX IF NOT EXISTS idx_tally_voucher_party ON public.tally_trn_voucher(party_ledger_name);

-- Ledgers indexes
CREATE INDEX IF NOT EXISTS idx_tally_ledger_name ON public.tally_mst_ledger(name);
CREATE INDEX IF NOT EXISTS idx_tally_ledger_parent ON public.tally_mst_ledger(parent);
CREATE INDEX IF NOT EXISTS idx_tally_ledger_company ON public.tally_mst_ledger(company_id);

-- Groups indexes
CREATE INDEX IF NOT EXISTS idx_tally_group_name ON public.tally_mst_group(name);
CREATE INDEX IF NOT EXISTS idx_tally_group_parent ON public.tally_mst_group(parent);

-- Accounting indexes
CREATE INDEX IF NOT EXISTS idx_tally_accounting_voucher ON public.tally_trn_accounting(voucher_guid);
CREATE INDEX IF NOT EXISTS idx_tally_accounting_ledger ON public.tally_trn_accounting(ledger);
CREATE INDEX IF NOT EXISTS idx_tally_accounting_date ON public.tally_trn_accounting(voucher_date);

-- Inventory indexes
CREATE INDEX IF NOT EXISTS idx_tally_inventory_voucher ON public.tally_trn_inventory(voucher_guid);
CREATE INDEX IF NOT EXISTS idx_tally_inventory_item ON public.tally_trn_inventory(item);
CREATE INDEX IF NOT EXISTS idx_tally_inventory_date ON public.tally_trn_inventory(voucher_date);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.tally_trn_voucher ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tally_mst_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tally_mst_group ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tally_mst_stock_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tally_mst_vouchertype ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tally_trn_accounting ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tally_trn_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tally_mst_company ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tally_mst_godown ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tally_mst_cost_centre ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tally_mst_employee ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE RLS POLICIES
-- ============================================

-- Allow authenticated users to access all Tally data
CREATE POLICY "Authenticated users can access Tally vouchers" ON public.tally_trn_voucher
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access Tally ledgers" ON public.tally_mst_ledger
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access Tally groups" ON public.tally_mst_group
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access Tally stock items" ON public.tally_mst_stock_item
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access Tally voucher types" ON public.tally_mst_vouchertype
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access Tally accounting" ON public.tally_trn_accounting
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access Tally inventory" ON public.tally_trn_inventory
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access Tally companies" ON public.tally_mst_company
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access Tally godowns" ON public.tally_mst_godown
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access Tally cost centres" ON public.tally_mst_cost_centre
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access Tally employees" ON public.tally_mst_employee
    FOR ALL USING (auth.uid() IS NOT NULL);

-- ============================================
-- MIGRATION SUMMARY
-- ============================================

-- Count records in new tables
SELECT 'tally_trn_voucher' as table_name, COUNT(*) as record_count FROM public.tally_trn_voucher
UNION ALL
SELECT 'tally_mst_ledger', COUNT(*) FROM public.tally_mst_ledger
UNION ALL  
SELECT 'tally_mst_group', COUNT(*) FROM public.tally_mst_group
UNION ALL
SELECT 'tally_mst_stock_item', COUNT(*) FROM public.tally_mst_stock_item
UNION ALL
SELECT 'tally_mst_vouchertype', COUNT(*) FROM public.tally_mst_vouchertype
UNION ALL
SELECT 'tally_trn_accounting', COUNT(*) FROM public.tally_trn_accounting
UNION ALL
SELECT 'tally_trn_inventory', COUNT(*) FROM public.tally_trn_inventory
UNION ALL
SELECT 'tally_mst_company', COUNT(*) FROM public.tally_mst_company
ORDER BY table_name;

-- Migration complete message
SELECT 'TALLY SCHEMA TO PUBLIC SCHEMA MIGRATION COMPLETED SUCCESSFULLY' as status;