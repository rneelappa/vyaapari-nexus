interface TallyApiFilters {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
  type?: string;
  search?: string;
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
  private baseURL = 'https://tally-sync-vyaapari360-production.up.railway.app/api/v1';

  async getHealth(): Promise<TallyApiResponse> {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, data: null, error: (error as Error).message };
    }
  }

  async syncFromTally(companyId: string, divisionId: string, fromDate: string, toDate: string): Promise<TallyApiResponse> {
    try {
      const response = await fetch(`${this.baseURL}/sync/${companyId}/${divisionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromDate, toDate } as SyncRequest)
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, data: null, error: (error as Error).message };
    }
  }

  async getVouchers(companyId: string, divisionId: string, filters: TallyApiFilters = {}): Promise<TallyApiResponse<VoucherListResponse>> {
    try {
      const params = new URLSearchParams({
        page: (filters.page || 1).toString(),
        limit: (filters.limit || 50).toString(),
        ...(filters.from && { from: filters.from }),
        ...(filters.to && { to: filters.to }),
        ...(filters.type && { type: filters.type?.toUpperCase() }),
        ...(filters.search && { search: filters.search })
      });

      const response = await fetch(`${this.baseURL}/vouchers/${companyId}/${divisionId}?${params}`);
      const responseData = await response.json();
      
      // Unwrap the data payload from the API response
      const data = responseData.success ? responseData.data : responseData;
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, data: null, error: (error as Error).message };
    }
  }

  async getVoucher(companyId: string, divisionId: string, voucherId: string): Promise<TallyApiResponse> {
    try {
      const response = await fetch(`${this.baseURL}/voucher/${companyId}/${divisionId}/${voucherId}`);
      const responseData = await response.json();
      const data = responseData.success ? responseData.data : responseData;
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, data: null, error: (error as Error).message };
    }
  }

  async updateVoucher(companyId: string, divisionId: string, voucherId: string, updates: any): Promise<TallyApiResponse> {
    try {
      const response = await fetch(`${this.baseURL}/voucher/${companyId}/${divisionId}/${voucherId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const responseData = await response.json();
      const data = responseData.success ? responseData.data : responseData;
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, data: null, error: (error as Error).message };
    }
  }

  async exportVoucherXml(companyId: string, divisionId: string, voucherId: string): Promise<TallyApiResponse<string>> {
    try {
      const response = await fetch(`${this.baseURL}/voucher/${companyId}/${divisionId}/${voucherId}/xml`);
      const xmlData = await response.text();
      return { success: response.ok, data: xmlData };
    } catch (error) {
      return { success: false, data: null, error: (error as Error).message };
    }
  }

  // Master Data Methods
  async getLedgerMasters(companyId: string, divisionId: string): Promise<TallyApiResponse> {
    try {
      const response = await fetch(`${this.baseURL}/masters/ledgers/${companyId}/${divisionId}`);
      const responseData = await response.json();
      const data = responseData.success ? responseData.data : responseData;
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, data: null, error: (error as Error).message };
    }
  }

  async getStockMasters(companyId: string, divisionId: string): Promise<TallyApiResponse> {
    try {
      const response = await fetch(`${this.baseURL}/masters/stocks/${companyId}/${divisionId}`);
      const responseData = await response.json();
      const data = responseData.success ? responseData.data : responseData;
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, data: null, error: (error as Error).message };
    }
  }

  async getGroupMasters(companyId: string, divisionId: string): Promise<TallyApiResponse> {
    try {
      const response = await fetch(`${this.baseURL}/masters/groups/${companyId}/${divisionId}`);
      const responseData = await response.json();
      const data = responseData.success ? responseData.data : responseData;
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, data: null, error: (error as Error).message };
    }
  }

  async getUnitMasters(companyId: string, divisionId: string): Promise<TallyApiResponse> {
    try {
      const response = await fetch(`${this.baseURL}/masters/units/${companyId}/${divisionId}`);
      const responseData = await response.json();
      const data = responseData.success ? responseData.data : responseData;
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, data: null, error: (error as Error).message };
    }
  }

  async getGodownMasters(companyId: string, divisionId: string): Promise<TallyApiResponse> {
    try {
      const response = await fetch(`${this.baseURL}/masters/godowns/${companyId}/${divisionId}`);
      const responseData = await response.json();
      const data = responseData.success ? responseData.data : responseData;
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, data: null, error: (error as Error).message };
    }
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