import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { TallyVoucherSync } from './TallyVoucherSync';
import { VoucherViewRenderer } from './VoucherViewRenderer';

interface VoucherEntry {
  guid: string;
  voucher_number: string;
  voucher_type: string;
  date: string;
  party_ledger_name: string;
  total_amount: number;
  narration: string;
  created_at: string;
  basic_amount?: number;
  discount_amount?: number;
  tax_amount?: number;
  net_amount?: number;
  reference?: string;
  due_date?: string;
}

interface VoucherDetailsViewProps {
  voucher: VoucherEntry;
  onBack: () => void;
  onEdit: (voucher: VoucherEntry) => void;
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
            voucherType={voucher.voucher_type}
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