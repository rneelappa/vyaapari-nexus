import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useVtSync } from '@/hooks/useVtSync';
import { Loader2, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VtMigrationTriggerProps {
  companyId: string;
  divisionId: string;
}

export const VtMigrationTrigger: React.FC<VtMigrationTriggerProps> = ({
  companyId,
  divisionId
}) => {
  const { performSync, isSyncing, lastSyncResult } = useVtSync();
  const { toast } = useToast();

  const handleMigration = async () => {
    try {
      await performSync(companyId, divisionId);
      toast({
        title: "Migration Started",
        description: "VT schema migration is in progress...",
      });
    } catch (error) {
      console.error('Migration error:', error);
      toast({
        title: "Migration Failed",
        description: "Failed to start VT schema migration",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          VT Schema Migration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Migrate data from Tally schema to VT schema for improved performance and functionality.
          </p>
          
          <Button 
            onClick={handleMigration}
            disabled={isSyncing}
            className="w-full"
          >
            {isSyncing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Migrating...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Start Migration
              </>
            )}
          </Button>

          {lastSyncResult && (
            <div className="mt-4 p-3 bg-secondary rounded-lg">
              <p className="text-sm">
                Last sync: {lastSyncResult.recordsProcessed} records processed
                {lastSyncResult.errors > 0 && (
                  <span className="text-destructive ml-2">
                    ({lastSyncResult.errors} errors)
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};