/**
 * Tally Data Extractor Service
 * Handles extraction and transformation of data from Tally ERP to Supabase
 * Safe for production use with comprehensive error handling
 */

import { supabase } from '@/integrations/supabase/client';

export interface TallyDataConfig {
  server: string;
  port: number;
  company: string;
  fromDate?: string;
  toDate?: string;
  syncType: 'full' | 'incremental';
  masterData: boolean;
  transactionData: boolean;
}

export interface ExtractionResult {
  success: boolean;
  data: any[];
  count: number;
  error?: string;
  lastSyncId?: number;
  timestamp: Date;
}

export interface SyncStatus {
  tableName: string;
  lastSyncId: number;
  lastSyncTime: Date;
  recordCount: number;
  status: 'success' | 'error' | 'pending';
  error?: string;
}

class TallyDataExtractor {
  private config: TallyDataConfig;
  private syncStatus: Map<string, SyncStatus> = new Map();

  constructor(config: TallyDataConfig) {
    this.config = config;
  }

  /**
   * Extract master data from Tally
   */
  async extractMasterData(): Promise<Record<string, ExtractionResult>> {
    const results: Record<string, ExtractionResult> = {};
    
    const masterTables = [
      'mst_group',
      'mst_ledger', 
      'mst_uom',
      'mst_stock_item',
      'mst_godown',
      'mst_cost_category',
      'mst_cost_centre',
      'mst_employee',
      'mst_payhead',
      'mst_vouchertype'
    ];

    for (const table of masterTables) {
      try {
        const result = await this.extractTableData(table, 'master');
        results[table] = result;
        this.updateSyncStatus(table, result);
      } catch (error) {
        results[table] = {
          success: false,
          data: [],
          count: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date()
        };
        this.updateSyncStatus(table, results[table]);
      }
    }

    return results;
  }

  /**
   * Extract transaction data from Tally
   */
  async extractTransactionData(): Promise<Record<string, ExtractionResult>> {
    const results: Record<string, ExtractionResult> = {};
    
    const transactionTables = [
      'trn_voucher',
      'trn_accounting'
    ];

    for (const table of transactionTables) {
      try {
        const result = await this.extractTableData(table, 'transaction');
        results[table] = result;
        this.updateSyncStatus(table, result);
      } catch (error) {
        results[table] = {
          success: false,
          data: [],
          count: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date()
        };
        this.updateSyncStatus(table, results[table]);
      }
    }

    return results;
  }

