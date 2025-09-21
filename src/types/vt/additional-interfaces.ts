/**
 * Additional VT Interfaces
 * 
 * Additional interfaces for VT system that are referenced but missing
 * Generated on: 2025-09-21
 */

export interface VtAddressList {
  id: number;
  address_type?: string;
  address_line1?: string;
  address_line2?: string;
  address_line3?: string;
  address_line4?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  voucher_guid?: string;
  guid?: string;
  created_at?: string;
  updated_at?: string;
  company_id: string;
  division_id: string;
}

export interface VtAddressListInsert {
  id?: number;
  address_type?: string;
  address_line1?: string;
  address_line2?: string;
  address_line3?: string;
  address_line4?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  voucher_guid?: string;
  guid?: string;
  created_at?: string;
  updated_at?: string;
  company_id?: string;
  division_id?: string;
}

export interface VtAddressListUpdate {
  id?: number;
  address_type?: string;
  address_line1?: string;
  address_line2?: string;
  address_line3?: string;
  address_line4?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  voucher_guid?: string;
  guid?: string;
  created_at?: string;
  updated_at?: string;
  company_id?: string;
  division_id?: string;
}

export interface VtGstdetailsList {
  id: number;
  gst_type?: string;
  gst_rate?: number;
  gst_amount?: number;
  cgst_amount?: number;
  sgst_amount?: number;
  igst_amount?: number;
  cess_amount?: number;
  voucher_guid?: string;
  ledger_name?: string;
  item_name?: string;
  created_at?: string;
  updated_at?: string;
  company_id: string;
  division_id: string;
}

export interface VtGstdetailsListInsert {
  id?: number;
  gst_type?: string;
  gst_rate?: number;
  gst_amount?: number;
  cgst_amount?: number;
  sgst_amount?: number;
  igst_amount?: number;
  cess_amount?: number;
  voucher_guid?: string;
  ledger_name?: string;
  item_name?: string;
  created_at?: string;
  updated_at?: string;
  company_id?: string;
  division_id?: string;
}

export interface VtGstdetailsListUpdate {
  id?: number;
  gst_type?: string;
  gst_rate?: number;
  gst_amount?: number;
  cgst_amount?: number;
  sgst_amount?: number;
  igst_amount?: number;
  cess_amount?: number;
  voucher_guid?: string;
  ledger_name?: string;
  item_name?: string;
  created_at?: string;
  updated_at?: string;
  company_id?: string;
  division_id?: string;
}

export interface VtBillallocationsList {
  id: number;
  bill_name?: string;
  bill_type?: string;
  bill_amount?: number;
  bill_date?: string;
  bill_credit_period?: number;
  ledger_name?: string;
  voucher_guid?: string;
  created_at?: string;
  updated_at?: string;
  company_id: string;
  division_id: string;
}

export interface VtBillallocationsListInsert {
  id?: number;
  bill_name?: string;
  bill_type?: string;
  bill_amount?: number;
  bill_date?: string;
  bill_credit_period?: number;
  ledger_name?: string;
  voucher_guid?: string;
  created_at?: string;
  updated_at?: string;
  company_id?: string;
  division_id?: string;
}

export interface VtBillallocationsListUpdate {
  id?: number;
  bill_name?: string;
  bill_type?: string;
  bill_amount?: number;
  bill_date?: string;
  bill_credit_period?: number;
  ledger_name?: string;
  voucher_guid?: string;
  created_at?: string;
  updated_at?: string;
  company_id?: string;
  division_id?: string;
}

// Complete interface definitions for all other VT tables
export interface VtCostcategory {
  id: number;
  name?: string;
  allocate_revenue?: number;
  allocate_non_revenue?: number;
  guid?: string;
  created_at?: string;
  updated_at?: string;
  company_id: string;
  division_id: string;
}

export interface VtCostcategoryInsert {
  id?: number;
  name?: string;
  allocate_revenue?: number;
  allocate_non_revenue?: number;
  guid?: string;
  created_at?: string;
  updated_at?: string;
  company_id?: string;
  division_id?: string;
}

export interface VtCostcategoryUpdate {
  id?: number;
  name?: string;
  allocate_revenue?: number;
  allocate_non_revenue?: number;
  guid?: string;
  created_at?: string;
  updated_at?: string;
  company_id?: string;
  division_id?: string;
}

