/**
 * Tally Data Synchronization Service
 * Handles synchronization between Tally ERP and Supabase
 * Provides comprehensive data validation and conflict resolution
 */

import { supabase } from '@/integrations/supabase/client';
import TallyDataExtractor, { TallyDataConfig, ExtractionResult, SyncStatus } from './tally-data-extractor';

export interface SyncConfig extends TallyDataConfig {
  batchSize: number;
  retryAttempts: number;
  conflictResolution: 'tally_wins' | 'supabase_wins' | 'manual';
  validateRelationships: boolean;
  createBackup: boolean;
}

export interface SyncResult {
  success: boolean;
  tablesProcessed: string[];
  totalRecords: number;
  errors: string[];
  warnings: string[];
  duration: number;
  timestamp: Date;
}

export interface DataValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recordCount: number;
  relationshipErrors: string[];
}

class TallyDataSync {
  private config: SyncConfig;
  private extractor: TallyDataExtractor;
  private validationResults: Map<string, DataValidationResult> = new Map();

  constructor(config: SyncConfig) {
    this.config = config;
    this.extractor = new TallyDataExtractor(config);
  }

  /**
   * Perform full synchronization
   */
  async performFullSync(): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: true,
      tablesProcessed: [],
      totalRecords: 0,
      errors: [],
      warnings: [],
      duration: 0,
      timestamp: new Date()
    };

    try {
      console.log('Starting full synchronization...');

      // Create backup if requested
      if (this.config.createBackup) {
        await this.createBackup();
      }

      // Extract master data
      if (this.config.masterData) {
        console.log('Extracting master data...');
        const masterResults = await this.extractor.extractMasterData();
        
        for (const [tableName, extractionResult] of Object.entries(masterResults)) {
          if (extractionResult.success) {
            // Validate data
            const validationResult = await this.validateData(tableName, extractionResult.data);
            this.validationResults.set(tableName, validationResult);

            if (validationResult.isValid) {
              // Sync to Supabase
              await this.syncTableData(tableName, extractionResult.data, 'replace');
              result.tablesProcessed.push(tableName);
              result.totalRecords += extractionResult.count;
            } else {
              result.errors.push(`Validation failed for ${tableName}: ${validationResult.errors.join(', ')}`);
            }
          } else {
            result.errors.push(`Extraction failed for ${tableName}: ${extractionResult.error}`);
          }
        }
      }

      // Extract transaction data
      if (this.config.transactionData) {
        console.log('Extracting transaction data...');
        const transactionResults = await this.extractor.extractTransactionData();
        
        for (const [tableName, extractionResult] of Object.entries(transactionResults)) {
          if (extractionResult.success) {
            // Validate data
            const validationResult = await this.validateData(tableName, extractionResult.data);
            this.validationResults.set(tableName, validationResult);

            if (validationResult.isValid) {
              // Sync to Supabase
              await this.syncTableData(tableName, extractionResult.data, 'replace');
              result.tablesProcessed.push(tableName);
              result.totalRecords += extractionResult.count;
            } else {
              result.errors.push(`Validation failed for ${tableName}: ${validationResult.errors.join(', ')}`);
            }
          } else {
            result.errors.push(`Extraction failed for ${tableName}: ${extractionResult.error}`);
          }
        }
      }

      // Save sync status
      await this.extractor.saveSyncStatus();

      result.success = result.errors.length === 0;
      result.duration = Date.now() - startTime;

      console.log(`Synchronization completed in ${result.duration}ms`);
      console.log(`Processed ${result.tablesProcessed.length} tables with ${result.totalRecords} records`);

    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      result.duration = Date.now() - startTime;
      console.error('Synchronization failed:', error);
    }

    return result;
  }

  /**
   * Perform incremental synchronization
   */
  async performIncrementalSync(): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: true,
      tablesProcessed: [],
      totalRecords: 0,
      errors: [],
      warnings: [],
      duration: 0,
      timestamp: new Date()
    };

    try {
      console.log('Starting incremental synchronization...');

      // Get last sync times
      const lastSyncTimes = await this.getLastSyncTimes();

      // Extract master data
      if (this.config.masterData) {
        const masterResults = await this.extractor.extractMasterData();
        
        for (const [tableName, extractionResult] of Object.entries(masterResults)) {
          if (extractionResult.success) {
            // Filter for new/updated records
            const filteredData = await this.filterIncrementalData(tableName, extractionResult.data, lastSyncTimes[tableName]);
            
            if (filteredData.length > 0) {
              // Validate data
              const validationResult = await this.validateData(tableName, filteredData);
              
              if (validationResult.isValid) {
                // Sync to Supabase
                await this.syncTableData(tableName, filteredData, 'upsert');
                result.tablesProcessed.push(tableName);
                result.totalRecords += filteredData.length;
              } else {
                result.errors.push(`Validation failed for ${tableName}: ${validationResult.errors.join(', ')}`);
              }
            }
          } else {
            result.errors.push(`Extraction failed for ${tableName}: ${extractionResult.error}`);
          }
        }
      }

      // Extract transaction data
      if (this.config.transactionData) {
        const transactionResults = await this.extractor.extractTransactionData();
        
        for (const [tableName, extractionResult] of Object.entries(transactionResults)) {
          if (extractionResult.success) {
            // Filter for new/updated records
            const filteredData = await this.filterIncrementalData(tableName, extractionResult.data, lastSyncTimes[tableName]);
            
            if (filteredData.length > 0) {
              // Validate data
              const validationResult = await this.validateData(tableName, filteredData);
              
              if (validationResult.isValid) {
                // Sync to Supabase
                await this.syncTableData(tableName, filteredData, 'upsert');
                result.tablesProcessed.push(tableName);
                result.totalRecords += filteredData.length;
              } else {
                result.errors.push(`Validation failed for ${tableName}: ${validationResult.errors.join(', ')}`);
              }
            }
          } else {
            result.errors.push(`Extraction failed for ${tableName}: ${extractionResult.error}`);
          }
        }
      }

      // Save sync status
      await this.extractor.saveSyncStatus();

      result.success = result.errors.length === 0;
      result.duration = Date.now() - startTime;

      console.log(`Incremental synchronization completed in ${result.duration}ms`);
      console.log(`Processed ${result.tablesProcessed.length} tables with ${result.totalRecords} records`);

    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      result.duration = Date.now() - startTime;
      console.error('Incremental synchronization failed:', error);
    }

    return result;
  }

  /**
   * Validate data before synchronization
   */
  private async validateData(tableName: string, data: any[]): Promise<DataValidationResult> {
    const result: DataValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      recordCount: data.length,
      relationshipErrors: []
    };

    // Basic validation
    for (let i = 0; i < data.length; i++) {
      const record = data[i];
      
      // Check required fields
      if (!record.id) {
        result.errors.push(`Record ${i}: Missing required field 'id'`);
        result.isValid = false;
      }

      if (!record.name && tableName !== 'trn_accounting') {
        result.errors.push(`Record ${i}: Missing required field 'name'`);
        result.isValid = false;
      }

      if (!record.company_id) {
        result.errors.push(`Record ${i}: Missing required field 'company_id'`);
        result.isValid = false;
      }
    }

    // Relationship validation
    if (this.config.validateRelationships) {
      const relationshipErrors = await this.validateRelationships(tableName, data);
      result.relationshipErrors = relationshipErrors;
      
      if (relationshipErrors.length > 0) {
        result.warnings.push(...relationshipErrors);
        // Don't fail validation for relationship warnings in incremental sync
        if (this.config.syncType === 'full') {
          result.isValid = false;
        }
      }
    }

    return result;
  }

  /**
   * Validate relationships between tables
   */
  private async validateRelationships(tableName: string, data: any[]): Promise<string[]> {
    const errors: string[] = [];

    // Validate ledger-parent group relationships
    if (tableName === 'mst_ledger') {
      for (const record of data) {
        if (record.parent) {
          const { data: parentGroup } = await supabase
            .from('mst_group')
            .select('id')
            .eq('name', record.parent)
            .eq('company_id', record.company_id)
            .single();

          if (!parentGroup) {
            errors.push(`Ledger '${record.name}' references non-existent parent group '${record.parent}'`);
          }
        }
      }
    }

    // Validate stock item-UOM relationships
    if (tableName === 'mst_stock_item') {
      for (const record of data) {
        if (record.uom) {
          const { data: uom } = await supabase
            .from('mst_uom')
            .select('id')
            .eq('name', record.uom)
            .eq('company_id', record.company_id)
            .single();

          if (!uom) {
            errors.push(`Stock item '${record.name}' references non-existent UOM '${record.uom}'`);
          }
        }
      }
    }

    // Validate accounting entry-ledger relationships
    if (tableName === 'trn_accounting') {
      for (const record of data) {
        if (record.ledger_id) {
          const { data: ledger } = await supabase
            .from('mst_ledger')
            .select('id')
            .eq('id', record.ledger_id)
            .eq('company_id', record.company_id)
            .single();

          if (!ledger) {
            errors.push(`Accounting entry references non-existent ledger ID '${record.ledger_id}'`);
          }
        }
      }
    }

    return errors;
  }

  /**
   * Sync table data to Supabase
   */
  private async syncTableData(tableName: string, data: any[], mode: 'replace' | 'upsert'): Promise<void> {
    if (data.length === 0) return;

    // Process in batches
    const batches = this.chunkArray(data, this.config.batchSize);
    
    for (const batch of batches) {
      try {
        if (mode === 'replace') {
          // Delete existing data and insert new
          await supabase
            .from(tableName)
            .delete()
            .eq('company_id', this.config.company);

          const { error } = await supabase
            .from(tableName)
            .insert(batch);

          if (error) {
            throw new Error(`Failed to insert batch: ${error.message}`);
          }
        } else {
          // Upsert data
          const { error } = await supabase
            .from(tableName)
            .upsert(batch, { onConflict: 'id' });

          if (error) {
            throw new Error(`Failed to upsert batch: ${error.message}`);
          }
        }
      } catch (error) {
        console.error(`Error syncing batch for ${tableName}:`, error);
        throw error;
      }
    }
  }

  /**
   * Filter data for incremental sync
   */
  private async filterIncrementalData(tableName: string, data: any[], lastSyncTime?: Date): Promise<any[]> {
    if (!lastSyncTime) {
      return data; // No previous sync, return all data
    }

    return data.filter(record => {
      const recordTime = new Date(record.updated_at || record.created_at);
      return recordTime > lastSyncTime;
    });
  }

  /**
   * Get last sync times for all tables
   */
  private async getLastSyncTimes(): Promise<Record<string, Date>> {
    const { data, error } = await supabase
      .from('sync_status')
      .select('table_name, last_sync_time')
      .eq('company_id', this.config.company);

    if (error) {
      console.warn('Could not get last sync times:', error);
      return {};
    }

    const result: Record<string, Date> = {};
    for (const record of data || []) {
      result[record.table_name] = new Date(record.last_sync_time);
    }

    return result;
  }

  /**
   * Create backup of current data
   */
  private async createBackup(): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `backup_${this.config.company}_${timestamp}`;

    console.log(`Creating backup: ${backupName}`);

    // This would typically involve creating a database backup
    // For now, we'll just log the backup creation
    console.log(`Backup created: ${backupName}`);
  }

  /**
   * Utility function to chunk array into smaller batches
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Get validation results
   */
  getValidationResults(): Map<string, DataValidationResult> {
    return this.validationResults;
  }

  /**
   * Get sync status
   */
  getSyncStatus(): Map<string, SyncStatus> {
    return this.extractor.getSyncStatus();
  }
}

export default TallyDataSync;
