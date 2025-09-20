-- Create missing transaction tables for complete Tally XML data capture

-- Party/Customer Details Table
CREATE TABLE public.trn_party_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guid VARCHAR(64) NOT NULL,
  voucher_guid VARCHAR(64) NOT NULL,
  company_id UUID,
  division_id UUID,
  party_name VARCHAR(255) NOT NULL DEFAULT '',
  party_ledger_name VARCHAR(255) NOT NULL DEFAULT '',
  gstin VARCHAR(15) NOT NULL DEFAULT '',
  party_address TEXT NOT NULL DEFAULT '',
  party_state VARCHAR(100) NOT NULL DEFAULT '',
  party_pincode VARCHAR(10) NOT NULL DEFAULT '',
  party_country VARCHAR(100) NOT NULL DEFAULT '',
  place_of_supply VARCHAR(100) NOT NULL DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- GST/Tax Details Table
CREATE TABLE public.trn_gst_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guid VARCHAR(64) NOT NULL,
  voucher_guid VARCHAR(64) NOT NULL,
  company_id UUID,
  division_id UUID,
  gst_class VARCHAR(50) NOT NULL DEFAULT '',
  hsn_code VARCHAR(20) NOT NULL DEFAULT '',
  hsn_description TEXT NOT NULL DEFAULT '',
  taxable_amount NUMERIC(15,2) DEFAULT 0,
  igst_amount NUMERIC(15,2) DEFAULT 0,
  cgst_amount NUMERIC(15,2) DEFAULT 0,
  sgst_amount NUMERIC(15,2) DEFAULT 0,
  cess_amount NUMERIC(15,2) DEFAULT 0,
  igst_rate NUMERIC(5,2) DEFAULT 0,
  cgst_rate NUMERIC(5,2) DEFAULT 0,
  sgst_rate NUMERIC(5,2) DEFAULT 0,
  cess_rate NUMERIC(5,2) DEFAULT 0,
  gst_registration_type VARCHAR(50) NOT NULL DEFAULT '',
  reverse_charge_applicable SMALLINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Address Details Table
CREATE TABLE public.trn_address_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guid VARCHAR(64) NOT NULL,
  voucher_guid VARCHAR(64) NOT NULL,
  company_id UUID,
  division_id UUID,
  address_type VARCHAR(50) NOT NULL DEFAULT '', -- billing, shipping, etc.
  address_line1 TEXT NOT NULL DEFAULT '',
  address_line2 TEXT NOT NULL DEFAULT '',
  address_line3 TEXT NOT NULL DEFAULT '',
  address_line4 TEXT NOT NULL DEFAULT '',
  city VARCHAR(100) NOT NULL DEFAULT '',
  state VARCHAR(100) NOT NULL DEFAULT '',
  pincode VARCHAR(10) NOT NULL DEFAULT '',
  country VARCHAR(100) NOT NULL DEFAULT '',
  contact_person VARCHAR(255) NOT NULL DEFAULT '',
  phone VARCHAR(20) NOT NULL DEFAULT '',
  email VARCHAR(255) NOT NULL DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shipping Details Table
CREATE TABLE public.trn_shipping_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guid VARCHAR(64) NOT NULL,
  voucher_guid VARCHAR(64) NOT NULL,
  company_id UUID,
  division_id UUID,
  consignee_name VARCHAR(255) NOT NULL DEFAULT '',
  consignee_address TEXT NOT NULL DEFAULT '',
  consignee_state VARCHAR(100) NOT NULL DEFAULT '',
  consignee_pincode VARCHAR(10) NOT NULL DEFAULT '',
  consignee_country VARCHAR(100) NOT NULL DEFAULT '',
  buyer_name VARCHAR(255) NOT NULL DEFAULT '',
  buyer_address TEXT NOT NULL DEFAULT '',
  buyer_state VARCHAR(100) NOT NULL DEFAULT '',
  dispatch_state VARCHAR(100) NOT NULL DEFAULT '',
  ship_to_state VARCHAR(100) NOT NULL DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Category Allocation Table
CREATE TABLE public.trn_category_allocation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guid VARCHAR(64) NOT NULL,
  voucher_guid VARCHAR(64) NOT NULL,
  company_id UUID,
  division_id UUID,
  cost_category VARCHAR(255) NOT NULL DEFAULT '',
  cost_centre VARCHAR(255) NOT NULL DEFAULT '',
  allocation_amount NUMERIC(15,2) DEFAULT 0,
  allocation_percentage NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Due Date Information Table
