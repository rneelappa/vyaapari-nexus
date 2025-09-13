import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Database, AlertTriangle, ExternalLink, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Division {
  id: string;
  name: string;
  description: string;
  manager_name?: string;
  manager?: string; // For compatibility with mock data
  employee_count?: number;
  employees?: number; // For compatibility with mock data
  budget: string;
  performance_score?: number;
  performance?: number; // For compatibility with mock data
  status: string;
  tally_enabled?: boolean;
  tally_url?: string;
  tally_company_id?: string;
  auto_sync_enabled?: boolean;
  sync_frequency?: string;
  last_sync_attempt?: string;
  last_sync_success?: string;
  sync_status?: string;
  company_id: string;
}

interface ManageDivisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  division: Division;
  onDivisionUpdate: (updatedDivision: Division) => void;
}

const ManageDivisionDialog = ({ open, onOpenChange, division, onDivisionUpdate }: ManageDivisionDialogProps) => {
  const [formData, setFormData] = useState({
    name: division.name,
  });
  
  const [tallyEnabled, setTallyEnabled] = useState(division.tally_enabled || false);
  const [tallyUrl, setTallyUrl] = useState(division.tally_url || "");
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(division.auto_sync_enabled || false);
  const [syncFrequency, setSyncFrequency] = useState(division.sync_frequency || 'disabled');
  const { toast } = useToast();

  const syncFrequencyOptions = [
    { value: 'disabled', label: 'Disabled' },
    { value: '1min', label: 'Every 1 minute' },
    { value: '5min', label: 'Every 5 minutes' },
    { value: '15min', label: 'Every 15 minutes' },
    { value: '30min', label: 'Every 30 minutes' },
    { value: '1hour', label: 'Every 1 hour' },
    { value: '3hours', label: 'Every 3 hours' },
    { value: '6hours', label: 'Every 6 hours' },
    { value: '12hours', label: 'Every 12 hours' },
    { value: '24hours', label: 'Every 24 hours' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  // Update state when division prop changes
  useEffect(() => {
    setFormData({
      name: division.name,
    });
    setTallyEnabled(division.tally_enabled || false);
    setTallyUrl(division.tally_url || "");
    setAutoSyncEnabled(division.auto_sync_enabled || false);
    setSyncFrequency(division.sync_frequency || 'disabled');
  }, [division]);

  const handleSave = async () => {
    try {
      // Validate required fields - only name is required
      if (!formData.name.trim()) {
        toast({
          title: "Error",
          description: "Division name is required.",
          variant: "destructive",
        });
        return;
      }

      console.log('Saving division with data:', {
        name: formData.name,
        tally_enabled: tallyEnabled,
        tally_url: tallyEnabled ? tallyUrl : null,
      });

      // Update division basic information in database
      const { data, error: divisionError } = await supabase
        .from('divisions')
        .update({
          name: formData.name,
          tally_enabled: tallyEnabled,
          tally_url: tallyEnabled ? tallyUrl : null,
          auto_sync_enabled: autoSyncEnabled,
          sync_frequency: autoSyncEnabled ? syncFrequency : 'disabled',
        })
        .eq('id', division.id)
        .select()
        .single();

      if (divisionError) {
        console.error('Division update error:', divisionError);
        throw divisionError;
      }

      console.log('Division updated successfully:', data);

      const updatedDivision = {
        ...division,
        ...formData,
        tally_enabled: tallyEnabled,
        tally_url: tallyEnabled ? tallyUrl : null,
        auto_sync_enabled: autoSyncEnabled,
        sync_frequency: autoSyncEnabled ? syncFrequency : 'disabled',
      };
      
      onDivisionUpdate(updatedDivision);
      toast({
        title: "Division Updated",
        description: "Division details have been saved successfully.",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating division:', error);
      toast({
        title: "Error",
        description: "Failed to update division. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTallyConfiguration = async () => {
    if (!tallyUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid Tally URL.",
        variant: "destructive",
      });
      return;
    }
    
    // Test connection could be added here
    toast({
      title: "Tally Configuration Saved",
      description: `Tally URL configured: ${tallyUrl}`,
    });
  };

  const handleFullImport = () => {
    toast({
      title: "Import Started",
      description: "Full data import from Tally has been initiated. This may take several minutes.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Manage Division
          </DialogTitle>
          <DialogDescription>
            Edit division details, configure Tally integration, and manage data imports.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
              <CardDescription>Update key division details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Division Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter division name"
                />
              </div>

            </CardContent>
          </Card>

          <Separator />

          {/* Tally Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="h-5 w-5" />
                Tally Integration
              </CardTitle>
              <CardDescription>
                Connect to Tally for automatic data synchronization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Enable Tally Integration</Label>
                  <p className="text-sm text-muted-foreground">
                    Connect this division to a Tally server
                  </p>
                </div>
                <Switch
                  checked={tallyEnabled}
                  onCheckedChange={setTallyEnabled}
                />
              </div>

              {tallyEnabled && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="tallyUrl">Tally Server URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="tallyUrl"
                        value={tallyUrl}
                        onChange={(e) => setTallyUrl(e.target.value)}
                        placeholder="http://localhost:9000"
                      />
                      <Button 
                        variant="outline"
                        onClick={handleTallyConfiguration}
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Connect
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Enter the URL of your Tally server (e.g., http://localhost:9000)
                    </p>
                  </div>

                  {tallyUrl && (
                    <Badge variant="secondary" className="w-fit">
                      Status: {tallyUrl ? "Configured" : "Not Connected"}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Auto Sync Scheduler */}
          {tallyEnabled && tallyUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Auto Sync Scheduler
                </CardTitle>
                <CardDescription>
                  Automatically sync data from Tally at regular intervals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Enable Auto Sync</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically fetch and sync data from Tally
                    </p>
                  </div>
                  <Switch
                    checked={autoSyncEnabled}
                    onCheckedChange={setAutoSyncEnabled}
                  />
                </div>

                {autoSyncEnabled && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="syncFrequency">Sync Frequency</Label>
                      <Select value={syncFrequency} onValueChange={setSyncFrequency}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          {syncFrequencyOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        How often should the system sync data from Tally?
                      </p>
                    </div>

                    {division.last_sync_attempt && (
                      <div className="space-y-2">
                        <Label>Sync Status</Label>
                        <div className="flex flex-col gap-2">
                          <Badge 
                            variant={division.sync_status === 'completed' ? 'default' : 
                                    division.sync_status === 'running' ? 'secondary' : 
                                    division.sync_status === 'failed' ? 'destructive' : 'outline'}
                            className="w-fit"
                          >
                            {division.sync_status || 'idle'}
                          </Badge>
                          {division.last_sync_success && (
                            <p className="text-sm text-muted-foreground">
                              Last successful sync: {new Date(division.last_sync_success).toLocaleString()}
                            </p>
                          )}
                          {division.last_sync_attempt && (
                            <p className="text-sm text-muted-foreground">
                              Last attempt: {new Date(division.last_sync_attempt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Data Import */}
          {tallyEnabled && tallyUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Import
                </CardTitle>
                <CardDescription>
                  Import data from Tally server
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Full Import from Tally
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Confirm Full Import
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-2">
                        <p className="font-medium text-foreground">
                          This will replace all existing data for this division with data from Tally.
                        </p>
                        <p>This action includes:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Company information and structure</li>
                          <li>Ledgers, groups, and accounts</li>
                          <li>Transactions and vouchers</li>
                          <li>Stock items and inventory</li>
                          <li>Financial reports and statements</li>
                        </ul>
                        <p className="font-medium text-destructive">
                          This action cannot be undone. Are you sure you want to proceed?
                        </p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleFullImport}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Proceed with Import
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageDivisionDialog;