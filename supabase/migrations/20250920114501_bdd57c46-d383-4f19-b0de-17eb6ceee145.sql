-- Drop existing VT schema and recreate with proper references
DROP SCHEMA IF EXISTS vt CASCADE;
CREATE SCHEMA vt;

-- VT Groups table (references public.companies/divisions)
CREATE TABLE vt.groups (
  id BIGSERIAL PRIMARY KEY,
  guid VARCHAR NOT NULL UNIQUE,
  name VARCHAR NOT NULL DEFAULT '',
  parent VARCHAR NOT NULL DEFAULT '',
  _parent VARCHAR NOT NULL DEFAULT '',
  primary_group VARCHAR NOT NULL DEFAULT '',
  is_revenue SMALLINT DEFAULT NULL,
  is_deemedpositive SMALLINT DEFAULT NULL,
  is_reserved SMALLINT DEFAULT NULL,
  affects_gross_profit SMALLINT DEFAULT NULL,
  sort_position INTEGER DEFAULT NULL,
  alterid BIGINT DEFAULT 0,
  company_id UUID REFERENCES public.companies(id),
  division_id UUID REFERENCES public.divisions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VT Ledgers table
CREATE TABLE vt.ledgers (
  id BIGSERIAL PRIMARY KEY,
  guid VARCHAR NOT NULL UNIQUE,
  name VARCHAR NOT NULL DEFAULT '',
  alias VARCHAR NOT NULL DEFAULT '',
  parent VARCHAR NOT NULL DEFAULT '',
  _parent VARCHAR NOT NULL DEFAULT '',
  description VARCHAR NOT NULL DEFAULT '',
  notes VARCHAR NOT NULL DEFAULT '',
  opening_balance NUMERIC DEFAULT 0,
  closing_balance NUMERIC DEFAULT 0,
  is_revenue SMALLINT DEFAULT NULL,
  is_deemedpositive SMALLINT DEFAULT NULL,
  alterid BIGINT DEFAULT 0,
  credit_limit NUMERIC DEFAULT 0,
  credit_days INTEGER DEFAULT 0,
  bill_credit_limit NUMERIC DEFAULT 0,
  bill_credit_period INTEGER DEFAULT 0,
  tax_rate NUMERIC DEFAULT 0,
  -- Contact details
  mailing_name VARCHAR NOT NULL DEFAULT '',
  mailing_address VARCHAR NOT NULL DEFAULT '',
  mailing_state VARCHAR NOT NULL DEFAULT '',
  mailing_country VARCHAR NOT NULL DEFAULT '',
  mailing_pincode VARCHAR NOT NULL DEFAULT '',
  email VARCHAR NOT NULL DEFAULT '',
  -- Tax details
  it_pan VARCHAR NOT NULL DEFAULT '',
  gstn VARCHAR NOT NULL DEFAULT '',
  gst_registration_type VARCHAR NOT NULL DEFAULT '',
  gst_supply_type VARCHAR NOT NULL DEFAULT '',
  gst_duty_head VARCHAR NOT NULL DEFAULT '',
  -- Bank details
  bank_account_holder VARCHAR NOT NULL DEFAULT '',
  bank_account_number VARCHAR NOT NULL DEFAULT '',
  bank_ifsc VARCHAR NOT NULL DEFAULT '',
  bank_swift VARCHAR NOT NULL DEFAULT '',
  bank_name VARCHAR NOT NULL DEFAULT '',
  bank_branch VARCHAR NOT NULL DEFAULT '',
  -- Additional tax numbers
  income_tax_number VARCHAR DEFAULT '',
  sales_tax_number VARCHAR DEFAULT '',
  excise_registration_number VARCHAR DEFAULT '',
  service_tax_number VARCHAR DEFAULT '',
  -- Contact info
  ledger_contact VARCHAR DEFAULT '',
  ledger_mobile VARCHAR DEFAULT '',
  ledger_fax VARCHAR DEFAULT '',
  ledger_website VARCHAR DEFAULT '',
  -- Business details
  buyer_category VARCHAR DEFAULT '',
  buyer_type VARCHAR DEFAULT '',
  company_id UUID REFERENCES public.companies(id),
  division_id UUID REFERENCES public.divisions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VT Stock Items table
CREATE TABLE vt.stock_items (
  id BIGSERIAL PRIMARY KEY,
  guid VARCHAR NOT NULL UNIQUE,
  name VARCHAR NOT NULL DEFAULT '',
  alias VARCHAR NOT NULL DEFAULT '',
  parent VARCHAR NOT NULL DEFAULT '',
  _parent VARCHAR NOT NULL DEFAULT '',
  description VARCHAR NOT NULL DEFAULT '',
  notes VARCHAR NOT NULL DEFAULT '',
  part_number VARCHAR NOT NULL DEFAULT '',
  uom VARCHAR NOT NULL DEFAULT '',
  _uom VARCHAR NOT NULL DEFAULT '',
  alternate_uom VARCHAR NOT NULL DEFAULT '',
  _alternate_uom VARCHAR NOT NULL DEFAULT '',
  conversion INTEGER DEFAULT 0,
  base_units VARCHAR DEFAULT '',
  additional_units VARCHAR DEFAULT '',
  opening_balance NUMERIC DEFAULT 0,
  opening_rate NUMERIC DEFAULT 0,
  opening_value NUMERIC DEFAULT 0,
  closing_balance NUMERIC DEFAULT 0,
  closing_rate NUMERIC DEFAULT 0,
  closing_value NUMERIC DEFAULT 0,
  costing_method VARCHAR NOT NULL DEFAULT '',
  minimum_level NUMERIC DEFAULT 0,
  maximum_level NUMERIC DEFAULT 0,
  reorder_level NUMERIC DEFAULT 0,
  -- GST details
  gst_taxability VARCHAR DEFAULT '',
  gst_hsn_code VARCHAR DEFAULT '',
  gst_hsn_description VARCHAR DEFAULT '',
  gst_rate NUMERIC DEFAULT 0,
  gst_type_of_supply VARCHAR DEFAULT '',
  -- Physical properties
  weight NUMERIC DEFAULT 0,
  weight_unit VARCHAR DEFAULT '',
  volume NUMERIC DEFAULT 0,
  volume_unit VARCHAR DEFAULT '',
  color VARCHAR DEFAULT '',
  size VARCHAR DEFAULT '',
  model VARCHAR DEFAULT '',
  brand VARCHAR DEFAULT '',
  manufacturer VARCHAR DEFAULT '',
  item_classification VARCHAR DEFAULT '',
  item_category VARCHAR DEFAULT '',
  shelf_life_days INTEGER DEFAULT 0,
  company_id UUID REFERENCES public.companies(id),
  division_id UUID REFERENCES public.divisions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VT Units of Measure table
CREATE TABLE vt.units_of_measure (
  id BIGSERIAL PRIMARY KEY,
  guid VARCHAR NOT NULL UNIQUE,
  name VARCHAR NOT NULL DEFAULT '',
  formalname VARCHAR NOT NULL DEFAULT '',
  is_simple_unit SMALLINT NOT NULL DEFAULT 0,
  base_units VARCHAR NOT NULL DEFAULT '',
  additional_units VARCHAR NOT NULL DEFAULT '',
  conversion INTEGER NOT NULL DEFAULT 1,
  company_id UUID REFERENCES public.companies(id),
  division_id UUID REFERENCES public.divisions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VT Cost Categories table
CREATE TABLE vt.cost_categories (
  id BIGSERIAL PRIMARY KEY,
  guid VARCHAR NOT NULL UNIQUE,
  name VARCHAR NOT NULL DEFAULT '',
  allocate_revenue SMALLINT DEFAULT NULL,
  allocate_non_revenue SMALLINT DEFAULT NULL,
  company_id UUID REFERENCES public.companies(id),
  division_id UUID REFERENCES public.divisions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VT Cost Centers table
CREATE TABLE vt.cost_centers (
  id BIGSERIAL PRIMARY KEY,
  guid VARCHAR NOT NULL UNIQUE,
  name VARCHAR NOT NULL DEFAULT '',
  parent VARCHAR NOT NULL DEFAULT '',
  _parent VARCHAR NOT NULL DEFAULT '',
  category VARCHAR NOT NULL DEFAULT '',
  company_id UUID REFERENCES public.companies(id),
  division_id UUID REFERENCES public.divisions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VT Employees table
CREATE TABLE vt.employees (
  id BIGSERIAL PRIMARY KEY,
  guid VARCHAR NOT NULL UNIQUE,
  name VARCHAR NOT NULL DEFAULT '',
  parent VARCHAR NOT NULL DEFAULT '',
  _parent VARCHAR NOT NULL DEFAULT '',
  designation VARCHAR NOT NULL DEFAULT '',
  id_number VARCHAR NOT NULL DEFAULT '',
  pr_account_number VARCHAR NOT NULL DEFAULT '',
  pf_number VARCHAR NOT NULL DEFAULT '',
  uan VARCHAR NOT NULL DEFAULT '',
  aadhar VARCHAR NOT NULL DEFAULT '',
  pan VARCHAR NOT NULL DEFAULT '',
  function_role VARCHAR NOT NULL DEFAULT '',
  gender VARCHAR NOT NULL DEFAULT '',
  date_of_birth DATE,
  date_of_joining DATE,
  date_of_release DATE,
  pf_joining_date DATE,
  pf_relieving_date DATE,
  location VARCHAR NOT NULL DEFAULT '',
  blood_group VARCHAR NOT NULL DEFAULT '',
  father_mother_name VARCHAR NOT NULL DEFAULT '',
  spouse_name VARCHAR NOT NULL DEFAULT '',
  address VARCHAR NOT NULL DEFAULT '',
  mobile VARCHAR NOT NULL DEFAULT '',
  email VARCHAR NOT NULL DEFAULT '',
  company_id UUID REFERENCES public.companies(id),
  division_id UUID REFERENCES public.divisions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VT Godowns table
CREATE TABLE vt.godowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guid VARCHAR NOT NULL UNIQUE,
  name VARCHAR NOT NULL DEFAULT '',
  parent VARCHAR NOT NULL DEFAULT '',
  _parent VARCHAR NOT NULL DEFAULT '',
  address VARCHAR NOT NULL DEFAULT '',
  godown_type VARCHAR DEFAULT '',
  storage_type VARCHAR DEFAULT '',
  capacity_unit VARCHAR DEFAULT '',
  manager_name VARCHAR DEFAULT '',
  contact_number VARCHAR DEFAULT '',
  location_code VARCHAR DEFAULT '',
  capacity NUMERIC DEFAULT 0,
  company_id UUID REFERENCES public.companies(id),
  division_id UUID REFERENCES public.divisions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VT Payheads table
CREATE TABLE vt.payheads (
  id BIGSERIAL PRIMARY KEY,
  guid VARCHAR NOT NULL UNIQUE,
  name VARCHAR NOT NULL DEFAULT '',
  payslip_name VARCHAR NOT NULL DEFAULT '',
  parent VARCHAR NOT NULL DEFAULT '',
  _parent VARCHAR NOT NULL DEFAULT '',
  pay_type VARCHAR NOT NULL DEFAULT '',
  calculation_type VARCHAR NOT NULL DEFAULT '',
  calculation_period VARCHAR NOT NULL DEFAULT '',
  leave_type VARCHAR NOT NULL DEFAULT '',
  income_type VARCHAR NOT NULL DEFAULT '',
  company_id UUID REFERENCES public.companies(id),
  division_id UUID REFERENCES public.divisions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VT Voucher Types table
CREATE TABLE vt.voucher_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guid VARCHAR NOT NULL UNIQUE,
  name VARCHAR NOT NULL DEFAULT '',
  parent VARCHAR NOT NULL DEFAULT '',
  _parent VARCHAR NOT NULL DEFAULT '',
  numbering_method VARCHAR NOT NULL DEFAULT '',
  affects_stock SMALLINT DEFAULT NULL,
  is_deemedpositive SMALLINT DEFAULT NULL,
  company_id UUID REFERENCES public.companies(id),
  division_id UUID REFERENCES public.divisions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VT Vouchers table
CREATE TABLE vt.vouchers (
  id BIGSERIAL PRIMARY KEY,
  guid VARCHAR NOT NULL UNIQUE,
  voucher_number VARCHAR,
  voucher_number_prefix VARCHAR DEFAULT '',
  voucher_number_suffix VARCHAR DEFAULT '',
  voucher_type VARCHAR,
  date DATE,
  due_date DATE,
  reference VARCHAR DEFAULT '',
  currency VARCHAR DEFAULT 'INR',
  exchange_rate NUMERIC DEFAULT 1.0000,
  party_ledger_name VARCHAR DEFAULT '',
  order_reference VARCHAR DEFAULT '',
  consignment_note VARCHAR DEFAULT '',
  receipt_reference VARCHAR DEFAULT '',
  narration TEXT,
  basic_amount NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  net_amount NUMERIC DEFAULT 0,
  final_amount NUMERIC DEFAULT 0,
  is_cancelled SMALLINT DEFAULT 0,
  is_optional SMALLINT DEFAULT 0,
  altered_by VARCHAR DEFAULT '',
  altered_on TIMESTAMP,
  alterid BIGINT DEFAULT 0,
  persistedview INTEGER DEFAULT 0,
  company_id UUID REFERENCES public.companies(id),
  division_id UUID REFERENCES public.divisions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VT Ledger Entries table
CREATE TABLE vt.ledger_entries (
  id BIGSERIAL PRIMARY KEY,
  guid VARCHAR NOT NULL DEFAULT '',
  voucher_guid VARCHAR DEFAULT '',
  voucher_number VARCHAR DEFAULT '',
  voucher_type VARCHAR DEFAULT '',
  voucher_date DATE,
  ledger VARCHAR NOT NULL DEFAULT '',
  _ledger VARCHAR NOT NULL DEFAULT '',
  amount NUMERIC NOT NULL DEFAULT 0,
  amount_forex NUMERIC NOT NULL DEFAULT 0,
  currency VARCHAR NOT NULL DEFAULT 'INR',
  is_deemed_positive SMALLINT DEFAULT 0,
  is_party_ledger SMALLINT DEFAULT 0,
  cost_centre VARCHAR DEFAULT '',
  cost_category VARCHAR DEFAULT '',
  bill_allocations TEXT DEFAULT '',
  amount_cleared NUMERIC DEFAULT 0,
  alterid BIGINT DEFAULT 0,
  company_id UUID REFERENCES public.companies(id),
  division_id UUID REFERENCES public.divisions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VT Inventory Entries table
CREATE TABLE vt.inventory_entries (
  id BIGSERIAL PRIMARY KEY,
  guid VARCHAR NOT NULL DEFAULT '',
  voucher_guid VARCHAR DEFAULT '',
  voucher_number VARCHAR DEFAULT '',
  voucher_type VARCHAR DEFAULT '',
  voucher_date DATE,
  item VARCHAR NOT NULL DEFAULT '',
  _item VARCHAR NOT NULL DEFAULT '',
  name VARCHAR NOT NULL DEFAULT '',
  godown VARCHAR DEFAULT '',
  _godown VARCHAR NOT NULL DEFAULT '',
  destination_godown VARCHAR DEFAULT '',
  _destination_godown VARCHAR NOT NULL DEFAULT '',
  tracking_number VARCHAR DEFAULT '',
  batch_serial_number VARCHAR DEFAULT '',
  quantity NUMERIC NOT NULL DEFAULT 0,
  rate NUMERIC DEFAULT 0,
  amount NUMERIC NOT NULL DEFAULT 0,
  actual_quantity NUMERIC DEFAULT 0,
  billed_quantity NUMERIC DEFAULT 0,
  discount_percent NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  manufactured_date DATE,
  expiry_date DATE,
  additional_details TEXT DEFAULT '',
  company_id UUID REFERENCES public.companies(id),
  division_id UUID REFERENCES public.divisions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VT Address Details table
CREATE TABLE vt.address_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guid VARCHAR NOT NULL DEFAULT '',
  voucher_guid VARCHAR NOT NULL DEFAULT '',
  address_type VARCHAR NOT NULL DEFAULT '',
  contact_person VARCHAR NOT NULL DEFAULT '',
  email VARCHAR NOT NULL DEFAULT '',
  phone VARCHAR NOT NULL DEFAULT '',
  address_line1 TEXT NOT NULL DEFAULT '',
  address_line2 TEXT NOT NULL DEFAULT '',
  address_line3 TEXT NOT NULL DEFAULT '',
  address_line4 TEXT NOT NULL DEFAULT '',
  city VARCHAR NOT NULL DEFAULT '',
  state VARCHAR NOT NULL DEFAULT '',
  country VARCHAR NOT NULL DEFAULT '',
  pincode VARCHAR NOT NULL DEFAULT '',
  company_id UUID REFERENCES public.companies(id),
  division_id UUID REFERENCES public.divisions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all VT tables
ALTER TABLE vt.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE vt.ledgers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vt.stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vt.units_of_measure ENABLE ROW LEVEL SECURITY;
ALTER TABLE vt.cost_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE vt.cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vt.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE vt.godowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE vt.payheads ENABLE ROW LEVEL SECURITY;
ALTER TABLE vt.voucher_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE vt.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vt.ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE vt.inventory_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE vt.address_details ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Authenticated users can access VT groups" ON vt.groups FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can access VT ledgers" ON vt.ledgers FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can access VT stock items" ON vt.stock_items FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can access VT units of measure" ON vt.units_of_measure FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can access VT cost categories" ON vt.cost_categories FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can access VT cost centers" ON vt.cost_centers FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can access VT employees" ON vt.employees FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can access VT godowns" ON vt.godowns FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can access VT payheads" ON vt.payheads FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can access VT voucher types" ON vt.voucher_types FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can access VT vouchers" ON vt.vouchers FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can access VT ledger entries" ON vt.ledger_entries FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can access VT inventory entries" ON vt.inventory_entries FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can access VT address details" ON vt.address_details FOR ALL USING (auth.uid() IS NOT NULL);

-- Create indexes for performance
CREATE INDEX idx_vt_groups_company_division ON vt.groups(company_id, division_id);
CREATE INDEX idx_vt_ledgers_company_division ON vt.ledgers(company_id, division_id);
CREATE INDEX idx_vt_stock_items_company_division ON vt.stock_items(company_id, division_id);
CREATE INDEX idx_vt_vouchers_company_division ON vt.vouchers(company_id, division_id);
CREATE INDEX idx_vt_ledger_entries_company_division ON vt.ledger_entries(company_id, division_id);
CREATE INDEX idx_vt_inventory_entries_company_division ON vt.inventory_entries(company_id, division_id);