import { supabase } from '@/integrations/supabase/client';

export interface TallyCompanyMapping {
  id: number;
  tally_company_id: string;
  erp_division_id: string;
  tally_company_name: string;
  erp_division_name: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyDivision {
  company_id: string;
  company_name: string;
  division_id: string;
  division_name: string;
  tally_company_id?: string;
}

export class TallyMappingService {
  /**
   * Get Tally company ID from ERP division ID
   */
  static async getTallyCompanyId(erpDivisionId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_tally_company_id', { erp_division_id_param: erpDivisionId });
      
      if (error) {
        console.error('Error getting Tally company ID:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error in getTallyCompanyId:', error);
      return null;
    }
  }

  /**
   * Get ERP division ID from Tally company ID
   */
  static async getErpDivisionId(tallyCompanyId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_erp_division_id', { tally_company_id_param: tallyCompanyId });
      
      if (error) {
        console.error('Error getting ERP division ID:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error in getErpDivisionId:', error);
      return null;
    }
  }

  /**
   * Get all company-division mappings with Tally information
   */
  static async getCompanyDivisions(): Promise<CompanyDivision[]> {
    try {
      const { data, error } = await supabase
        .from('mst_company')
        .select(`
          company_id,
          company_name,
          mst_division!inner(
            division_id,
            division_name,
            tally_url
          )
        `)
        .order('company_name');

      if (error) {
        console.error('Error fetching company divisions:', error);
        return [];
      }

      // Flatten the data and add Tally company ID
      const result: CompanyDivision[] = [];
      
      for (const company of data || []) {
        for (const division of company.mst_division) {
          const tallyCompanyId = await this.getTallyCompanyId(division.division_id);
          
          result.push({
            company_id: company.company_id,
            company_name: company.company_name,
            division_id: division.division_id,
            division_name: division.division_name,
            tally_company_id: tallyCompanyId || undefined
          });
        }
      }

      return result;
    } catch (error) {
      console.error('Error in getCompanyDivisions:', error);
      return [];
    }
  }

  /**
   * Get Tally data for a specific division
   */
  static async getTallyDataForDivision(divisionId: string) {
    try {
      const tallyCompanyId = await this.getTallyCompanyId(divisionId);
      
      if (!tallyCompanyId) {
        throw new Error('No Tally company mapping found for this division');
      }

      // Get all Tally data for this company
      const { data: ledgers, error: ledgerError } = await supabase
        .from('mst_ledger')
        .select('*')
        .eq('company_id', tallyCompanyId)
        .order('name');

      const { data: groups, error: groupError } = await supabase
        .from('mst_group')
        .select('*')
        .eq('company_id', tallyCompanyId)
        .order('name');

      const { data: vouchers, error: voucherError } = await supabase
        .from('trn_voucher')
        .select('*')
        .eq('company_id', tallyCompanyId)
        .order('date', { ascending: false })
        .limit(100);

      if (ledgerError || groupError || voucherError) {
        throw new Error('Error fetching Tally data');
      }

      return {
        ledgers: ledgers || [],
        groups: groups || [],
        vouchers: vouchers || [],
        tallyCompanyId
      };
    } catch (error) {
      console.error('Error in getTallyDataForDivision:', error);
      throw error;
    }
  }

  /**
   * Create a new company-division mapping
   */
  static async createMapping(
    tallyCompanyId: string,
    erpDivisionId: string,
    tallyCompanyName: string,
    erpDivisionName: string
  ): Promise<TallyCompanyMapping | null> {
    try {
      const { data, error } = await supabase
        .from('tally_company_mapping')
        .insert({
          tally_company_id: tallyCompanyId,
          erp_division_id: erpDivisionId,
          tally_company_name: tallyCompanyName,
          erp_division_name: erpDivisionName
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating mapping:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createMapping:', error);
      return null;
    }
  }

  /**
   * Get all mappings
   */
  static async getAllMappings(): Promise<TallyCompanyMapping[]> {
    try {
      const { data, error } = await supabase
        .from('tally_company_mapping')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching mappings:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllMappings:', error);
      return [];
    }
  }
}
