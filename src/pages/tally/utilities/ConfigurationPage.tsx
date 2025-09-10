import { useState } from "react";
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

interface ConfigItem {
  key: string;
  value: string;
  description: string;
  type: "string" | "number" | "boolean" | "select";
  options?: string[];
}

const mockConfigItems: ConfigItem[] = [
  {
    key: "tally_url",
    value: "http://localhost:9000",
    description: "Tally ERP server URL for data synchronization",
    type: "string"
  },
  {
    key: "sync_interval",
    value: "300",
    description: "Automatic sync interval in seconds (300 = 5 minutes)",
    type: "number"
  },
  {
    key: "auto_sync_enabled",
    value: "true",
    description: "Enable automatic data synchronization",
    type: "boolean"
  },
  {
    key: "backup_enabled",
    value: "true",
    description: "Enable automatic database backups",
    type: "boolean"
  },
  {
    key: "backup_retention_days",
    value: "30",
    description: "Number of days to retain backup files",
    type: "number"
  },
  {
    key: "currency_code",
    value: "INR",
    description: "Default currency for financial reports",
    type: "select",
    options: ["INR", "USD", "EUR", "GBP"]
  },
  {
    key: "date_format",
    value: "DD/MM/YYYY",
    description: "Default date format for display",
    type: "select",
    options: ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]
  },
  {
    key: "decimal_places",
    value: "2",
    description: "Number of decimal places for currency amounts",
    type: "number"
  }
];

const mockSyncStatus = {
  lastSync: "2025-01-15T10:30:00Z",
  status: "success",
  recordsSynced: 1250,
  errors: 0,
  nextSync: "2025-01-15T10:35:00Z"
};

const mockSystemInfo = {
  version: "1.0.0",
  databaseSize: "2.5 GB",
  totalRecords: 125000,
  lastBackup: "2025-01-15T06:00:00Z",
  uptime: "15 days, 8 hours"
};

export default function ConfigurationPage() {
  const [configItems, setConfigItems] = useState<ConfigItem[]>(mockConfigItems);
  const [hasChanges, setHasChanges] = useState(false);

  const handleConfigChange = (key: string, value: string) => {
    setConfigItems(prev => 
      prev.map(item => 
        item.key === key ? { ...item, value } : item
      )
    );
    setHasChanges(true);
  };

  const handleSave = () => {
    // Save configuration logic would go here
    setHasChanges(false);
    // Show success message
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
              {configItems.filter(item => 
                ["currency_code", "date_format", "decimal_places"].includes(item.key)
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
              ))}
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
                  ["tally_url", "sync_interval", "auto_sync_enabled"].includes(item.key)
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
                    {getStatusIcon(mockSyncStatus.status)}
                    {getStatusBadge(mockSyncStatus.status)}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Last Sync:</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDateTime(mockSyncStatus.lastSync)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Records Synced:</span>
                  <span className="text-sm font-medium">
                    {mockSyncStatus.recordsSynced.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Errors:</span>
                  <span className={`text-sm ${
                    mockSyncStatus.errors > 0 ? "text-red-600" : "text-green-600"
                  }`}>
                    {mockSyncStatus.errors}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Next Sync:</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDateTime(mockSyncStatus.nextSync)}
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
                <Badge variant="outline">{mockSystemInfo.version}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database Size:</span>
                <span className="text-sm font-medium">{mockSystemInfo.databaseSize}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Records:</span>
                <span className="text-sm font-medium">
                  {mockSystemInfo.totalRecords.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Backup:</span>
                <span className="text-sm text-muted-foreground">
                  {formatDateTime(mockSystemInfo.lastBackup)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">System Uptime:</span>
                <span className="text-sm text-muted-foreground">
                  {mockSystemInfo.uptime}
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
