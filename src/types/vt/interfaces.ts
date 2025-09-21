/**
 * VT_* Table Interfaces
 * 
 * Auto-generated TypeScript interfaces for all vt_* tables
 * Generated on: 2025-09-20T20:45:31.625Z
 */

export interface VtAccountingallocationsList {
  id: number;
  oldauditentryids?: number;
  ledgername?: string;
  gstclass?: string;
  isdeemedpositive?: boolean;
  ledgerfromitem?: boolean;
  removezeroentries?: boolean;
  ispartyledger?: boolean;
  gstoverridden?: boolean;
  isgstassessablevalueoverridden?: boolean;
  strdisgstapplicable?: boolean;
  strdgstispartyledger?: boolean;
  strdgstisdutyledger?: boolean;
  contentnegispos?: boolean;
  islastdeemedpositive?: boolean;
  iscapvattaxaltered?: boolean;
  iscapvatnotclaimed?: boolean;
  amount?: number;
  servicetaxdetails_list?: string;
  bankallocations_list?: string;
  billallocations_list?: string;
  interestcollection_list?: string;
  oldauditentries_list?: string;
  accountauditentries_list?: string;
  auditentries_list?: string;
  inputcrallocs_list?: string;
  dutyheaddetails_list?: string;
  excisedutyheaddetails_list?: string;
  ratedetails_list?: string;
  summaryallocs_list?: string;
  cenvatdutyallocations_list?: string;
  stpymtdetails_list?: string;
  excisepaymentallocations_list?: string;
  taxbillallocations_list?: string;
  taxobjectallocations_list?: string;
  tdsexpenseallocations_list?: string;
  vatstatutorydetails_list?: string;
  costtrackallocations_list?: string;
  refvoucherdetails_list?: string;
  invoicewisedetails_list?: string;
  vatitcdetails_list?: string;
  advancetaxdetails_list?: string;
  taxtypeallocations_list?: string;
  allinventoryentries_list_id?: number;
  /** Record creation timestamp */
  created_at?: string;
  /** Record last update timestamp */
  updated_at?: string;
  /** Multi-tenant company identifier */
  company_id: string;
  /** Multi-tenant division identifier */
  division_id: string;
}

export interface VtAccountingallocationsListInsert {
  id: number;
  oldauditentryids?: number;
  ledgername?: string;
  gstclass?: string;
  isdeemedpositive?: boolean;
  ledgerfromitem?: boolean;
  removezeroentries?: boolean;
  ispartyledger?: boolean;
  gstoverridden?: boolean;
  isgstassessablevalueoverridden?: boolean;
  strdisgstapplicable?: boolean;
  strdgstispartyledger?: boolean;
  strdgstisdutyledger?: boolean;
  contentnegispos?: boolean;
  islastdeemedpositive?: boolean;
  iscapvattaxaltered?: boolean;
  iscapvatnotclaimed?: boolean;
  amount?: number;
  servicetaxdetails_list?: string;
  bankallocations_list?: string;
  billallocations_list?: string;
  interestcollection_list?: string;
  oldauditentries_list?: string;
  accountauditentries_list?: string;
  auditentries_list?: string;
  inputcrallocs_list?: string;
  dutyheaddetails_list?: string;
  excisedutyheaddetails_list?: string;
  ratedetails_list?: string;
  summaryallocs_list?: string;
  cenvatdutyallocations_list?: string;
  stpymtdetails_list?: string;
  excisepaymentallocations_list?: string;
  taxbillallocations_list?: string;
  taxobjectallocations_list?: string;
  tdsexpenseallocations_list?: string;
  vatstatutorydetails_list?: string;
  costtrackallocations_list?: string;
  refvoucherdetails_list?: string;
  invoicewisedetails_list?: string;
  vatitcdetails_list?: string;
  advancetaxdetails_list?: string;
  taxtypeallocations_list?: string;
  allinventoryentries_list_id?: number;
  created_at?: string;
  updated_at?: string;
  company_id?: string;
  division_id?: string;
}

export interface VtAccountingallocationsListUpdate {
  id?: number;
  oldauditentryids?: number;
  ledgername?: string;
  gstclass?: string;
  isdeemedpositive?: boolean;
  ledgerfromitem?: boolean;
  removezeroentries?: boolean;
  ispartyledger?: boolean;
  gstoverridden?: boolean;
  isgstassessablevalueoverridden?: boolean;
  strdisgstapplicable?: boolean;
  strdgstispartyledger?: boolean;
  strdgstisdutyledger?: boolean;
  contentnegispos?: boolean;
  islastdeemedpositive?: boolean;
  iscapvattaxaltered?: boolean;
  iscapvatnotclaimed?: boolean;
  amount?: number;
  servicetaxdetails_list?: string;
  bankallocations_list?: string;
  billallocations_list?: string;
  interestcollection_list?: string;
  oldauditentries_list?: string;
  accountauditentries_list?: string;
  auditentries_list?: string;
  inputcrallocs_list?: string;
  dutyheaddetails_list?: string;
  excisedutyheaddetails_list?: string;
  ratedetails_list?: string;
  summaryallocs_list?: string;
  cenvatdutyallocations_list?: string;
  stpymtdetails_list?: string;
  excisepaymentallocations_list?: string;
  taxbillallocations_list?: string;
  taxobjectallocations_list?: string;
  tdsexpenseallocations_list?: string;
  vatstatutorydetails_list?: string;
  costtrackallocations_list?: string;
  refvoucherdetails_list?: string;
  invoicewisedetails_list?: string;
  vatitcdetails_list?: string;
  advancetaxdetails_list?: string;
  taxtypeallocations_list?: string;
  allinventoryentries_list_id?: number;
  created_at?: string;
  updated_at?: string;
  company_id?: string;
  division_id?: string;
}

