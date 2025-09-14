import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Database, 
  Building2, 
  Package, 
  Users, 
  Warehouse,
  Scale,
  Receipt,
  Target,
  Tag,
  DollarSign,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  FileText
} from 'lucide-react';

interface MasterDataType {
  type: string;
  label: string;
  icon: React.ComponentType<any>;
  count: number;
  data: any[];
  description: string;
}

interface VoucherMasterDataProps {
  voucherGuid: string;
  companyId: string;
  divisionId: string;
}

export function VoucherMasterData({ voucherGuid, companyId, divisionId }: VoucherMasterDataProps) {
  const [loading, setLoading] = useState(true);
  const [masterDataTypes, setMasterDataTypes] = useState<MasterDataType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set(['ledgers']));

  useEffect(() => {
    fetchMasterData();
  }, [voucherGuid, companyId, divisionId]);

  const fetchMasterData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all master data types in parallel
      const [
        ledgersResult,
        stockItemsResult,
        godownsResult,
        uomsResult,
        groupsResult,
        voucherTypesResult,
        costCentresResult,
        costCategoriesResult,
        employeesResult,
        payheadsResult
      ] = await Promise.all([
        supabase
          .from('mst_ledger')
          .select('*')
          .eq('company_id', companyId)
          .eq('division_id', divisionId)
          .limit(100),
        
        supabase
          .from('mst_stock_item')
          .select('*')
          .eq('company_id', companyId)
          .eq('division_id', divisionId)
          .limit(100),
        
        supabase
          .from('mst_godown')
          .select('*')
          .eq('company_id', companyId)
          .eq('division_id', divisionId),
        
        supabase
          .from('mst_uom')
          .select('*')
          .eq('company_id', companyId)
          .eq('division_id', divisionId),
        
        supabase
          .from('mst_group')
          .select('*')
          .eq('company_id', companyId)
          .eq('division_id', divisionId)
          .limit(50),
        
        supabase
          .from('mst_vouchertype')
          .select('*')
          .eq('company_id', companyId)
          .eq('division_id', divisionId),
        
        supabase
          .from('mst_cost_centre')
          .select('*')
          .eq('company_id', companyId)
          .eq('division_id', divisionId)
          .limit(50),
        
        supabase
          .from('mst_cost_category')
          .select('*')
          .eq('company_id', companyId)
          .eq('division_id', divisionId),
        
        supabase
          .from('mst_employee')
          .select('*')
          .eq('company_id', companyId)
          .eq('division_id', divisionId)
          .limit(50),
        
        supabase
          .from('mst_payhead')
          .select('*')
          .eq('company_id', companyId)
          .eq('division_id', divisionId)
          .limit(50)
      ]);

      const masterData: MasterDataType[] = [
        {
          type: 'ledgers',
          label: 'Ledgers',
          icon: Building2,
          count: ledgersResult.data?.length || 0,
          data: ledgersResult.data || [],
          description: 'Chart of accounts and ledger masters'
        },
        {
          type: 'stock-items',
          label: 'Stock Items',
          icon: Package,
          count: stockItemsResult.data?.length || 0,
          data: stockItemsResult.data || [],
          description: 'Inventory items and products'
        },
        {
          type: 'godowns',
          label: 'Godowns/Warehouses',
          icon: Warehouse,
          count: godownsResult.data?.length || 0,
          data: godownsResult.data || [],
          description: 'Storage locations and warehouses'
        },
        {
          type: 'uoms',
          label: 'Units of Measure',
          icon: Scale,
          count: uomsResult.data?.length || 0,
          data: uomsResult.data || [],
          description: 'Measurement units and conversions'
        },
        {
          type: 'groups',
          label: 'Groups',
          icon: Tag,
          count: groupsResult.data?.length || 0,
          data: groupsResult.data || [],
          description: 'Account and item groupings'
        },
        {
          type: 'voucher-types',
          label: 'Voucher Types',
          icon: Receipt,
          count: voucherTypesResult.data?.length || 0,
          data: voucherTypesResult.data || [],
          description: 'Transaction voucher types'
        },
        {
          type: 'cost-centres',
          label: 'Cost Centres',
          icon: Target,
          count: costCentresResult.data?.length || 0,
          data: costCentresResult.data || [],
          description: 'Cost allocation centres'
        },
        {
          type: 'cost-categories',
          label: 'Cost Categories',
          icon: DollarSign,
          count: costCategoriesResult.data?.length || 0,
          data: costCategoriesResult.data || [],
          description: 'Cost classification categories'
        },
        {
          type: 'employees',
          label: 'Employees',
          icon: Users,
          count: employeesResult.data?.length || 0,
          data: employeesResult.data || [],
          description: 'Employee master records'
        },
        {
          type: 'payheads',
          label: 'Pay Heads',
          icon: DollarSign,
          count: payheadsResult.data?.length || 0,
          data: payheadsResult.data || [],
          description: 'Payroll components and heads'
        }
      ];

      // Filter out empty master data types
      const nonEmptyMasterData = masterData.filter(md => md.count > 0);
      setMasterDataTypes(nonEmptyMasterData);

    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (type: string) => {
    const newExpanded = new Set(expandedTypes);
    if (newExpanded.has(type)) {
      newExpanded.delete(type);
    } else {
      newExpanded.add(type);
    }
    setExpandedTypes(newExpanded);
  };

  const renderMasterDataTable = (masterData: MasterDataType) => {
    if (masterData.data.length === 0) return null;

    const sampleData = masterData.data.slice(0, 10); // Show first 10 records

    switch (masterData.type) {
      case 'ledgers':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Parent Group</TableHead>
                <TableHead>Opening Balance</TableHead>
                <TableHead>Closing Balance</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.parent || 'N/A'}</TableCell>
                  <TableCell>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.opening_balance || 0)}</TableCell>
                  <TableCell>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.closing_balance || 0)}</TableCell>
                  <TableCell>
                    <Badge variant={item.is_revenue === 1 ? "default" : "secondary"}>
                      {item.is_revenue === 1 ? "Revenue" : "Non-Revenue"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case 'stock-items':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>UOM</TableHead>
                <TableHead>Stock Qty</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>HSN Code</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.parent || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.uom || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>{(item.closing_balance || 0).toLocaleString('en-IN')}</TableCell>
                  <TableCell>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.closing_rate || 0)}</TableCell>
                  <TableCell>{item.gst_hsn_code || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case 'godowns':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Manager</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.parent || 'N/A'}</TableCell>
                  <TableCell>
                    {item.godown_type && (
                      <Badge variant="outline">{item.godown_type}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.capacity > 0 ? `${item.capacity} ${item.capacity_unit}` : 'N/A'}
                  </TableCell>
                  <TableCell>{item.manager_name || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case 'employees':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Joining Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.designation || 'N/A'}</TableCell>
                  <TableCell>{item.email || 'N/A'}</TableCell>
                  <TableCell>{item.mobile || 'N/A'}</TableCell>
                  <TableCell>
                    {item.date_of_joining ? new Date(item.date_of_joining).toLocaleDateString('en-IN') : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      default:
        // Generic table for other master data types
        const firstItem = sampleData[0];
        if (!firstItem) return null;

        const displayFields = ['name', 'parent', 'guid'].filter(field => firstItem.hasOwnProperty(field));

        return (
          <Table>
            <TableHeader>
              <TableRow>
                {displayFields.map(field => (
                  <TableHead key={field} className="capitalize">
                    {field.replace('_', ' ')}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleData.map((item, index) => (
                <TableRow key={index}>
                  {displayFields.map(field => (
                    <TableCell key={field} className={field === 'name' ? 'font-medium' : ''}>
                      {item[field] || 'N/A'}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Unable to Load Master Data</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (masterDataTypes.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Master Data</h3>
          <p className="text-muted-foreground">
            No master data records found for this company and division.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Master Data Types</p>
                <p className="text-lg font-semibold">{masterDataTypes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Records</p>
                <p className="text-lg font-semibold text-blue-600">
                  {masterDataTypes.reduce((sum, md) => sum + md.count, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Ledgers</p>
                <p className="text-lg font-semibold text-green-600">
                  {masterDataTypes.find(md => md.type === 'ledgers')?.count || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Stock Items</p>
                <p className="text-lg font-semibold text-orange-600">
                  {masterDataTypes.find(md => md.type === 'stock-items')?.count || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Master Data Types */}
      <div className="space-y-4">
        {masterDataTypes.map((masterData) => {
          const IconComponent = masterData.icon;
          const isExpanded = expandedTypes.has(masterData.type);

          return (
            <Card key={masterData.type}>
              <Collapsible 
                open={isExpanded}
                onOpenChange={() => toggleExpanded(masterData.type)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-5 w-5 text-primary" />
                        <div>
                          <CardTitle className="text-base">{masterData.label}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {masterData.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{masterData.count} records</Badge>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {masterData.count > 0 ? (
                      <div className="space-y-4">
                        <div className="overflow-x-auto">
                          {renderMasterDataTable(masterData)}
                        </div>
                        {masterData.count > 10 && (
                          <div className="text-sm text-muted-foreground text-center py-2">
                            Showing first 10 of {masterData.count} records
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <IconComponent className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No {masterData.label.toLowerCase()} found</p>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>
    </div>
  );
}