export interface VtIncometaxclassification {
  id: number;
  name?: string;
  classification_type?: string;
  rate?: number;
  guid?: string;
  created_at?: string;
  updated_at?: string;
  company_id: string;
  division_id: string;
}

export interface VtIncometaxclassificationInsert {
  id?: number;
  name?: string;
  classification_type?: string;
  rate?: number;
  guid?: string;
  created_at?: string;
  updated_at?: string;
  company_id?: string;
  division_id?: string;
}

export interface VtIncometaxclassificationUpdate {
  id?: number;
  name?: string;
  classification_type?: string;
  rate?: number;
  guid?: string;
  created_at?: string;
  updated_at?: string;
  company_id?: string;
  division_id?: string;
}

export interface VtIncometaxslab {
  id: number;
  name?: string;
  slab_type?: string;
  rate?: number;
  minimum_amount?: number;
  maximum_amount?: number;
  guid?: string;
  created_at?: string;
  updated_at?: string;
  company_id: string;
  division_id: string;
}

export interface VtIncometaxslabInsert {
  id?: number;
  name?: string;
  slab_type?: string;
  rate?: number;
  minimum_amount?: number;
  maximum_amount?: number;
  guid?: string;
  created_at?: string;
  updated_at?: string;
  company_id?: string;
  division_id?: string;
}

export interface VtIncometaxslabUpdate {
  id?: number;
  name?: string;
  slab_type?: string;
  rate?: number;
  minimum_amount?: number;
  maximum_amount?: number;
  guid?: string;
  created_at?: string;
  updated_at?: string;
  company_id?: string;
  division_id?: string;
}

export interface VtStockcategory {
  id: number;
  name?: string;
  parent?: string;
  guid?: string;
  created_at?: string;
  updated_at?: string;
  company_id: string;
  division_id: string;
}

export interface VtStockcategoryInsert {
  id?: number;
  name?: string;
  parent?: string;
  guid?: string;
  created_at?: string;
  updated_at?: string;
  company_id?: string;
  division_id?: string;
}

export interface VtStockcategoryUpdate {
  id?: number;
  name?: string;
  parent?: string;
  guid?: string;
  created_at?: string;
  updated_at?: string;
  company_id?: string;
  division_id?: string;
}

export interface VtStockgroup {
  id: number;
  name?: string;
  parent?: string;
  guid?: string;
  created_at?: string;
  updated_at?: string;
  company_id: string;
  division_id: string;
}

export interface VtStockgroupInsert {
  id?: number;
  name?: string;
  parent?: string;
  guid?: string;
  created_at?: string;
  updated_at?: string;
  company_id?: string;
  division_id?: string;
}

export interface VtStockgroupUpdate {
  id?: number;
  name?: string;
  parent?: string;
  guid?: string;
  created_at?: string;
  updated_at?: string;
  company_id?: string;
  division_id?: string;
}

export interface VtTaxunit {
  id: number;
  name?: string;
  unit_type?: string;
  rate?: number;
  guid?: string;
  created_at?: string;
  updated_at?: string;
  company_id: string;
  division_id: string;
}

export interface VtTaxunitInsert {
  id?: number;
  name?: string;
  unit_type?: string;
  rate?: number;
  guid?: string;
  created_at?: string;
  updated_at?: string;
  company_id?: string;
  division_id?: string;
}

export interface VtTaxunitUpdate {
  id?: number;
  name?: string;
  unit_type?: string;
  rate?: number;
  guid?: string;
  created_at?: string;
  updated_at?: string;
  company_id?: string;
  division_id?: string;
}

export interface VtTdsrate {
  id: number;
  name?: string;
  rate?: number;
  section?: string;
  nature_of_payment?: string;
  threshold_limit?: number;
  guid?: string;
  created_at?: string;
  updated_at?: string;
  company_id: string;
  division_id: string;
}

export interface VtTdsrateInsert {
  id?: number;
  name?: string;
  rate?: number;
  section?: string;
  nature_of_payment?: string;
  threshold_limit?: number;
  guid?: string;
  created_at?: string;
  updated_at?: string;
  company_id?: string;
  division_id?: string;
}

export interface VtTdsrateUpdate {
  id?: number;
  name?: string;
  rate?: number;
  section?: string;
  nature_of_payment?: string;
  threshold_limit?: number;
  guid?: string;
  created_at?: string;
  updated_at?: string;
  company_id?: string;
  division_id?: string;
}