// Core VT interfaces for the main tables we use

export interface VtCompany {
  id: number;
  name?: string;
  maillocaladdress?: string;
  partygstin?: string;
  partyname?: string;
  guid?: string;
  created_at?: string;
  updated_at?: string;
  company_id: string;
  division_id: string;
}

export interface VtCompanyInsert {
  id?: number;
  name?: string;
  maillocaladdress?: string;
  partygstin?: string;
  partyname?: string;
  guid?: string;
  created_at?: string;
  updated_at?: string;
  company_id?: string;
  division_id?: string;
}

export interface VtCompanyUpdate {
  id?: number;
  name?: string;
  maillocaladdress?: string;
  partygstin?: string;
  partyname?: string;
  guid?: string;
  created_at?: string;
  updated_at?: string;
  company_id?: string;
  division_id?: string;
}

export interface VtLedger {
  id: number;
  name?: string;
  parent?: string;
  alias?: string;
  guid?: string;
  isbillwiseon?: boolean;
  iscostcentreson?: boolean;
  isintereston?: boolean;
  allowinmobile?: boolean;
  iscosttrackingon?: boolean;
  isbeneficiarycodeon?: boolean;
  isupdatingtargetid?: boolean;
  asoriginal?: boolean;
  iscondensed?: boolean;
  affectsstock?: boolean;
  useforinterest?: boolean;
  useforpayroll?: boolean;
  useforcost?: boolean;
  useforvatcollection?: boolean;
  isrevenue?: boolean;
  sortposition?: number;
  oldauditentryids?: number;
  created_at?: string;
  updated_at?: string;
  company_id: string;
  division_id: string;
}

export interface VtLedgerInsert {
  id?: number;
  name?: string;
  parent?: string;
  alias?: string;
  guid?: string;
  isbillwiseon?: boolean;
  iscostcentreson?: boolean;
  isintereston?: boolean;
  allowinmobile?: boolean;
  iscosttrackingon?: boolean;
  isbeneficiarycodeon?: boolean;
  isupdatingtargetid?: boolean;
  asoriginal?: boolean;
  iscondensed?: boolean;
  affectsstock?: boolean;
  useforinterest?: boolean;
  useforpayroll?: boolean;
  useforcost?: boolean;
  useforvatcollection?: boolean;
  isrevenue?: boolean;
  sortposition?: number;
  oldauditentryids?: number;
  created_at?: string;
  updated_at?: string;
  company_id?: string;
  division_id?: string;
}

export interface VtLedgerUpdate {
  id?: number;
  name?: string;
  parent?: string;
  alias?: string;
  guid?: string;
  isbillwiseon?: boolean;
  iscostcentreson?: boolean;
  isintereston?: boolean;
  allowinmobile?: boolean;
  iscosttrackingon?: boolean;
  isbeneficiarycodeon?: boolean;
  isupdatingtargetid?: boolean;
  asoriginal?: boolean;
  iscondensed?: boolean;
  affectsstock?: boolean;
  useforinterest?: boolean;
  useforpayroll?: boolean;
  useforcost?: boolean;
  useforvatcollection?: boolean;
  isrevenue?: boolean;
  sortposition?: number;
  oldauditentryids?: number;
  created_at?: string;
  updated_at?: string;
  company_id?: string;
  division_id?: string;
}

export interface VtVoucher {
  id: number;
  vouchertypename?: string;
  voucher_type?: string;
  vouchernumber?: string;
  date?: string;
  voucher_date?: string;
  guid?: string;
  narration?: string;
  basicbuyername?: string;
  basicbasepartyname?: string;
  partyname?: string;
  partyledgername?: string;
  paymtmode?: string;
  reference?: string;
  amount?: number;
  alterid?: number;
  masterid?: number;
  voucherkey?: number;
  vouchernumberseries?: string;
  isdaywisepayroll?: boolean;
  iscancelled?: boolean;
  isoptional?: boolean;
  classname?: string;
  persistedview?: number;
  oldauditentryids?: number;
  created_at?: string;
  updated_at?: string;
  company_id: string;
  division_id: string;
}

