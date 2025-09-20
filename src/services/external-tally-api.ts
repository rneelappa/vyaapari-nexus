interface TallyApiFilters {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
  type?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface TallyApiResponse<T = any> {
  success: boolean;
  data: T;
  error?: string;
}

interface VoucherListResponse {
  vouchers: any[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface SyncRequest {
  fromDate: string;
  toDate: string;
}

export class ExternalTallyApiService {
  private baseURL = 'https://tally-sync-vyaapari360-production.up.railway.app';

  async getHealth(): Promise<TallyApiResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/health`);
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, data: null, error: (error as Error).message };
    }
  }

  async getDivisionStatus(): Promise<TallyApiResponse> {
    try {
      const response = await fetch(`${this.baseURL}/tally-sync/divisions/status`);
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, data: null, error: (error as Error).message };
    }
  }

  async queryData(companyId: string, divisionId: string, table: string, filters: any = {}, limit = 100, offset = 0): Promise<TallyApiResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/query/${companyId}/${divisionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table,
          filters,
          limit,
          offset
        })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, data: null, error: (error as Error).message };
    }
  }

  async getMetadata(companyId: string, divisionId: string): Promise<TallyApiResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/metadata/${companyId}/${divisionId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, data: null, error: (error as Error).message };
    }
  }

  async getStats(companyId: string, divisionId: string): Promise<TallyApiResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/stats/${companyId}/${divisionId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, data: null, error: (error as Error).message };
    }
  }

  async getTables(): Promise<TallyApiResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/tables`);
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, data: null, error: (error as Error).message };
    }
  }

  async bulkSync(companyId: string, divisionId: string, table: string, data: any[], syncType = 'full'): Promise<TallyApiResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/bulk-sync/${companyId}/${divisionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table,
          data,
          sync_type: syncType,
          metadata: { timestamp: new Date().toISOString() }
        })
      });
      const data_response = await response.json();
      return data_response;
    } catch (error) {
      return { success: false, data: null, error: (error as Error).message };
    }
  }

  async triggerDivisionSync(companyId: string, divisionId: string): Promise<TallyApiResponse> {
    try {
      const response = await fetch(`${this.baseURL}/tally-sync/divisions/${divisionId}/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, data: null, error: (error as Error).message };
    }
  }

  // Legacy method for backward compatibility - now uses new query endpoint
  async getVouchers(companyId: string, divisionId: string, filters: TallyApiFilters = {}): Promise<TallyApiResponse<VoucherListResponse>> {
    try {
      const queryFilters: any = {};
      if (filters.from) queryFilters.date = `${filters.from}*`;
      if (filters.to) queryFilters.date_to = filters.to;
      if (filters.type) queryFilters.voucher_type = filters.type;
      if (filters.search) queryFilters.search = filters.search;

      const result = await this.queryData(
        companyId, 
        divisionId, 
        'vouchers', 
        queryFilters, 
        filters.limit || 50, 
        ((filters.page || 1) - 1) * (filters.limit || 50)
      );

      if (result.success) {
        const responseData: VoucherListResponse = {
          vouchers: result.data.records || [],
          page: filters.page || 1,
          limit: filters.limit || 50,
          total: result.data.pagination?.total_records || 0,
          pages: Math.ceil((result.data.pagination?.total_records || 0) / (filters.limit || 50))
        };
        return { success: true, data: responseData };
      }
      
      return result;
    } catch (error) {
      return { success: false, data: null, error: (error as Error).message };
    }
  }

  // Compatibility methods for voucher operations
  async getVoucher(companyId: string, divisionId: string, voucherId: string): Promise<TallyApiResponse> {
    return this.queryData(companyId, divisionId, 'vouchers', { guid: voucherId }, 1, 0);
  }

  async updateVoucher(companyId: string, divisionId: string, voucherId: string, updates: any): Promise<TallyApiResponse> {
    // This would require a new API endpoint for updates
    return { success: false, data: null, error: 'Update operation not implemented in new API' };
  }

  async exportVoucherXml(companyId: string, divisionId: string, voucherId: string): Promise<TallyApiResponse<string>> {
    // This would require a new API endpoint for XML export
    return { success: false, data: null, error: 'XML export not implemented in new API' };
  }

  // Legacy sync method for backward compatibility
  async syncFromTally(companyId: string, divisionId: string, fromDate: string, toDate: string): Promise<TallyApiResponse> {
    return this.triggerDivisionSync(companyId, divisionId);
  }

  // Master Data Methods - Updated to use new query endpoint
  async getLedgerMasters(companyId: string, divisionId: string): Promise<TallyApiResponse> {
    return this.queryData(companyId, divisionId, 'ledgers');
  }

  async getStockMasters(companyId: string, divisionId: string): Promise<TallyApiResponse> {
    return this.queryData(companyId, divisionId, 'stock_items');
  }

  async getGroupMasters(companyId: string, divisionId: string): Promise<TallyApiResponse> {
    return this.queryData(companyId, divisionId, 'groups');
  }

  async getUnitMasters(companyId: string, divisionId: string): Promise<TallyApiResponse> {
    return this.queryData(companyId, divisionId, 'uoms');
  }

  async getGodownMasters(companyId: string, divisionId: string): Promise<TallyApiResponse> {
    return this.queryData(companyId, divisionId, 'godowns');
  }

  async getEmployeeMasters(companyId: string, divisionId: string): Promise<TallyApiResponse> {
    return this.queryData(companyId, divisionId, 'employees');
  }

  async getCostCenterMasters(companyId: string, divisionId: string): Promise<TallyApiResponse> {
    return this.queryData(companyId, divisionId, 'cost_centers');
  }

  async getVoucherTypeMasters(companyId: string, divisionId: string): Promise<TallyApiResponse> {
    return this.queryData(companyId, divisionId, 'voucher_types');
  }

  // Accounting Reports Methods
  async getTrialBalance(companyId: string, divisionId: string, fromDate: string, toDate: string): Promise<TallyApiResponse> {
    try {
      const params = new URLSearchParams({ fromDate, toDate });
      const response = await fetch(`${this.baseURL}/reports/trial-balance/${companyId}/${divisionId}?${params}`);
      const responseData = await response.json();
      const data = responseData.success ? responseData.data : responseData;
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, data: null, error: (error as Error).message };
    }
  }

  async getProfitLoss(companyId: string, divisionId: string, fromDate: string, toDate: string): Promise<TallyApiResponse> {
    try {
      const params = new URLSearchParams({ fromDate, toDate });
      const response = await fetch(`${this.baseURL}/reports/profit-loss/${companyId}/${divisionId}?${params}`);
      const responseData = await response.json();
      const data = responseData.success ? responseData.data : responseData;
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, data: null, error: (error as Error).message };
    }
  }

  async getBalanceSheet(companyId: string, divisionId: string, fromDate: string, toDate: string): Promise<TallyApiResponse> {
    try {
      const params = new URLSearchParams({ fromDate, toDate });
      const response = await fetch(`${this.baseURL}/reports/balance-sheet/${companyId}/${divisionId}?${params}`);
      const responseData = await response.json();
      const data = responseData.success ? responseData.data : responseData;
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, data: null, error: (error as Error).message };
    }
  }
}

export const externalTallyApi = new ExternalTallyApiService();