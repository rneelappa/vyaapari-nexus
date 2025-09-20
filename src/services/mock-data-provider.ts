/**
 * Mock Data Provider for Tally ERP
 * Provides fallback data when Supabase is not available
 * Safe for lovable.dev deployment - no environment changes
 */

export interface MockDataProvider {
  // Master data operations
  getGroups: (companyId?: string) => Promise<{ data: any[]; error: any }>;
  getLedgers: (companyId?: string) => Promise<{ data: any[]; error: any }>;
  getUOMs: (companyId?: string) => Promise<{ data: any[]; error: any }>;
  getStockItems: (companyId?: string) => Promise<{ data: any[]; error: any }>;
  getGodowns: (companyId?: string) => Promise<{ data: any[]; error: any }>;
  getCostCategories: (companyId?: string) => Promise<{ data: any[]; error: any }>;
  getCostCentres: (companyId?: string) => Promise<{ data: any[]; error: any }>;
  getEmployees: (companyId?: string) => Promise<{ data: any[]; error: any }>;
  getPayheads: (companyId?: string) => Promise<{ data: any[]; error: any }>;
  getVoucherTypes: (companyId?: string) => Promise<{ data: any[]; error: any }>;
  
  // Transaction data operations
  getVouchers: (companyId?: string) => Promise<{ data: any[]; error: any }>;
  getAccountingEntries: (companyId?: string) => Promise<{ data: any[]; error: any }>;
  
  // CRUD operations
  create: (table: string, data: any) => Promise<{ data: any; error: any }>;
  update: (table: string, id: string, data: any) => Promise<{ data: any; error: any }>;
  delete: (table: string, id: string) => Promise<{ data: any; error: any }>;
  
  // Health check
  isHealthy: () => Promise<boolean>;
}

class MockDataProviderImpl implements MockDataProvider {
  private mockData: Record<string, any[]> = {};
  private isInitialized = false;

  constructor() {
    this.initializeMockData();
  }

  private async initializeMockData() {
    if (this.isInitialized) return;
    
    try {
      // Load mock data from JSON files
      const masters = await this.loadMockData('masters');
      const transactions = await this.loadMockData('transactions');
      
      this.mockData = { ...masters, ...transactions };
      this.isInitialized = true;
    } catch (error) {
      console.warn('Failed to load mock data, using fallback:', error);
      this.mockData = this.getFallbackData();
      this.isInitialized = true;
    }
  }

