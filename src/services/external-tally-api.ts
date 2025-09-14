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
        ...(filters.type && { type: filters.type }),
        ...(filters.search && { search: filters.search })
      });

      const response = await fetch(`${this.baseURL}/vouchers/${companyId}/${divisionId}?${params}`);
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, data: null, error: (error as Error).message };
    }
  }

  async getVoucher(companyId: string, divisionId: string, voucherId: string): Promise<TallyApiResponse> {
    try {
      const response = await fetch(`${this.baseURL}/voucher/${companyId}/${divisionId}/${voucherId}`);
      const data = await response.json();
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
      const data = await response.json();
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
}

export const externalTallyApi = new ExternalTallyApiService();