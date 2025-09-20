-- Phase 1: Create VT Schema with proper relationships and multi-tenancy
-- Drop and recreate VT schema to ensure clean state
DROP SCHEMA IF EXISTS vt CASCADE;
CREATE SCHEMA vt;

-- Enable RLS on schema level
GRANT USAGE ON SCHEMA vt TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA vt TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA vt TO authenticated;

-- Core Master Tables with Multi-tenancy
CREATE TABLE vt.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tally_company_id TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE vt.divisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES vt.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    tally_division_id TEXT,
    tally_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, tally_division_id)
);

-- Chart of Accounts Structure
CREATE TABLE vt.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES vt.companies(id) ON DELETE CASCADE,
    division_id UUID REFERENCES vt.divisions(id) ON DELETE CASCADE,
    tally_guid TEXT,
    name TEXT NOT NULL,
    parent_id UUID REFERENCES vt.groups(id) ON DELETE SET NULL,
    primary_group TEXT,
    is_revenue BOOLEAN DEFAULT FALSE,
    is_deemed_positive BOOLEAN DEFAULT FALSE,
    is_reserved BOOLEAN DEFAULT FALSE,
    affects_gross_profit BOOLEAN DEFAULT FALSE,
    sort_position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, division_id, tally_guid)
);

CREATE TABLE vt.ledgers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES vt.companies(id) ON DELETE CASCADE,
    division_id UUID REFERENCES vt.divisions(id) ON DELETE CASCADE,
    group_id UUID REFERENCES vt.groups(id) ON DELETE SET NULL,
    tally_guid TEXT,
    name TEXT NOT NULL,
    alias TEXT,
    opening_balance DECIMAL(15,4) DEFAULT 0,
    closing_balance DECIMAL(15,4) DEFAULT 0,
    
    -- Contact Information
    mailing_name TEXT,
    mailing_address TEXT,
    mailing_city TEXT,
    mailing_state TEXT,
    mailing_country TEXT,
    mailing_pincode TEXT,
    email TEXT,
    phone TEXT,
    
    -- Tax Information
    gstn TEXT,
    pan TEXT,
    gst_registration_type TEXT,
    gst_supply_type TEXT,
    
    -- Banking Information
    bank_name TEXT,
    bank_account_number TEXT,
    bank_ifsc TEXT,
    bank_account_holder TEXT,
    
    -- Credit Management
    credit_limit DECIMAL(15,4) DEFAULT 0,
    credit_days INTEGER DEFAULT 0,
    
    is_revenue BOOLEAN DEFAULT FALSE,
    is_deemed_positive BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, division_id, tally_guid)
);

-- Inventory Management
CREATE TABLE vt.units_of_measure (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES vt.companies(id) ON DELETE CASCADE,
    division_id UUID REFERENCES vt.divisions(id) ON DELETE CASCADE,
    tally_guid TEXT,
    name TEXT NOT NULL,
    formal_name TEXT,
    is_simple_unit BOOLEAN DEFAULT TRUE,
    base_units TEXT,
    additional_units TEXT,
    conversion_factor DECIMAL(15,6) DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, division_id, tally_guid)
);

CREATE TABLE vt.stock_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES vt.companies(id) ON DELETE CASCADE,
    division_id UUID REFERENCES vt.divisions(id) ON DELETE CASCADE,
    tally_guid TEXT,
    name TEXT NOT NULL,
    parent_id UUID REFERENCES vt.stock_groups(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, division_id, tally_guid)
);

