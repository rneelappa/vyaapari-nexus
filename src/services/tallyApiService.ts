/**
 * Comprehensive Tally API Service
 * Centralized service for all Tally API operations
 * Replaces Supabase queries with Railway API backend
 */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: string | null;
  metadata: {
    timestamp: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    [key: string]: any;
  };
}

export interface Ledger {
  guid: string;
  name: string;
  parent: string;
  alias: string;
  opening_balance: number;
  closing_balance: number;
  is_revenue: boolean;
  is_deemedpositive: boolean;
  gstn: string;
  email: string;
  mailing_address: string;
}

export interface Group {
  guid: string;
  name: string;
  parent: string;
  primary_group: string;
  is_revenue: boolean;
  is_deemedpositive: boolean;
  affects_gross_profit: boolean;
}

export interface StockItem {
  guid: string;
  name: string;
  parent: string;
  category: string;
  base_unit: string;
  opening_balance: number;
  closing_balance: number;
  opening_rate: number;
  closing_rate: number;
}

export interface VoucherType {
  guid: string;
  name: string;
  parent: string;
  affects_stock: boolean;
  is_deemedpositive: boolean;
  common_narration: string;
}

export interface Voucher {
  id: string;
  vchkey: string;
  alterId: string;
  date: string;
  type: string;
  number: string;
  narration: string;
  partyLedgerName: string;
  amount: number;
  entries: Array<{
    ledgerName: string;
    amount: number;
    isDebit: boolean;
    isPartyledger: boolean;
  }>;
  inventoryEntries: Array<{
    stockItemName: string;
    actualQuantity: number;
    rate: number;
    amount: number;
    godownName: string;
  }>;
}

export interface CompleteVoucher {
  voucher: Voucher;
  partyRelationship: {
    partyLedger: any;
    transactionHistory: {
      totalVouchers: number;
      totalAmount: number;
    };
  };
  accountingRelationships: Array<{
    ledgerHierarchy: any;
    amount: number;
    isDebit: boolean;
    isPartyLedger: boolean;
  }>;
  inventoryRelationships: Array<{
    stockItemHierarchy: any;
    quantity: number;
    rate: number;
    amount: number;
    godown: string;
  }>;
  relationshipSummary: {
    totalLedgersInvolved: number;
    totalStockItemsInvolved: number;
    hasInventory: boolean;
    isPartyTransaction: boolean;
    transactionComplexity: 'Simple' | 'Complex';
  };
}

export interface MonthlyAnalysis {
  fiscalYear: string;
  analysisType: string;
  totalGroups?: number;
  totalLedgers?: number;
  totalStockItems?: number;
  groups?: Array<{
    group: Group;
    ledgerCount: number;
    monthlyBreakup: Array<{
      month: string;
      year: number;
      fromDate: string;
      toDate: string;
      voucherCount: number;
      totalAmount: number;
    }>;
    fiscalYearSummary: {
      totalVouchers: number;
      totalAmount: number;
      activeMonths: number;
      peakMonth: any;
    };
  }>;
}

export interface HierarchyData {
  format: 'tree' | 'flat';
  hierarchy: any[];
  statistics: {
    totalGroups?: number;
    totalStockItems?: number;
    maxDepth: number;
    rootItems?: number;
    itemsWithChildren?: number;
  };
}

export class TallyApiService {
  private baseUrl = 'https://tally-sync-vyaapari360-production.up.railway.app/api/v1';
  
