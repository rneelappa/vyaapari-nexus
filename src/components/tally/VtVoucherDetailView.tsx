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
              {voucher.voucher_type} - {voucher.voucher_number}
            </h1>
            <p className="text-muted-foreground">
              Date: {formatDate(voucher.date)} {voucher.effective_date && voucher.effective_date !== voucher.date && `(Effective: ${formatDate(voucher.effective_date)})`}
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
              <p className="text-sm">{voucher.voucher_type || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Voucher Number</label>
              <p className="text-sm">{voucher.voucher_number || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Amount</label>
              <p className="text-sm font-semibold">{formatCurrency(voucher.amount)}</p>
            </div>
          </div>

          {voucher.party_name && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Party Name</label>
              <p className="text-sm">{voucher.party_name}</p>
            </div>
          )}

          {voucher.reference_number && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Reference Number</label>
              <p className="text-sm">{voucher.reference_number}</p>
            </div>
          )}

          {voucher.place_of_supply && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Place of Supply</label>
              <p className="text-sm">{voucher.place_of_supply}</p>
            </div>
          )}

          {voucher.narration && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Narration</label>
              <p className="text-sm">{voucher.narration}</p>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">
              {voucher.is_invoice ? "Invoice" : "Non-Invoice"}
            </Badge>
            {voucher.is_accounting_voucher && (
              <Badge variant="default">Accounting</Badge>
            )}
            {voucher.is_inventory_voucher && (
              <Badge variant="default">Inventory</Badge>
            )}
            {voucher.is_order_voucher && (
              <Badge variant="outline">Order</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Amount Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Amount Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-muted-foreground">Inventory Value</p>
              <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                {formatCurrency(voucher.total_inventory_value)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accounting Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Accounting Entries ({voucher.accounting_entries?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {voucher.accounting_entries && voucher.accounting_entries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ledger</TableHead>
                  <TableHead>GST Class</TableHead>
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
                    <TableCell className="text-xs text-muted-foreground">
                      {entry.gstclass || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.isdeemedpositive ? formatCurrency(entry.amount) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {!entry.isdeemedpositive ? formatCurrency(Math.abs(entry.amount || 0)) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Badge variant={entry.ispartyledger ? "default" : "secondary"} className="text-xs">
                          {entry.ispartyledger ? "Party" : "Ledger"}
                        </Badge>
                        {entry.ledgerfromitem && (
                          <Badge variant="outline" className="text-xs">Item</Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">No accounting entries found</p>
          )}
        </CardContent>
      </Card>

      {/* Inventory Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Entries ({voucher.inventory_entries?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {voucher.inventory_entries && voucher.inventory_entries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stock Item</TableHead>
                  <TableHead>Godown</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {voucher.inventory_entries.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {entry.stockitem_name || 'N/A'}
                    </TableCell>
                    <TableCell>{entry.godown_name || '-'}</TableCell>
                    <TableCell className="text-right">
                      {entry.quantity?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(entry.rate)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(entry.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">No inventory entries found</p>
          )}
        </CardContent>
      </Card>

      {/* Related Ledgers */}
      <Card>
        <CardHeader>
          <CardTitle>Related Ledgers ({voucher.ledger_details?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {voucher.ledger_details && voucher.ledger_details.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ledger Name</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead className="text-right">Opening Balance</TableHead>
                  <TableHead className="text-right">Closing Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {voucher.ledger_details.map((ledger, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {ledger.name || 'N/A'}
                    </TableCell>
                    <TableCell>{ledger.parent || '-'}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(ledger.opening_balance)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(ledger.closing_balance)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">No related ledgers found</p>
          )}
        </CardContent>
      </Card>

      {/* Related Stock Items */}
      <Card>
        <CardHeader>
          <CardTitle>Related Stock Items ({voucher.stock_items?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {voucher.stock_items && voucher.stock_items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Parent Group</TableHead>
                  <TableHead>Base Units</TableHead>
                  <TableHead className="text-right">Opening Stock</TableHead>
                  <TableHead className="text-right">Closing Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {voucher.stock_items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {item.name || 'N/A'}
                    </TableCell>
                    <TableCell>{item.parent || '-'}</TableCell>
                    <TableCell>{item.base_units || '-'}</TableCell>
                    <TableCell className="text-right">
                      {item.opening_balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.closing_balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">No related stock items found</p>
          )}
        </CardContent>
      </Card>

      {/* Address Details */}
      <Card>
        <CardHeader>
          <CardTitle>Address Details ({voucher.address_details?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {voucher.address_details && voucher.address_details.length > 0 ? (
            <div className="space-y-4">
              {voucher.address_details.map((address, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{address.address_type || 'Address'}</Badge>
                    {address.contact_person && (
                      <span className="text-sm text-muted-foreground">Contact: {address.contact_person}</span>
                    )}
                  </div>
                  <div className="text-sm">
                    {address.address_line1 && <div>{address.address_line1}</div>}
                    {address.address_line2 && <div>{address.address_line2}</div>}
                    <div>
                      {[address.city, address.state, address.pincode].filter(Boolean).join(', ')}
                    </div>
                    {address.country && <div>{address.country}</div>}
                  </div>
                  {(address.phone || address.email) && (
                    <div className="text-sm text-muted-foreground">
                      {address.phone && <div>Phone: {address.phone}</div>}
                      {address.email && <div>Email: {address.email}</div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No address details found</p>
          )}
        </CardContent>
      </Card>

      {/* GST Details */}
      <Card>
        <CardHeader>
          <CardTitle>GST Details ({voucher.gst_details?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {voucher.gst_details && voucher.gst_details.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>HSN Code</TableHead>
                  <TableHead className="text-right">GST Rate</TableHead>
                  <TableHead className="text-right">IGST</TableHead>
                  <TableHead className="text-right">CGST</TableHead>
                  <TableHead className="text-right">SGST</TableHead>
                  <TableHead className="text-right">Cess</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {voucher.gst_details.map((gst, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {gst.hsn_code || 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      {gst.gst_rate ? `${gst.gst_rate}%` : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(gst.igst_amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(gst.cgst_amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(gst.sgst_amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(gst.cess_amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">No GST details found</p>
          )}
        </CardContent>
      </Card>

      {/* Bill Allocations */}
      <Card>
        <CardHeader>
          <CardTitle>Bill Allocations ({voucher.bill_allocations?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {voucher.bill_allocations && voucher.bill_allocations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill Name</TableHead>
                  <TableHead>Bill Date</TableHead>
                  <TableHead className="text-right">Bill Amount</TableHead>
                  <TableHead className="text-right">Allocation Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {voucher.bill_allocations.map((bill, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {bill.bill_name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {bill.bill_date ? formatDate(bill.bill_date) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(bill.bill_amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(bill.allocation_amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">No bill allocations found</p>
          )}
        </CardContent>
      </Card>

      {/* Batch Allocations */}
      <Card>
        <CardHeader>
          <CardTitle>Batch Allocations ({voucher.batch_allocations?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {voucher.batch_allocations && voucher.batch_allocations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch Name</TableHead>
                  <TableHead>Godown</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Mfg Date</TableHead>
                  <TableHead>Exp Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {voucher.batch_allocations.map((batch, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {batch.batch_name || 'N/A'}
                    </TableCell>
                    <TableCell>{batch.godown_name || '-'}</TableCell>
                    <TableCell className="text-right">
                      {batch.quantity?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(batch.rate)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(batch.amount)}
                    </TableCell>
                    <TableCell>
                      {batch.manufactured_date ? formatDate(batch.manufactured_date) : '-'}
                    </TableCell>
                    <TableCell>
                      {batch.expiry_date ? formatDate(batch.expiry_date) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">No batch allocations found</p>
          )}
        </CardContent>
      </Card>

      {/* Related Vouchers */}
      <Card>
        <CardHeader>
          <CardTitle>Related Vouchers ({voucher.related_vouchers?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {voucher.related_vouchers && voucher.related_vouchers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Voucher Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {voucher.related_vouchers.map((relatedVoucher, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {relatedVoucher.voucher_number || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{relatedVoucher.voucher_type || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>
                      {relatedVoucher.date ? formatDate(relatedVoucher.date) : '-'}
                    </TableCell>
                    <TableCell>{relatedVoucher.party_name || '-'}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(relatedVoucher.amount)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {relatedVoucher.reference_number || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">No related vouchers found</p>
          )}
        </CardContent>
      </Card>

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
              <label className="font-medium text-muted-foreground">Voucher Type ID</label>
              <p>{voucher.voucher_type_id || 'N/A'}</p>
            </div>
            <div>
              <label className="font-medium text-muted-foreground">Currency ID</label>
              <p>{voucher.currency_id || 'N/A'}</p>
            </div>
            {voucher.reference_date && (
              <div>
                <label className="font-medium text-muted-foreground">Reference Date</label>
                <p>{formatDate(voucher.reference_date)}</p>
              </div>
            )}
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