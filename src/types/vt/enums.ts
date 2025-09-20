/**
 * VT Enums and Constants
 * 
 * Enum types and constants for VT system
 * Generated on: 2025-09-20T20:45:31.631Z
 */


/**
 * All VT table names
 */
export type VtTableName = 'vt_accountingallocations_list' | 'vt_address_list' | 'vt_allinventoryentries_list' | 'vt_allledgerentries_list' | 'vt_basicbuyeraddress_list' | 'vt_batchallocations_list' | 'vt_billallocations_list' | 'vt_body' | 'vt_cancelledpayallocations_list' | 'vt_categorydetails_list' | 'vt_chequerange_list' | 'vt_company' | 'vt_consigneeaddress_list' | 'vt_consignoraddress_list' | 'vt_contactdetails_list' | 'vt_costcategory' | 'vt_currency' | 'vt_deductinsamevchrules_list' | 'vt_dispatchfromaddress_list' | 'vt_envelope' | 'vt_ewaybilldetails_list' | 'vt_godown' | 'vt_group_table' | 'vt_gst_list' | 'vt_gstdetails_list' | 'vt_gsteinvoicedetails_list' | 'vt_gstewaybilldetails_list' | 'vt_gstin' | 'vt_gstreconconfigdetails_list' | 'vt_gstregistrationdetails_list' | 'vt_header' | 'vt_hsndetails_list' | 'vt_importdata' | 'vt_incometaxclassification' | 'vt_incometaxslab' | 'vt_interestcollection_list' | 'vt_inventoryentries' | 'vt_invoicedelnotes_list' | 'vt_itclassificationdetails_list' | 'vt_itclassificationperiod_list' | 'vt_itregimedetails_list' | 'vt_itslabperiod_list' | 'vt_itslabrate_list' | 'vt_languagename_list' | 'vt_lastexchangeinfo_list' | 'vt_lastgsttaxunitbyseries_list' | 'vt_lastnumberlist_list' | 'vt_lastseriesbygsttaxunit_list' | 'vt_lastsynctime_list' | 'vt_ledger' | 'vt_ledgerclosingvalues_list' | 'vt_ledgerentries' | 'vt_ledgerentries_list' | 'vt_ledgerentrieslist_list' | 'vt_ledgerforinventorylist_list' | 'vt_ledgstregdetails_list' | 'vt_ledmailingdetails_list' | 'vt_ledmultiaddresslist_list' | 'vt_lowerdeduction_list' | 'vt_mrpratedetails_list' | 'vt_name_list' | 'vt_oldaddress_list' | 'vt_oldauditentryids_list' | 'vt_oldmailingname_list' | 'vt_oldmrpdetails_list' | 'vt_paymentdetails_list' | 'vt_prefixlist_list' | 'vt_previousname_list' | 'vt_ratedetails_list' | 'vt_rateofinvoicetax_list' | 'vt_remotecmpinfo_list' | 'vt_reportinguomdetails_list' | 'vt_reportinguqcdetails_list' | 'vt_requestdesc' | 'vt_restartfromlist_list' | 'vt_stat_list' | 'vt_statewisedetails_list' | 'vt_staticvariables' | 'vt_stockcategory' | 'vt_stockgroup' | 'vt_stockitem' | 'vt_subcategoryallocation_list' | 'vt_suffixlist_list' | 'vt_supabase_change_log' | 'vt_sync_configuration' | 'vt_sync_conflicts' | 'vt_sync_execution_log' | 'vt_tally_supabase_sync' | 'vt_tally_xml_schema_db' | 'vt_taxobjectallocations_list' | 'vt_taxunit' | 'vt_tcscategorydetails_list' | 'vt_tdscategorydetails_list' | 'vt_tdsrate' | 'vt_transportdetails_list' | 'vt_unit' | 'vt_vchnumseriesid_list' | 'vt_voucher' | 'vt_voucherclasslist_list' | 'vt_vouchernumberseries_list' | 'vt_vouchertype';