CREATE TABLE vt.stock_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES vt.companies(id) ON DELETE CASCADE,
    division_id UUID REFERENCES vt.divisions(id) ON DELETE CASCADE,
    stock_group_id UUID REFERENCES vt.stock_groups(id) ON DELETE SET NULL,
    uom_id UUID REFERENCES vt.units_of_measure(id) ON DELETE SET NULL,
    tally_guid TEXT,
    name TEXT NOT NULL,
    alias TEXT,
    part_number TEXT,
    description TEXT,
    
    -- Stock Levels
    opening_balance DECIMAL(15,6) DEFAULT 0,
    opening_rate DECIMAL(15,4) DEFAULT 0,
    opening_value DECIMAL(15,4) DEFAULT 0,
    closing_balance DECIMAL(15,6) DEFAULT 0,
    closing_rate DECIMAL(15,4) DEFAULT 0,
    closing_value DECIMAL(15,4) DEFAULT 0,
    
    -- Inventory Control
    reorder_level DECIMAL(15,6) DEFAULT 0,
    minimum_level DECIMAL(15,6) DEFAULT 0,
    maximum_level DECIMAL(15,6) DEFAULT 0,
    
    -- Physical Properties
    weight DECIMAL(15,6),
    weight_unit TEXT,
    volume DECIMAL(15,6),
    volume_unit TEXT,
    
    -- GST Information
    gst_hsn_code TEXT,
    gst_hsn_description TEXT,
    gst_rate DECIMAL(5,4) DEFAULT 0,
    gst_taxability TEXT,
    gst_type_of_supply TEXT,
    
    costing_method TEXT DEFAULT 'FIFO',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, division_id, tally_guid)
);

CREATE TABLE vt.godowns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES vt.companies(id) ON DELETE CASCADE,
    division_id UUID REFERENCES vt.divisions(id) ON DELETE CASCADE,
    tally_guid TEXT,
    name TEXT NOT NULL,
    parent_id UUID REFERENCES vt.godowns(id) ON DELETE SET NULL,
    address TEXT,
    capacity DECIMAL(15,6),
    capacity_unit TEXT,
    manager_name TEXT,
    contact_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, division_id, tally_guid)
);

-- Cost Management
CREATE TABLE vt.cost_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES vt.companies(id) ON DELETE CASCADE,
    division_id UUID REFERENCES vt.divisions(id) ON DELETE CASCADE,
    tally_guid TEXT,
    name TEXT NOT NULL,
    allocate_revenue BOOLEAN DEFAULT FALSE,
    allocate_non_revenue BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, division_id, tally_guid)
);

CREATE TABLE vt.cost_centres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES vt.companies(id) ON DELETE CASCADE,
    division_id UUID REFERENCES vt.divisions(id) ON DELETE CASCADE,
    cost_category_id UUID REFERENCES vt.cost_categories(id) ON DELETE SET NULL,
    tally_guid TEXT,
    name TEXT NOT NULL,
    parent_id UUID REFERENCES vt.cost_centres(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, division_id, tally_guid)
);

-- Voucher Types and Transaction Framework
CREATE TABLE vt.voucher_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES vt.companies(id) ON DELETE CASCADE,
    division_id UUID REFERENCES vt.divisions(id) ON DELETE CASCADE,
    tally_guid TEXT,
    name TEXT NOT NULL,
    parent TEXT,
    numbering_method TEXT,
    affects_stock BOOLEAN DEFAULT FALSE,
    is_deemed_positive BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, division_id, tally_guid)
);

-- Main Voucher/Transaction Table
CREATE TABLE vt.vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES vt.companies(id) ON DELETE CASCADE,
    division_id UUID REFERENCES vt.divisions(id) ON DELETE CASCADE,
    voucher_type_id UUID REFERENCES vt.voucher_types(id) ON DELETE SET NULL,
    tally_guid TEXT,
    
    -- Voucher Identification
    voucher_number TEXT,
    voucher_number_prefix TEXT,
    voucher_number_suffix TEXT,
    reference TEXT,
    
    -- Dates
    voucher_date DATE NOT NULL,
    due_date DATE,
    
    -- Amounts
    basic_amount DECIMAL(15,4) DEFAULT 0,
    discount_amount DECIMAL(15,4) DEFAULT 0,
    tax_amount DECIMAL(15,4) DEFAULT 0,
    total_amount DECIMAL(15,4) DEFAULT 0,
    final_amount DECIMAL(15,4) DEFAULT 0,
    
    -- Currency
    currency TEXT DEFAULT 'INR',
    exchange_rate DECIMAL(10,6) DEFAULT 1,
    
    -- Additional Information
    narration TEXT,
    party_ledger_name TEXT,
    order_reference TEXT,
    consignment_note TEXT,
    receipt_reference TEXT,
    
    -- Status
    is_cancelled BOOLEAN DEFAULT FALSE,
    is_optional BOOLEAN DEFAULT FALSE,
    
    -- Audit
    altered_by TEXT,
    altered_on TIMESTAMPTZ,
    alter_id BIGINT DEFAULT 0,
    persisted_view INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, division_id, tally_guid)
);

