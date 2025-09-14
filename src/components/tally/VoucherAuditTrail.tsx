import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  User, 
  Database, 
  Activity, 
  AlertCircle,
  CheckCircle,
  RefreshCw,
  FileText,
  Calendar,
  Hash
} from 'lucide-react';

interface VoucherDetails {
  guid: string;
  voucher_number: string;
  voucher_type: string;
  date: string;
  created_at: string;
  altered_by?: string;
  altered_on?: string;
  persistedview?: number;
  is_cancelled: number;
  is_optional: number;
}

interface SyncJobDetail {
  id: string;
  job_id: string;
  action: string;
  processed_at: string;
  error_message?: string;
  record_details?: any;
}

interface SyncJob {
  id: string;
  status: string;
  job_type: string;
  started_at: string;
  completed_at?: string;
  records_processed: number;
  error_message?: string;
}

interface VoucherAuditTrailProps {
  voucherGuid: string;
  companyId: string;
  divisionId: string;
}

export function VoucherAuditTrail({ voucherGuid, companyId, divisionId }: VoucherAuditTrailProps) {
  const [loading, setLoading] = useState(true);
  const [voucher, setVoucher] = useState<VoucherDetails | null>(null);
  const [syncJobs, setSyncJobs] = useState<SyncJob[]>([]);
  const [syncDetails, setSyncDetails] = useState<SyncJobDetail[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAuditData();
  }, [voucherGuid, companyId, divisionId]);

  const fetchAuditData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch voucher details with audit info
      const [voucherResult, syncJobsResult, syncDetailsResult] = await Promise.all([
        supabase
          .from('tally_trn_voucher')
          .select('guid, voucher_number, voucher_type, date, created_at, altered_by, altered_on, persistedview, is_cancelled, is_optional')
          .eq('guid', voucherGuid)
          .eq('company_id', companyId)
          .eq('division_id', divisionId)
          .maybeSingle(),
        
        // Fetch sync jobs for this company/division
        supabase
          .from('tally_sync_jobs')
          .select('*')
          .eq('company_id', companyId)
          .eq('division_id', divisionId)
          .order('started_at', { ascending: false })
          .limit(10),
        
        // Fetch sync job details for this specific voucher
        supabase
          .from('tally_sync_job_details')
          .select('*')
          .eq('record_guid', voucherGuid)
          .order('processed_at', { ascending: false })
          .limit(20)
      ]);

      if (voucherResult.error) {
        console.error('Error fetching voucher:', voucherResult.error);
        setError('Failed to fetch voucher details');
        return;
      }

      if (!voucherResult.data) {
        setError('Voucher not found');
        return;
      }

      setVoucher(voucherResult.data);
      setSyncJobs(syncJobsResult.data || []);
      setSyncDetails(syncDetailsResult.data || []);

    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
      case 'insert':
        return <FileText className="h-4 w-4 text-green-600" />;
      case 'updated':
      case 'update':
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      case 'deleted':
      case 'delete':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !voucher) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Unable to Load Audit Trail</h3>
          <p className="text-muted-foreground">{error || 'Voucher not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Voucher Identity & Creation Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Voucher Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Tally GUID:</span>
              <span className="font-mono text-xs break-all">{voucher.guid}</span>
              
              <span className="text-muted-foreground">Voucher Number:</span>
              <span className="font-medium">{voucher.voucher_number || 'N/A'}</span>
              
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium">{voucher.voucher_type}</span>
              
              <span className="text-muted-foreground">Date:</span>
              <span className="font-medium">{new Date(voucher.date).toLocaleDateString('en-IN')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Creation & Modification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Created At:</span>
              <span className="font-medium">{formatDateTime(voucher.created_at)}</span>
              
              {voucher.altered_by && (
                <>
                  <span className="text-muted-foreground">Modified By:</span>
                  <span className="font-medium">{voucher.altered_by}</span>
                </>
              )}
              
              {voucher.altered_on && (
                <>
                  <span className="text-muted-foreground">Modified On:</span>
                  <span className="font-medium">{formatDateTime(voucher.altered_on)}</span>
                </>
              )}
              
              <span className="text-muted-foreground">Persisted View:</span>
              <Badge variant={voucher.persistedview === 1 ? "default" : "secondary"}>
                {voucher.persistedview === 1 ? "Yes" : "No"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Current Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Badge variant={voucher.is_cancelled === 1 ? "destructive" : "default"}>
              {voucher.is_cancelled === 1 ? "Cancelled" : "Active"}
            </Badge>
            <Badge variant={voucher.is_optional === 1 ? "outline" : "secondary"}>
              {voucher.is_optional === 1 ? "Optional" : "Mandatory"}
            </Badge>
            <Badge variant="outline">
              {syncDetails.length > 0 ? "Synchronized" : "Not Synchronized"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Sync History - Voucher Specific */}
      {syncDetails.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Voucher Sync History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {syncDetails.map((detail, index) => (
                <div key={detail.id}>
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getActionIcon(detail.action)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{detail.action}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(detail.processed_at)}
                        </span>
                      </div>
                      {detail.error_message && (
                        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                          {detail.error_message}
                        </div>
                      )}
                      {detail.record_details && (
                        <div className="text-xs text-muted-foreground">
                          Job: {detail.job_id.slice(0, 8)}...
                        </div>
                      )}
                    </div>
                  </div>
                  {index < syncDetails.length - 1 && <Separator className="mt-3" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Sync Jobs */}
      {syncJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Recent Sync Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {syncJobs.slice(0, 5).map((job, index) => (
                <div key={job.id}>
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getStatusIcon(job.status)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium capitalize">{job.job_type}</span>
                          <Badge variant="outline" className="text-xs">
                            {job.status}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(job.started_at)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Records processed: {job.records_processed || 0}
                        {job.completed_at && (
                          <span className="ml-2">
                            • Completed: {formatDateTime(job.completed_at)}
                          </span>
                        )}
                      </div>
                      {job.error_message && (
                        <div className="text-xs text-red-600 bg-red-50 p-2 rounded mt-1">
                          {job.error_message}
                        </div>
                      )}
                    </div>
                  </div>
                  {index < Math.min(syncJobs.length, 5) - 1 && <Separator className="mt-3" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Sync History */}
      {syncDetails.length === 0 && syncJobs.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Sync History</h3>
            <p className="text-muted-foreground">
              This voucher has no recorded synchronization activity.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}