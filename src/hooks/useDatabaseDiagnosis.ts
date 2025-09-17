import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { externalTallyApi } from '@/services/external-tally-api';

interface TableInfo {
  tableName: string;
  recordCount: number;
  lastUpdated: string | null;
  hasData: boolean;
  relationships: string[];
  dataQuality: {
    nullValues: number;
    duplicates: number;
    orphanedRecords: number;
  };
}

interface MigrationCompleteness {
  table: string;
  localRecords: number;
  apiRecords: number;
  completeness: number;
  gaps: number;
  lastSync: string | null;
}

interface ApiHealthStatus {
  endpoint: string;
  status: 'healthy' | 'warning' | 'error';
  responseTime: number;
  lastCheck: string;
  errorMessage?: string;
}

interface DiagnosisData {
  tableOverview: TableInfo[];
  migrationCompleteness: MigrationCompleteness[];
  apiHealth: ApiHealthStatus[];
  dataIntegrity: {
    foreignKeyViolations: number;
    missingRelationships: number;
    dataConsistencyIssues: number;
  };
  lastDiagnosisRun: string;
}

const TALLY_TABLES = [
  'mst_group',
  'mst_ledger', 
  'mst_stock_item',
  'mst_vouchertype',
  'mst_cost_centre',
  'mst_godown',
  'mst_employee',
  'mst_uom',
  'tally_trn_voucher',
  'trn_accounting'
];

export const useDatabaseDiagnosis = (companyId: string, divisionId: string) => {
  const [diagnosisData, setDiagnosisData] = useState<DiagnosisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTableRecordCount = async (tableName: string): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from(tableName as any)
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('division_id', divisionId);

      if (error) throw error;
      return count || 0;
    } catch {
      return 0;
    }
  };

  const getTableLastUpdated = async (tableName: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from(tableName as any)
        .select('created_at')
        .eq('company_id', companyId)
        .eq('division_id', divisionId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error || !data || data.length === 0) return null;
      return (data[0] as any).created_at;
    } catch {
      return null;
    }
  };

  const getApiRecordCount = async (table: string): Promise<number> => {
    try {
      const result = await externalTallyApi.queryData(companyId, divisionId, table, {}, 1, 0);
      if (result.success && result.data.pagination) {
        return result.data.pagination.total_records || 0;
      }
      return 0;
    } catch {
      return 0;
    }
  };

  const checkApiHealth = async (endpoint: string): Promise<ApiHealthStatus> => {
    const startTime = Date.now();
    try {
      let result;
      
      switch (endpoint) {
        case 'health':
          result = await externalTallyApi.getHealth();
          break;
        case 'division_status':
          result = await externalTallyApi.getDivisionStatus();
          break;
        case 'tables':
          result = await externalTallyApi.getTables();
          break;
        case 'metadata':
          result = await externalTallyApi.getMetadata(companyId, divisionId);
          break;
        default:
          throw new Error('Unknown endpoint');
      }

      const responseTime = Date.now() - startTime;
      
      return {
        endpoint,
        status: result.success ? 'healthy' : 'error',
        responseTime,
        lastCheck: new Date().toISOString(),
        errorMessage: result.success ? undefined : result.error
      };
    } catch (error) {
      return {
        endpoint,
        status: 'error',
        responseTime: Date.now() - startTime,
        lastCheck: new Date().toISOString(),
        errorMessage: (error as Error).message
      };
    }
  };

  const runDiagnosis = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Running comprehensive database diagnosis...');

      // Get table overview
      const tableOverviewPromises = TALLY_TABLES.map(async (tableName): Promise<TableInfo> => {
        const recordCount = await getTableRecordCount(tableName);
        const lastUpdated = await getTableLastUpdated(tableName);
        
        return {
          tableName,
          recordCount,
          lastUpdated,
          hasData: recordCount > 0,
          relationships: [], // TODO: Implement relationship detection
          dataQuality: {
            nullValues: 0, // TODO: Implement null value detection
            duplicates: 0, // TODO: Implement duplicate detection
            orphanedRecords: 0 // TODO: Implement orphaned record detection
          }
        };
      });

      const tableOverview = await Promise.all(tableOverviewPromises);

      // Get migration completeness
      const migrationCompletenessPromises = TALLY_TABLES.map(async (tableName): Promise<MigrationCompleteness> => {
        const localRecords = await getTableRecordCount(tableName);
        const apiTable = tableName.replace('mst_', '').replace('trn_', '').replace('tally_', '');
        const apiRecords = await getApiRecordCount(apiTable);
        
        const completeness = apiRecords > 0 ? Math.round((localRecords / apiRecords) * 100) : 100;
        const gaps = Math.max(0, apiRecords - localRecords);
        const lastSync = await getTableLastUpdated(tableName);

        return {
          table: tableName,
          localRecords,
          apiRecords,
          completeness,
          gaps,
          lastSync
        };
      });

      const migrationCompleteness = await Promise.all(migrationCompletenessPromises);

      // Check API health
      const apiHealthPromises = ['health', 'division_status', 'tables', 'metadata'].map(
        endpoint => checkApiHealth(endpoint)
      );

      const apiHealth = await Promise.all(apiHealthPromises);

      // Get data integrity metrics (simplified)
      const dataIntegrity = {
        foreignKeyViolations: 0, // TODO: Implement FK violation detection
        missingRelationships: 0, // TODO: Implement missing relationship detection
        dataConsistencyIssues: 0 // TODO: Implement consistency issue detection
      };

      const diagnosis: DiagnosisData = {
        tableOverview,
        migrationCompleteness,
        apiHealth,
        dataIntegrity,
        lastDiagnosisRun: new Date().toISOString()
      };

      setDiagnosisData(diagnosis);
      console.log('Diagnosis completed successfully');

    } catch (error) {
      console.error('Diagnosis failed:', error);
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [companyId, divisionId]);

  // Auto-run diagnosis on mount
  useEffect(() => {
    if (companyId && divisionId) {
      runDiagnosis();
    }
  }, [companyId, divisionId, runDiagnosis]);

  return {
    diagnosisData,
    isLoading,
    error,
    runDiagnosis
  };
};