import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

export default function SalesVoucherCreate() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <FileText className="h-5 w-5" />
            Sales Voucher Creation (VT)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            VT Sales Voucher creation form is being implemented.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
