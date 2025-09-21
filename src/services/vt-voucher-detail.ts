/**
 * VT Voucher Detail Service
 * 
 * Service for fetching complete voucher details from VT tables using Supabase read queries
 */

import { supabase } from "@/integrations/supabase/client";

export interface VtVoucherDetail {
  id: number;
  guid: string;
  vouchertypename?: string;
  voucher_type?: string;
  vouchernumber?: string;
  date?: string;
  voucher_date?: string;
  amount?: number;
  narration?: string;
  partyname?: string;
  partyledgername?: string;
  iscancelled?: boolean;
  isoptional?: boolean;
  alterid?: number;
  masterid?: number;
  classname?: string;
  created_at?: string;
  updated_at?: string;
  company_id: string;
  division_id: string;
  accounting_entries?: VtAccountingEntry[];
  total_debit?: number;
  total_credit?: number;
}

export interface VtAccountingEntry {
  id: number;
  ledgername?: string;
  amount?: number;
  isdeemedpositive?: boolean;
  ispartyledger?: boolean;
}

export class VtVoucherDetailService {
  /**
   * Fetch complete voucher details with accounting entries using read queries
   */
  static async getVoucherDetail(
    voucherGuid: string,
    companyId: string,
    divisionId: string
  ): Promise<VtVoucherDetail | null> {
    try {
      // Use Supabase direct query for voucher from backup table
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

      // Map backup table fields to VT interface
      const voucher = {
        id: 0, // Will be assigned by VT migration
        guid: voucherData.guid,
        vouchertypename: voucherData.voucher_type,
        voucher_type: voucherData.voucher_type,
        vouchernumber: voucherData.voucher_number,
        date: voucherData.date,
        voucher_date: voucherData.date,
        amount: voucherData.total_amount,
        narration: voucherData.narration,
        partyname: voucherData.party_ledger_name,
        partyledgername: voucherData.party_ledger_name,
        iscancelled: !!voucherData.is_cancelled,
        isoptional: !!voucherData.is_optional,
        alterid: voucherData.alterid,
        masterid: 0,
        classname: '',
        created_at: voucherData.created_at,
        updated_at: voucherData.created_at,
        company_id: companyId,
        division_id: divisionId
      };

      // Fetch accounting entries from backup table
      const { data: accountingData, error: accountingError } = await supabase
        .from('bkp_trn_accounting')
        .select('*')
        .eq('voucher_guid', voucherGuid)
        .eq('company_id', companyId)
        .eq('division_id', divisionId);

      const entries = accountingData?.map(entry => ({
        id: 0,
        ledgername: entry.ledger,
        amount: entry.amount,
        isdeemedpositive: !!entry.is_deemed_positive,
        ispartyledger: !!entry.is_party_ledger
      })) || [];

      const totalDebit = entries
        .filter(entry => entry.isdeemedpositive)
        .reduce((sum, entry) => sum + (entry.amount || 0), 0);
      
      const totalCredit = entries
        .filter(entry => !entry.isdeemedpositive)
        .reduce((sum, entry) => sum + Math.abs(entry.amount || 0), 0);

      return {
        ...voucher,
        accounting_entries: entries,
        total_debit: totalDebit,
        total_credit: totalCredit
      } as VtVoucherDetail;


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