-- Accounting Entries (Double Entry)
CREATE TABLE vt.ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES vt.companies(id) ON DELETE CASCADE,
    division_id UUID REFERENCES vt.divisions(id) ON DELETE CASCADE,
    voucher_id UUID NOT NULL REFERENCES vt.vouchers(id) ON DELETE CASCADE,
    ledger_id UUID REFERENCES vt.ledgers(id) ON DELETE SET NULL,
    cost_centre_id UUID REFERENCES vt.cost_centres(id) ON DELETE SET NULL,
    cost_category_id UUID REFERENCES vt.cost_categories(id) ON DELETE SET NULL,
    tally_guid TEXT,
    
    -- Entry Details
    ledger_name TEXT NOT NULL, -- Denormalized for performance
    amount DECIMAL(15,4) NOT NULL,
    amount_forex DECIMAL(15,4) DEFAULT 0,
    currency TEXT DEFAULT 'INR',
    
    -- Entry Classification
    is_party_ledger BOOLEAN DEFAULT FALSE,
    is_deemed_positive BOOLEAN DEFAULT FALSE,
    
    -- Bill Allocations
    bill_allocations JSONB,
    amount_cleared DECIMAL(15,4) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, division_id, tally_guid)
);

-- Inventory Entries
CREATE TABLE vt.inventory_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES vt.companies(id) ON DELETE CASCADE,
    division_id UUID REFERENCES vt.divisions(id) ON DELETE CASCADE,
    voucher_id UUID NOT NULL REFERENCES vt.vouchers(id) ON DELETE CASCADE,
    stock_item_id UUID REFERENCES vt.stock_items(id) ON DELETE SET NULL,
    godown_id UUID REFERENCES vt.godowns(id) ON DELETE SET NULL,
    tally_guid TEXT,
    
    -- Item Details
    stock_item_name TEXT NOT NULL, -- Denormalized for performance
    
    -- Quantities
    actual_quantity DECIMAL(15,6) DEFAULT 0,
    billed_quantity DECIMAL(15,6) DEFAULT 0,
    
    -- Rates and Amounts
    rate DECIMAL(15,4) DEFAULT 0,
    amount DECIMAL(15,4) DEFAULT 0,
    discount_percent DECIMAL(5,4) DEFAULT 0,
    discount_amount DECIMAL(15,4) DEFAULT 0,
    
    -- Batch Information
    batch_name TEXT,
    batch_serial_number TEXT,
    manufactured_date DATE,
    expiry_date DATE,
    
    -- Tracking
    tracking_number TEXT,
    additional_details JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, division_id, tally_guid)
);

-- Address Details for Vouchers
CREATE TABLE vt.address_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES vt.companies(id) ON DELETE CASCADE,
    division_id UUID REFERENCES vt.divisions(id) ON DELETE CASCADE,
    voucher_id UUID NOT NULL REFERENCES vt.vouchers(id) ON DELETE CASCADE,
    tally_guid TEXT,
    
    address_type TEXT NOT NULL, -- 'billing', 'shipping', etc.
    contact_person TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    address_line3 TEXT,
    address_line4 TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    pincode TEXT,
    phone TEXT,
    email TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bank/Payment Details
CREATE TABLE vt.bank_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES vt.companies(id) ON DELETE CASCADE,
    division_id UUID REFERENCES vt.divisions(id) ON DELETE CASCADE,
    voucher_id UUID NOT NULL REFERENCES vt.vouchers(id) ON DELETE CASCADE,
    ledger_id UUID REFERENCES vt.ledgers(id) ON DELETE SET NULL,
    tally_guid TEXT,
    
    transaction_type TEXT,
    bank_name TEXT,
    instrument_number TEXT,
    instrument_date DATE,
    bankers_date DATE,
    amount DECIMAL(15,4) NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Indexes for Performance
