import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, Download, RefreshCw } from 'lucide-react';
import { useVtData } from '@/hooks/useVtData';

const VT_TABLES = [
  { value: 'companies', label: 'Companies' },
  { value: 'divisions', label: 'Divisions' },
  { value: 'groups', label: 'Groups' },
  { value: 'ledgers', label: 'Ledgers' },
  { value: 'units_of_measure', label: 'Units of Measure' },
  { value: 'stock_items', label: 'Stock Items' },
  { value: 'godowns', label: 'Godowns' },
  { value: 'cost_centres', label: 'Cost Centres' },
  { value: 'cost_categories', label: 'Cost Categories' },
  { value: 'employees', label: 'Employees' },
  { value: 'payheads', label: 'Payheads' },
  { value: 'voucher_types', label: 'Voucher Types' },
  { value: 'vouchers', label: 'Vouchers' },
  { value: 'ledger_entries', label: 'Ledger Entries' },
  { value: 'inventory_entries', label: 'Inventory Entries' },
  { value: 'address_details', label: 'Address Details' }
];

export const VtDataExplorer: React.FC = () => {
  const { companyId, divisionId } = useParams();
  const [selectedTable, setSelectedTable] = useState('vouchers');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterColumn, setFilterColumn] = useState('');
  const [filterValue, setFilterValue] = useState('');

  const filters = React.useMemo(() => {
    const result: Record<string, any> = {};
    if (filterColumn && filterValue) {
      result[filterColumn] = filterValue;
    }
    return result;
  }, [filterColumn, filterValue]);

  const { data, loading, error, total, hasMore, refresh, loadMore } = useVtData(
    selectedTable,
    {
      companyId,
      divisionId,
      filters,
      limit: 50
    }
  );

  const filteredData = React.useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter(row => 
      Object.values(row).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  const getTableColumns = (data: any[]) => {
    if (data.length === 0) return [];
    return Object.keys(data[0]).filter(key => 
      !['created_at', 'updated_at'].includes(key) || key === 'id'
    );
  };

  const formatCellValue = (value: any) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') {
      if (value % 1 === 0) return value.toString();
      return value.toFixed(2);
    }
    if (typeof value === 'string' && value.length > 50) {
      return value.substring(0, 47) + '...';
    }
    return String(value);
  };

  const handleExport = () => {
    const csvContent = [
      getTableColumns(data).join(','),
      ...filteredData.map(row => 
        getTableColumns(data).map(col => `"${formatCellValue(row[col])}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTable}_export.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">VT Data Explorer</h1>
          <p className="text-muted-foreground">
            Browse and explore data in the VT schema
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" disabled={filteredData.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={refresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Browser</CardTitle>
          <CardDescription>
            Select a table and explore its data with filtering and search capabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select value={selectedTable} onValueChange={setSelectedTable}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a table" />
                </SelectTrigger>
                <SelectContent>
                  {VT_TABLES.map((table) => (
                    <SelectItem key={table.value} value={table.value}>
                      {table.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search all columns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Filter column name"
                value={filterColumn}
                onChange={(e) => setFilterColumn(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Input
                placeholder="Filter value"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              />
            </div>
            <Button
              onClick={() => {
                setFilterColumn('');
                setFilterValue('');
                setSearchTerm('');
              }}
              variant="outline"
            >
              <Filter className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="outline">
                Total: {total} records
              </Badge>
              <Badge variant="outline">
                Showing: {filteredData.length} records
              </Badge>
              {error && (
                <Badge variant="destructive">
                  Error: {error}
                </Badge>
              )}
            </div>
          </div>

          {loading && (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          )}

          {!loading && filteredData.length > 0 && (
            <div className="border rounded-md">
              <div className="overflow-x-auto max-h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {getTableColumns(data).map((column) => (
                        <TableHead key={column} className="whitespace-nowrap">
                          {column.replace(/_/g, ' ').toUpperCase()}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((row, index) => (
                      <TableRow key={index}>
                        {getTableColumns(data).map((column) => (
                          <TableCell key={column} className="whitespace-nowrap">
                            {formatCellValue(row[column])}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {!loading && filteredData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No data found
            </div>
          )}

          {hasMore && (
            <div className="flex justify-center">
              <Button onClick={loadMore} variant="outline">
                Load More
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};