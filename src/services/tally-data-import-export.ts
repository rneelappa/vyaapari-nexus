/**
 * Tally Data Import/Export Service
 * Handles importing and exporting data between Tally ERP and various formats
 * Supports CSV, JSON, and direct database operations
 */

import { supabase } from '@/integrations/supabase/client';

export interface ImportExportConfig {
  format: 'csv' | 'json' | 'excel';
  includeHeaders: boolean;
  dateFormat: string;
  encoding: string;
  delimiter: string;
  quoteChar: string;
}

export interface ImportResult {
  success: boolean;
  recordsProcessed: number;
  recordsImported: number;
  recordsSkipped: number;
  errors: string[];
  warnings: string[];
  duration: number;
}

export interface ExportResult {
  success: boolean;
  recordsExported: number;
  filePath: string;
  fileSize: number;
  duration: number;
}

export interface DataMapping {
  sourceField: string;
  targetField: string;
  transformation?: (value: any) => any;
  required: boolean;
  defaultValue?: any;
}

class TallyDataImportExport {
  private config: ImportExportConfig;

  constructor(config: ImportExportConfig) {
    this.config = config;
  }

  /**
   * Import data from CSV file
   */
  async importFromCSV(
    tableName: string,
    csvContent: string,
    mappings: DataMapping[],
    companyId: string
  ): Promise<ImportResult> {
    const startTime = Date.now();
    const result: ImportResult = {
      success: true,
      recordsProcessed: 0,
      recordsImported: 0,
      recordsSkipped: 0,
      errors: [],
      warnings: [],
      duration: 0
    };

    try {
      const lines = csvContent.split('\n').filter(line => line.trim());
      const headers = lines[0].split(this.config.delimiter);
      
      result.recordsProcessed = lines.length - 1;

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = this.parseCSVLine(lines[i]);
          const record = this.mapData(headers, values, mappings, companyId);
          
          if (this.validateRecord(record, tableName)) {
            await this.insertRecord(tableName, record);
            result.recordsImported++;
          } else {
            result.recordsSkipped++;
            result.warnings.push(`Row ${i + 1}: Validation failed`);
          }
        } catch (error) {
          result.recordsSkipped++;
          result.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      result.success = result.errors.length === 0;
      result.duration = Date.now() - startTime;

    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      result.duration = Date.now() - startTime;
    }

    return result;
  }

