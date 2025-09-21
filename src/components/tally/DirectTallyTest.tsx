import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, CheckCircle, XCircle, RefreshCw, AlertCircle, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
export default function DirectTallyTest() {
  const [isPosting, setIsPosting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const generateTestVoucherData = () => {
    const voucherNumber = `TEST-${Date.now()}`;
    const dateIso = new Date().toISOString().slice(0,10);
    return {
      date: dateIso,
      voucherNumber,
      partyLedger: { name: 'Cash' },
      salesLedger: { name: 'Bank' },
      totalAmount: 1000,
      narration: 'Direct test payment from Vyaapari360',
      lines: []
    } as const;
  };

  const handlePostToTally = async () => {
    setIsPosting(true);
    setError(null);
    setResult(null);

    try {
      const voucherData = generateTestVoucherData();
      const { data, error: fnError } = await supabase.functions.invoke('send-to-tally', {
        body: { voucherData }
      });

      if (fnError) {
        throw fnError;
      }

      if (data?.success) {
        setResult({ success: true, status: 200, response: data?.tallyResponse || data?.response, xml: data?.xmlSent });
      } else {
        setError(data?.error || 'Failed to send to Tally');
      }
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Play className="h-6 w-6" />
            Direct Tally XML Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Posts XML via Supabase Edge Function (no localhost dependency)</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Button onClick={handlePostToTally} disabled={isPosting} className="w-full">
            {isPosting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Post to Tally
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <p className="text-green-700">Success! Status: {result.status}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
