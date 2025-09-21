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
   * Fetch complete voucher details with all related records from VT tables
   */
  static async getVoucherDetail(
    voucherGuid: string,
    companyId: string,
    divisionId: string
  ): Promise<VtVoucherDetail | null> {
    try {
      // 1. Fetch core voucher data from backup table (VT tables need RPC functions not available)
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

      // 2. Fetch accounting entries from backup table
      const { data: accountingEntries } = await supabase
        .from('bkp_trn_accounting')
        .select('*')
        .eq('voucher_guid', voucherGuid)
        .eq('company_id', companyId)
        .eq('division_id', divisionId);

      // 3. No inventory entries available in backup tables
      const inventoryEntries: any[] = [];

      // 4. Fetch related ledger details
      const ledgerNames = [...new Set(accountingEntries?.map(entry => 
        entry.ledger
      ).filter(Boolean) || [])];
      
      let ledgerDetails: any[] = [];
      if (ledgerNames.length > 0) {
        const { data } = await supabase
          .from('bkp_mst_ledger')
          .select('*')
          .in('name', ledgerNames)
          .eq('company_id', companyId)
          .eq('division_id', divisionId);
        ledgerDetails = data || [];
      }

      // 5. Fetch stock item details (placeholder since no inventory entries)
      const stockItems: any[] = [];

      // 6-10. Other related data (using empty arrays for now since RPC functions aren't available)
      const addressDetails: any[] = [];
      const gstDetails: any[] = [];
      const billAllocations: any[] = [];
      const batchAllocations: any[] = [];
      
      // Find related vouchers
      let relatedVouchers: any[] = [];
      if (voucherData.party_ledger_name) {
        try {
          const { data } = await supabase
            .from('bkp_tally_trn_voucher')
            .select('*')
            .neq('guid', voucherGuid)
            .eq('party_ledger_name', voucherData.party_ledger_name)
            .eq('company_id', companyId)
            .eq('division_id', divisionId)
            .limit(5);
          relatedVouchers = data || [];
        } catch {
          // Ignore errors for related vouchers
        }
      }

      // Calculate totals
      const totalDebit = accountingEntries
        ?.filter(entry => entry.is_deemed_positive)
        .reduce((sum, entry) => sum + (entry.amount || 0), 0) || 0;
      
      const totalCredit = accountingEntries
        ?.filter(entry => !entry.is_deemed_positive)
        .reduce((sum, entry) => sum + Math.abs(entry.amount || 0), 0) || 0;

      const totalInventoryValue = inventoryEntries
        ?.reduce((sum, entry) => sum + (entry.amount || 0), 0) || 0;

      // Build complete voucher detail object (mapping backup fields to VT interface)
      const voucherDetail: VtVoucherDetail = {
        // Core voucher data (mapping from backup table structure)
        id: 0, // No id in backup table
        guid: voucherData.guid,
        voucher_number: voucherData.voucher_number,
        voucher_type: voucherData.voucher_type,
        voucher_type_id: undefined, // Not available in backup
        date: voucherData.date,
        effective_date: voucherData.date, // Use same date as effective
        party_name: voucherData.party_ledger_name,
        reference_number: voucherData.reference,
        reference_date: undefined, // Not available in backup
        narration: voucherData.narration,
        amount: voucherData.total_amount,
        currency_id: undefined, // Not available in backup
        place_of_supply: undefined, // Not available in backup
        is_invoice: false, // Default value
        is_accounting_voucher: true, // Default value
        is_inventory_voucher: false, // Default value
        is_order_voucher: false, // Default value
        company_id: companyId,
        division_id: divisionId,
        created_at: voucherData.created_at,
        updated_at: voucherData.created_at, // Use created_at as fallback
        
        // Related records (mapped from appropriate structures)
        accounting_entries: (accountingEntries || []).map(entry => ({
          id: 0, // No id in backup table
          oldauditentryids: undefined,
          ledgername: entry.ledger,
          gstclass: undefined,
          isdeemedpositive: !!entry.is_deemed_positive,
          ledgerfromitem: undefined,
          removezeroentries: undefined,
          ispartyledger: !!entry.is_party_ledger,
          amount: entry.amount,
          requestdata_id: undefined,
          created_at: undefined,
          updated_at: undefined
        })),
        inventory_entries: inventoryEntries,
        related_vouchers: (relatedVouchers || []).map(rv => ({
          id: 0,
          guid: rv.guid,
          voucher_number: rv.voucher_number,
          voucher_type: rv.voucher_type,
          date: rv.date,
          party_name: rv.party_ledger_name,
          amount: rv.total_amount,
          reference_number: rv.reference,
          company_id: companyId,
          division_id: divisionId
        })),
        ledger_details: ledgerDetails,
        stock_items: stockItems,
        address_details: [],
        gst_details: [],
        bill_allocations: [],
        batch_allocations: [],
        
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

  /**
   * Fetch voucher summary for list views
   */
  static async getVoucherSummary(
    companyId: string,
    divisionId: string,
    limit = 50,
    offset = 0
  ) {
    try {
      // For now, return empty array since direct VT table access needs setup
      // TODO: Implement when direct VT table access is available
      return [];
    } catch (error) {
      console.error('Error in getVoucherSummary:', error);
      return [];
    }
  }
}