CREATE INDEX idx_vt_divisions_company_id ON vt.divisions(company_id);
CREATE INDEX idx_vt_groups_company_division ON vt.groups(company_id, division_id);
CREATE INDEX idx_vt_groups_parent_id ON vt.groups(parent_id);
CREATE INDEX idx_vt_ledgers_company_division ON vt.ledgers(company_id, division_id);
CREATE INDEX idx_vt_ledgers_group_id ON vt.ledgers(group_id);
CREATE INDEX idx_vt_ledgers_name ON vt.ledgers(name);
CREATE INDEX idx_vt_stock_items_company_division ON vt.stock_items(company_id, division_id);
CREATE INDEX idx_vt_stock_items_group_id ON vt.stock_items(stock_group_id);
CREATE INDEX idx_vt_vouchers_company_division ON vt.vouchers(company_id, division_id);
CREATE INDEX idx_vt_vouchers_date ON vt.vouchers(voucher_date);
CREATE INDEX idx_vt_vouchers_type_id ON vt.vouchers(voucher_type_id);
CREATE INDEX idx_vt_ledger_entries_voucher_id ON vt.ledger_entries(voucher_id);
CREATE INDEX idx_vt_ledger_entries_ledger_id ON vt.ledger_entries(ledger_id);
CREATE INDEX idx_vt_ledger_entries_company_division ON vt.ledger_entries(company_id, division_id);
CREATE INDEX idx_vt_inventory_entries_voucher_id ON vt.inventory_entries(voucher_id);
CREATE INDEX idx_vt_inventory_entries_stock_item_id ON vt.inventory_entries(stock_item_id);
CREATE INDEX idx_vt_inventory_entries_company_division ON vt.inventory_entries(company_id, division_id);

-- Enable RLS on all tables
ALTER TABLE vt.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE vt.divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vt.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE vt.ledgers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vt.units_of_measure ENABLE ROW LEVEL SECURITY;
ALTER TABLE vt.stock_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE vt.stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vt.godowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE vt.cost_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE vt.cost_centres ENABLE ROW LEVEL SECURITY;
ALTER TABLE vt.voucher_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE vt.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vt.ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE vt.inventory_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE vt.address_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE vt.bank_details ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for Multi-tenancy
-- Companies: Users can only see companies they have access to
CREATE POLICY "Users can access companies they belong to" ON vt.companies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.company_id = vt.companies.id
        )
    );

-- Divisions: Users can only see divisions of companies they have access to
CREATE POLICY "Users can access divisions of their companies" ON vt.divisions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.company_id = vt.divisions.company_id
            AND (ur.division_id = vt.divisions.id OR ur.division_id IS NULL)
        )
    );

-- Generic multi-tenant policy for all other tables
CREATE POLICY "Multi-tenant access for groups" ON vt.groups
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.company_id = vt.groups.company_id
            AND (ur.division_id = vt.groups.division_id OR ur.division_id IS NULL)
        )
    );

CREATE POLICY "Multi-tenant access for ledgers" ON vt.ledgers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.company_id = vt.ledgers.company_id
            AND (ur.division_id = vt.ledgers.division_id OR ur.division_id IS NULL)
        )
    );

CREATE POLICY "Multi-tenant access for units_of_measure" ON vt.units_of_measure
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.company_id = vt.units_of_measure.company_id
            AND (ur.division_id = vt.units_of_measure.division_id OR ur.division_id IS NULL)
        )
    );

CREATE POLICY "Multi-tenant access for stock_groups" ON vt.stock_groups
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.company_id = vt.stock_groups.company_id
            AND (ur.division_id = vt.stock_groups.division_id OR ur.division_id IS NULL)
        )
    );

CREATE POLICY "Multi-tenant access for stock_items" ON vt.stock_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.company_id = vt.stock_items.company_id
            AND (ur.division_id = vt.stock_items.division_id OR ur.division_id IS NULL)
        )
    );

CREATE POLICY "Multi-tenant access for godowns" ON vt.godowns
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.company_id = vt.godowns.company_id
            AND (ur.division_id = vt.godowns.division_id OR ur.division_id IS NULL)
        )
    );

CREATE POLICY "Multi-tenant access for cost_categories" ON vt.cost_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.company_id = vt.cost_categories.company_id
            AND (ur.division_id = vt.cost_categories.division_id OR ur.division_id IS NULL)
        )
    );

CREATE POLICY "Multi-tenant access for cost_centres" ON vt.cost_centres
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.company_id = vt.cost_centres.company_id
            AND (ur.division_id = vt.cost_centres.division_id OR ur.division_id IS NULL)
        )
    );