/**
 * VT table categories
 */
export type VtTableCategory = 'master' | 'transaction' | 'list' | 'system';

/**
 * VT table information
 */
export interface VtTableInfo {
  name: VtTableName;
  label: string;
  description: string;
  category: VtTableCategory;
}

/**
 * All VT tables with metadata
 */
export const VT_TABLES: VtTableInfo[] = [
  {
    name: 'vt_accountingallocations_list',
    label: 'accountingallocations list',
    description: 'accountingallocations list data',
    category: 'list'
  },\n  {
    name: 'vt_address_list',
    label: 'address list',
    description: 'address list data',
    category: 'list'
  },\n  {
    name: 'vt_allinventoryentries_list',
    label: 'allinventoryentries list',
    description: 'allinventoryentries list data',
    category: 'list'
  },\n  {
    name: 'vt_allledgerentries_list',
    label: 'allledgerentries list',
    description: 'allledgerentries list data',
    category: 'list'
  },\n  {
    name: 'vt_basicbuyeraddress_list',
    label: 'basicbuyeraddress list',
    description: 'basicbuyeraddress list data',
    category: 'list'
  },\n  {
    name: 'vt_batchallocations_list',
    label: 'batchallocations list',
    description: 'batchallocations list data',
    category: 'list'
  },\n  {
    name: 'vt_billallocations_list',
    label: 'billallocations list',
    description: 'billallocations list data',
    category: 'list'
  },\n  {
    name: 'vt_body',
    label: 'body',
    description: 'body data',
    category: 'master'
  },\n  {
    name: 'vt_cancelledpayallocations_list',
    label: 'cancelledpayallocations list',
    description: 'cancelledpayallocations list data',
    category: 'list'
  },\n  {
    name: 'vt_categorydetails_list',
    label: 'categorydetails list',
    description: 'categorydetails list data',
    category: 'list'
  },\n  {
    name: 'vt_chequerange_list',
    label: 'chequerange list',
    description: 'chequerange list data',
    category: 'list'
  },\n  {
    name: 'vt_company',
    label: 'company',
    description: 'Company master',
    category: 'master'
  },\n  {
    name: 'vt_consigneeaddress_list',
    label: 'consigneeaddress list',
    description: 'consigneeaddress list data',
    category: 'list'
  },\n  {
    name: 'vt_consignoraddress_list',
    label: 'consignoraddress list',
    description: 'consignoraddress list data',
    category: 'list'
  },\n  {
    name: 'vt_contactdetails_list',
    label: 'contactdetails list',
    description: 'contactdetails list data',
    category: 'list'
  },\n  {
    name: 'vt_costcategory',
    label: 'costcategory',
    description: 'costcategory data',
    category: 'master'
  },\n  {
    name: 'vt_currency',
    label: 'currency',
    description: 'Currency master',
    category: 'master'
  },\n  {
    name: 'vt_deductinsamevchrules_list',
    label: 'deductinsamevchrules list',
    description: 'deductinsamevchrules list data',
    category: 'list'
  },\n  {
    name: 'vt_dispatchfromaddress_list',
    label: 'dispatchfromaddress list',
    description: 'dispatchfromaddress list data',
    category: 'list'
  },\n  {
    name: 'vt_envelope',
    label: 'envelope',
    description: 'envelope data',
    category: 'master'
  },\n  {
    name: 'vt_ewaybilldetails_list',
    label: 'ewaybilldetails list',
    description: 'ewaybilldetails list data',
    category: 'list'
  },\n  {
    name: 'vt_godown',
    label: 'godown',
    description: 'godown data',
    category: 'master'
  },\n  {
    name: 'vt_group_table',
    label: 'group table',
    description: 'Account groups',
    category: 'master'
  },\n  {
    name: 'vt_gst_list',
    label: 'gst list',
    description: 'gst list data',
    category: 'list'
  },\n  {
    name: 'vt_gstdetails_list',
    label: 'gstdetails list',
    description: 'gstdetails list data',
    category: 'list'
  },\n  {
    name: 'vt_gsteinvoicedetails_list',
    label: 'gsteinvoicedetails list',
    description: 'gsteinvoicedetails list data',
    category: 'list'
  },\n  {
    name: 'vt_gstewaybilldetails_list',
    label: 'gstewaybilldetails list',
    description: 'gstewaybilldetails list data',
    category: 'list'
  },\n  {
    name: 'vt_gstin',
    label: 'gstin',
    description: 'gstin data',
    category: 'master'
  },\n  {
    name: 'vt_gstreconconfigdetails_list',
    label: 'gstreconconfigdetails list',
    description: 'gstreconconfigdetails list data',
    category: 'list'
  },\n  {
    name: 'vt_gstregistrationdetails_list',
    label: 'gstregistrationdetails list',
    description: 'gstregistrationdetails list data',
    category: 'list'
  },\n  {
    name: 'vt_header',
    label: 'header',
    description: 'header data',
    category: 'master'
  },\n  {
    name: 'vt_hsndetails_list',
    label: 'hsndetails list',
    description: 'hsndetails list data',
    category: 'list'
  },\n  {
    name: 'vt_importdata',
    label: 'importdata',
    description: 'importdata data',
    category: 'master'
  },\n  {
    name: 'vt_incometaxclassification',
    label: 'incometaxclassification',
    description: 'incometaxclassification data',
    category: 'master'
  },\n  {
    name: 'vt_incometaxslab',
    label: 'incometaxslab',
    description: 'incometaxslab data',
    category: 'master'
  },\n  {
    name: 'vt_interestcollection_list',
    label: 'interestcollection list',
    description: 'interestcollection list data',
    category: 'list'
  },\n  {
    name: 'vt_inventoryentries',
    label: 'inventoryentries',
    description: 'Stock movements',
    category: 'transaction'
  },\n  {
    name: 'vt_invoicedelnotes_list',
    label: 'invoicedelnotes list',
    description: 'invoicedelnotes list data',
    category: 'list'
  },\n  {
    name: 'vt_itclassificationdetails_list',
    label: 'itclassificationdetails list',
    description: 'itclassificationdetails list data',
    category: 'list'
  },\n  {
    name: 'vt_itclassificationperiod_list',
    label: 'itclassificationperiod list',
    description: 'itclassificationperiod list data',
    category: 'list'
  },\n  {
    name: 'vt_itregimedetails_list',
    label: 'itregimedetails list',
    description: 'itregimedetails list data',
    category: 'list'
  },\n  {
    name: 'vt_itslabperiod_list',
    label: 'itslabperiod list',
    description: 'itslabperiod list data',
    category: 'list'
  },\n  {
    name: 'vt_itslabrate_list',
    label: 'itslabrate list',
    description: 'itslabrate list data',
    category: 'list'
  },\n  {
    name: 'vt_languagename_list',
    label: 'languagename list',
    description: 'languagename list data',
    category: 'list'
  },\n  {
    name: 'vt_lastexchangeinfo_list',
    label: 'lastexchangeinfo list',
    description: 'lastexchangeinfo list data',
    category: 'list'
  },\n  {
    name: 'vt_lastgsttaxunitbyseries_list',
    label: 'lastgsttaxunitbyseries list',
    description: 'lastgsttaxunitbyseries list data',
    category: 'list'
  },\n  {
    name: 'vt_lastnumberlist_list',
    label: 'lastnumberlist list',
    description: 'lastnumberlist list data',
    category: 'list'
  },\n  {
    name: 'vt_lastseriesbygsttaxunit_list',
    label: 'lastseriesbygsttaxunit list',
    description: 'lastseriesbygsttaxunit list data',
    category: 'list'
  },\n  {
    name: 'vt_lastsynctime_list',
    label: 'lastsynctime list',
    description: 'lastsynctime list data',
    category: 'list'
  },\n  {
    name: 'vt_ledger',
    label: 'ledger',
    description: 'Chart of accounts',
    category: 'master'
  },\n  {
    name: 'vt_ledgerclosingvalues_list',
    label: 'ledgerclosingvalues list',
    description: 'ledgerclosingvalues list data',
    category: 'list'
  },\n  {
    name: 'vt_ledgerentries',
    label: 'ledgerentries',
    description: 'Accounting entries',
    category: 'transaction'
  },\n  {
    name: 'vt_ledgerentries_list',
    label: 'ledgerentries list',
    description: 'ledgerentries list data',
    category: 'list'
  },\n  {
    name: 'vt_ledgerentrieslist_list',
    label: 'ledgerentrieslist list',
    description: 'ledgerentrieslist list data',
    category: 'list'
  },\n  {
    name: 'vt_ledgerforinventorylist_list',
    label: 'ledgerforinventorylist list',
    description: 'ledgerforinventorylist list data',
    category: 'list'
  },\n  {
    name: 'vt_ledgstregdetails_list',
    label: 'ledgstregdetails list',
    description: 'ledgstregdetails list data',
    category: 'list'
  },\n  {
    name: 'vt_ledmailingdetails_list',
    label: 'ledmailingdetails list',
    description: 'ledmailingdetails list data',
    category: 'list'
  },\n  {
    name: 'vt_ledmultiaddresslist_list',
    label: 'ledmultiaddresslist list',
    description: 'ledmultiaddresslist list data',
    category: 'list'
  },\n  {
    name: 'vt_lowerdeduction_list',
    label: 'lowerdeduction list',
    description: 'lowerdeduction list data',
    category: 'list'
  },\n  {
    name: 'vt_mrpratedetails_list',
    label: 'mrpratedetails list',
    description: 'mrpratedetails list data',
    category: 'list'
  },\n  {
    name: 'vt_name_list',
    label: 'name list',
    description: 'name list data',
    category: 'list'
  },\n  {
    name: 'vt_oldaddress_list',
    label: 'oldaddress list',
    description: 'oldaddress list data',
    category: 'list'
  },\n  {
    name: 'vt_oldauditentryids_list',
    label: 'oldauditentryids list',
    description: 'oldauditentryids list data',
    category: 'list'
  },\n  {
    name: 'vt_oldmailingname_list',
    label: 'oldmailingname list',
    description: 'oldmailingname list data',
    category: 'list'
  },\n  {
    name: 'vt_oldmrpdetails_list',
    label: 'oldmrpdetails list',
    description: 'oldmrpdetails list data',
    category: 'list'
  },\n  {
    name: 'vt_paymentdetails_list',
    label: 'paymentdetails list',
    description: 'paymentdetails list data',
    category: 'list'
  },\n  {
    name: 'vt_prefixlist_list',
    label: 'prefixlist list',
    description: 'prefixlist list data',
    category: 'list'
  },\n  {
    name: 'vt_previousname_list',
    label: 'previousname list',
    description: 'previousname list data',
    category: 'list'
  },\n  {
    name: 'vt_ratedetails_list',
    label: 'ratedetails list',
    description: 'ratedetails list data',
    category: 'list'
  },\n  {
    name: 'vt_rateofinvoicetax_list',
    label: 'rateofinvoicetax list',
    description: 'rateofinvoicetax list data',
    category: 'list'
  },\n  {
    name: 'vt_remotecmpinfo_list',
    label: 'remotecmpinfo list',
    description: 'remotecmpinfo list data',
    category: 'list'
  },\n  {
    name: 'vt_reportinguomdetails_list',
    label: 'reportinguomdetails list',
    description: 'reportinguomdetails list data',
    category: 'list'
  },\n  {
    name: 'vt_reportinguqcdetails_list',
    label: 'reportinguqcdetails list',
    description: 'reportinguqcdetails list data',
    category: 'list'
  },\n  {
    name: 'vt_requestdesc',
    label: 'requestdesc',
    description: 'requestdesc data',
    category: 'master'
  },\n  {
    name: 'vt_restartfromlist_list',
    label: 'restartfromlist list',
    description: 'restartfromlist list data',
    category: 'list'
  },\n  {
    name: 'vt_stat_list',
    label: 'stat list',
    description: 'stat list data',
    category: 'list'
  },\n  {
    name: 'vt_statewisedetails_list',
    label: 'statewisedetails list',
    description: 'statewisedetails list data',
    category: 'list'
  },\n  {
    name: 'vt_staticvariables',
    label: 'staticvariables',
    description: 'staticvariables data',
    category: 'master'
  },\n  {
    name: 'vt_stockcategory',
    label: 'stockcategory',
    description: 'stockcategory data',
    category: 'master'
  },\n  {
    name: 'vt_stockgroup',
    label: 'stockgroup',
    description: 'stockgroup data',
    category: 'master'
  },\n  {
    name: 'vt_stockitem',
    label: 'stockitem',
    description: 'Inventory items',
    category: 'master'
  },\n  {
    name: 'vt_subcategoryallocation_list',
    label: 'subcategoryallocation list',
    description: 'subcategoryallocation list data',
    category: 'list'
  },\n  {
    name: 'vt_suffixlist_list',
    label: 'suffixlist list',
    description: 'suffixlist list data',
    category: 'list'
  },\n  {
    name: 'vt_supabase_change_log',
    label: 'supabase change log',
    description: 'supabase change log data',
    category: 'system'
  },\n  {
    name: 'vt_sync_configuration',
    label: 'sync configuration',
    description: 'sync configuration data',
    category: 'system'
  },\n  {
    name: 'vt_sync_conflicts',
    label: 'sync conflicts',
    description: 'sync conflicts data',
    category: 'system'
  },\n  {
    name: 'vt_sync_execution_log',
    label: 'sync execution log',
    description: 'sync execution log data',
    category: 'system'
  },\n  {
    name: 'vt_tally_supabase_sync',
    label: 'tally supabase sync',
    description: 'tally supabase sync data',
    category: 'master'
  },\n  {
    name: 'vt_tally_xml_schema_db',
    label: 'tally xml schema db',
    description: 'tally xml schema db data',
    category: 'system'
  },\n  {
    name: 'vt_taxobjectallocations_list',
    label: 'taxobjectallocations list',
    description: 'taxobjectallocations list data',
    category: 'list'
  },\n  {
    name: 'vt_taxunit',
    label: 'taxunit',
    description: 'taxunit data',
    category: 'master'
  },\n  {
    name: 'vt_tcscategorydetails_list',
    label: 'tcscategorydetails list',
    description: 'tcscategorydetails list data',
    category: 'list'
  },\n  {
    name: 'vt_tdscategorydetails_list',
    label: 'tdscategorydetails list',
    description: 'tdscategorydetails list data',
    category: 'list'
  },\n  {
    name: 'vt_tdsrate',
    label: 'tdsrate',
    description: 'tdsrate data',
    category: 'master'
  },\n  {
    name: 'vt_transportdetails_list',
    label: 'transportdetails list',
    description: 'transportdetails list data',
    category: 'list'
  },\n  {
    name: 'vt_unit',
    label: 'unit',
    description: 'Units of measure',
    category: 'master'
  },\n  {
    name: 'vt_vchnumseriesid_list',
    label: 'vchnumseriesid list',
    description: 'vchnumseriesid list data',
    category: 'list'
  },\n  {
    name: 'vt_voucher',
    label: 'voucher',
    description: 'Core business transactions',
    category: 'transaction'
  },\n  {
    name: 'vt_voucherclasslist_list',
    label: 'voucherclasslist list',
    description: 'voucherclasslist list data',
    category: 'list'
  },\n  {
    name: 'vt_vouchernumberseries_list',
    label: 'vouchernumberseries list',
    description: 'vouchernumberseries list data',
    category: 'list'
  },\n  {
    name: 'vt_vouchertype',
    label: 'vouchertype',
    description: 'Transaction types',
    category: 'master'
  }
];