CREATE TABLE public.trn_due_date (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guid VARCHAR(64) NOT NULL,
  voucher_guid VARCHAR(64) NOT NULL,
  company_id UUID,
  division_id UUID,
  bill_name VARCHAR(255) NOT NULL DEFAULT '',
  due_date DATE,
  overdue_days INTEGER DEFAULT 0,
  credit_period INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tax Details Table
CREATE TABLE public.trn_tax_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guid VARCHAR(64) NOT NULL,
  voucher_guid VARCHAR(64) NOT NULL,
  company_id UUID,
  division_id UUID,
  tax_name VARCHAR(255) NOT NULL DEFAULT '',
  tax_type VARCHAR(50) NOT NULL DEFAULT '',
  tax_rate NUMERIC(5,2) DEFAULT 0,
  tax_amount NUMERIC(15,2) DEFAULT 0,
  tax_ledger VARCHAR(255) NOT NULL DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reference Information Table
CREATE TABLE public.trn_reference (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guid VARCHAR(64) NOT NULL,
  voucher_guid VARCHAR(64) NOT NULL,
  company_id UUID,
  division_id UUID,
  reference_name VARCHAR(255) NOT NULL DEFAULT '',
  reference_number VARCHAR(100) NOT NULL DEFAULT '',
  reference_date DATE,
  reference_amount NUMERIC(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add missing columns to existing tally_trn_voucher table
ALTER TABLE public.tally_trn_voucher 
ADD COLUMN IF NOT EXISTS voucher_number_prefix VARCHAR(20) DEFAULT '',
ADD COLUMN IF NOT EXISTS voucher_number_suffix VARCHAR(20) DEFAULT '',
ADD COLUMN IF NOT EXISTS reference VARCHAR(255) DEFAULT '',
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR',
ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC(10,4) DEFAULT 1.0000,
ADD COLUMN IF NOT EXISTS party_ledger_name VARCHAR(255) DEFAULT '',
ADD COLUMN IF NOT EXISTS order_reference VARCHAR(255) DEFAULT '',
ADD COLUMN IF NOT EXISTS consignment_note VARCHAR(255) DEFAULT '',
ADD COLUMN IF NOT EXISTS receipt_reference VARCHAR(255) DEFAULT '',
ADD COLUMN IF NOT EXISTS basic_amount NUMERIC(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_amount NUMERIC(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_amount NUMERIC(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS final_amount NUMERIC(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_cancelled SMALLINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_optional SMALLINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS altered_by VARCHAR(255) DEFAULT '',
ADD COLUMN IF NOT EXISTS altered_on TIMESTAMP,
ADD COLUMN IF NOT EXISTS persistedview INTEGER DEFAULT 0;

-- Add missing columns to existing trn_accounting table
ALTER TABLE public.trn_accounting 
ADD COLUMN IF NOT EXISTS voucher_guid VARCHAR(64) DEFAULT '',
ADD COLUMN IF NOT EXISTS voucher_type VARCHAR(100) DEFAULT '',
ADD COLUMN IF NOT EXISTS voucher_number VARCHAR(100) DEFAULT '',
ADD COLUMN IF NOT EXISTS voucher_date DATE,
ADD COLUMN IF NOT EXISTS is_party_ledger SMALLINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_deemed_positive SMALLINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS amount_cleared NUMERIC(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS bill_allocations TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS cost_category VARCHAR(255) DEFAULT '',
ADD COLUMN IF NOT EXISTS cost_centre VARCHAR(255) DEFAULT '';

-- Add missing columns to existing trn_batch table (inventory)
ALTER TABLE public.trn_batch 
ADD COLUMN IF NOT EXISTS voucher_guid VARCHAR(64) DEFAULT '',
ADD COLUMN IF NOT EXISTS voucher_type VARCHAR(100) DEFAULT '',
ADD COLUMN IF NOT EXISTS voucher_number VARCHAR(100) DEFAULT '',
ADD COLUMN IF NOT EXISTS voucher_date DATE,
ADD COLUMN IF NOT EXISTS rate NUMERIC(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_percent NUMERIC(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS actual_quantity NUMERIC(15,4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS billed_quantity NUMERIC(15,4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS additional_details TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS batch_serial_number VARCHAR(255) DEFAULT '',
ADD COLUMN IF NOT EXISTS expiry_date DATE,
ADD COLUMN IF NOT EXISTS manufactured_date DATE;

-- Add missing columns to master tables

-- Add columns to mst_ledger
ALTER TABLE public.mst_ledger 
ADD COLUMN IF NOT EXISTS income_tax_number VARCHAR(50) DEFAULT '',
ADD COLUMN IF NOT EXISTS sales_tax_number VARCHAR(50) DEFAULT '',
ADD COLUMN IF NOT EXISTS excise_registration_number VARCHAR(50) DEFAULT '',
ADD COLUMN IF NOT EXISTS service_tax_number VARCHAR(50) DEFAULT '',
ADD COLUMN IF NOT EXISTS buyer_type VARCHAR(50) DEFAULT '',
ADD COLUMN IF NOT EXISTS buyer_category VARCHAR(50) DEFAULT '',
ADD COLUMN IF NOT EXISTS ledger_contact VARCHAR(100) DEFAULT '',
ADD COLUMN IF NOT EXISTS ledger_mobile VARCHAR(20) DEFAULT '',
ADD COLUMN IF NOT EXISTS ledger_fax VARCHAR(20) DEFAULT '',
ADD COLUMN IF NOT EXISTS ledger_website VARCHAR(255) DEFAULT '',
ADD COLUMN IF NOT EXISTS credit_limit NUMERIC(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS credit_days INTEGER DEFAULT 0;

-- Add columns to mst_stock_item  
ALTER TABLE public.mst_stock_item 
ADD COLUMN IF NOT EXISTS item_category VARCHAR(100) DEFAULT '',
ADD COLUMN IF NOT EXISTS item_classification VARCHAR(100) DEFAULT '',
ADD COLUMN IF NOT EXISTS manufacturer VARCHAR(255) DEFAULT '',
ADD COLUMN IF NOT EXISTS brand VARCHAR(255) DEFAULT '',
ADD COLUMN IF NOT EXISTS model VARCHAR(255) DEFAULT '',
ADD COLUMN IF NOT EXISTS size VARCHAR(100) DEFAULT '',
ADD COLUMN IF NOT EXISTS color VARCHAR(100) DEFAULT '',
ADD COLUMN IF NOT EXISTS weight NUMERIC(10,4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS weight_unit VARCHAR(20) DEFAULT '',
ADD COLUMN IF NOT EXISTS volume NUMERIC(10,4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS volume_unit VARCHAR(20) DEFAULT '',
ADD COLUMN IF NOT EXISTS minimum_level NUMERIC(15,4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS maximum_level NUMERIC(15,4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS reorder_level NUMERIC(15,4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS shelf_life_days INTEGER DEFAULT 0;

-- Add columns to mst_godown
ALTER TABLE public.mst_godown 
ADD COLUMN IF NOT EXISTS godown_type VARCHAR(50) DEFAULT '',
ADD COLUMN IF NOT EXISTS storage_type VARCHAR(50) DEFAULT '',
ADD COLUMN IF NOT EXISTS capacity NUMERIC(15,4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS capacity_unit VARCHAR(20) DEFAULT '',
ADD COLUMN IF NOT EXISTS location_code VARCHAR(50) DEFAULT '',
ADD COLUMN IF NOT EXISTS manager_name VARCHAR(255) DEFAULT '',
ADD COLUMN IF NOT EXISTS contact_number VARCHAR(20) DEFAULT '';

-- Enable RLS on all new tables
ALTER TABLE public.trn_party_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trn_gst_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trn_address_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trn_shipping_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trn_category_allocation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trn_due_date ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trn_tax_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trn_reference ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Allow authenticated users full access" ON public.trn_party_details FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users full access" ON public.trn_gst_details FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users full access" ON public.trn_address_details FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users full access" ON public.trn_shipping_details FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users full access" ON public.trn_category_allocation FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users full access" ON public.trn_due_date FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users full access" ON public.trn_tax_details FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users full access" ON public.trn_reference FOR ALL USING (auth.uid() IS NOT NULL);

-- Create indexes for better performance
CREATE INDEX idx_trn_party_details_voucher_guid ON public.trn_party_details(voucher_guid);
CREATE INDEX idx_trn_party_details_company_division ON public.trn_party_details(company_id, division_id);

CREATE INDEX idx_trn_gst_details_voucher_guid ON public.trn_gst_details(voucher_guid);
CREATE INDEX idx_trn_gst_details_company_division ON public.trn_gst_details(company_id, division_id);

CREATE INDEX idx_trn_address_details_voucher_guid ON public.trn_address_details(voucher_guid);
CREATE INDEX idx_trn_address_details_company_division ON public.trn_address_details(company_id, division_id);

CREATE INDEX idx_trn_shipping_details_voucher_guid ON public.trn_shipping_details(voucher_guid);
CREATE INDEX idx_trn_shipping_details_company_division ON public.trn_shipping_details(company_id, division_id);

CREATE INDEX idx_trn_category_allocation_voucher_guid ON public.trn_category_allocation(voucher_guid);
CREATE INDEX idx_trn_category_allocation_company_division ON public.trn_category_allocation(company_id, division_id);

CREATE INDEX idx_trn_due_date_voucher_guid ON public.trn_due_date(voucher_guid);
CREATE INDEX idx_trn_due_date_company_division ON public.trn_due_date(company_id, division_id);

CREATE INDEX idx_trn_tax_details_voucher_guid ON public.trn_tax_details(voucher_guid);
CREATE INDEX idx_trn_tax_details_company_division ON public.trn_tax_details(company_id, division_id);

CREATE INDEX idx_trn_reference_voucher_guid ON public.trn_reference(voucher_guid);
CREATE INDEX idx_trn_reference_company_division ON public.trn_reference(company_id, division_id);