  /**
   * Import data from JSON file
   */
  async importFromJSON(
    tableName: string,
    jsonData: any[],
    mappings: DataMapping[],
    companyId: string
  ): Promise<ImportResult> {
    const startTime = Date.now();
    const result: ImportResult = {
      success: true,
      recordsProcessed: 0,
      recordsImported: 0,
      recordsSkipped: 0,
      errors: [],
      warnings: [],
      duration: 0
    };

    try {
      result.recordsProcessed = jsonData.length;

      for (let i = 0; i < jsonData.length; i++) {
        try {
          const record = this.mapDataFromObject(jsonData[i], mappings, companyId);
          
          if (this.validateRecord(record, tableName)) {
            await this.insertRecord(tableName, record);
            result.recordsImported++;
          } else {
            result.recordsSkipped++;
            result.warnings.push(`Record ${i + 1}: Validation failed`);
          }
        } catch (error) {
          result.recordsSkipped++;
          result.errors.push(`Record ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      result.success = result.errors.length === 0;
      result.duration = Date.now() - startTime;

    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      result.duration = Date.now() - startTime;
    }

    return result;
  }

  /**
   * Export data to CSV
   */
  async exportToCSV(
    tableName: string,
    companyId: string,
    filters?: Record<string, any>
  ): Promise<ExportResult> {
    const startTime = Date.now();
    const result: ExportResult = {
      success: false,
      recordsExported: 0,
      filePath: '',
      fileSize: 0,
      duration: 0
    };

    try {
      // Fetch data from Supabase
      let query = supabase.from(tableName).select('*').eq('company_id', companyId);
      
      // Apply filters
      if (filters) {
        for (const [field, value] of Object.entries(filters)) {
          if (value !== undefined && value !== null) {
            query = query.eq(field, value);
          }
        }
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data || data.length === 0) {
        result.success = true;
        result.duration = Date.now() - startTime;
        return result;
      }

      // Convert to CSV
      const csvContent = this.convertToCSV(data);
      const fileName = `${tableName}_${companyId}_${Date.now()}.csv`;
      
      // In a real implementation, you would save this to a file
      // For now, we'll simulate the file creation
      result.filePath = `/exports/${fileName}`;
      result.fileSize = csvContent.length;
      result.recordsExported = data.length;
      result.success = true;
      result.duration = Date.now() - startTime;

      console.log(`CSV export completed: ${fileName}`);

    } catch (error) {
      result.success = false;
      result.duration = Date.now() - startTime;
      console.error('CSV export failed:', error);
    }

    return result;
  }

  /**
   * Export data to JSON
   */
  async exportToJSON(
    tableName: string,
    companyId: string,
    filters?: Record<string, any>
  ): Promise<ExportResult> {
    const startTime = Date.now();
    const result: ExportResult = {
      success: false,
      recordsExported: 0,
      filePath: '',
      fileSize: 0,
      duration: 0
    };

    try {
      // Fetch data from Supabase
      let query = supabase.from(tableName).select('*').eq('company_id', companyId);
      
      // Apply filters
      if (filters) {
        for (const [field, value] of Object.entries(filters)) {
          if (value !== undefined && value !== null) {
            query = query.eq(field, value);
          }
        }
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data || data.length === 0) {
        result.success = true;
        result.duration = Date.now() - startTime;
        return result;
      }

      // Convert to JSON
      const jsonContent = JSON.stringify(data, null, 2);
      const fileName = `${tableName}_${companyId}_${Date.now()}.json`;
      
      // In a real implementation, you would save this to a file
      result.filePath = `/exports/${fileName}`;
      result.fileSize = jsonContent.length;
      result.recordsExported = data.length;
      result.success = true;
      result.duration = Date.now() - startTime;

      console.log(`JSON export completed: ${fileName}`);

    } catch (error) {
      result.success = false;
      result.duration = Date.now() - startTime;
      console.error('JSON export failed:', error);
    }

    return result;
  }

  /**
   * Export all master data for a company
   */
  async exportAllMasterData(companyId: string): Promise<ExportResult> {
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

    const allData: Record<string, any[]> = {};
    let totalRecords = 0;

    for (const table of masterTables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('company_id', companyId);

      if (!error && data) {
        allData[table] = data;
        totalRecords += data.length;
      }
    }

    const jsonContent = JSON.stringify(allData, null, 2);
    const fileName = `master_data_${companyId}_${Date.now()}.json`;

    return {
      success: true,
      recordsExported: totalRecords,
      filePath: `/exports/${fileName}`,
      fileSize: jsonContent.length,
      duration: 0
    };
  }

  /**
   * Export all transaction data for a company
   */
  async exportAllTransactionData(companyId: string, dateFrom?: string, dateTo?: string): Promise<ExportResult> {
    const transactionTables = [
      'trn_voucher',
      'trn_accounting'
    ];

    const allData: Record<string, any[]> = {};
    let totalRecords = 0;

    for (const table of transactionTables) {
      let query = supabase
        .from(table)
        .select('*')
        .eq('company_id', companyId);

      if (dateFrom && dateTo) {
        query = query.gte('created_at', dateFrom).lte('created_at', dateTo);
      }

      const { data, error } = await query;

      if (!error && data) {
        allData[table] = data;
        totalRecords += data.length;
      }
    }

    const jsonContent = JSON.stringify(allData, null, 2);
    const fileName = `transaction_data_${companyId}_${Date.now()}.json`;

    return {
      success: true,
      recordsExported: totalRecords,
      filePath: `/exports/${fileName}`,
      fileSize: jsonContent.length,
      duration: 0
    };
  }

  /**
   * Parse CSV line with proper handling of quoted fields
   */
  private parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      
      if (char === this.config.quoteChar) {
        inQuotes = !inQuotes;
      } else if (char === this.config.delimiter && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
      i++;
    }
    
    values.push(current.trim());
    return values;
  }

  /**
   * Map CSV data to database record
   */
  private mapData(
    headers: string[],
    values: string[],
    mappings: DataMapping[],
    companyId: string
  ): Record<string, any> {
    const record: Record<string, any> = {
      company_id: companyId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    for (const mapping of mappings) {
      const sourceIndex = headers.indexOf(mapping.sourceField);
      if (sourceIndex !== -1 && sourceIndex < values.length) {
        let value = values[sourceIndex];
        
        if (mapping.transformation) {
          value = mapping.transformation(value);
        }
        
        record[mapping.targetField] = value;
      } else if (mapping.required && mapping.defaultValue !== undefined) {
        record[mapping.targetField] = mapping.defaultValue;
      }
    }

    return record;
  }

  /**
   * Map JSON object to database record
   */
  private mapDataFromObject(
    obj: any,
    mappings: DataMapping[],
    companyId: string
  ): Record<string, any> {
    const record: Record<string, any> = {
      company_id: companyId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    for (const mapping of mappings) {
      let value = obj[mapping.sourceField];
      
      if (value !== undefined) {
        if (mapping.transformation) {
          value = mapping.transformation(value);
        }
        record[mapping.targetField] = value;
      } else if (mapping.required && mapping.defaultValue !== undefined) {
        record[mapping.targetField] = mapping.defaultValue;
      }
    }

    return record;
  }

  /**
   * Validate record before insertion
   */
  private validateRecord(record: any, tableName: string): boolean {
    // Basic validation
    if (!record.id) {
      return false;
    }

    if (!record.name && tableName !== 'trn_accounting') {
      return false;
    }

    if (!record.company_id) {
      return false;
    }

    return true;
  }

  /**
   * Insert record into database
   */
  private async insertRecord(tableName: string, record: any): Promise<void> {
    const { error } = await supabase
      .from(tableName)
      .upsert(record, { onConflict: 'id' });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  /**
   * Convert data to CSV format
   */
  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvLines = [headers.join(this.config.delimiter)];

    for (const record of data) {
      const values = headers.map(header => {
        let value = record[header] || '';
        
        // Escape quotes and wrap in quotes if contains delimiter
        if (typeof value === 'string' && (value.includes(this.config.delimiter) || value.includes(this.config.quoteChar))) {
          value = this.config.quoteChar + value.replace(new RegExp(this.config.quoteChar, 'g'), this.config.quoteChar + this.config.quoteChar) + this.config.quoteChar;
        }
        
        return value;
      });
      
      csvLines.push(values.join(this.config.delimiter));
    }

    return csvLines.join('\n');
  }
}

export default TallyDataImportExport;
