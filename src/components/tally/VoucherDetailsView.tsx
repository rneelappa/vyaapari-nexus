import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { TallyVoucherSync } from './TallyVoucherSync'; // Keep for now, will be replaced
import { VoucherViewRenderer } from './VoucherViewRenderer'; // Keep for now, will be updated
import { VtVoucher } from '@/types/vt'; // Import VtVoucher from generated types

// Using VT types - VtVoucher interface from generated types

interface VoucherDetailsViewProps {
  voucher: VtVoucher; // Use VtVoucher type
  onBack: () => void;
  onEdit: (voucher: VtVoucher) => void; // Use VtVoucher type
  companyId?: string;
  divisionId?: string;
  onSyncComplete?: () => void;
}

export function VoucherDetailsView({ voucher, onBack, onEdit, companyId, divisionId, onSyncComplete }: VoucherDetailsViewProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Vouchers
        </Button>
        
        <div className="flex gap-2">
          {companyId && divisionId && (
            <TallyVoucherSync
              voucherGuid={voucher.guid}
              companyId={companyId}
              divisionId={divisionId}
              onSyncComplete={onSyncComplete}
            />
          )}
          
          <Button onClick={() => onEdit(voucher)} variant="outline" size="sm" className="flex items-center gap-2">
            Edit Voucher
          </Button>
        </div>
      </div>

      {/* Voucher View Renderer */}
      <div className="flex-1 overflow-auto">
        {companyId && divisionId ? (
          <VoucherViewRenderer
            voucherGuid={voucher.guid}
            voucherType={voucher.voucher_type || ''} // Ensure voucher_type is string
            companyId={companyId}
            divisionId={divisionId}
            onClose={onBack}
          />
        ) : (
          <div className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>Voucher Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Company ID and Division ID are required to display detailed voucher information.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}