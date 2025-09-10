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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Database, AlertTriangle, ExternalLink } from "lucide-react";
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
    description: division.description,
    manager_name: division.manager_name || division.manager,
    budget: division.budget,
  });
  
  const [tallyEnabled, setTallyEnabled] = useState(division.tally_enabled || false);
  const [tallyUrl, setTallyUrl] = useState(division.tally_url || "");
  const [tallyCompanyId, setTallyCompanyId] = useState(division.tally_company_id || "");
  const { toast } = useToast();

  // Update state when division prop changes
  useEffect(() => {
    setTallyEnabled(division.tally_enabled || false);
    setTallyUrl(division.tally_url || "");
    setTallyCompanyId(division.tally_company_id || "");
  }, [division]);

  const handleSave = async () => {
    try {
      console.log('Saving division with data:', {
        name: formData.name,
        description: formData.description,
        manager_name: formData.manager_name,
        budget: parseFloat(formData.budget.replace(/[₹,\s]/g, '')) || 0,
        tally_enabled: tallyEnabled,
        tally_url: tallyEnabled ? tallyUrl : null,
        tally_company_id: tallyEnabled ? tallyCompanyId : null,
      });

      // Update division basic information in database
      const { data, error: divisionError } = await supabase
        .from('divisions')
        .update({
          name: formData.name,
          description: formData.description,
          manager_name: formData.manager_name,
          budget: parseFloat(formData.budget.replace(/[₹,\s]/g, '')) || 0,
          tally_enabled: tallyEnabled,
          tally_url: tallyEnabled ? tallyUrl : null,
          tally_company_id: tallyEnabled ? tallyCompanyId : null,
          updated_at: new Date().toISOString()
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
        tally_company_id: tallyEnabled ? tallyCompanyId : null,
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

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter division description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manager">Manager Name</Label>
                  <Input
                    id="manager"
                    value={formData.manager_name}
                    onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
                    placeholder="Enter manager name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Budget</Label>
                  <Input
                    id="budget"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="e.g., ₹2.5 Cr"
                  />
                </div>
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

                  <div className="space-y-2">
                    <Label htmlFor="tallyCompanyId">Tally Company ID</Label>
                    <Input
                      id="tallyCompanyId"
                      value={tallyCompanyId}
                      onChange={(e) => setTallyCompanyId(e.target.value)}
                      placeholder="Enter Tally Company ID (e.g., bc90d453-0c64-4f6f-8bbe-dca32aba40d1)"
                    />
                    <p className="text-sm text-muted-foreground">
                      Unique identifier for the company in Tally
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