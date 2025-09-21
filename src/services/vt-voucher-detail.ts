/**
 * VT Voucher Detail Service
 * 
 * Service for fetching complete voucher details from VT tables with all related records
 */

import { supabase } from "@/integrations/supabase/client";

export interface VtVoucherDetail {
  // Core voucher data
  id: number;
  guid: string;
  voucher_number?: string;
  voucher_type?: string;
  voucher_type_id?: number;
  date?: string;
  effective_date?: string;
  party_name?: string;
  reference_number?: string;
  reference_date?: string;
  narration?: string;
  amount?: number;
  currency_id?: number;
  place_of_supply?: string;
  is_invoice?: boolean;
  is_accounting_voucher?: boolean;
  is_inventory_voucher?: boolean;
  is_order_voucher?: boolean;
  company_id: string;
  division_id: string;
  created_at?: string;
  updated_at?: string;
  
  // Related records
  accounting_entries?: VtAccountingEntry[];
  inventory_entries?: VtInventoryEntry[];
  related_vouchers?: VtVoucherDetail[];
  ledger_details?: VtLedgerDetail[];
  stock_items?: VtStockItemDetail[];
  address_details?: VtAddressDetail[];
  gst_details?: VtGstDetail[];
  bill_allocations?: VtBillAllocation[];
  batch_allocations?: VtBatchAllocation[];
  
  // Computed totals
  total_debit?: number;
  total_credit?: number;
  total_inventory_value?: number;
}

