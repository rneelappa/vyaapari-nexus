import { supabase } from "@/integrations/supabase/client";
import TallyApiService, { TallyGroup, TallyLedger, TallyVoucher, TallyStockItem, TallyDashboardStats } from "./tally-api";

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
      // Mock data until Tally tables are created
      return "mock-tally-company-id";
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
      // Mock data until Tally tables are created
      return "mock-erp-division-id";
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
      // Mock data until Tally tables are created
      return [
        {
          company_id: "mock-company-1",
          company_name: "Sample Company Ltd",
          division_id: "mock-division-1",
          division_name: "Head Office",
          tally_company_id: "mock-tally-company-1"
        },
        {
          company_id: "mock-company-1",
          company_name: "Sample Company Ltd",
          division_id: "mock-division-2", 
          division_name: "Branch Office",
          tally_company_id: "mock-tally-company-2"
        }
      ];
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
      // Check if Tally API is available
      const isApiAvailable = await TallyApiService.healthCheck();
      if (!isApiAvailable) {
        console.warn('Tally API not available, returning mock data');
        return this.getMockTallyData();
      }

      // Fetch real data from Tally API
      const [groupsResponse, ledgersResponse, vouchersResponse, stockItemsResponse] = await Promise.all([
        TallyApiService.getGroups({ limit: 100 }),
        TallyApiService.getLedgers({ limit: 100 }),
        TallyApiService.getVouchers({ limit: 100 }),
        TallyApiService.getStockItems({ limit: 100 })
      ]);

      return {
        groups: groupsResponse.data || [],
        ledgers: ledgersResponse.data || [],
        vouchers: vouchersResponse.data || [],
        stockItems: stockItemsResponse.data || [],
        tallyCompanyId: "bc90d453-0c64-4f6f-8bbe-dca32aba40d1" // SKM Steels company ID
      };
    } catch (error) {
      console.error('Error in getTallyDataForDivision:', error);
      // Fallback to mock data if API fails
      return this.getMockTallyData();
    }
  }

  /**
   * Get mock Tally data as fallback
   */
  private static getMockTallyData() {
    return {
      groups: [
        {
          guid: "mock-group-1",
          name: "Current Assets",
          parent: "Assets",
          primary_group: "Assets"
        }
      ],
      ledgers: [
        {
          guid: "mock-ledger-1",
          name: "Cash",
          parent: "Cash-in-Hand",
          opening_balance: 10000
        }
      ],
      vouchers: [
        {
          guid: "mock-voucher-1",
          voucher_type: "Receipt",
          date: new Date().toISOString(),
          amount: 1000
        }
      ],
      stockItems: [],
      tallyCompanyId: "mock-tally-company-id"
    };
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
      // Mock data until Tally tables are created
      return {
        id: 1,
        tally_company_id: tallyCompanyId,
        erp_division_id: erpDivisionId,
        tally_company_name: tallyCompanyName,
        erp_division_name: erpDivisionName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
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
      // Mock data until Tally tables are created
      return [
        {
          id: 1,
          tally_company_id: "mock-tally-company-1",
          erp_division_id: "mock-division-1",
          tally_company_name: "Sample Tally Company",
          erp_division_name: "Head Office",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    } catch (error) {
      console.error('Error in getAllMappings:', error);
      return [];
    }
  }

  // Additional helper functions for backward compatibility
  static async getTallyCompanyInfo() {
    return {
      id: "mock-company-id",
      name: "Sample Tally Company",
      created_at: new Date().toISOString()
    };
  }

  static async getTallyDivisions() {
    return [
      {
        id: "mock-division-1",
        name: "Head Office",
        company_id: "mock-company-id",
        created_at: new Date().toISOString()
      },
      {
        id: "mock-division-2", 
        name: "Branch Office",
        company_id: "mock-company-id",
        created_at: new Date().toISOString()
      }
    ];
  }
}

// Export backward compatible functions
export const getTallyCompanyId = TallyMappingService.getTallyCompanyId;
export const getErpDivisionId = TallyMappingService.getErpDivisionId;
export const getTallyCompanyInfo = TallyMappingService.getTallyCompanyInfo;
export const getTallyDivisions = TallyMappingService.getTallyDivisions;