  private async apiCall<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });
      
      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // ==================== MASTER DATA APIS ====================

  async getLedgers(
    companyId: string, 
    divisionId: string, 
    options?: {
      page?: number;
      limit?: number;
      search?: string;
      parent?: string;
    }
  ): Promise<ApiResponse<Ledger[]>> {
    const params = new URLSearchParams();
    if (options?.page) params.set('page', options.page.toString());
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.search) params.set('search', options.search);
    if (options?.parent) params.set('parent', options.parent);
    
    return this.apiCall<Ledger[]>(`/ledgers/${companyId}/${divisionId}?${params}`);
  }

  async getLedger(companyId: string, divisionId: string, ledgerId: string): Promise<ApiResponse<Ledger>> {
    return this.apiCall<Ledger>(`/ledgers/${companyId}/${divisionId}/${ledgerId}`);
  }

  async createLedger(
    companyId: string, 
    divisionId: string, 
    ledgerData: Partial<Ledger>
  ): Promise<ApiResponse<Ledger>> {
    return this.apiCall<Ledger>(`/ledgers/${companyId}/${divisionId}`, {
      method: 'POST',
      body: JSON.stringify(ledgerData),
    });
  }

  async updateLedger(
    companyId: string, 
    divisionId: string, 
    ledgerId: string, 
    ledgerData: Partial<Ledger>
  ): Promise<ApiResponse<Ledger>> {
    return this.apiCall<Ledger>(`/ledgers/${companyId}/${divisionId}/${ledgerId}`, {
      method: 'PUT',
      body: JSON.stringify(ledgerData),
    });
  }

  async deleteLedger(companyId: string, divisionId: string, ledgerId: string): Promise<ApiResponse<any>> {
    return this.apiCall<any>(`/ledgers/${companyId}/${divisionId}/${ledgerId}`, {
      method: 'DELETE',
    });
  }

  async getGroups(
    companyId: string, 
    divisionId: string, 
    options?: {
      page?: number;
      limit?: number;
      search?: string;
      parent?: string;
    }
  ): Promise<ApiResponse<Group[]>> {
    const params = new URLSearchParams();
    if (options?.page) params.set('page', options.page.toString());
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.search) params.set('search', options.search);
    if (options?.parent) params.set('parent', options.parent);
    
    return this.apiCall<Group[]>(`/groups/${companyId}/${divisionId}?${params}`);
  }

  async createGroup(
    companyId: string, 
    divisionId: string, 
    groupData: Partial<Group>
  ): Promise<ApiResponse<Group>> {
    return this.apiCall<Group>(`/groups/${companyId}/${divisionId}`, {
      method: 'POST',
      body: JSON.stringify(groupData),
    });
  }

  async getStockItems(
    companyId: string, 
    divisionId: string, 
    options?: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      parent?: string;
    }
  ): Promise<ApiResponse<StockItem[]>> {
    const params = new URLSearchParams();
    if (options?.page) params.set('page', options.page.toString());
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.search) params.set('search', options.search);
    if (options?.category) params.set('category', options.category);
    if (options?.parent) params.set('parent', options.parent);
    
    return this.apiCall<StockItem[]>(`/stock-items/${companyId}/${divisionId}?${params}`);
  }

  async createStockItem(
    companyId: string, 
    divisionId: string, 
    stockData: Partial<StockItem>
  ): Promise<ApiResponse<StockItem>> {
    return this.apiCall<StockItem>(`/stock-items/${companyId}/${divisionId}`, {
      method: 'POST',
      body: JSON.stringify(stockData),
    });
  }

  async getVoucherTypes(
    companyId: string, 
    divisionId: string, 
    options?: {
      page?: number;
      limit?: number;
      search?: string;
      affects_stock?: string;
    }
  ): Promise<ApiResponse<VoucherType[]>> {
    const params = new URLSearchParams();
    if (options?.page) params.set('page', options.page.toString());
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.search) params.set('search', options.search);
    if (options?.affects_stock) params.set('affects_stock', options.affects_stock);
    
    return this.apiCall<VoucherType[]>(`/voucher-types/${companyId}/${divisionId}?${params}`);
  }

  // ==================== TRANSACTION APIS ====================

  async syncVouchers(
    companyId: string, 
    divisionId: string, 
    syncData: {
      fromDate: string;
      toDate: string;
      chunkDays?: number;
    }
  ): Promise<ApiResponse<any>> {
    return this.apiCall<any>(`/sync/${companyId}/${divisionId}`, {
      method: 'POST',
      body: JSON.stringify(syncData),
    });
  }

  async getVouchers(companyId: string, divisionId: string): Promise<ApiResponse<{ vouchers: Voucher[] }>> {
    return this.apiCall<{ vouchers: Voucher[] }>(`/vouchers/${companyId}/${divisionId}`);
  }

  async getEnhancedVouchers(
    companyId: string, 
    divisionId: string, 
    options?: {
      fromDate?: string;
      toDate?: string;
      page?: number;
      limit?: number;
      voucherType?: string;
      search?: string;
    }
  ): Promise<ApiResponse<Voucher[]>> {
    const params = new URLSearchParams();
    if (options?.fromDate) params.set('fromDate', options.fromDate);
    if (options?.toDate) params.set('toDate', options.toDate);
    if (options?.page) params.set('page', options.page.toString());
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.voucherType) params.set('voucherType', options.voucherType);
    if (options?.search) params.set('search', options.search);
    
    return this.apiCall<Voucher[]>(`/vouchers-enhanced/${companyId}/${divisionId}?${params}`);
  }

  async createVoucher(
    companyId: string, 
    divisionId: string, 
    voucherData: {
      voucherType: string;
      date: string;
      voucherNumber?: string;
      partyLedgerName: string;
      narration?: string;
      reference?: string;
      referenceDate?: string;
      entries: Array<{
        ledgerName: string;
        amount: number;
        isDebit: boolean;
      }>;
    }
  ): Promise<ApiResponse<any>> {
    return this.apiCall<any>(`/vouchers/${companyId}/${divisionId}`, {
      method: 'POST',
      body: JSON.stringify(voucherData),
    });
  }

  // ==================== RELATIONSHIP APIS ====================

  async getVoucherComplete(
    companyId: string, 
    divisionId: string, 
    voucherId: string
  ): Promise<ApiResponse<CompleteVoucher>> {
    return this.apiCall<CompleteVoucher>(`/vouchers/${companyId}/${divisionId}/${voucherId}/complete`);
  }

  async getLedgerComplete(
    companyId: string, 
    divisionId: string, 
    ledgerId: string
  ): Promise<ApiResponse<any>> {
    return this.apiCall<any>(`/ledgers/${companyId}/${divisionId}/${ledgerId}/complete`);
  }

  async getStockItemComplete(
    companyId: string, 
    divisionId: string, 
    itemId: string
  ): Promise<ApiResponse<any>> {
    return this.apiCall<any>(`/stock-items/${companyId}/${divisionId}/${itemId}/complete`);
  }

  // ==================== MONTHLY ANALYSIS APIS ====================

  async getGroupsMonthlyAnalysis(
    companyId: string, 
    divisionId: string, 
    fiscalYear: number = 2025
  ): Promise<ApiResponse<MonthlyAnalysis>> {
    return this.apiCall<MonthlyAnalysis>(`/analysis/groups-monthly/${companyId}/${divisionId}?fiscalYear=${fiscalYear}`);
  }

  async getLedgersMonthlyAnalysis(
    companyId: string, 
    divisionId: string, 
    fiscalYear: number = 2025,
    ledgerName?: string
  ): Promise<ApiResponse<MonthlyAnalysis>> {
    const params = new URLSearchParams();
    params.set('fiscalYear', fiscalYear.toString());
    if (ledgerName) params.set('ledgerName', ledgerName);
    
    return this.apiCall<MonthlyAnalysis>(`/analysis/ledgers-monthly/${companyId}/${divisionId}?${params}`);
  }

  async getStockItemsMonthlyAnalysis(
    companyId: string, 
    divisionId: string, 
    fiscalYear: number = 2025,
    stockItemName?: string
  ): Promise<ApiResponse<MonthlyAnalysis>> {
    const params = new URLSearchParams();
    params.set('fiscalYear', fiscalYear.toString());
    if (stockItemName) params.set('stockItemName', stockItemName);
    
    return this.apiCall<MonthlyAnalysis>(`/analysis/stock-items-monthly/${companyId}/${divisionId}?${params}`);
  }

  async getPartyMonthlyAnalysis(
    companyId: string, 
    divisionId: string, 
    fiscalYear: number = 2025,
    partyType: 'customers' | 'suppliers' | 'all' = 'all'
  ): Promise<ApiResponse<MonthlyAnalysis>> {
    const params = new URLSearchParams();
    params.set('fiscalYear', fiscalYear.toString());
    params.set('partyType', partyType);
    
    return this.apiCall<MonthlyAnalysis>(`/analysis/party-monthly/${companyId}/${divisionId}?${params}`);
  }

  // ==================== HIERARCHY APIS ====================

  async getGroupsHierarchy(
    companyId: string, 
    divisionId: string, 
    format: 'tree' | 'flat' = 'tree'
  ): Promise<ApiResponse<HierarchyData>> {
    return this.apiCall<HierarchyData>(`/hierarchy/groups/${companyId}/${divisionId}?format=${format}`);
  }

  async getStockItemsHierarchy(
    companyId: string, 
    divisionId: string, 
    format: 'tree' | 'flat' = 'tree',
    maxItems: number = 100
  ): Promise<ApiResponse<HierarchyData>> {
    return this.apiCall<HierarchyData>(`/hierarchy/stock-items/${companyId}/${divisionId}?format=${format}&maxItems=${maxItems}`);
  }

  async getLedgersHierarchy(
    companyId: string, 
    divisionId: string, 
    format: 'tree' | 'flat' = 'tree',
    groupName?: string
  ): Promise<ApiResponse<HierarchyData>> {
    const params = new URLSearchParams();
    params.set('format', format);
    if (groupName) params.set('groupName', groupName);
    
    return this.apiCall<HierarchyData>(`/hierarchy/ledgers/${companyId}/${divisionId}?${params}`);
  }

  // ==================== FINANCIAL REPORTS APIS ====================

  async getBalanceSheet(
    companyId: string, 
    divisionId: string, 
    fromDate: string, 
    toDate: string
  ): Promise<ApiResponse<any>> {
    return this.apiCall<any>(`/reports/balance-sheet/${companyId}/${divisionId}?fromDate=${fromDate}&toDate=${toDate}`);
  }

  async getProfitLoss(
    companyId: string, 
    divisionId: string, 
    fromDate: string, 
    toDate: string
  ): Promise<ApiResponse<any>> {
    return this.apiCall<any>(`/reports/profit-loss/${companyId}/${divisionId}?fromDate=${fromDate}&toDate=${toDate}`);
  }

  async getTrialBalance(
    companyId: string, 
    divisionId: string, 
    fromDate: string, 
    toDate: string
  ): Promise<ApiResponse<any>> {
    return this.apiCall<any>(`/reports/trial-balance/${companyId}/${divisionId}?fromDate=${fromDate}&toDate=${toDate}`);
  }

  // ==================== UTILITY METHODS ====================

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl.replace('/api/v1', '')}/`);
      return response.ok;
    } catch {
      return false;
    }
  }

  getApiUrl(): string {
    return this.baseUrl;
  }
}

// Export singleton instance
export const tallyApi = new TallyApiService();