export interface VtAccountingEntry {
  id: number;
  oldauditentryids?: number;
  ledgername?: string;
  gstclass?: string;
  isdeemedpositive?: boolean;
  ledgerfromitem?: boolean;
  removezeroentries?: boolean;
  ispartyledger?: boolean;
  amount?: number;
  requestdata_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface VtInventoryEntry {
  id: number;
  voucher_id?: number;
  stockitem_id?: number;
  stockitem_name?: string;
  quantity?: number;
  rate?: number;
  amount?: number;
  godown_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface VtLedgerDetail {
  id: number;
  guid: string;
  name?: string;
  parent?: string;
  parent_group_id?: number;
  opening_balance?: number;
  closing_balance?: number;
  created_at?: string;
  updated_at?: string;
}

export interface VtStockItemDetail {
  id: number;
  guid: string;
  name?: string;
  parent?: string;
  parent_group_id?: number;
  base_units?: string;
  opening_balance?: number;
  closing_balance?: number;
  opening_rate?: number;
  closing_rate?: number;
  created_at?: string;
  updated_at?: string;
}

export interface VtAddressDetail {
  id: number;
  address_type?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
}

export interface VtGstDetail {
  id: number;
  hsn_code?: string;
  gst_rate?: number;
  igst_amount?: number;
  cgst_amount?: number;
  sgst_amount?: number;
  cess_amount?: number;
}

export interface VtBillAllocation {
  id: number;
  bill_name?: string;
  bill_amount?: number;
  allocation_amount?: number;
  bill_date?: string;
}

export interface VtBatchAllocation {
  id: number;
  batch_name?: string;
  quantity?: number;
  rate?: number;
  amount?: number;
  godown_name?: string;
  manufactured_date?: string;
  expiry_date?: string;
}

export class VtVoucherDetailService {
  /**
   * Fetch complete voucher details with all related records from backup tables 
   * (mapped to VT-compatible interface)
   */
  static async getVoucherDetail(
    voucherGuid: string,
    companyId: string,
    divisionId: string
  ): Promise<VtVoucherDetail | null> {
    try {
      // Fetch core voucher data from backup tables
      const { data: voucherData, error: voucherError } = await supabase
        .from('bkp_tally_trn_voucher')
        .select('*')
        .eq('guid', voucherGuid)
        .eq('company_id', companyId)
        .eq('division_id', divisionId)
        .maybeSingle();

      if (voucherError || !voucherData) {
        console.error('Error fetching voucher:', voucherError);
        return null;
      }

      // Fetch all related records in parallel
      const [
        { data: accountingEntries },
        { data: inventoryEntries },
        { data: addressDetails },
        { data: gstDetails },
        { data: billAllocations }
      ] = await Promise.all([
        supabase.from('bkp_trn_accounting').select('*').eq('voucher_guid', voucherGuid).eq('company_id', companyId).eq('division_id', divisionId),
        supabase.from('bkp_trn_batch').select('*').eq('voucher_guid', voucherGuid).eq('company_id', companyId).eq('division_id', divisionId),
        supabase.from('bkp_trn_address_details').select('*').eq('voucher_guid', voucherGuid).eq('company_id', companyId).eq('division_id', divisionId),
        supabase.from('bkp_mst_gst_effective_rate').select('*').eq('company_id', companyId).eq('division_id', divisionId).limit(5),
        supabase.from('bkp_trn_bill').select('*').eq('company_id', companyId).eq('division_id', divisionId).limit(5)
      ]);

      // Calculate totals
      const totalDebit = (accountingEntries || [])
        .filter(entry => entry.is_deemed_positive)
        .reduce((sum, entry) => sum + (parseFloat(entry.amount) || 0), 0);
      
      const totalCredit = (accountingEntries || [])
        .filter(entry => !entry.is_deemed_positive)
        .reduce((sum, entry) => sum + Math.abs(parseFloat(entry.amount) || 0), 0);

      const totalInventoryValue = (inventoryEntries || [])
        .reduce((sum, entry) => sum + (parseFloat(entry.amount) || 0), 0);

      // Build VT-compatible response
      const voucherDetail: VtVoucherDetail = {
        id: 1,
        guid: voucherData.guid,
        voucher_number: voucherData.voucher_number,
        voucher_type: voucherData.voucher_type,
        date: voucherData.date,
        party_name: voucherData.party_ledger_name,
        reference_number: voucherData.reference,
        narration: voucherData.narration,
        amount: parseFloat(voucherData.total_amount) || 0,
        is_accounting_voucher: true,
        is_inventory_voucher: (inventoryEntries?.length || 0) > 0,
        company_id: companyId,
        division_id: divisionId,
        created_at: voucherData.created_at,
        updated_at: voucherData.created_at,
        
        // Map all related records to VT interfaces
        accounting_entries: (accountingEntries || []).map((entry, index) => ({
          id: index + 1,
          ledgername: entry.ledger,
          isdeemedpositive: !!entry.is_deemed_positive,
          ispartyledger: !!entry.is_party_ledger,
          amount: parseFloat(entry.amount) || 0
        })),
        inventory_entries: (inventoryEntries || []).map((entry, index) => ({
          id: index + 1,
          stockitem_name: entry.item,
          quantity: parseFloat(entry.quantity) || 0,
          rate: parseFloat(entry.rate) || 0,
          amount: parseFloat(entry.amount) || 0,
          godown_name: entry.godown
        })),
        address_details: (addressDetails || []).map((addr, index) => ({
          id: index + 1,
          address_type: addr.address_type || 'Unknown',
          address_line1: addr.address_line1 || '',
          city: addr.city || '',
          state: addr.state || '',
          country: addr.country || '',
          pincode: addr.pincode || '',
          contact_person: addr.contact_person || '',
          phone: addr.phone || '',
          email: addr.email || ''
        })),
        gst_details: (gstDetails || []).map((gst, index) => ({
          id: index + 1,
          hsn_code: gst.hsn_code || '',
          gst_rate: parseFloat(gst.rate) || 0,
          igst_amount: 0,
          cgst_amount: 0,
          sgst_amount: 0,
          cess_amount: 0
        })),
        bill_allocations: (billAllocations || []).map((bill, index) => ({
          id: index + 1,
          bill_name: bill.name || '',
          bill_amount: parseFloat(bill.amount) || 0,
          allocation_amount: parseFloat(bill.amount) || 0
        })),
        batch_allocations: (inventoryEntries || []).map((batch, index) => ({
          id: index + 1,
          batch_name: batch.name || '',
          quantity: parseFloat(batch.quantity) || 0,
          rate: parseFloat(batch.rate) || 0,
          amount: parseFloat(batch.amount) || 0,
          godown_name: batch.godown || ''
        })),
        related_vouchers: [],
        ledger_details: [],
        stock_items: [],
        
        // Computed totals
        total_debit: totalDebit,
        total_credit: totalCredit,
        total_inventory_value: totalInventoryValue
      };

      return voucherDetail;

    } catch (error) {
      console.error('Error in getVoucherDetail:', error);
      return null;
    }
  }

  static async getVoucherSummary(
    companyId: string,
    divisionId: string,
    limit = 50,
    offset = 0
  ) {
    return [];
  }
}