/**
 * Tally Data Monitoring Service
 * Provides real-time monitoring of data synchronization and health
 * Includes alerts, metrics, and performance tracking
 */

import { supabase } from '@/integrations/supabase/client';

export interface DataHealthMetrics {
  tableName: string;
  recordCount: number;
  lastSyncTime: Date | null;
  dataQuality: number; // 0-100
  syncStatus: 'healthy' | 'warning' | 'error';
  issues: string[];
  performance: {
    avgSyncTime: number;
    lastSyncDuration: number;
    errorRate: number;
  };
}

export interface SyncAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  tableName: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface DataIntegrityCheck {
  tableName: string;
  checkType: string;
  passed: boolean;
  issues: string[];
  recordCount: number;
  timestamp: Date;
}

export interface PerformanceMetrics {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  avgSyncDuration: number;
  totalRecordsProcessed: number;
  dataQualityScore: number;
  uptime: number;
}

class TallyDataMonitor {
  private alerts: Map<string, SyncAlert> = new Map();
  private metrics: Map<string, DataHealthMetrics> = new Map();
  private performanceHistory: PerformanceMetrics[] = [];

  /**
   * Monitor data health for all tables
   */
  async monitorDataHealth(companyId: string): Promise<Map<string, DataHealthMetrics>> {
    const tables = [
      'mst_group',
      'mst_ledger',
      'mst_uom',
      'mst_stock_item',
      'mst_godown',
      'mst_cost_category',
      'mst_cost_centre',
      'mst_employee',
      'mst_payhead',
      'mst_vouchertype',
      'trn_voucher',
      'trn_accounting'
    ];

    for (const tableName of tables) {
      try {
        const metrics = await this.analyzeTableHealth(tableName, companyId);
        this.metrics.set(tableName, metrics);
        
        // Check for alerts
        this.checkForAlerts(tableName, metrics);
      } catch (error) {
        console.error(`Error monitoring ${tableName}:`, error);
        this.createAlert(tableName, 'error', `Failed to monitor table: ${error instanceof Error ? error.message : 'Unknown error'}`, 'high');
      }
    }

    return this.metrics;
  }

  /**
   * Analyze health of a specific table
   */
  private async analyzeTableHealth(tableName: string, companyId: string): Promise<DataHealthMetrics> {
    // Get record count
    const { count: recordCount, error: countError } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId);

    if (countError) {
      throw new Error(`Failed to get record count: ${countError.message}`);
    }

    // Get last sync time
    const { data: syncData } = await supabase
      .from('sync_status')
      .select('last_sync_time, last_sync_duration, status')
      .eq('table_name', tableName)
      .eq('company_id', companyId)
      .single();

    // Perform data quality checks
    const qualityChecks = await this.performDataQualityChecks(tableName, companyId);
    const dataQuality = this.calculateDataQualityScore(qualityChecks);

    // Determine sync status
    let syncStatus: 'healthy' | 'warning' | 'error' = 'healthy';
    if (syncData?.status === 'error') {
      syncStatus = 'error';
    } else if (dataQuality < 80 || (syncData && new Date(syncData.last_sync_time) < new Date(Date.now() - 24 * 60 * 60 * 1000))) {
      syncStatus = 'warning';
    }

    // Get performance metrics
    const performance = await this.getPerformanceMetrics(tableName, companyId);

