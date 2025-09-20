import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity, Database, Package, Building2, FileText, CheckCircle, XCircle, Clock, Plus } from 'lucide-react';

interface ProcessResult {
  table: string;
  action: 'inserted' | 'updated' | 'ignored' | 'created_master' | 'error';
  guid: string;
  record_type: 'voucher' | 'ledger' | 'stock_item' | 'godown' | 'voucher_type' | 'accounting' | 'inventory';
  details?: any;
  error?: string;
}

interface LiveUpdate {
  type: 'progress' | 'complete' | 'error';
  message: string;
  record?: ProcessResult;
  progress?: {
    current: number;
    total: number;
    stage: string;
  };
}

interface EnhancedProcessingViewProps {
  isProcessing: boolean;
  currentProgress: LiveUpdate | null;
  results: ProcessResult[];
  summary: {
    total: number;
    inserted: number;
    updated: number;
    ignored: number;
    created_master: number;
    errors: number;
    by_table: Record<string, number>;
  } | null;
}

export const EnhancedProcessingView: React.FC<EnhancedProcessingViewProps> = ({
  isProcessing,
  currentProgress,
  results,
  summary
}) => {
  const getRecordTypeIcon = (recordType: string) => {
    switch (recordType) {
      case 'voucher': return <FileText className="h-4 w-4" />;
      case 'ledger': return <Database className="h-4 w-4" />;
      case 'stock_item': return <Package className="h-4 w-4" />;
      case 'godown': return <Building2 className="h-4 w-4" />;
      case 'voucher_type': return <Activity className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'inserted': return <Plus className="h-4 w-4 text-green-600" />;
      case 'updated': return <Activity className="h-4 w-4 text-blue-600" />;
      case 'created_master': return <Plus className="h-4 w-4 text-purple-600" />;
      case 'ignored': return <Clock className="h-4 w-4 text-gray-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'inserted': return 'default';
      case 'updated': return 'secondary';
      case 'created_master': return 'default';
      case 'ignored': return 'outline';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'inserted': return 'Inserted';
      case 'updated': return 'Updated';
      case 'created_master': return 'Master Created';
      case 'ignored': return 'No Changes';
      case 'error': return 'Error';
      default: return action;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Section */}
      {isProcessing && currentProgress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 animate-pulse" />
              Processing in Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>{currentProgress.message}</span>
                {currentProgress.progress && (
                  <span>
                    {currentProgress.progress.current} / {currentProgress.progress.total}
                  </span>
                )}
              </div>
              {currentProgress.progress && (
                <Progress
                  value={(currentProgress.progress.current / currentProgress.progress.total) * 100}
                  className="w-full"
                />
              )}
            </div>
            {currentProgress.progress && (
              <Badge variant="outline">
                Stage: {currentProgress.progress.stage}
              </Badge>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{summary.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-green-600">Inserted</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-green-600">{summary.inserted}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-blue-600">Updated</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-blue-600">{summary.updated}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-purple-600">Master Created</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-purple-600">{summary.created_master}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">No Changes</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-gray-600">{summary.ignored}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-red-600">Errors</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-red-600">{summary.errors}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Results Table */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>GUID</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.slice(0, 100).map((result, index) => (
                    <TableRow key={`${result.guid}-${index}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRecordTypeIcon(result.record_type)}
                          <span className="capitalize">{result.record_type.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{result.table}</TableCell>
                      <TableCell className="font-mono text-xs max-w-xs truncate">
                        {result.guid}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={getActionBadgeVariant(result.action)}
                          className="flex items-center gap-1 w-fit"
                        >
                          {getActionIcon(result.action)}
                          {getActionLabel(result.action)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {result.details?.name && (
                          <span className="text-sm">{result.details.name}</span>
                        )}
                        {result.error && (
                          <span className="text-sm text-red-600">{result.error}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {results.length > 100 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Showing first 100 results of {results.length} total
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table Statistics */}
      {summary?.by_table && Object.keys(summary.by_table).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Records by Table</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(summary.by_table).map(([table, count]) => (
                <div key={table} className="flex justify-between items-center p-3 border rounded">
                  <span className="font-mono text-sm">{table}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};