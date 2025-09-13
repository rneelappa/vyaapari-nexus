import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SyncJob {
  id: string;
  division_id: string;
  company_id: string;
  job_type: string;
  status: string;
  started_at: string;
  completed_at?: string;
  error_message?: string;
  records_processed: number;
  division?: {
    name: string;
  };
}

interface Division {
  id: string;
  name: string;
  auto_sync_enabled: boolean;
  sync_frequency: string;
  last_sync_attempt?: string;
  last_sync_success?: string;
  sync_status: string;
}

const SyncJobsManagement = () => {
  const [syncJobs, setSyncJobs] = useState<SyncJob[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSyncJobs = async () => {
    const { data, error } = await supabase
      .from('tally_sync_jobs')
      .select(`
        *,
        divisions:division_id (
          name
        )
      `)
      .order('started_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching sync jobs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch sync jobs",
        variant: "destructive",
      });
    } else {
      setSyncJobs(data || []);
    }
  };

  const fetchDivisions = async () => {
    const { data, error } = await supabase
      .from('divisions')
      .select('id, name, auto_sync_enabled, sync_frequency, last_sync_attempt, last_sync_success, sync_status')
      .eq('auto_sync_enabled', true);

    if (error) {
      console.error('Error fetching divisions:', error);
    } else {
      setDivisions(data || []);
    }
  };

  const triggerManualSync = async (divisionId: string) => {
    try {
      console.log(`Triggering manual sync for division: ${divisionId}`);
      
      const { data, error } = await supabase.functions.invoke('tally-scheduler', {
        body: { manual_trigger: divisionId }
      });

      if (error) {
        console.error('Manual sync error:', error);
        throw error;
      }

      console.log('Manual sync response:', data);

      toast({
        title: "Sync Triggered",
        description: "Manual sync has been initiated for this division",
      });

      // Refresh data after a short delay to show updated status
      setTimeout(() => {
        fetchSyncJobs();
        fetchDivisions();
      }, 1000);
    } catch (error) {
      console.error('Error triggering manual sync:', error);
      toast({
        title: "Error",
        description: `Failed to trigger sync: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSyncJobs(), fetchDivisions()]);
      setLoading(false);
    };

    loadData();

    // Set up real-time subscription for sync jobs
    const syncJobsSubscription = supabase
      .channel('sync-jobs-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'tally_sync_jobs' 
      }, () => {
        fetchSyncJobs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(syncJobsSubscription);
    };
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'completed' ? 'default' : 
                   status === 'running' ? 'secondary' : 
                   status === 'failed' ? 'destructive' : 'outline';
    return <Badge variant={variant}>{status}</Badge>;
  };

  const formatFrequency = (frequency: string) => {
    const frequencies: Record<string, string> = {
      '1min': 'Every 1 minute',
      '5min': 'Every 5 minutes',
      '15min': 'Every 15 minutes',
      '30min': 'Every 30 minutes',
      '1hour': 'Every 1 hour',
      '3hours': 'Every 3 hours',
      '6hours': 'Every 6 hours',
      '12hours': 'Every 12 hours',
      '24hours': 'Every 24 hours',
      'weekly': 'Weekly',
      'monthly': 'Monthly'
    };
    return frequencies[frequency] || frequency;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Clock className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Sync Jobs Management</h1>
        </div>
        <div className="flex items-center justify-center h-48">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Clock className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Sync Jobs Management</h1>
      </div>

      {/* Active Divisions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Auto Sync Divisions</CardTitle>
          <CardDescription>
            Divisions with automatic sync enabled
          </CardDescription>
        </CardHeader>
        <CardContent>
          {divisions.length === 0 ? (
            <p className="text-muted-foreground">No divisions have auto sync enabled</p>
          ) : (
            <div className="space-y-4">
              {divisions.map((division) => (
                <div key={division.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h3 className="font-medium">{division.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Frequency: {formatFrequency(division.sync_frequency)}</span>
                      <span>Status: {getStatusBadge(division.sync_status)}</span>
                      {division.last_sync_success && (
                        <span>Last sync: {new Date(division.last_sync_success).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => triggerManualSync(division.id)}
                    disabled={division.sync_status === 'running'}
                  >
                    {division.sync_status === 'running' ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Sync Now
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Sync Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sync Jobs</CardTitle>
          <CardDescription>
            Last 50 sync jobs (automatic and manual)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {syncJobs.length === 0 ? (
            <p className="text-muted-foreground">No sync jobs found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Division</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {syncJobs.map((job) => {
                  const duration = job.completed_at 
                    ? Math.round((new Date(job.completed_at).getTime() - new Date(job.started_at).getTime()) / 1000)
                    : null;

                  return (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">
                        {job.division?.name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{job.job_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(job.status)}
                          {getStatusBadge(job.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(job.started_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {duration ? `${duration}s` : job.status === 'running' ? 'Running...' : '-'}
                      </TableCell>
                      <TableCell>{job.records_processed}</TableCell>
                      <TableCell>
                        {job.error_message && (
                          <span className="text-red-500 text-sm truncate max-w-48" title={job.error_message}>
                            {job.error_message}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SyncJobsManagement;