  private async loadMockData(category: string): Promise<Record<string, any[]>> {
    const data: Record<string, any[]> = {};
    
    try {
      // Try to load from public/mock-data
      const response = await fetch(`/mock-data/${category}/index.json`);
      if (response.ok) {
        const index = await response.json();
        
        for (const [table, filename] of Object.entries(index)) {
          try {
            const tableResponse = await fetch(`/mock-data/${category}/${filename}`);
            if (tableResponse.ok) {
              data[table] = await tableResponse.json();
            }
          } catch (err) {
            console.warn(`Failed to load ${table}:`, err);
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to load ${category} mock data:`, error);
    }
    
    return data;
  }

  private getFallbackData(): Record<string, any[]> {
    return {
      mst_group: [
        {
          id: '1',
          name: 'Sundry Debtors',
          parent: null,
          company_id: 'default',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Sundry Creditors',
          parent: null,
          company_id: 'default',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Cash-in-Hand',
          parent: null,
          company_id: 'default',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      mst_ledger: [
        {
          id: '1',
          name: 'Cash',
          parent: '3',
          company_id: 'default',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Bank Account',
          parent: '3',
          company_id: 'default',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      mst_uom: [
        {
          id: '1',
          name: 'Nos',
          formal_name: 'Numbers',
          company_id: 'default',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Kg',
          formal_name: 'Kilograms',
          company_id: 'default',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      mst_stock_item: [
        {
          id: '1',
          name: 'Sample Product 1',
          uom: '1',
          company_id: 'default',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      mst_godown: [
        {
          id: '1',
          name: 'Main Godown',
          company_id: 'default',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      mst_cost_category: [
        {
          id: '1',
          name: 'Direct Costs',
          company_id: 'default',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      mst_cost_centre: [
        {
          id: '1',
          name: 'Production',
          company_id: 'default',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      mst_employee: [
        {
          id: '1',
          name: 'John Doe',
          company_id: 'default',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      mst_payhead: [
        {
          id: '1',
          name: 'Basic Salary',
          company_id: 'default',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      mst_vouchertype: [
        {
          id: '1',
          name: 'Payment',
          company_id: 'default',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Receipt',
          company_id: 'default',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      trn_voucher: [
        {
          id: '1',
          voucher_type: '1',
          company_id: 'default',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      trn_accounting: [
        {
          id: '1',
          voucher_id: '1',
          ledger_id: '1',
          debit: 1000,
          credit: 0,
          company_id: 'default',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    };
  }

  private async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initializeMockData();
    }
  }

  // Master data getters
  async getGroups(companyId?: string) {
    await this.ensureInitialized();
    const data = this.mockData.mst_group || [];
    const filtered = companyId ? data.filter(item => item.company_id === companyId) : data;
    return { data: filtered, error: null };
  }

  async getLedgers(companyId?: string) {
    await this.ensureInitialized();
    const data = this.mockData.mst_ledger || [];
    const filtered = companyId ? data.filter(item => item.company_id === companyId) : data;
    return { data: filtered, error: null };
  }

  async getUOMs(companyId?: string) {
    await this.ensureInitialized();
    const data = this.mockData.mst_uom || [];
    const filtered = companyId ? data.filter(item => item.company_id === companyId) : data;
    return { data: filtered, error: null };
  }

  async getStockItems(companyId?: string) {
    await this.ensureInitialized();
    const data = this.mockData.mst_stock_item || [];
    const filtered = companyId ? data.filter(item => item.company_id === companyId) : data;
    return { data: filtered, error: null };
  }

  async getGodowns(companyId?: string) {
    await this.ensureInitialized();
    const data = this.mockData.mst_godown || [];
    const filtered = companyId ? data.filter(item => item.company_id === companyId) : data;
    return { data: filtered, error: null };
  }

  async getCostCategories(companyId?: string) {
    await this.ensureInitialized();
    const data = this.mockData.mst_cost_category || [];
    const filtered = companyId ? data.filter(item => item.company_id === companyId) : data;
    return { data: filtered, error: null };
  }

  async getCostCentres(companyId?: string) {
    await this.ensureInitialized();
    const data = this.mockData.mst_cost_centre || [];
    const filtered = companyId ? data.filter(item => item.company_id === companyId) : data;
    return { data: filtered, error: null };
  }

  async getEmployees(companyId?: string) {
    await this.ensureInitialized();
    const data = this.mockData.mst_employee || [];
    const filtered = companyId ? data.filter(item => item.company_id === companyId) : data;
    return { data: filtered, error: null };
  }

  async getPayheads(companyId?: string) {
    await this.ensureInitialized();
    const data = this.mockData.mst_payhead || [];
    const filtered = companyId ? data.filter(item => item.company_id === companyId) : data;
    return { data: filtered, error: null };
  }

  async getVoucherTypes(companyId?: string) {
    await this.ensureInitialized();
    const data = this.mockData.mst_vouchertype || [];
    const filtered = companyId ? data.filter(item => item.company_id === companyId) : data;
    return { data: filtered, error: null };
  }

  // Transaction data getters
  async getVouchers(companyId?: string) {
    await this.ensureInitialized();
    const data = this.mockData.trn_voucher || [];
    const filtered = companyId ? data.filter(item => item.company_id === companyId) : data;
    return { data: filtered, error: null };
  }

  async getAccountingEntries(companyId?: string) {
    await this.ensureInitialized();
    const data = this.mockData.trn_accounting || [];
    const filtered = companyId ? data.filter(item => item.company_id === companyId) : data;
    return { data: filtered, error: null };
  }

  // CRUD operations
  async create(table: string, data: any) {
    await this.ensureInitialized();
    
    const newRecord = {
      ...data,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (!this.mockData[table]) {
      this.mockData[table] = [];
    }
    
    this.mockData[table].push(newRecord);
    
    return { data: newRecord, error: null };
  }

  async update(table: string, id: string, data: any) {
    await this.ensureInitialized();
    
    if (!this.mockData[table]) {
      return { data: null, error: new Error('Table not found') };
    }

    const index = this.mockData[table].findIndex(item => item.id === id);
    if (index === -1) {
      return { data: null, error: new Error('Record not found') };
    }

    const updatedRecord = {
      ...this.mockData[table][index],
      ...data,
      updated_at: new Date().toISOString()
    };

    this.mockData[table][index] = updatedRecord;
    
    return { data: updatedRecord, error: null };
  }

  async delete(table: string, id: string) {
    await this.ensureInitialized();
    
    if (!this.mockData[table]) {
      return { data: null, error: new Error('Table not found') };
    }

    const index = this.mockData[table].findIndex(item => item.id === id);
    if (index === -1) {
      return { data: null, error: new Error('Record not found') };
    }

    const deletedRecord = this.mockData[table][index];
    this.mockData[table].splice(index, 1);
    
    return { data: deletedRecord, error: null };
  }

  async isHealthy() {
    await this.ensureInitialized();
    return this.isInitialized && Object.keys(this.mockData).length > 0;
  }
}

// Export singleton instance
export const mockDataProvider = new MockDataProviderImpl();

// Export factory for testing
export const createMockDataProvider = () => new MockDataProviderImpl();
