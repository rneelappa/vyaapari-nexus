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

interface TallyDebugResponse {
  success: boolean;
  xmlResponse?: string;
  statistics?: {
    totalNodes: number;
    depth: number;
    processingTime: number;
    stagingRecords: number;
  };
  error?: string;
  debugInfo?: {
    request: any;
    response: any;
    parseTime: number;
    timeline?: Array<{ step: string; info?: any; at: string }>;
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
  const [tallyData, setTallyData] = useState<TallyDebugResponse | null>(null);
  const [updating, setUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const TIMEOUT_MS = 30000; // 30s client-side timeout to avoid endless waiting

  const fetchTallyData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('tally-xml-staging-sync', {
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
        throw new Error(data.error || 'Failed to fetch voucher data from Tally');
      }

      setTallyData(data);
      setShowDialog(true);
      
    } catch (error: any) {
      console.error('Error fetching voucher data:', error);
      toast.error('Failed to fetch voucher data from Tally', {
        description: error.message
      });
      
      // Show error response in dialog
      setTallyData({
        success: false,
        error: error.message,
        statistics: {
          totalNodes: 0,
          depth: 0,
          processingTime: 0,
          stagingRecords: 0
        }
      });
      setShowDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const updateFromTally = async () => {
    // Open popup immediately with loading state
    setUpdating(true);
    setStatusMessage('Preparing Tally request...');
    // Initialize dialog with empty stats
    setTallyData({
      success: false,
      statistics: {
        totalNodes: 0,
        depth: 0,
        processingTime: 0,
        stagingRecords: 0
      },
      debugInfo: {
        request: { voucherGuid },
        response: {},
        parseTime: 0,
      }
    });
    setShowDialog(true);

    // Prefetch Tally URL and construct the exact XML request for visibility in UI
    try {
      const [{ data: divisionRow }, { data: companyRow }] = await Promise.all([
        supabase.from('divisions').select('tally_url, tally_company_id').eq('id', divisionId).single(),
        supabase.from('mst_company').select('company_name').eq('vyaapari_company_id', companyId).single()
      ]);

      if (divisionRow?.tally_url) {
        const url = divisionRow.tally_url;
        const companyName = companyRow?.company_name || divisionRow.tally_company_id || 'Unknown Company';
        const requestBody = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <VERSION>1</VERSION>
    <TALLYREQUEST>Export</TALLYREQUEST>
    <TYPE>Data</TYPE>
    <ID>DayBook</ID>
  </HEADER>
  <BODY>
    <DESC>
      <STATICVARIABLES>
        <SVCURRENTCOMPANY>${companyName}</SVCURRENTCOMPANY>
        <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
      </STATICVARIABLES>
    </DESC>
  </BODY>
</ENVELOPE>`;
        setTallyData((prev) => ({
          ...(prev || { success: false }),
          debugInfo: {
            ...(prev?.debugInfo || { parseTime: 0, response: {} }),
            request: {
              ...(prev?.debugInfo?.request || {}),
              url,
              voucherGuid,
              companyName,
              requestBody,
            },
          },
        }));
      }
    } catch (e) {
      // Non-blocking: if this fails we still proceed
      console.warn('Could not prefetch division/mst_company config for debug UI', e);
    }

    const slowTimer = setTimeout(() => {
      setStatusMessage('Still processing... This may take up to a minute depending on Tally.');
    }, 10000);

    try {
      setStatusMessage('Calling Tally API...');
      const invokePromise = supabase.functions.invoke('tally-xml-staging-sync', {
        body: {
          voucherGuid,
          companyId,
          divisionId,
          action: 'update'
        }
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Tally request timed out. Please check the Tally server and try again.')), TIMEOUT_MS);
      });

      const result = await Promise.race([invokePromise, timeoutPromise]) as any;
      const { data, error } = result;

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to update staging table');
      }

      setStatusMessage('Processing complete.');
      setTallyData(data);
      toast.success('XML staging table updated successfully', {
        description: `Processed ${data.statistics?.stagingRecords || 0} XML nodes`
      });

      onSyncComplete?.();
      
    } catch (error: any) {
      console.error('Error updating staging table:', error);
      setStatusMessage('Error while processing.');
      toast.error('Failed to update staging table', {
        description: error.message
      });
      
      // Keep existing request debug info and attach error
      setTallyData((prev) => ({
        ...(prev || { success: false }),
        success: false,
        error: error.message,
        statistics: prev?.statistics || {
          totalNodes: 0,
          depth: 0,
          processingTime: 0,
          stagingRecords: 0
        },
        debugInfo: prev?.debugInfo,
      }));
    } finally {
      clearTimeout(slowTimer);
      setUpdating(false);
    }
  };

  const formatXmlPreview = (xmlContent: string) => {
    if (!xmlContent) return 'No XML content';
    const preview = xmlContent.substring(0, 500);
    return preview + (xmlContent.length > 500 ? '...' : '');
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

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const renderStatCard = (title: string, value: string | number, icon: any) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-lg font-semibold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <div className="flex gap-2">
        <Button
          onClick={fetchTallyData}
          disabled={loading || updating}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Eye className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          View Tally Data
        </Button>
        
        <Button
          onClick={updateFromTally}
          disabled={loading || updating}
          variant="default"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${updating ? 'animate-spin' : ''}`} />
          Update from Tally
        </Button>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {tallyData?.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              Tally XML Debug Information
            </DialogTitle>
            <DialogDescription>
              Detailed information about the Tally API call and XML processing
            </DialogDescription>
          </DialogHeader>

          {tallyData && (
            <div className="space-y-6">
              {/* Status Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    {updating ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                        Processing...
                      </>
                    ) : tallyData.success ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Success
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        Error
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {updating ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <p className="text-sm text-muted-foreground">
                        {statusMessage || 'Calling Tally API and processing XML data...'}
                      </p>
                    </div>
                  ) : tallyData.success ? (
                    <p className="text-sm text-muted-foreground">
                      Successfully fetched and processed voucher data from Tally
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-red-600 font-medium">Error occurred:</p>
                      <p className="text-sm text-muted-foreground bg-red-50 p-3 rounded border">
                        {tallyData.error}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Statistics */}
              {tallyData.statistics && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Processing Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {renderStatCard(
                        'XML Nodes',
                        tallyData.statistics.totalNodes.toLocaleString(),
                        <FileText className="h-5 w-5 text-blue-600" />
                      )}
                      {renderStatCard(
                        'XML Depth',
                        tallyData.statistics.depth,
                        <ArrowRight className="h-5 w-5 text-green-600" />
                      )}
                      {renderStatCard(
                        'Processing Time',
                        `${tallyData.statistics.processingTime}ms`,
                        <RefreshCw className="h-5 w-5 text-orange-600" />
                      )}
                      {renderStatCard(
                        'Staging Records',
                        tallyData.statistics.stagingRecords.toLocaleString(),
                        <CheckCircle className="h-5 w-5 text-purple-600" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Debug Information */}
              {tallyData.debugInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Debug Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-2">Request Details:</p>
                        <div className="bg-muted p-3 rounded text-xs font-mono space-y-1">
                          <p><strong>URL:</strong> {tallyData.debugInfo.request.url || 'N/A'}</p>
                          <p><strong>Voucher GUID:</strong> {tallyData.debugInfo.request.voucherGuid}</p>
                          {tallyData.debugInfo.request.tallyCompanyId && (
                            <p><strong>Tally Company ID:</strong> {tallyData.debugInfo.request.tallyCompanyId}</p>
                          )}
                        </div>
                      </div>

                      {tallyData.debugInfo.request.requestBody && (
                         <div>
                           <p className="text-sm font-medium mb-2">XML Request Sent:</p>
                           <div className="bg-muted p-3 rounded text-xs font-mono max-h-60 overflow-y-auto">
                             <pre className="whitespace-pre-wrap">
                               {tallyData.debugInfo.request.requestBody}
                             </pre>
                           </div>
                         </div>
                      )}
                      
                      <div>
                        <p className="text-sm font-medium mb-2">Response Details:</p>
                        <div className="bg-muted p-3 rounded text-xs font-mono">
                          <p><strong>Status:</strong> {tallyData.debugInfo.response.statusCode ?? 'N/A'}</p>
                          {typeof tallyData.debugInfo.response.contentLength === 'number' && (
                            <p><strong>Content Length:</strong> {formatBytes(tallyData.debugInfo.response.contentLength)}</p>
                          )}
                          {tallyData.debugInfo.parseTime ? (
                            <p><strong>Parse Time:</strong> {tallyData.debugInfo.parseTime}ms</p>
                          ) : null}
                        </div>
                      </div>

                      {tallyData.debugInfo.response.responsePreview && (
                         <div>
                           <p className="text-sm font-medium mb-2">XML Response Preview:</p>
                           <div className="bg-muted p-3 rounded text-xs font-mono max-h-60 overflow-y-auto">
                             <pre className="whitespace-pre-wrap">
                               {tallyData.debugInfo.response.responsePreview}
                             </pre>
                           </div>
                         </div>
                      )}

                      {/* Timeline */}
                      {tallyData.debugInfo.timeline && tallyData.debugInfo.timeline.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Processing Timeline:</p>
                          <div className="bg-muted p-3 rounded text-xs font-mono max-h-60 overflow-y-auto">
                            {tallyData.debugInfo.timeline.map((entry, index) => (
                              <div key={index} className="mb-2 last:mb-0">
                                <div className="flex justify-between items-start">
                                  <span className="font-medium">{entry.step}:</span>
                                  <span className="text-muted-foreground">{new Date(entry.at).toLocaleTimeString()}</span>
                                </div>
                                {entry.info && (
                                  <div className="ml-2 mt-1 text-muted-foreground">
                                    <pre className="whitespace-pre-wrap text-xs">
                                      {JSON.stringify(entry.info, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                     </div>
                   </CardContent>
                 </Card>
               )}
             </div>
           )}

           <Separator />

          <DialogFooter className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={updating}
            >
              Close
            </Button>
            
            <div className="flex gap-2">
              {tallyData?.success && (
                <Button
                  onClick={updateFromTally}
                  disabled={updating}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${updating ? 'animate-spin' : ''}`} />
                  Update Staging Table
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}