export interface VtVoucherInsert {
  id?: number;
  vouchertypename?: string;
  voucher_type?: string;
  vouchernumber?: string;
  date?: string;
  voucher_date?: string;
  guid?: string;
  narration?: string;
  basicbuyername?: string;
  basicbasepartyname?: string;
  partyname?: string;
  partyledgername?: string;
  paymtmode?: string;
  reference?: string;
  amount?: number;
  alterid?: number;
  masterid?: number;
  voucherkey?: number;
  vouchernumberseries?: string;
  isdaywisepayroll?: boolean;
  iscancelled?: boolean;
  isoptional?: boolean;
  classname?: string;
  persistedview?: number;
  oldauditentryids?: number;
  created_at?: string;
  updated_at?: string;
  company_id?: string;
  division_id?: string;
}

export interface VtVoucherUpdate {
  id?: number;
  vouchertypename?: string;
  voucher_type?: string;
  vouchernumber?: string;
  date?: string;
  voucher_date?: string;
  guid?: string;
  narration?: string;
  basicbuyername?: string;
  basicbasepartyname?: string;
  partyname?: string;
  partyledgername?: string;
  paymtmode?: string;
  reference?: string;
  amount?: number;
  alterid?: number;
  masterid?: number;
  voucherkey?: number;
  vouchernumberseries?: string;
  isdaywisepayroll?: boolean;
  iscancelled?: boolean;
  isoptional?: boolean;
  classname?: string;
  persistedview?: number;
  oldauditentryids?: number;
  created_at?: string;
  updated_at?: string;
  company_id?: string;
  division_id?: string;
}

export interface VtLedgerentries {
  id: number;
  ledgername?: string;
  ledger?: string;
  amount?: number;
  isdeemedpositive?: boolean;
  is_party_ledger?: boolean;
  ispartyledger?: boolean;
  ledgerfromitem?: boolean;
  removezeroentries?: boolean;
  cost_centre?: string;
  cost_category?: string;
  voucher_id?: number;
  created_at?: string;
  updated_at?: string;
  company_id: string;
  division_id: string;
}

export interface VtLedgerentriesInsert {
  id?: number;
  ledgername?: string;
  ledger?: string;
  amount?: number;
  isdeemedpositive?: boolean;
  is_party_ledger?: boolean;
  ispartyledger?: boolean;
  ledgerfromitem?: boolean;
  removezeroentries?: boolean;
  cost_centre?: string;
  cost_category?: string;
  voucher_id?: number;
  created_at?: string;
  updated_at?: string;
  company_id?: string;
  division_id?: string;
}

export interface VtLedgerentriesUpdate {
  id?: number;
  ledgername?: string;
  ledger?: string;
  amount?: number;
  isdeemedpositive?: boolean;
  is_party_ledger?: boolean;
  ispartyledger?: boolean;
  ledgerfromitem?: boolean;
  removezeroentries?: boolean;
  cost_centre?: string;
  cost_category?: string;
  voucher_id?: number;
  created_at?: string;
  updated_at?: string;
  company_id?: string;
  division_id?: string;
}

export interface VtInventoryentries {
  id: number;
  stockitemname?: string;
  stock_item_name?: string;
  actualqty?: string;
  actual_quantity?: number;
  billedqty?: string;
  rate?: string;
  amount?: number;
  isdeemedpositive?: boolean;
  godown?: string;
  voucher_id?: number;
  created_at?: string;
  updated_at?: string;
  company_id: string;
  division_id: string;
}

export interface VtInventoryentriesInsert {
  id?: number;
  stockitemname?: string;
  stock_item_name?: string;
  actualqty?: string;
  actual_quantity?: number;
  billedqty?: string;
  rate?: string;
  amount?: number;
  isdeemedpositive?: boolean;
  godown?: string;
  voucher_id?: number;
  created_at?: string;
  updated_at?: string;
  company_id?: string;
  division_id?: string;
}

export interface VtInventoryentriesUpdate {
  id?: number;
  stockitemname?: string;
  stock_item_name?: string;
  actualqty?: string;
  actual_quantity?: number;
  billedqty?: string;
  rate?: string;
  amount?: number;
  isdeemedpositive?: boolean;
  godown?: string;
  voucher_id?: number;
  created_at?: string;
  updated_at?: string;
  company_id?: string;
  division_id?: string;
}

// Export common types
export type VtTableRecord = {
  id: number;
  created_at?: string;
  updated_at?: string;
  company_id: string;
  division_id: string;
};

export type VtCompanyRecord = VtTableRecord & {
  name?: string;
};

export type VtLedgerRecord = VtTableRecord & {
  name?: string;
  parent?: string;
};

export type VtVoucherRecord = VtTableRecord & {
  vouchertypename?: string;
  vouchernumber?: string;
  date?: string;
  amount?: number;
};