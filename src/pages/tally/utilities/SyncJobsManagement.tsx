import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Play, 
  Pause, 
  RefreshCw, 
  Clock,
  AlertCircle,
  CheckCircle,
  Calendar,
  Database,
  Wifi,
  WifiOff,
  Timer
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';

interface DivisionSettings {
  id: string;
  name: string;
  auto_sync_enabled: boolean;
  sync_frequency: string;
  last_sync_success: string | null;
  last_sync_attempt: string | null;
  sync_status: string;
  tally_enabled: boolean;
  tally_url: string | null;
  tally_health_status: string;
  last_health_check: string | null;
  health_check_response_time: number | null;
}

export default function SyncJobsManagement() {
  const { divisionId } = useParams();
  const { toast } = useToast();
  const [division, setDivision] = useState<DivisionSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (divisionId) {
      fetchDivisionSettings();
    }
  }, [divisionId]);

  const fetchDivisionSettings = async () => {
    if (!divisionId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('divisions')
        .select('id, name, auto_sync_enabled, sync_frequency, last_sync_success, last_sync_attempt, sync_status, tally_enabled, tally_url, tally_health_status, last_health_check, health_check_response_time')
        .eq('id', divisionId)
        .single();

      if (error) throw error;

      setDivision(data as DivisionSettings);
    } catch (error: any) {
      console.error('Error fetching division settings:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch division settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateDivisionSettings = async (updates: Partial<DivisionSettings>) => {
    if (!divisionId || !division) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('divisions')
        .update(updates)
        .eq('id', divisionId);

      if (error) throw error;

      setDivision(prev => prev ? { ...prev, ...updates } : null);
      
      toast({
        title: "Settings Updated",
        description: "Sync settings have been saved successfully",
      });
    } catch (error: any) {
      console.error('Error updating division settings:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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
      
      // Refresh settings to see updated status
      setTimeout(() => fetchDivisionSettings(), 1000);
    } catch (error: any) {
      console.error('Error triggering sync:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to trigger sync",
        variant: "destructive",
      });
    }
  };

  const triggerHealthCheck = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('tally-health-check', {
        body: { 
          manual_trigger: true
        }
      });

      if (error) throw error;

      toast({
        title: "Health Check Triggered",
        description: "Manual health check has been initiated",
      });
      
      // Refresh settings to see updated status
      setTimeout(() => fetchDivisionSettings(), 2000);
    } catch (error: any) {
      console.error('Error triggering health check:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to trigger health check",
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
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <Wifi className="h-4 w-4 text-green-600" />;
      case 'offline':
        return <WifiOff className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'running':
        return <Badge variant="secondary">Running</Badge>;
      default:
        return <Badge variant="outline">Idle</Badge>;
    }
  };

  const getHealthBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge variant="default">Online</Badge>;
      case 'offline':
        return <Badge variant="destructive">Offline</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const frequencyOptions = [
    { value: 'disabled', label: 'Disabled' },
    { value: '1min', label: 'Every Minute' },
    { value: '5min', label: 'Every 5 Minutes' },
    { value: '15min', label: 'Every 15 Minutes' },
    { value: '30min', label: 'Every 30 Minutes' },
    { value: '1hour', label: 'Every Hour' },
    { value: '2hours', label: 'Every 2 Hours' },
    { value: '6hours', label: 'Every 6 Hours' },
    { value: '12hours', label: 'Every 12 Hours' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading sync settings...</p>
        </div>
      </div>
    );
  }

  if (!division) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive">Division not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sync Jobs Management</h1>
          <p className="text-muted-foreground">
            Configure automatic sync settings for {division.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchDivisionSettings} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={triggerManualSync}>
            <Play className="h-4 w-4 mr-2" />
            Trigger Sync Now
          </Button>
        </div>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Current Status
          </CardTitle>
          <CardDescription>
            Live sync status and last execution details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Sync Status</Label>
              <div className="flex items-center gap-2">
                {getStatusIcon(division.sync_status)}
                {getStatusBadge(division.sync_status)}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Auto Sync</Label>
              <Badge variant={division.auto_sync_enabled ? 'default' : 'secondary'}>
                {division.auto_sync_enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Frequency</Label>
              <div className="text-sm font-medium">
                {frequencyOptions.find(opt => opt.value === division.sync_frequency)?.label || division.sync_frequency}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Tally Health</Label>
              <div className="flex items-center gap-2">
                {getHealthIcon(division.tally_health_status)}
                {getHealthBadge(division.tally_health_status)}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Response Time</Label>
              <div className="flex items-center gap-1 text-sm font-medium">
                <Timer className="h-3 w-3" />
                {division.health_check_response_time ? `${division.health_check_response_time}ms` : 'N/A'}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Last Successful Sync</Label>
                <div className="font-medium">
                  {division.last_sync_success 
                    ? new Date(division.last_sync_success).toLocaleString()
                    : 'Never'
                  }
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Last Sync Attempt</Label>
                <div className="font-medium">
                  {division.last_sync_attempt 
                    ? new Date(division.last_sync_attempt).toLocaleString()
                    : 'Never'
                  }
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Last Health Check</Label>
                <div className="font-medium">
                  {division.last_health_check 
                    ? new Date(division.last_health_check).toLocaleString()
                    : 'Never'
                  }
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sync Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Sync Configuration
          </CardTitle>
          <CardDescription>
            Configure automatic sync settings and schedules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Enable Automatic Sync</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically sync data from Tally based on the configured schedule
                </p>
              </div>
              <Switch
                checked={division.auto_sync_enabled}
                onCheckedChange={(checked) => 
                  updateDivisionSettings({ auto_sync_enabled: checked })
                }
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label>Sync Frequency</Label>
              <select
                value={division.sync_frequency}
                onChange={(e) => 
                  updateDivisionSettings({ sync_frequency: e.target.value })
                }
                disabled={saving || !division.auto_sync_enabled}
                className="w-full p-2 border rounded-md bg-background"
              >
                {frequencyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-muted-foreground">
                How often should the system sync with Tally
              </p>
            </div>

            <div className="space-y-2">
              <Label>Tally Server URL</Label>
              <Input
                value={division.tally_url || ''}
                onChange={(e) => 
                  updateDivisionSettings({ tally_url: e.target.value })
                }
                placeholder="http://localhost:9000"
                disabled={saving}
              />
              <p className="text-sm text-muted-foreground">
                The URL where your Tally server is running
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button onClick={() => fetchDivisionSettings()} disabled={saving}>
              {saving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sync History Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common sync management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" onClick={triggerManualSync}>
              <Play className="h-4 w-4 mr-2" />
              Run Sync Now
            </Button>
            
            <Button variant="outline" onClick={triggerHealthCheck}>
              <Wifi className="h-4 w-4 mr-2" />
              Check Health Now
            </Button>
            
            <Button variant="outline" disabled>
              <Pause className="h-4 w-4 mr-2" />
              Pause All Syncs
            </Button>
            
            <Button variant="outline" disabled>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset Sync Status
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}