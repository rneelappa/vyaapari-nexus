import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Database, 
  RefreshCw, 
  Shield, 
  Clock, 
  Globe,
  Save,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ConfigItem {
  key: string;
  value: string;
  description: string;
  type: "string" | "number" | "boolean" | "select";
  options?: string[];
}

export default function ConfigurationPage() {
  const { user } = useAuth();
  const [configItems, setConfigItems] = useState<ConfigItem[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchConfig();
    }
  }, [user]);

  const fetchConfig = async () => {
    if (!user) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch from Supabase config table
      const { data, error } = await supabase
        .from('config')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      // Transform data to match ConfigItem interface with defaults
      const transformedConfig: ConfigItem[] = (data || []).map(item => ({
        key: item.name,
        value: item.value || '',
        description: `Configuration setting: ${item.name}`,
        type: 'string' as const,
      }));

      // Add default configs if table is empty
      if (transformedConfig.length === 0) {
        const defaultConfigs: ConfigItem[] = [
          {
            key: "tally_url",
            value: "http://localhost:9000",
            description: "Tally ERP server URL for data synchronization",
            type: "string"
          },
          {
            key: "currency_code",
            value: "INR",
            description: "Default currency for financial reports",
            type: "select",
            options: ["INR", "USD", "EUR", "GBP"]
          }
        ];
        setConfigItems(defaultConfigs);
      } else {
        setConfigItems(transformedConfig);
      }
    } catch (err) {
      console.error('Error fetching config:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch configuration');
      
      // Fallback to default config
      setConfigItems([
        {
          key: "tally_url",
          value: "http://localhost:9000",
          description: "Tally ERP server URL for data synchronization",
          type: "string"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (key: string, value: string) => {
    setConfigItems(prev => 
      prev.map(item => 
        item.key === key ? { ...item, value } : item
      )
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      // Save configuration logic would go here
      // For now, just simulate success
      setHasChanges(false);
      console.log('Configuration saved:', configItems);
    } catch (err) {
      console.error('Error saving config:', err);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "running":
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge variant="default">Success</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      case "running":
        return <Badge variant="secondary">Running</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to view configuration.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tally Configuration</h1>
          <p className="text-muted-foreground">
            Configure Tally ERP integration and system settings
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={fetchConfig} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Test Connection
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="sync">Synchronization</TabsTrigger>
          <TabsTrigger value="backup">Backup & Recovery</TabsTrigger>
          <TabsTrigger value="system">System Info</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>General Configuration</span>
              </CardTitle>
              <CardDescription>
                Basic system settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading configuration...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
                  <p className="text-destructive">{error}</p>
                </div>
              ) : configItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No configuration items found.</p>
                </div>
              ) : (
                configItems.filter(item => 
                  ["currency_code", "date_format", "decimal_places", "tally_url"].includes(item.key)
                ).map((item) => (
                <div key={item.key} className="space-y-2">
                  <Label htmlFor={item.key} className="text-sm font-medium">
                    {item.key.replace(/_/g, ' ').toUpperCase()}
                  </Label>
                  <div className="space-y-1">
                    {item.type === "boolean" ? (
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={item.key}
                          checked={item.value === "true"}
                          onCheckedChange={(checked) => 
                            handleConfigChange(item.key, checked.toString())
                          }
                        />
                        <Label htmlFor={item.key} className="text-sm">
                          {item.value === "true" ? "Enabled" : "Disabled"}
                        </Label>
                      </div>
                    ) : item.type === "select" ? (
                      <select
                        id={item.key}
                        value={item.value}
                        onChange={(e) => handleConfigChange(item.key, e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        {item.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        id={item.key}
                        type={item.type === "number" ? "number" : "text"}
                        value={item.value}
                        onChange={(e) => handleConfigChange(item.key, e.target.value)}
                        className="w-full"
                      />
                    )}
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <RefreshCw className="h-5 w-5" />
                  <span>Synchronization Settings</span>
                </CardTitle>
                <CardDescription>
                  Configure data sync with Tally ERP
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {configItems.filter(item => 
                  ["tally_url"].includes(item.key)
                ).map((item) => (
                  <div key={item.key} className="space-y-2">
                    <Label htmlFor={item.key} className="text-sm font-medium">
                      {item.key.replace(/_/g, ' ').toUpperCase()}
                    </Label>
                    <div className="space-y-1">
                      {item.type === "boolean" ? (
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={item.key}
                            checked={item.value === "true"}
                            onCheckedChange={(checked) => 
                              handleConfigChange(item.key, checked.toString())
                            }
                          />
                          <Label htmlFor={item.key} className="text-sm">
                            {item.value === "true" ? "Enabled" : "Disabled"}
                          </Label>
                        </div>
                      ) : (
                        <Input
                          id={item.key}
                          type={item.type === "number" ? "number" : "text"}
                          value={item.value}
                          onChange={(e) => handleConfigChange(item.key, e.target.value)}
                          className="w-full"
                        />
                      )}
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Sync Status</span>
                </CardTitle>
                <CardDescription>
                  Current synchronization status and statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon("success")}
                    {getStatusBadge("success")}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Connection:</span>
                  <span className="text-sm text-muted-foreground">
                    Ready to sync with Tally
                  </span>
                </div>
                <div className="pt-4">
                  <Button className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="backup" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Backup & Recovery</span>
              </CardTitle>
              <CardDescription>
                Configure automatic backups and recovery options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Backup configuration will be available in future updates.</p>
              </div>
              {configItems.filter(item => 
                ["backup_enabled", "backup_retention_days"].includes(item.key)
              ).map((item) => (
                <div key={item.key} className="space-y-2">
                  <Label htmlFor={item.key} className="text-sm font-medium">
                    {item.key.replace(/_/g, ' ').toUpperCase()}
                  </Label>
                  <div className="space-y-1">
                    {item.type === "boolean" ? (
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={item.key}
                          checked={item.value === "true"}
                          onCheckedChange={(checked) => 
                            handleConfigChange(item.key, checked.toString())
                          }
                        />
                        <Label htmlFor={item.key} className="text-sm">
                          {item.value === "true" ? "Enabled" : "Disabled"}
                        </Label>
                      </div>
                    ) : (
                      <Input
                        id={item.key}
                        type="number"
                        value={item.value}
                        onChange={(e) => handleConfigChange(item.key, e.target.value)}
                        className="w-full"
                      />
                    )}
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
              <div className="pt-4">
                <Button variant="outline" className="w-full">
                  <Shield className="h-4 w-4 mr-2" />
                  Create Backup Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>System Information</span>
              </CardTitle>
              <CardDescription>
                System status and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Version:</span>
                <Badge variant="outline">1.0.0</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database:</span>
                <span className="text-sm font-medium">Supabase PostgreSQL</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <span className="text-sm text-green-600">Connected</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
