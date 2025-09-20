import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VtSyncDashboard } from '@/components/vt/VtSyncDashboard';
import { VtDataExplorer } from '@/components/vt/VtDataExplorer';

export const VtManagementPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">VT Schema Management</h1>
          <p className="text-muted-foreground">
            Manage the Virtual Tally (VT) normalized data schema
          </p>
        </div>

        <Tabs defaultValue="sync" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sync">Sync Dashboard</TabsTrigger>
            <TabsTrigger value="explorer">Data Explorer</TabsTrigger>
          </TabsList>

          <TabsContent value="sync" className="space-y-4">
            <VtSyncDashboard />
          </TabsContent>

          <TabsContent value="explorer" className="space-y-4">
            <VtDataExplorer />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};