CREATE POLICY "Multi-tenant access for voucher_types" ON vt.voucher_types
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.company_id = vt.voucher_types.company_id
            AND (ur.division_id = vt.voucher_types.division_id OR ur.division_id IS NULL)
        )
    );

CREATE POLICY "Multi-tenant access for vouchers" ON vt.vouchers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.company_id = vt.vouchers.company_id
            AND (ur.division_id = vt.vouchers.division_id OR ur.division_id IS NULL)
        )
    );

CREATE POLICY "Multi-tenant access for ledger_entries" ON vt.ledger_entries
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.company_id = vt.ledger_entries.company_id
            AND (ur.division_id = vt.ledger_entries.division_id OR ur.division_id IS NULL)
        )
    );

CREATE POLICY "Multi-tenant access for inventory_entries" ON vt.inventory_entries
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.company_id = vt.inventory_entries.company_id
            AND (ur.division_id = vt.inventory_entries.division_id OR ur.division_id IS NULL)
        )
    );

CREATE POLICY "Multi-tenant access for address_details" ON vt.address_details
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.company_id = vt.address_details.company_id
            AND (ur.division_id = vt.address_details.division_id OR ur.division_id IS NULL)
        )
    );

CREATE POLICY "Multi-tenant access for bank_details" ON vt.bank_details
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.company_id = vt.bank_details.company_id
            AND (ur.division_id = vt.bank_details.division_id OR ur.division_id IS NULL)
        )
    );

-- Create updated_at triggers for all tables
CREATE OR REPLACE FUNCTION vt.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON vt.companies FOR EACH ROW EXECUTE FUNCTION vt.update_updated_at_column();
CREATE TRIGGER update_divisions_updated_at BEFORE UPDATE ON vt.divisions FOR EACH ROW EXECUTE FUNCTION vt.update_updated_at_column();
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON vt.groups FOR EACH ROW EXECUTE FUNCTION vt.update_updated_at_column();
CREATE TRIGGER update_ledgers_updated_at BEFORE UPDATE ON vt.ledgers FOR EACH ROW EXECUTE FUNCTION vt.update_updated_at_column();
CREATE TRIGGER update_units_of_measure_updated_at BEFORE UPDATE ON vt.units_of_measure FOR EACH ROW EXECUTE FUNCTION vt.update_updated_at_column();
CREATE TRIGGER update_stock_groups_updated_at BEFORE UPDATE ON vt.stock_groups FOR EACH ROW EXECUTE FUNCTION vt.update_updated_at_column();
CREATE TRIGGER update_stock_items_updated_at BEFORE UPDATE ON vt.stock_items FOR EACH ROW EXECUTE FUNCTION vt.update_updated_at_column();
CREATE TRIGGER update_godowns_updated_at BEFORE UPDATE ON vt.godowns FOR EACH ROW EXECUTE FUNCTION vt.update_updated_at_column();
CREATE TRIGGER update_cost_categories_updated_at BEFORE UPDATE ON vt.cost_categories FOR EACH ROW EXECUTE FUNCTION vt.update_updated_at_column();
CREATE TRIGGER update_cost_centres_updated_at BEFORE UPDATE ON vt.cost_centres FOR EACH ROW EXECUTE FUNCTION vt.update_updated_at_column();
CREATE TRIGGER update_voucher_types_updated_at BEFORE UPDATE ON vt.voucher_types FOR EACH ROW EXECUTE FUNCTION vt.update_updated_at_column();
CREATE TRIGGER update_vouchers_updated_at BEFORE UPDATE ON vt.vouchers FOR EACH ROW EXECUTE FUNCTION vt.update_updated_at_column();
CREATE TRIGGER update_ledger_entries_updated_at BEFORE UPDATE ON vt.ledger_entries FOR EACH ROW EXECUTE FUNCTION vt.update_updated_at_column();
CREATE TRIGGER update_inventory_entries_updated_at BEFORE UPDATE ON vt.inventory_entries FOR EACH ROW EXECUTE FUNCTION vt.update_updated_at_column();
CREATE TRIGGER update_address_details_updated_at BEFORE UPDATE ON vt.address_details FOR EACH ROW EXECUTE FUNCTION vt.update_updated_at_column();
CREATE TRIGGER update_bank_details_updated_at BEFORE UPDATE ON vt.bank_details FOR EACH ROW EXECUTE FUNCTION vt.update_updated_at_column();