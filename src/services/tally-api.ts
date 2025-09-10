import axios from 'axios';

// Tally Backend API Configuration
const TALLY_API_BASE_URL = 'http://localhost:5001/api';

// API Client
const tallyApi = axios.create({
  baseURL: TALLY_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface TallyGroup {
  guid: string;
  company_id: string;
  division_id: string;
  name: string;
  parent: string;
  _parent: string;
  primary_group: string;
  is_revenue: boolean | null;
  is_deemedpositive: boolean | null;
  is_reserved: boolean | null;
  affects_gross_profit: boolean | null;
  sort_position: number | null;
  created_at: string;
  ledger_count?: string;
}

export interface TallyLedger {
  guid: string;
  company_id: string;
  division_id: string;
  name: string;
  parent: string;
  opening_balance: number;
  closing_balance: number;
  created_at: string;
  group_name?: string;
}

export interface TallyVoucher {
  guid: string;
  company_id: string;
  division_id: string;
  voucher_number: string;
  date: string;
  reference: string;
  narration: string;
  voucher_type: string;
  party_name: string;
  place_of_supply: string;
  created_at: string;
}

export interface TallyStockItem {
  guid: string;
  company_id: string;
  division_id: string;
  name: string;
  parent: string;
  unit: string;
  created_at: string;
}

export interface TallyDashboardStats {
  total_ledgers: string;
  total_vouchers: string;
  total_stock_items: string;
  total_groups: string;
  total_voucher_types: number;
  total_accounting_entries: number;
}

export interface TallyApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface TallyPaginationResponse<T> extends TallyApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// API Service Class
export class TallyApiService {
  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(): Promise<TallyApiResponse<TallyDashboardStats>> {
    try {
      const response = await tallyApi.get('/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error('Failed to fetch dashboard statistics');
    }
  }

  /**
   * Get groups with pagination and filtering
   */
  static async getGroups(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<TallyPaginationResponse<TallyGroup[]>> {
    try {
      const response = await tallyApi.get('/groups', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching groups:', error);
      throw new Error('Failed to fetch groups');
    }
  }

  /**
   * Get ledgers with pagination and filtering
   */
  static async getLedgers(params?: {
    page?: number;
    limit?: number;
    group?: string;
    search?: string;
  }): Promise<TallyPaginationResponse<TallyLedger[]>> {
    try {
      const response = await tallyApi.get('/ledgers', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching ledgers:', error);
      throw new Error('Failed to fetch ledgers');
    }
  }

  /**
   * Get vouchers with pagination and filtering
   */
  static async getVouchers(params?: {
    page?: number;
    limit?: number;
    type?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<TallyPaginationResponse<TallyVoucher[]>> {
    try {
      const response = await tallyApi.get('/vouchers', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      throw new Error('Failed to fetch vouchers');
    }
  }

  /**
   * Get stock items with pagination and filtering
   */
  static async getStockItems(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<TallyPaginationResponse<TallyStockItem[]>> {
    try {
      const response = await tallyApi.get('/stock-items', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching stock items:', error);
      throw new Error('Failed to fetch stock items');
    }
  }

  /**
   * Get voucher types
   */
  static async getVoucherTypes(): Promise<TallyApiResponse<any[]>> {
    try {
      const response = await tallyApi.get('/voucher-types');
      return response.data;
    } catch (error) {
      console.error('Error fetching voucher types:', error);
      throw new Error('Failed to fetch voucher types');
    }
  }

  /**
   * Get single voucher details
   */
  static async getVoucherDetails(guid: string): Promise<TallyApiResponse<{
    voucher: TallyVoucher;
    accounting: any[];
  }>> {
    try {
      const response = await tallyApi.get(`/vouchers/${guid}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching voucher details:', error);
      throw new Error('Failed to fetch voucher details');
    }
  }

  /**
   * Health check
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await tallyApi.get('/health');
      return response.data.success === true;
    } catch (error) {
      console.error('Tally API health check failed:', error);
      return false;
    }
  }
}

export default TallyApiService;
