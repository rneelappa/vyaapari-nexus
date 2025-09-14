import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  ArrowRight,
  Calendar,
  DollarSign,
  User,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

interface TallyVoucherSyncProps {
  voucherGuid: string;
  companyId: string;
  divisionId: string;
  onSyncComplete?: () => void;
}

interface VoucherComparison {
  currentData: any;
  tallyData: any;
  differences: {
    voucherNumber: boolean;
    partyLedger: boolean;
    narration: boolean;
    basicAmount: boolean;
    totalAmount: boolean;
    modifiedBy: boolean;
    modifiedOn: boolean;
  };
}

export function TallyVoucherSync({ 
  voucherGuid, 
  companyId, 
  divisionId, 
  onSyncComplete 
}: TallyVoucherSyncProps) {
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [comparison, setComparison] = useState<VoucherComparison | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchComparison = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('tally-voucher-sync', {
        body: {
          voucherGuid,
          companyId,
          divisionId,
          action: 'fetch'
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch voucher comparison');
      }

      setComparison(data);
      setShowDialog(true);
      
    } catch (error: any) {
      console.error('Error fetching voucher comparison:', error);
      toast.error('Failed to fetch voucher data from Tally', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const performUpdate = async (autoUpdate: boolean = false) => {
    setUpdating(true);
    try {
      const { data, error } = await supabase.functions.invoke('tally-voucher-sync', {
        body: {
          voucherGuid,
          companyId,
          divisionId,
          action: 'update',
          autoUpdate
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to update voucher');
      }

      toast.success('Voucher updated successfully', {
        description: 'Latest data has been synced from Tally'
      });

      setShowDialog(false);
      onSyncComplete?.();
      
    } catch (error: any) {
      console.error('Error updating voucher:', error);
      toast.error('Failed to update voucher', {
        description: error.message
      });
    } finally {
      setUpdating(false);
    }
  };

  const autoUpdate = async () => {
    setLoading(true);
    try {
      await performUpdate(true);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(num || 0);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const hasDifferences = comparison ? 
    Object.values(comparison.differences).some(diff => diff) : false;

  const renderComparisonField = (
    label: string,
    currentValue: any,
    tallyValue: any,
    isDifferent: boolean,
    formatter?: (value: any) => string
  ) => {
    const formatValue = formatter || ((val: any) => val?.toString() || 'N/A');
    
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{label}</span>
          {isDifferent && (
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              Changed
            </Badge>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
          <div className="space-y-1">
            <span className="text-muted-foreground">Current:</span>
            <div className={`p-2 rounded border ${isDifferent ? 'bg-red-50 border-red-200' : 'bg-muted'}`}>
              {formatValue(currentValue)}
            </div>
          </div>
          <div className="flex items-center justify-center">
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground">Tally:</span>
            <div className={`p-2 rounded border ${isDifferent ? 'bg-green-50 border-green-200' : 'bg-muted'}`}>
              {formatValue(tallyValue)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          onClick={fetchComparison}
          disabled={loading}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Update from Tally
        </Button>
        
        <Button
          onClick={autoUpdate}
          disabled={loading}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Auto Update
        </Button>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Voucher Sync Comparison
            </DialogTitle>
            <DialogDescription>
              Review the differences between your local data and the latest data from Tally
            </DialogDescription>
          </DialogHeader>

          {comparison && (
            <div className="space-y-6">
              {/* Status Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    {hasDifferences ? (
                      <>
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        Differences Found
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        No Differences
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {hasDifferences 
                      ? 'The voucher data in Tally has been modified. Review the changes below and decide whether to update.'
                      : 'Your local voucher data is in sync with Tally. No update is required.'
                    }
                  </p>
                </CardContent>
              </Card>

              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {renderComparisonField(
                    'Voucher Number',
                    comparison.currentData.voucher_number,
                    comparison.tallyData.basicInfo.voucherNumber,
                    comparison.differences.voucherNumber
                  )}
                  
                  {renderComparisonField(
                    'Party Ledger',
                    comparison.currentData.party_ledger_name,
                    comparison.tallyData.party.name,
                    comparison.differences.partyLedger
                  )}
                  
                  {renderComparisonField(
                    'Narration',
                    comparison.currentData.narration,
                    comparison.tallyData.references.narration,
                    comparison.differences.narration
                  )}
                </CardContent>
              </Card>

              {/* Financial Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Financial Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {renderComparisonField(
                    'Basic Amount',
                    comparison.currentData.basic_amount,
                    comparison.tallyData.financial.grossAmount,
                    comparison.differences.basicAmount,
                    formatCurrency
                  )}
                  
                  {renderComparisonField(
                    'Total Amount',
                    comparison.currentData.total_amount,
                    comparison.tallyData.financial.totalAmount,
                    comparison.differences.totalAmount,
                    formatCurrency
                  )}
                </CardContent>
              </Card>

              {/* Audit Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Audit Trail
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {renderComparisonField(
                    'Modified By',
                    comparison.currentData.altered_by,
                    comparison.tallyData.audit.modifiedBy,
                    comparison.differences.modifiedBy
                  )}
                  
                  {renderComparisonField(
                    'Modified On',
                    comparison.currentData.altered_on,
                    comparison.tallyData.audit.alteredOn,
                    comparison.differences.modifiedOn,
                    formatDate
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <Separator />

          <DialogFooter className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={updating}
            >
              Cancel
            </Button>
            
            <div className="flex gap-2">
              {hasDifferences && (
                <Button
                  onClick={() => performUpdate(false)}
                  disabled={updating}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${updating ? 'animate-spin' : ''}`} />
                  Update Voucher
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}