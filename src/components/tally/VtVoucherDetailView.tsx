/**
 * VT Voucher Detail View
 * 
 * Complete VT-enabled voucher detail component
 */

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Edit, RefreshCw } from "lucide-react";
import { useVtVoucherDetail } from "@/hooks/useVtVoucherDetail";
import { LoadingErrorState } from "@/components/common/LoadingErrorState";
import { format } from "date-fns";

interface VtVoucherDetailViewProps {
  voucherGuid: string;
  companyId: string;
  divisionId: string;
  onBack?: () => void;
  onEdit?: (voucher: any) => void;
  onSyncComplete?: () => void;
}

export function VtVoucherDetailView({
  voucherGuid,
  companyId,
  divisionId,
  onBack,
  onEdit,
  onSyncComplete
}: VtVoucherDetailViewProps) {
  const { voucher, loading, error, refresh } = useVtVoucherDetail(
    voucherGuid,
    companyId,
    divisionId
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading voucher details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!voucher) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Voucher not found</p>
      </div>
    );
  }

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return '₹0.00';
    return `₹${Math.abs(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'N/A';
    try {
      return format(new Date(dateStr), 'dd MMM yyyy');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Vouchers
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-semibold">
              {voucher.vouchertypename} - {voucher.vouchernumber}
            </h1>
            <p className="text-muted-foreground">
              Date: {formatDate(voucher.date || voucher.voucher_date)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(voucher)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Voucher
            </Button>
          )}
        </div>
      </div>

      {/* Voucher Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Voucher Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Voucher Type</label>
              <p className="text-sm">{voucher.vouchertypename || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Voucher Number</label>
              <p className="text-sm">{voucher.vouchernumber || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Amount</label>
              <p className="text-sm font-semibold">{formatCurrency(voucher.amount)}</p>
            </div>
          </div>

          {voucher.partyname && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Party Name</label>
              <p className="text-sm">{voucher.partyname}</p>
            </div>
          )}

          {voucher.narration && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Narration</label>
              <p className="text-sm">{voucher.narration}</p>
            </div>
          )}

          <div className="flex items-center gap-4">
            <Badge variant={voucher.iscancelled ? "destructive" : "secondary"}>
              {voucher.iscancelled ? "Cancelled" : "Active"}
            </Badge>
            {voucher.isoptional && (
              <Badge variant="outline">Optional</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Amount Summary */}
      {(voucher.total_debit !== undefined || voucher.total_credit !== undefined) && (
        <Card>
          <CardHeader>
            <CardTitle>Amount Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Debit</p>
                <p className="text-xl font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(voucher.total_debit)}
                </p>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Credit</p>
                <p className="text-xl font-semibold text-red-600 dark:text-red-400">
                  {formatCurrency(voucher.total_credit)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accounting Entries */}
      {voucher.accounting_entries && voucher.accounting_entries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Accounting Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ledger</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {voucher.accounting_entries.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {entry.ledgername || 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.isdeemedpositive ? formatCurrency(entry.amount) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {!entry.isdeemedpositive ? formatCurrency(Math.abs(entry.amount || 0)) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={entry.ispartyledger ? "default" : "secondary"}>
                        {entry.ispartyledger ? "Party" : "Ledger"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="font-medium text-muted-foreground">GUID</label>
              <p className="font-mono text-xs break-all">{voucher.guid}</p>
            </div>
            <div>
              <label className="font-medium text-muted-foreground">Alter ID</label>
              <p>{voucher.alterid || 'N/A'}</p>
            </div>
            <div>
              <label className="font-medium text-muted-foreground">Master ID</label>
              <p>{voucher.masterid || 'N/A'}</p>
            </div>
            <div>
              <label className="font-medium text-muted-foreground">Class Name</label>
              <p>{voucher.classname || 'N/A'}</p>
            </div>
            {voucher.created_at && (
              <div>
                <label className="font-medium text-muted-foreground">Created At</label>
                <p>{formatDate(voucher.created_at)}</p>
              </div>
            )}
            {voucher.updated_at && (
              <div>
                <label className="font-medium text-muted-foreground">Updated At</label>
                <p>{formatDate(voucher.updated_at)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}