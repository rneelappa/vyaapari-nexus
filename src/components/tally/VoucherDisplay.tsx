import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Calendar, FileText, Eye, Edit, Trash2, Filter } from 'lucide-react';
import { format } from 'date-fns';

interface VoucherEntry {
  guid: string;
  voucher_number: string;
  voucher_type: string;
  date: string;
  party_ledger_name: string;
  total_amount: number;
  narration: string;
  created_at: string;
}

interface VoucherDisplayProps {
  vouchers: VoucherEntry[];
  loading?: boolean;
  onVoucherClick?: (voucher: VoucherEntry) => void;
  onEdit?: (voucher: VoucherEntry) => void;
  onDelete?: (voucher: VoucherEntry) => void;
  showActions?: boolean;
  title?: string;
  searchable?: boolean;
  filterable?: boolean;
}

export const VoucherDisplay: React.FC<VoucherDisplayProps> = ({
  vouchers,
  loading = false,
  onVoucherClick,
  onEdit,
  onDelete,
  showActions = false,
  title = "Vouchers",
  searchable = true,
  filterable = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'number' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Get unique voucher types for filtering
  const voucherTypes = Array.from(new Set(vouchers.map(v => v.voucher_type))).filter(Boolean);

  // Filter and sort vouchers
  const filteredVouchers = vouchers
    .filter(voucher => {
      const matchesSearch = searchTerm === '' || 
        voucher.voucher_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voucher.party_ledger_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voucher.narration.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = selectedType === '' || voucher.voucher_type === selectedType;
      
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'number':
          comparison = a.voucher_number.localeCompare(b.voucher_number);
          break;
        case 'amount':
          comparison = a.total_amount - b.total_amount;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch {
      return dateString;
    }
  };

  const getVoucherTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Sales': 'bg-green-100 text-green-800',
      'Purchase': 'bg-blue-100 text-blue-800',
      'Receipt': 'bg-purple-100 text-purple-800',
      'Payment': 'bg-orange-100 text-orange-800',
      'Journal': 'bg-gray-100 text-gray-800',
      'Contra': 'bg-yellow-100 text-yellow-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {title}
          <Badge variant="secondary" className="ml-auto">
            {filteredVouchers.length} vouchers
          </Badge>
        </CardTitle>
        
        {(searchable || filterable) && (
          <div className="flex flex-col sm:flex-row gap-4">
            {searchable && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vouchers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
            
            {filterable && (
              <div className="flex gap-2">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    {voucherTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={(value: 'date' | 'number' | 'amount') => setSortBy(value)}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Sort by Date</SelectItem>
                    <SelectItem value="number">Sort by Number</SelectItem>
                    <SelectItem value="amount">Sort by Amount</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {filteredVouchers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No vouchers found</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Voucher No.</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Narration</TableHead>
                  {showActions && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVouchers.map((voucher) => (
                  <TableRow 
                    key={voucher.guid}
                    className={onVoucherClick ? "cursor-pointer hover:bg-muted/50" : ""}
                    onClick={() => onVoucherClick?.(voucher)}
                  >
                    <TableCell className="font-medium">
                      {voucher.voucher_number}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={getVoucherTypeBadgeColor(voucher.voucher_type)}
                      >
                        {voucher.voucher_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(voucher.date)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {voucher.party_ledger_name}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(voucher.total_amount)}
                    </TableCell>
                    <TableCell className="max-w-[250px] truncate">
                      {voucher.narration}
                    </TableCell>
                    {showActions && (
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onVoucherClick?.(voucher);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {onEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(voucher);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(voucher);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};