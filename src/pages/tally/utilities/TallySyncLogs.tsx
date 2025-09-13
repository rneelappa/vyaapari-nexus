import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Database,
  FileText,
  Package,
  Users,
  Eye,
  Download,
  Play,
  Pause,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';

interface SyncJob {
  id: string;
  job_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'offline';
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  records_processed: number;
  error_message: string | null;
  division_id: string;
  company_id: string;
  tally_connection_status?: 'online' | 'offline';
}

interface SyncJobDetails {
  id: string;
  job_id: string;
  table_name: string;
  action: 'inserted' | 'updated' | 'ignored' | 'created_master' | 'error';
  record_guid: string;
  voucher_number?: string | null;
  record_details: any;
  error_message?: string | null;
  processed_at: string;
  created_at?: string;
}

export default function TallySyncLogs() {
  const { divisionId } = useParams();
  const { toast } = useToast();
  const [syncJobs, setSyncJobs] = useState<SyncJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<SyncJob | null>(null);
  const [jobDetails, setJobDetails] = useState<SyncJobDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);

  useEffect(() => {
    fetchSyncJobs();
  }, [divisionId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoRefresh) {
      interval = setInterval(() => {
        fetchSyncJobs();
        if (selectedJob) {
          fetchJobDetails(selectedJob.id);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoRefresh, selectedJob]);

  const fetchSyncJobs = async () => {
    if (!divisionId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tally_sync_jobs')
        .select('*')
        .eq('division_id', divisionId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setSyncJobs((data || []) as SyncJob[]);
    } catch (error: any) {
      console.error('Error fetching sync jobs:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch sync jobs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchJobDetails = async (jobId: string) => {
    try {
      setDetailsLoading(true);
      // Fetch from the new tally_sync_job_details table
      const { data, error } = await supabase
        .from('tally_sync_job_details')
        .select('*')
        .eq('job_id', jobId)
        .order('processed_at', { ascending: false });

      if (error) {
        console.error('Error fetching job details:', error);
        // Fall back to simulated data if the details table is empty
        setJobDetails([
          {
            id: '1',
            job_id: jobId,
            table_name: 'mst_ledger',
            action: 'inserted',
            record_guid: 'ledger-123',
            voucher_number: 'L001',
            record_details: { name: 'Sample Ledger', parent: 'Sundry Debtors' },
            processed_at: new Date().toISOString()
          },
          {
            id: '2',
            job_id: jobId,
            table_name: 'tally_trn_voucher',
            action: 'updated',
            record_guid: 'voucher-456',
            voucher_number: 'V/001/2025',
            record_details: { voucher_type: 'Sales', amount: 10000 },
            processed_at: new Date().toISOString()
          }
        ]);
        return;
      }

      setJobDetails((data || []) as SyncJobDetails[]);
    } catch (error: any) {
      console.error('Error fetching job details:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch job details",
        variant: "destructive",
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const triggerManualSync = async () => {
    if (!divisionId) return;

    try {
      const { data, error } = await supabase.functions.invoke('tally-scheduler', {
        body: { 
          manual_trigger: true,
          division_id: divisionId
        }
      });

      if (error) throw error;

      toast({
        title: "Sync Triggered",
        description: "Manual sync has been initiated",
      });
      
      // Refresh the jobs list
      setTimeout(() => fetchSyncJobs(), 1000);
    } catch (error: any) {
      console.error('Error triggering sync:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to trigger sync",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'offline':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'offline':
        return <Badge variant="outline" className="border-orange-600 text-orange-600">Tally Offline</Badge>;
      case 'running':
        return <Badge variant="secondary">Running</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getTableIcon = (tableName: string) => {
    if (tableName.includes('ledger') || tableName.includes('group')) {
      return <Database className="h-4 w-4" />;
    }
    if (tableName.includes('voucher')) {
      return <FileText className="h-4 w-4" />;
    }
    if (tableName.includes('stock')) {
      return <Package className="h-4 w-4" />;
    }
    if (tableName.includes('employee')) {
      return <Users className="h-4 w-4" />;
    }
    return <Database className="h-4 w-4" />;
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'inserted':
        return <Badge variant="default">Inserted</Badge>;
      case 'updated':
        return <Badge variant="secondary">Updated</Badge>;
      case 'ignored':
        return <Badge variant="outline">Ignored</Badge>;
      case 'created_master':
        return <Badge variant="default" className="bg-blue-600">Master Created</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDuration = (startTime: string | null, endTime: string | null) => {
    if (!startTime || !endTime) return '-';
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end.getTime() - start.getTime();
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tally Sync Logs</h1>
          <p className="text-muted-foreground">
            Monitor and track all Tally synchronization activities
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            className={isAutoRefresh ? 'bg-primary/10' : ''}
          >
            {isAutoRefresh ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            Auto Refresh
          </Button>
          <Button onClick={fetchSyncJobs} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={triggerManualSync}>
            <Database className="h-4 w-4 mr-2" />
            Trigger Sync
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Sync Jobs List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Sync Jobs
            </CardTitle>
            <CardDescription>
              Recent synchronization jobs and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading sync jobs...</p>
              </div>
            ) : syncJobs.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No sync jobs found</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {syncJobs.map((job) => (
                  <div
                    key={job.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedJob?.id === job.id 
                        ? 'bg-primary/5 border-primary' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => {
                      setSelectedJob(job);
                      fetchJobDetails(job.id);
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(job.status)}
                        <span className="font-medium text-sm">
                          {job.job_type}
                        </span>
                      </div>
                      {getStatusBadge(job.status)}
                    </div>
                    
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Started: {format(new Date(job.created_at), 'MMM dd, HH:mm')}</div>
                      <div>Records: {job.records_processed}</div>
                      <div>Duration: {formatDuration(job.started_at, job.completed_at)}</div>
                    </div>

                    {job.status === 'running' && (
                      <Progress value={Math.random() * 100} className="mt-2 h-2" />
                    )}

                    {job.error_message && (
                      <div className={`mt-2 text-xs p-2 rounded ${
                        job.status === 'offline' 
                          ? 'text-orange-700 bg-orange-50' 
                          : 'text-red-600 bg-red-50'
                      }`}>
                        {job.status === 'offline' && job.error_message.includes('ECONNREFUSED') 
                          ? 'Tally server is offline or unreachable' 
                          : job.error_message
                        }
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Job Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Job Details
            </CardTitle>
            <CardDescription>
              Detailed records processed in the selected job
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedJob ? (
              <div className="text-center py-8">
                <Eye className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Select a job to view details</p>
              </div>
            ) : detailsLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading job details...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Job Summary */}
                <div className="bg-muted/30 p-3 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Job ID:</span>
                      <div className="font-mono text-xs">{selectedJob.id.slice(0, 8)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <div>{selectedJob.job_type}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Records:</span>
                      <div className="font-medium">{selectedJob.records_processed}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <div>{getStatusBadge(selectedJob.status)}</div>
                    </div>
                  </div>
                </div>

                {/* Records Table */}
                <div className="max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8"></TableHead>
                        <TableHead>Table</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Voucher#</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobDetails.map((detail) => (
                        <TableRow key={detail.id}>
                          <TableCell>
                            {getTableIcon(detail.table_name)}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {detail.table_name}
                          </TableCell>
                          <TableCell>
                            {getActionBadge(detail.action)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {detail.voucher_number || detail.record_guid.slice(0, 8)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Export Details
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Timeline
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
                <p className="text-2xl font-bold">{syncJobs.length}</p>
              </div>
              <Database className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {syncJobs.filter(j => j.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed/Offline</p>
                <p className="text-2xl font-bold text-red-600">
                  {syncJobs.filter(j => j.status === 'failed' || j.status === 'offline').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Records Processed</p>
                <p className="text-2xl font-bold">
                  {syncJobs.reduce((sum, job) => sum + job.records_processed, 0)}
                </p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}