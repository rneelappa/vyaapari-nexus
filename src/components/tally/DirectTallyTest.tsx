import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, CheckCircle, XCircle, RefreshCw, AlertCircle, Copy } from 'lucide-react';

export default function DirectTallyTest() {
  const [isPosting, setIsPosting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const generateTestXML = () => {
    const voucherNumber = `TEST-${Date.now()}`;
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    
    return `<ENVELOPE>
<HEADER>
<VERSION>1</VERSION>
<TALLYREQUEST>Import</TALLYREQUEST>
<TYPE>Data</TYPE>
<ID>Vouchers</ID>
</HEADER>
<BODY>
<DESC></DESC>
<DATA>
<TALLYMESSAGE>
<VOUCHER>
<DATE>${date}</DATE>
<NARRATION>Direct test payment from vyaapari-nexus</NARRATION>
<VOUCHERTYPENAME>Payment</VOUCHERTYPENAME>
<VOUCHERNUMBER>${voucherNumber}</VOUCHERNUMBER>
<ALLLEDGERENTRIES.LIST>
<LEDGERNAME>Cash</LEDGERNAME>
<ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
<AMOUNT>1000</AMOUNT>
</ALLLEDGERENTRIES.LIST>
<ALLLEDGERENTRIES.LIST>
<LEDGERNAME>Bank</LEDGERNAME>
<ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
<AMOUNT>1000</AMOUNT>
</ALLLEDGERENTRIES.LIST>
</VOUCHER>
</TALLYMESSAGE>
</DATA>
</BODY>
</ENVELOPE>`;
  };

  const handlePostToTally = async () => {
    setIsPosting(true);
    setError(null);
    setResult(null);

    try {
      const xml = generateTestXML();
      const response = await fetch('http://localhost:9000', {
        method: 'POST',
        headers: { 'Content-Type': 'application/xml' },
        body: xml,
      });

      const responseText = await response.text();
      
      if (response.ok) {
        setResult({ success: true, status: response.status, response: responseText, xml });
      } else {
        setError(`HTTP ${response.status}: ${responseText}`);
      }
    } catch (err) {
      setError(err.message);
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
          <p>Posts XML directly to Tally ERP on localhost:9000</p>
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