    return {
      tableName,
      recordCount: recordCount || 0,
      lastSyncTime: syncData?.last_sync_time ? new Date(syncData.last_sync_time) : null,
      dataQuality,
      syncStatus,
      issues: qualityChecks.filter(check => !check.passed).map(check => check.issues).flat(),
      performance
    };
  }

  /**
   * Perform data quality checks
   */
  private async performDataQualityChecks(tableName: string, companyId: string): Promise<DataIntegrityCheck[]> {
    const checks: DataIntegrityCheck[] = [];

    // Check for missing required fields
    const requiredFieldCheck = await this.checkRequiredFields(tableName, companyId);
    checks.push(requiredFieldCheck);

    // Check for duplicate records
    const duplicateCheck = await this.checkDuplicates(tableName, companyId);
    checks.push(duplicateCheck);

    // Check for orphaned records
    const orphanCheck = await this.checkOrphanedRecords(tableName, companyId);
    checks.push(orphanCheck);

    // Check for data consistency
    const consistencyCheck = await this.checkDataConsistency(tableName, companyId);
    checks.push(consistencyCheck);

    return checks;
  }

  /**
   * Check for missing required fields
   */
  private async checkRequiredFields(tableName: string, companyId: string): Promise<DataIntegrityCheck> {
    const issues: string[] = [];
    let recordCount = 0;

    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('id, name, company_id')
        .eq('company_id', companyId);

      if (error) {
        return {
          tableName,
          checkType: 'required_fields',
          passed: false,
          issues: [`Database error: ${error.message}`],
          recordCount: 0,
          timestamp: new Date()
        };
      }

      recordCount = data?.length || 0;

      for (const record of data || []) {
        if (!record.id) {
          issues.push(`Record missing ID`);
        }
        if (!record.name && tableName !== 'trn_accounting') {
          issues.push(`Record ${record.id} missing name`);
        }
        if (!record.company_id) {
          issues.push(`Record ${record.id} missing company_id`);
        }
      }
    } catch (error) {
      issues.push(`Check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      tableName,
      checkType: 'required_fields',
      passed: issues.length === 0,
      issues,
      recordCount,
      timestamp: new Date()
    };
  }

  /**
   * Check for duplicate records
   */
  private async checkDuplicates(tableName: string, companyId: string): Promise<DataIntegrityCheck> {
    const issues: string[] = [];
    let recordCount = 0;

    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('id, name')
        .eq('company_id', companyId);

      if (error) {
        return {
          tableName,
          checkType: 'duplicates',
          passed: false,
          issues: [`Database error: ${error.message}`],
          recordCount: 0,
          timestamp: new Date()
        };
      }

      recordCount = data?.length || 0;
      const nameCounts = new Map<string, number>();

      for (const record of data || []) {
        if (record.name) {
          const count = nameCounts.get(record.name) || 0;
          nameCounts.set(record.name, count + 1);
        }
      }

      for (const [name, count] of nameCounts) {
        if (count > 1) {
          issues.push(`Duplicate name '${name}' found ${count} times`);
        }
      }
    } catch (error) {
      issues.push(`Check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      tableName,
      checkType: 'duplicates',
      passed: issues.length === 0,
      issues,
      recordCount,
      timestamp: new Date()
    };
  }

  /**
   * Check for orphaned records
   */
  private async checkOrphanedRecords(tableName: string, companyId: string): Promise<DataIntegrityCheck> {
    const issues: string[] = [];
    let recordCount = 0;

    try {
      // Check ledger-parent group relationships
      if (tableName === 'mst_ledger') {
        const { data, error } = await supabase
          .from('mst_ledger')
          .select('id, name, parent')
          .eq('company_id', companyId)
          .not('parent', 'is', null);

        if (!error && data) {
          recordCount = data.length;

          for (const ledger of data) {
            const { data: parentGroup } = await supabase
              .from('mst_group')
              .select('id')
              .eq('name', ledger.parent)
              .eq('company_id', companyId)
              .single();

            if (!parentGroup) {
              issues.push(`Ledger '${ledger.name}' references non-existent parent group '${ledger.parent}'`);
            }
          }
        }
      }

      // Check stock item-UOM relationships
      if (tableName === 'mst_stock_item') {
        const { data, error } = await supabase
          .from('mst_stock_item')
          .select('id, name, uom')
          .eq('company_id', companyId)
          .not('uom', 'is', null);

        if (!error && data) {
          recordCount = data.length;

          for (const item of data) {
            const { data: uom } = await supabase
              .from('mst_uom')
              .select('id')
              .eq('name', item.uom)
              .eq('company_id', companyId)
              .single();

            if (!uom) {
              issues.push(`Stock item '${item.name}' references non-existent UOM '${item.uom}'`);
            }
          }
        }
      }
    } catch (error) {
      issues.push(`Check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      tableName,
      checkType: 'orphaned_records',
      passed: issues.length === 0,
      issues,
      recordCount,
      timestamp: new Date()
    };
  }

  /**
   * Check data consistency
   */
  private async checkDataConsistency(tableName: string, companyId: string): Promise<DataIntegrityCheck> {
    const issues: string[] = [];
    let recordCount = 0;

    try {
      // Check for negative amounts in accounting entries
      if (tableName === 'trn_accounting') {
        const { data, error } = await supabase
          .from('trn_accounting')
          .select('id, debit, credit')
          .eq('company_id', companyId);

        if (!error && data) {
          recordCount = data.length;

          for (const entry of data) {
            if (entry.debit < 0) {
              issues.push(`Accounting entry ${entry.id} has negative debit amount`);
            }
            if (entry.credit < 0) {
              issues.push(`Accounting entry ${entry.id} has negative credit amount`);
            }
          }
        }
      }

      // Check for future dates
      const { data, error } = await supabase
        .from(tableName)
        .select('id, created_at, updated_at')
        .eq('company_id', companyId);

      if (!error && data) {
        recordCount = data.length;
        const now = new Date();

        for (const record of data) {
          if (new Date(record.created_at) > now) {
            issues.push(`Record ${record.id} has future creation date`);
          }
          if (new Date(record.updated_at) > now) {
            issues.push(`Record ${record.id} has future update date`);
          }
        }
      }
    } catch (error) {
      issues.push(`Check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      tableName,
      checkType: 'data_consistency',
      passed: issues.length === 0,
      issues,
      recordCount,
      timestamp: new Date()
    };
  }

  /**
   * Calculate data quality score
   */
  private calculateDataQualityScore(checks: DataIntegrityCheck[]): number {
    if (checks.length === 0) return 100;

    const totalIssues = checks.reduce((sum, check) => sum + check.issues.length, 0);
    const totalRecords = checks.reduce((sum, check) => sum + check.recordCount, 0);

    if (totalRecords === 0) return 100;

    const issueRate = totalIssues / totalRecords;
    return Math.max(0, Math.round(100 - (issueRate * 100)));
  }

  /**
   * Get performance metrics for a table
   */
  private async getPerformanceMetrics(tableName: string, companyId: string): Promise<{
    avgSyncTime: number;
    lastSyncDuration: number;
    errorRate: number;
  }> {
    try {
      const { data } = await supabase
        .from('sync_status')
        .select('last_sync_duration, status')
        .eq('table_name', tableName)
        .eq('company_id', companyId)
        .order('last_sync_time', { ascending: false })
        .limit(10);

      if (!data || data.length === 0) {
        return { avgSyncTime: 0, lastSyncDuration: 0, errorRate: 0 };
      }

      const durations = data.map(record => record.last_sync_duration || 0);
      const avgSyncTime = durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
      const lastSyncDuration = data[0].last_sync_duration || 0;
      const errorCount = data.filter(record => record.status === 'error').length;
      const errorRate = (errorCount / data.length) * 100;

      return { avgSyncTime, lastSyncDuration, errorRate };
    } catch (error) {
      console.error(`Error getting performance metrics for ${tableName}:`, error);
      return { avgSyncTime: 0, lastSyncDuration: 0, errorRate: 0 };
    }
  }

  /**
   * Check for alerts based on metrics
   */
  private checkForAlerts(tableName: string, metrics: DataHealthMetrics): void {
    // Data quality alert
    if (metrics.dataQuality < 70) {
      this.createAlert(
        tableName,
        'error',
        `Data quality is low (${metrics.dataQuality}%)`,
        'high'
      );
    } else if (metrics.dataQuality < 85) {
      this.createAlert(
        tableName,
        'warning',
        `Data quality is below optimal (${metrics.dataQuality}%)`,
        'medium'
      );
    }

    // Sync status alert
    if (metrics.syncStatus === 'error') {
      this.createAlert(
        tableName,
        'error',
        'Table sync is in error state',
        'critical'
      );
    } else if (metrics.syncStatus === 'warning') {
      this.createAlert(
        tableName,
        'warning',
        'Table sync needs attention',
        'medium'
      );
    }

    // Performance alert
    if (metrics.performance.errorRate > 20) {
      this.createAlert(
        tableName,
        'error',
        `High error rate (${metrics.performance.errorRate.toFixed(1)}%)`,
        'high'
      );
    }
  }

  /**
   * Create an alert
   */
  private createAlert(
    tableName: string,
    type: 'error' | 'warning' | 'info',
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): void {
    const alertId = `${tableName}_${Date.now()}`;
    const alert: SyncAlert = {
      id: alertId,
      type,
      tableName,
      message,
      timestamp: new Date(),
      resolved: false,
      severity
    };

    this.alerts.set(alertId, alert);
  }

  /**
   * Get all alerts
   */
  getAlerts(): SyncAlert[] {
    return Array.from(this.alerts.values()).sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  /**
   * Get unresolved alerts
   */
  getUnresolvedAlerts(): SyncAlert[] {
    return this.getAlerts().filter(alert => !alert.resolved);
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    const allMetrics = Array.from(this.metrics.values());
    const totalSyncs = allMetrics.length;
    const successfulSyncs = allMetrics.filter(m => m.syncStatus === 'healthy').length;
    const failedSyncs = allMetrics.filter(m => m.syncStatus === 'error').length;
    const avgSyncDuration = allMetrics.reduce((sum, m) => sum + m.performance.avgSyncTime, 0) / totalSyncs;
    const totalRecordsProcessed = allMetrics.reduce((sum, m) => sum + m.recordCount, 0);
    const dataQualityScore = allMetrics.reduce((sum, m) => sum + m.dataQuality, 0) / totalSyncs;

    return {
      totalSyncs,
      successfulSyncs,
      failedSyncs,
      avgSyncDuration,
      totalRecordsProcessed,
      dataQualityScore,
      uptime: 99.9 // This would be calculated based on actual uptime
    };
  }

  /**
   * Get metrics for a specific table
   */
  getTableMetrics(tableName: string): DataHealthMetrics | undefined {
    return this.metrics.get(tableName);
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Map<string, DataHealthMetrics> {
    return this.metrics;
  }
}

export default TallyDataMonitor;
