import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface VoucherMasterDataProps {
  voucherGuid: string;
  companyId: string;
  divisionId: string;
}

export function VoucherMasterData({ voucherGuid, companyId, divisionId }: VoucherMasterDataProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Placeholder for master data fetching
        // This will be replaced with actual VT schema queries once migration is complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (err) {
        console.error('Error fetching master data:', err);
        setError('Failed to fetch master data');
      } finally {
        setLoading(false);
      }
    };

    if (voucherGuid && companyId && divisionId) {
      fetchData();
    }
  }, [voucherGuid, companyId, divisionId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Master Data References</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-lg font-medium">Master Data Integration</p>
            <p className="text-sm">Master data will be displayed here once VT schema migration is complete</p>
            <Badge variant="outline" className="mt-2">VT Schema Ready</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
