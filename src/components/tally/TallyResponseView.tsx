import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, ArrowLeft, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface TallyResponseData {
  success: boolean;
  message?: string;
  error?: string;
  tallyResponse?: string;
  response?: string;
  endpoint?: string;
  xmlSent?: string;
  railwayBackendUrl?: string;
  ngrokUrl?: string;
  railwayResult?: any;
  allResponses?: Array<{
    endpoint: string;
    status: number;
    response?: string;
    error?: string;
    success: boolean;
  }>;
}

interface TallyResponseViewProps {
  responseData: TallyResponseData;
  voucherData: any;
  onBack: () => void;
  onRetry?: () => void;
}

export const TallyResponseView: React.FC<TallyResponseViewProps> = ({
  responseData,
  voucherData,
  onBack,
  onRetry
}) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const parseResponse = (response: string) => {
    // Remove null characters and clean up the response
    const cleaned = response.replace(/\x00/g, '');
    return cleaned;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {responseData.success ? (
            <CheckCircle className="h-8 w-8 text-green-500" />
          ) : (
            <XCircle className="h-8 w-8 text-red-500" />
          )}
          <div>
            <h1 className="text-2xl font-bold">
              {responseData.success ? 'Tally Import Successful' : 'Tally Import Failed'}
            </h1>
            <p className="text-muted-foreground">
              {responseData.success 
                ? 'Voucher has been successfully imported to Tally'
                : 'There was an issue importing the voucher to Tally'
              }
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Import Status</CardTitle>
          <CardDescription>Details about the Tally import attempt</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant={responseData.success ? 'default' : 'destructive'}>
                {responseData.success ? 'Success' : 'Failed'}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Voucher Number</p>
              <p className="font-semibold">{voucherData.voucherNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Endpoint Used</p>
              <p className="font-semibold text-sm">{responseData.endpoint || 'Railway Backend'}</p>
            </div>
          </div>
          
          {/* Railway Backend URL */}
          {responseData.railwayBackendUrl && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Railway Backend URL</p>
              <p className="text-sm font-mono bg-blue-50 p-2 rounded border break-all">{responseData.railwayBackendUrl}</p>
            </div>
          )}
          
          {/* Ngrok URL */}
          {responseData.ngrokUrl && responseData.ngrokUrl !== 'No ngrok URL detected' && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ngrok Endpoint</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono bg-yellow-50 p-2 rounded border break-all flex-1">
                  {responseData.ngrokUrl}
                </p>
                {responseData.ngrokUrl.includes('offline') && (
                  <Badge variant="destructive" className="text-xs">Offline</Badge>
                )}
              </div>
              {responseData.ngrokUrl.includes('offline') && (
                <p className="text-xs text-red-600 mt-1">⚠️ This ngrok endpoint appears to be offline</p>
              )}
            </div>
          )}
          
          {responseData.message && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Message</p>
              <p className="text-sm">{responseData.message}</p>
            </div>
          )}
          
          {responseData.error && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Error</p>
              <p className="text-sm text-red-600">{responseData.error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* XML Sent to Tally */}
      {responseData.xmlSent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              XML Sent to Tally
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(responseData.xmlSent!)}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </CardTitle>
            <CardDescription>The XML payload that was sent to Tally server</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <pre className="text-sm whitespace-pre-wrap font-mono text-blue-900">
                {responseData.xmlSent}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tally Response */}
      {(responseData.tallyResponse || responseData.response) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Tally Response
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(parseResponse(responseData.tallyResponse || responseData.response!))}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </CardTitle>
            <CardDescription>Raw response from Tally server (via Railway backend)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <pre className="text-sm whitespace-pre-wrap font-mono text-red-900">
                {parseResponse(responseData.tallyResponse || responseData.response || '')}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Endpoints Tried */}
      {responseData.allResponses && responseData.allResponses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Endpoints Attempted</CardTitle>
            <CardDescription>Details of all endpoints that were tried</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {responseData.allResponses.map((resp, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={resp.success ? 'default' : 'destructive'}>
                        {resp.success ? 'Success' : 'Failed'}
                      </Badge>
                      <span className="font-semibold">{resp.endpoint}</span>
                      <span className="text-sm text-muted-foreground">Status: {resp.status}</span>
                    </div>
                    {resp.response && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(parseResponse(resp.response!))}
                        className="flex items-center gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        Copy
                      </Button>
                    )}
                  </div>
                  
                  {resp.response && (
                    <div className="bg-gray-50 p-3 rounded border text-sm">
                      <p className="font-medium text-gray-600 mb-2">Response:</p>
                      <pre className="whitespace-pre-wrap font-mono text-gray-800">
                        {parseResponse(resp.response)}
                      </pre>
                    </div>
                  )}
                  
                  {resp.error && (
                    <div className="bg-red-50 p-3 rounded text-sm text-red-600">
                      {resp.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={onBack}>
          Back to Voucher
        </Button>
        {!responseData.success && onRetry && (
          <Button onClick={onRetry}>
            Retry Send to Tally
          </Button>
        )}
      </div>
    </div>
  );
};