  /**
   * Extract data from a specific table
   */
  private async extractTableData(tableName: string, type: 'master' | 'transaction'): Promise<ExtractionResult> {
    try {
      // Get last sync status for incremental sync
      const lastSyncId = await this.getLastSyncId(tableName);
      
      // Build Tally API request
      const requestData = {
        api_key: process.env.TALLY_API_KEY,
        action: this.getActionForTable(tableName),
        companyId: this.config.company,
        filters: {
          limit: 1000,
          offset: 0,
          search: '',
          ...(type === 'transaction' && this.config.fromDate && this.config.toDate ? {
            dateFrom: this.config.fromDate,
            dateTo: this.config.toDate
          } : {})
        }
      };

      // Make request to Tally API
      const response = await fetch(`http://${this.config.server}:${this.config.port}/api/tally`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`Tally API request failed: ${response.status} ${response.statusText}`);
      }

      const apiResult = await response.json();
      
      if (!apiResult.success) {
        throw new Error(`Tally API error: ${apiResult.error}`);
      }

      // Transform data to match Supabase schema
      const transformedData = this.transformDataForTable(tableName, apiResult.data);

      return {
        success: true,
        data: transformedData,
        count: transformedData.length,
        lastSyncId: transformedData.length > 0 ? Math.max(...transformedData.map((item: any) => item.id || 0)) : lastSyncId,
        timestamp: new Date()
      };

    } catch (error) {
      console.error(`Error extracting data from ${tableName}:`, error);
      return {
        success: false,
        data: [],
        count: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  /**
   * Get the appropriate Tally API action for a table
   */
  private getActionForTable(tableName: string): string {
    const actionMap: Record<string, string> = {
      'mst_group': 'getGroups',
      'mst_ledger': 'getLedgers',
      'mst_uom': 'getUOMs',
      'mst_stock_item': 'getStockItems',
      'mst_godown': 'getGodowns',
      'mst_cost_category': 'getCostCategories',
      'mst_cost_centre': 'getCostCentres',
      'mst_employee': 'getEmployees',
      'mst_payhead': 'getPayheads',
      'mst_vouchertype': 'getVoucherTypes',
      'trn_voucher': 'getVouchers',
      'trn_accounting': 'getAccountingEntries'
    };

    return actionMap[tableName] || 'getData';
  }

  /**
   * Transform data to match Supabase schema
   */
  private transformDataForTable(tableName: string, data: any[]): any[] {
    const transformers: Record<string, (data: any[]) => any[]> = {
      'mst_group': this.transformGroups,
      'mst_ledger': this.transformLedgers,
      'mst_uom': this.transformUOMs,
      'mst_stock_item': this.transformStockItems,
      'mst_godown': this.transformGodowns,
      'mst_cost_category': this.transformCostCategories,
      'mst_cost_centre': this.transformCostCentres,
      'mst_employee': this.transformEmployees,
      'mst_payhead': this.transformPayheads,
      'mst_vouchertype': this.transformVoucherTypes,
      'trn_voucher': this.transformVouchers,
      'trn_accounting': this.transformAccountingEntries
    };

    const transformer = transformers[tableName] || ((data: any[]) => data);
    return transformer(data);
  }

  // Data transformers for each table
  private transformGroups(data: any[]): any[] {
    return data.map(item => ({
      id: item.guid || item.id,
      name: item.name,
      parent: item.parent,
      primary_group: item.primary_group,
      is_revenue: item.is_revenue || false,
      is_deemedpositive: item.is_deemedpositive || true,
      is_reserved: item.is_reserved || false,
      affects_gross_profit: item.affects_gross_profit || false,
      sort_position: item.sort_position || 0,
      company_id: this.config.company,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  }

  private transformLedgers(data: any[]): any[] {
    return data.map(item => ({
      id: item.guid || item.id,
      name: item.name,
      parent: item.parent,
      primary_group: item.primary_group,
      is_revenue: item.is_revenue || false,
      is_deemedpositive: item.is_deemedpositive || true,
      is_reserved: item.is_reserved || false,
      affects_gross_profit: item.affects_gross_profit || false,
      sort_position: item.sort_position || 0,
      company_id: this.config.company,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  }

  private transformUOMs(data: any[]): any[] {
    return data.map(item => ({
      id: item.guid || item.id,
      name: item.name,
      formal_name: item.formal_name || item.name,
      company_id: this.config.company,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  }

  private transformStockItems(data: any[]): any[] {
    return data.map(item => ({
      id: item.guid || item.id,
      name: item.name,
      uom: item.uom,
      stock_group: item.stock_group,
      company_id: this.config.company,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  }

  private transformGodowns(data: any[]): any[] {
    return data.map(item => ({
      id: item.guid || item.id,
      name: item.name,
      company_id: this.config.company,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  }

  private transformCostCategories(data: any[]): any[] {
    return data.map(item => ({
      id: item.guid || item.id,
      name: item.name,
      company_id: this.config.company,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  }

  private transformCostCentres(data: any[]): any[] {
    return data.map(item => ({
      id: item.guid || item.id,
      name: item.name,
      company_id: this.config.company,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  }

  private transformEmployees(data: any[]): any[] {
    return data.map(item => ({
      id: item.guid || item.id,
      name: item.name,
      employee_id: item.employee_id,
      company_id: this.config.company,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  }

  private transformPayheads(data: any[]): any[] {
    return data.map(item => ({
      id: item.guid || item.id,
      name: item.name,
      company_id: this.config.company,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  }

  private transformVoucherTypes(data: any[]): any[] {
    return data.map(item => ({
      id: item.guid || item.id,
      name: item.name,
      company_id: this.config.company,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  }

  private transformVouchers(data: any[]): any[] {
    return data.map(item => ({
      id: item.guid || item.id,
      voucher_type: item.voucher_type,
      voucher_number: item.voucher_number,
      date: item.date,
      narration: item.narration,
      company_id: this.config.company,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  }

  private transformAccountingEntries(data: any[]): any[] {
    return data.map(item => ({
      id: item.guid || item.id,
      voucher_id: item.voucher_id,
      ledger_id: item.ledger_id,
      debit: item.debit || 0,
      credit: item.credit || 0,
      narration: item.narration,
      company_id: this.config.company,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  }

  /**
   * Get last sync ID for incremental sync
   */
  private async getLastSyncId(tableName: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('sync_status')
        .select('last_sync_id')
        .eq('table_name', tableName)
        .eq('company_id', this.config.company)
        .single();

      if (error || !data) {
        return 0;
      }

      return data.last_sync_id || 0;
    } catch (error) {
      console.warn(`Could not get last sync ID for ${tableName}:`, error);
      return 0;
    }
  }

  /**
   * Update sync status
   */
  private updateSyncStatus(tableName: string, result: ExtractionResult): void {
    this.syncStatus.set(tableName, {
      tableName,
      lastSyncId: result.lastSyncId || 0,
      lastSyncTime: result.timestamp,
      recordCount: result.count,
      status: result.success ? 'success' : 'error',
      error: result.error
    });
  }

  /**
   * Get current sync status
   */
  getSyncStatus(): Map<string, SyncStatus> {
    return this.syncStatus;
  }

  /**
   * Save sync status to database
   */
  async saveSyncStatus(): Promise<void> {
    for (const [tableName, status] of this.syncStatus) {
      try {
        const { error } = await supabase
          .from('sync_status')
          .upsert({
            table_name: tableName,
            company_id: this.config.company,
            last_sync_id: status.lastSyncId,
            last_sync_time: status.lastSyncTime.toISOString(),
            record_count: status.recordCount,
            status: status.status,
            error: status.error
          });

        if (error) {
          console.error(`Error saving sync status for ${tableName}:`, error);
        }
      } catch (error) {
        console.error(`Error saving sync status for ${tableName}:`, error);
      }
    }
  }
}

export default TallyDataExtractor;
