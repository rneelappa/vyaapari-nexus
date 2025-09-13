import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Send, Edit, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface VoucherLine {
  type: 'inventory' | 'ledger';
  stockItem?: any;
  ledger?: any;
  quantity?: number;
  rate?: number;
  amount: number;
  debit?: number;
  credit?: number;
  narration?: string;
  trackingNumber?: string;
}

interface VoucherData {
  voucherNumber: string;
  date: string;
  partyLedger: any;
  salesLedger: any;
  lines: VoucherLine[];
  narration: string;
  totalAmount: number;
}

interface VoucherSuccessViewProps {
  voucherData: VoucherData;
  onSendToTally: () => Promise<void>;
  onEdit: () => void;
  onBack: () => void;
  isSending?: boolean;
}

export const VoucherSuccessView: React.FC<VoucherSuccessViewProps> = ({
  voucherData,
  onSendToTally,
  onEdit,
  onBack,
  isSending = false
}) => {
  const { voucherNumber, date, partyLedger, salesLedger, totalAmount, narration } = voucherData;
  
  const partyFinalBalance = partyLedger.closing_balance + totalAmount;
  const salesFinalBalance = salesLedger.closing_balance - totalAmount;

  const handleSendToTally = async () => {
    try {
      await onSendToTally();
      toast.success('Voucher sent to Tally successfully!');
    } catch (error) {
      console.error('Error sending to Tally:', error);
      toast.error('Failed to send voucher to Tally. Please try again.');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-8 w-8 text-green-500" />
          <div>
            <h1 className="text-2xl font-bold text-green-700">Voucher Saved Successfully!</h1>
            <p className="text-muted-foreground">Voucher #{voucherNumber} has been saved to the database</p>
          </div>
        </div>
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to List
        </Button>
      </div>

      {/* Voucher Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Voucher Details</CardTitle>
          <CardDescription>Summary of the saved voucher</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Voucher Number</p>
              <p className="text-lg font-semibold">{voucherNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date</p>
              <p className="text-lg font-semibold">{date}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
              <p className="text-lg font-semibold">₹{totalAmount.toFixed(2)}</p>
            </div>
          </div>
          
          {narration && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Narration</p>
              <p className="text-sm bg-muted p-2 rounded">{narration}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Party Account
              <Badge variant="outline">Debited</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-medium">{partyLedger.name}</p>
              <p className="text-sm text-muted-foreground">
                Previous Balance: ₹{Math.abs(partyLedger.closing_balance).toFixed(2)} 
                {partyLedger.closing_balance >= 0 ? ' Dr' : ' Cr'}
              </p>
              <p className="text-sm text-blue-600 font-medium">
                Debited: ₹{totalAmount.toFixed(2)}
              </p>
              <p className="text-lg font-bold text-orange-600">
                Current Balance: ₹{Math.abs(partyFinalBalance).toFixed(2)} {partyFinalBalance >= 0 ? 'Dr' : 'Cr'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Sales Account
              <Badge variant="secondary">Credited</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-medium">{salesLedger.name}</p>
              <p className="text-sm text-muted-foreground">
                Previous Balance: ₹{Math.abs(salesLedger.closing_balance).toFixed(2)}
                {salesLedger.closing_balance >= 0 ? ' Dr' : ' Cr'}
              </p>
              <p className="text-sm text-green-600 font-medium">
                Credited: ₹{totalAmount.toFixed(2)}
              </p>
              <p className="text-lg font-bold text-orange-600">
                Current Balance: ₹{Math.abs(salesFinalBalance).toFixed(2)} {salesFinalBalance >= 0 ? 'Dr' : 'Cr'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={onEdit} className="flex items-center gap-2">
          <Edit className="h-4 w-4" />
          Edit Voucher
        </Button>
        <Button 
          onClick={handleSendToTally} 
          disabled={isSending}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Send className="h-4 w-4" />
          {isSending ? 'Sending to Tally...' : 'Send to Tally'}
        </Button>
      </div>
    </div>
  );
};