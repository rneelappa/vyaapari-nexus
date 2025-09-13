import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, Database, FileText, Package, Building2, DollarSign, Calendar, MapPin, Phone, Mail, Hash, Truck, Receipt } from 'lucide-react';

interface XmlField {
  xmlPath: string;
  fieldName: string;
  description: string;
  sampleValue?: string;
  dataType: string;
  category: 'master' | 'transaction' | 'reference';
  subCategory: string;
}

interface TableColumn {
  table: string;
  column: string;
  dataType: string;
  exists: boolean;
  nullable: boolean;
}

interface AnalysisResult {
  field: XmlField;
  mappedTo?: TableColumn;
  status: 'mapped' | 'missing' | 'partial';
  recommendation: string;
}

export const XmlDataAnalysis: React.FC<{ xmlData?: string }> = ({ xmlData }) => {
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [missingTables, setMissingTables] = useState<string[]>([]);
  const [missingColumns, setMissingColumns] = useState<{table: string, column: string, purpose: string}[]>([]);

  // Comprehensive XML field mapping based on Tally XML structure
  const tallyXmlFields: XmlField[] = [
    // Voucher Header Information
    { xmlPath: 'VOUCHER/GUID', fieldName: 'guid', description: 'Unique identifier', dataType: 'string', category: 'transaction', subCategory: 'voucher_header' },
    { xmlPath: 'VOUCHER/VOUCHERNUMBER', fieldName: 'voucher_number', description: 'Voucher number', dataType: 'string', category: 'transaction', subCategory: 'voucher_header' },
    { xmlPath: 'VOUCHER/VOUCHERTYPENAME', fieldName: 'voucher_type', description: 'Type of voucher', dataType: 'string', category: 'transaction', subCategory: 'voucher_header' },
    { xmlPath: 'VOUCHER/DATE', fieldName: 'date', description: 'Transaction date', dataType: 'date', category: 'transaction', subCategory: 'voucher_header' },
    { xmlPath: 'VOUCHER/NARRATION', fieldName: 'narration', description: 'Transaction description', dataType: 'text', category: 'transaction', subCategory: 'voucher_header' },
    { xmlPath: 'VOUCHER/REFERENCE', fieldName: 'reference', description: 'Reference number', dataType: 'string', category: 'transaction', subCategory: 'voucher_header' },
    { xmlPath: 'VOUCHER/ALTERID', fieldName: 'alter_id', description: 'Alteration ID', dataType: 'integer', category: 'transaction', subCategory: 'voucher_header' },
    { xmlPath: 'VOUCHER/AMOUNT', fieldName: 'total_amount', description: 'Total voucher amount', dataType: 'decimal', category: 'transaction', subCategory: 'voucher_header' },
    
    // Party/Customer Information
    { xmlPath: 'VOUCHER/PARTYLEDGERNAME', fieldName: 'party_name', description: 'Customer/Supplier name', dataType: 'string', category: 'master', subCategory: 'party_details' },
    { xmlPath: 'VOUCHER/PARTYGSTIN', fieldName: 'party_gstin', description: 'Party GST number', dataType: 'string', category: 'master', subCategory: 'party_details' },
    { xmlPath: 'VOUCHER/PARTYMAILINGNAME', fieldName: 'party_mailing_name', description: 'Party mailing name', dataType: 'string', category: 'master', subCategory: 'party_details' },
    
    // Address Information
    { xmlPath: 'VOUCHER/BASICBUYERADDRESS.LIST/BASICBUYERADDRESS', fieldName: 'buyer_address', description: 'Buyer address', dataType: 'text', category: 'transaction', subCategory: 'address_details' },
    { xmlPath: 'VOUCHER/BASICSELLERADDRESS.LIST/BASICSELLERADDRESS', fieldName: 'seller_address', description: 'Seller address', dataType: 'text', category: 'transaction', subCategory: 'address_details' },
    { xmlPath: 'VOUCHER/BASICSHIPTOADDRESS.LIST/BASICSHIPTOADDRESS', fieldName: 'ship_to_address', description: 'Shipping address', dataType: 'text', category: 'transaction', subCategory: 'address_details' },
    { xmlPath: 'VOUCHER/BASICBUYERPINCODE', fieldName: 'buyer_pincode', description: 'Buyer PIN code', dataType: 'string', category: 'transaction', subCategory: 'address_details' },
    { xmlPath: 'VOUCHER/BASICSELLERPINCODE', fieldName: 'seller_pincode', description: 'Seller PIN code', dataType: 'string', category: 'transaction', subCategory: 'address_details' },
    
    // GST Information
    { xmlPath: 'VOUCHER/BASICBUYERSSTIN', fieldName: 'buyer_gstin', description: 'Buyer GST number', dataType: 'string', category: 'transaction', subCategory: 'gst_details' },
    { xmlPath: 'VOUCHER/BASICSELLERSSTIN', fieldName: 'seller_gstin', description: 'Seller GST number', dataType: 'string', category: 'transaction', subCategory: 'gst_details' },
    { xmlPath: 'VOUCHER/PLACEOFSUPPLY', fieldName: 'place_of_supply', description: 'Place of supply for GST', dataType: 'string', category: 'transaction', subCategory: 'gst_details' },
    { xmlPath: 'VOUCHER/GSTREGISTRATIONTYPE', fieldName: 'gst_registration_type', description: 'GST registration type', dataType: 'string', category: 'transaction', subCategory: 'gst_details' },
    
    // Invoice Details
    { xmlPath: 'VOUCHER/INVOICETYPE', fieldName: 'invoice_type', description: 'Type of invoice', dataType: 'string', category: 'transaction', subCategory: 'invoice_details' },
    { xmlPath: 'VOUCHER/INVOICESUBTYPE', fieldName: 'invoice_subtype', description: 'Invoice subtype', dataType: 'string', category: 'transaction', subCategory: 'invoice_details' },
    { xmlPath: 'VOUCHER/EWAYBILLNO', fieldName: 'eway_bill_number', description: 'E-way bill number', dataType: 'string', category: 'transaction', subCategory: 'invoice_details' },
    { xmlPath: 'VOUCHER/EWAYBILLDATE', fieldName: 'eway_bill_date', description: 'E-way bill date', dataType: 'date', category: 'transaction', subCategory: 'invoice_details' },
    
    // Transport Details
    { xmlPath: 'VOUCHER/TRANSPORTERID', fieldName: 'transporter_id', description: 'Transporter ID', dataType: 'string', category: 'transaction', subCategory: 'transport_details' },
    { xmlPath: 'VOUCHER/TRANSPORTERNAME', fieldName: 'transporter_name', description: 'Transporter name', dataType: 'string', category: 'transaction', subCategory: 'transport_details' },
    { xmlPath: 'VOUCHER/VEHICLENO', fieldName: 'vehicle_number', description: 'Vehicle number', dataType: 'string', category: 'transaction', subCategory: 'transport_details' },
    { xmlPath: 'VOUCHER/SHIPPINGDATE', fieldName: 'shipping_date', description: 'Shipping date', dataType: 'date', category: 'transaction', subCategory: 'transport_details' },
    
    // Ledger Entry Details
    { xmlPath: 'LEDGERENTRIES.LIST/LEDGERNAME', fieldName: 'ledger_name', description: 'Account ledger name', dataType: 'string', category: 'reference', subCategory: 'ledger_entries' },
    { xmlPath: 'LEDGERENTRIES.LIST/AMOUNT', fieldName: 'ledger_amount', description: 'Ledger entry amount', dataType: 'decimal', category: 'transaction', subCategory: 'ledger_entries' },
    { xmlPath: 'LEDGERENTRIES.LIST/ISDEEMEDPOSITIVE', fieldName: 'is_deemed_positive', description: 'Debit/Credit indicator', dataType: 'boolean', category: 'transaction', subCategory: 'ledger_entries' },
    
    // Stock/Inventory Details
    { xmlPath: 'ALLINVENTORYENTRIES.LIST/STOCKITEMNAME', fieldName: 'stock_item_name', description: 'Stock item name', dataType: 'string', category: 'reference', subCategory: 'inventory_entries' },
    { xmlPath: 'ALLINVENTORYENTRIES.LIST/ACTUALQTY', fieldName: 'actual_quantity', description: 'Actual quantity', dataType: 'decimal', category: 'transaction', subCategory: 'inventory_entries' },
    { xmlPath: 'ALLINVENTORYENTRIES.LIST/BILLEDQTY', fieldName: 'billed_quantity', description: 'Billed quantity', dataType: 'decimal', category: 'transaction', subCategory: 'inventory_entries' },
    { xmlPath: 'ALLINVENTORYENTRIES.LIST/RATE', fieldName: 'item_rate', description: 'Item rate per unit', dataType: 'decimal', category: 'transaction', subCategory: 'inventory_entries' },
    { xmlPath: 'ALLINVENTORYENTRIES.LIST/AMOUNT', fieldName: 'item_amount', description: 'Total item amount', dataType: 'decimal', category: 'transaction', subCategory: 'inventory_entries' },
    { xmlPath: 'ALLINVENTORYENTRIES.LIST/GODOWNNAME', fieldName: 'godown_name', description: 'Warehouse/Godown name', dataType: 'string', category: 'reference', subCategory: 'inventory_entries' },
    
    // Tax Details
    { xmlPath: 'ALLINVENTORYENTRIES.LIST/ACCOUNTINGALLOCATIONS.LIST/TAXTYPE', fieldName: 'tax_type', description: 'Type of tax', dataType: 'string', category: 'transaction', subCategory: 'tax_details' },
    { xmlPath: 'ALLINVENTORYENTRIES.LIST/ACCOUNTINGALLOCATIONS.LIST/TAXRATE', fieldName: 'tax_rate', description: 'Tax rate percentage', dataType: 'decimal', category: 'transaction', subCategory: 'tax_details' },
    { xmlPath: 'ALLINVENTORYENTRIES.LIST/ACCOUNTINGALLOCATIONS.LIST/TAXAMOUNT', fieldName: 'tax_amount', description: 'Tax amount', dataType: 'decimal', category: 'transaction', subCategory: 'tax_details' },
    
    // Banking Details
    { xmlPath: 'VOUCHER/BANKALLOCATIONS.LIST/BANKNAME', fieldName: 'bank_name', description: 'Bank name', dataType: 'string', category: 'transaction', subCategory: 'banking_details' },
    { xmlPath: 'VOUCHER/BANKALLOCATIONS.LIST/INSTRUMENTNUMBER', fieldName: 'instrument_number', description: 'Cheque/DD number', dataType: 'string', category: 'transaction', subCategory: 'banking_details' },
    { xmlPath: 'VOUCHER/BANKALLOCATIONS.LIST/INSTRUMENTDATE', fieldName: 'instrument_date', description: 'Cheque/DD date', dataType: 'date', category: 'transaction', subCategory: 'banking_details' },
    { xmlPath: 'VOUCHER/BANKALLOCATIONS.LIST/BANKERSDATE', fieldName: 'bankers_date', description: 'Banker date', dataType: 'date', category: 'transaction', subCategory: 'banking_details' },
    
    // Additional Details
    { xmlPath: 'VOUCHER/DUEBILLDATE', fieldName: 'due_date', description: 'Payment due date', dataType: 'date', category: 'transaction', subCategory: 'payment_terms' },
    { xmlPath: 'VOUCHER/BILLCREDITPERIOD', fieldName: 'credit_period', description: 'Credit period in days', dataType: 'integer', category: 'transaction', subCategory: 'payment_terms' },
    { xmlPath: 'VOUCHER/COSTCENTRENAME', fieldName: 'cost_centre', description: 'Cost centre allocation', dataType: 'string', category: 'reference', subCategory: 'cost_allocation' },
    { xmlPath: 'VOUCHER/COSTCATEGORYNAME', fieldName: 'cost_category', description: 'Cost category', dataType: 'string', category: 'reference', subCategory: 'cost_allocation' }
  ];

  // Existing database tables and columns (simplified mapping)
  const existingTables = {
    'tally_trn_voucher': ['guid', 'voucher_number', 'voucher_type', 'date', 'narration'],
    'trn_accounting': ['guid', 'ledger', 'amount', 'currency'],
    'trn_batch': ['guid', 'item', 'quantity', 'amount', 'godown'],
    'mst_ledger': ['guid', 'name', 'parent', 'gstn', 'opening_balance', 'closing_balance'],
    'mst_stock_item': ['guid', 'name', 'parent', 'uom', 'gst_hsn_code'],
    'mst_godown': ['guid', 'name', 'parent', 'address'],
    'mst_vouchertype': ['guid', 'name', 'parent']
  };

  useEffect(() => {
    analyzeXmlMapping();
  }, [xmlData]);

  const analyzeXmlMapping = () => {
    const results: AnalysisResult[] = [];
    const missing: {table: string, column: string, purpose: string}[] = [];

    tallyXmlFields.forEach(field => {
      let mapped: TableColumn | undefined;
      let status: 'mapped' | 'missing' | 'partial' = 'missing';
      let recommendation = '';

      // Check if field is mapped to existing structure
      switch (field.subCategory) {
        case 'voucher_header':
          if (field.fieldName === 'guid' || field.fieldName === 'voucher_number' || 
              field.fieldName === 'voucher_type' || field.fieldName === 'date' || 
              field.fieldName === 'narration') {
            mapped = { table: 'tally_trn_voucher', column: field.fieldName, dataType: field.dataType, exists: true, nullable: false };
            status = 'mapped';
            recommendation = 'Already mapped to existing table';
          } else {
            missing.push({ 
              table: 'tally_trn_voucher', 
              column: field.fieldName, 
              purpose: field.description 
            });
            recommendation = `Add column '${field.fieldName}' to tally_trn_voucher table`;
          }
          break;

        case 'party_details':
          missing.push({ 
            table: 'trn_party_details', 
            column: field.fieldName, 
            purpose: field.description 
          });
          recommendation = `Create new table 'trn_party_details' for party information`;
          break;

        case 'address_details':
          missing.push({ 
            table: 'trn_address_details', 
            column: field.fieldName, 
            purpose: field.description 
          });
          recommendation = `Create new table 'trn_address_details' for shipping/billing addresses`;
          break;

        case 'gst_details':
          missing.push({ 
            table: 'trn_gst_details', 
            column: field.fieldName, 
            purpose: field.description 
          });
          recommendation = `Create new table 'trn_gst_details' for GST information`;
          break;

        case 'invoice_details':
          missing.push({ 
            table: 'trn_invoice_details', 
            column: field.fieldName, 
            purpose: field.description 
          });
          recommendation = `Create new table 'trn_invoice_details' for invoice metadata`;
          break;

        case 'transport_details':
          missing.push({ 
            table: 'trn_transport_details', 
            column: field.fieldName, 
            purpose: field.description 
          });
          recommendation = `Create new table 'trn_transport_details' for transport information`;
          break;

        case 'tax_details':
          missing.push({ 
            table: 'trn_tax_details', 
            column: field.fieldName, 
            purpose: field.description 
          });
          recommendation = `Create new table 'trn_tax_details' for tax breakup`;
          break;

        case 'banking_details':
          if (existingTables['trn_bank']) {
            status = 'partial';
            recommendation = `Enhance existing 'trn_bank' table with additional columns`;
          } else {
            missing.push({ 
              table: 'trn_banking_details', 
              column: field.fieldName, 
              purpose: field.description 
            });
            recommendation = `Create new table 'trn_banking_details' for payment instruments`;
          }
          break;

        case 'payment_terms':
          missing.push({ 
            table: 'trn_payment_terms', 
            column: field.fieldName, 
            purpose: field.description 
          });
          recommendation = `Create new table 'trn_payment_terms' for payment conditions`;
          break;

        case 'cost_allocation':
          if (existingTables['trn_cost_centre'] || existingTables['trn_cost_category_centre']) {
            status = 'partial';
            recommendation = `Enhance existing cost tables with additional data`;
          } else {
            missing.push({ 
              table: 'trn_cost_allocation', 
              column: field.fieldName, 
              purpose: field.description 
            });
            recommendation = `Enhance cost allocation tables`;
          }
          break;

        case 'ledger_entries':
          if (field.fieldName === 'ledger_name' || field.fieldName === 'ledger_amount') {
            mapped = { table: 'trn_accounting', column: field.fieldName, dataType: field.dataType, exists: true, nullable: false };
            status = 'mapped';
            recommendation = 'Partially mapped to existing table';
          } else {
            missing.push({ 
              table: 'trn_accounting', 
              column: field.fieldName, 
              purpose: field.description 
            });
            recommendation = `Add column '${field.fieldName}' to trn_accounting table`;
          }
          break;

        case 'inventory_entries':
          if (field.fieldName === 'stock_item_name' || field.fieldName === 'actual_quantity' || 
              field.fieldName === 'item_amount' || field.fieldName === 'godown_name') {
            mapped = { table: 'trn_batch', column: field.fieldName, dataType: field.dataType, exists: true, nullable: false };
            status = 'mapped';
            recommendation = 'Partially mapped to existing table';
          } else {
            missing.push({ 
              table: 'trn_batch', 
              column: field.fieldName, 
              purpose: field.description 
            });
            recommendation = `Add column '${field.fieldName}' to trn_batch table`;
          }
          break;

        default:
          recommendation = `Determine appropriate table for ${field.subCategory}`;
      }

      results.push({
        field,
        mappedTo: mapped,
        status,
        recommendation
      });
    });

    setAnalysisResults(results);
    setMissingColumns(missing);

    // Identify missing tables
    const missingTablesList = [
      'trn_party_details',
      'trn_address_details', 
      'trn_gst_details',
      'trn_invoice_details',
      'trn_transport_details',
      'trn_tax_details',
      'trn_banking_details',
      'trn_payment_terms'
    ];
    setMissingTables(missingTablesList);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'mapped': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'partial': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'missing': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <XCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'master': return <Database className="h-4 w-4" />;
      case 'transaction': return <FileText className="h-4 w-4" />;
      case 'reference': return <Hash className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getSubCategoryIcon = (subCategory: string) => {
    switch (subCategory) {
      case 'party_details': return <Building2 className="h-4 w-4" />;
      case 'address_details': return <MapPin className="h-4 w-4" />;
      case 'gst_details': return <Receipt className="h-4 w-4" />;
      case 'transport_details': return <Truck className="h-4 w-4" />;
      case 'banking_details': return <DollarSign className="h-4 w-4" />;
      case 'inventory_entries': return <Package className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const summaryStats = {
    total: analysisResults.length,
    mapped: analysisResults.filter(r => r.status === 'mapped').length,
    partial: analysisResults.filter(r => r.status === 'partial').length,
    missing: analysisResults.filter(r => r.status === 'missing').length
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Fields</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{summaryStats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-600">Mapped</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-green-600">{summaryStats.mapped}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-yellow-600">Partial</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-yellow-600">{summaryStats.partial}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-600">Missing</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-red-600">{summaryStats.missing}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analysis" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analysis">Field Analysis</TabsTrigger>
          <TabsTrigger value="missing-tables">Missing Tables</TabsTrigger>
          <TabsTrigger value="missing-columns">Missing Columns</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>XML Field Mapping Analysis</CardTitle>
              <CardDescription>
                Analysis of Tally XML fields and their mapping to database tables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>XML Path</TableHead>
                      <TableHead>Field</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Mapped To</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analysisResults.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(result.field.category)}
                            <div>
                              <div className="font-medium capitalize">{result.field.category}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                {getSubCategoryIcon(result.field.subCategory)}
                                {result.field.subCategory.replace('_', ' ')}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{result.field.xmlPath}</TableCell>
                        <TableCell className="font-medium">{result.field.fieldName}</TableCell>
                        <TableCell>{result.field.description}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(result.status)}
                            <Badge variant={
                              result.status === 'mapped' ? 'default' :
                              result.status === 'partial' ? 'secondary' : 'destructive'
                            }>
                              {result.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {result.mappedTo ? (
                            <div className="font-mono text-xs">
                              {result.mappedTo.table}.{result.mappedTo.column}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">Not mapped</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="missing-tables">
          <Card>
            <CardHeader>
              <CardTitle>Missing Database Tables</CardTitle>
              <CardDescription>
                Tables that need to be created to store Tally XML data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {missingTables.map((table, index) => (
                  <Alert key={index}>
                    <Database className="h-4 w-4" />
                    <AlertTitle>{table}</AlertTitle>
                    <AlertDescription>
                      This table is needed to store {table.replace('trn_', '').replace('_', ' ')} information from Tally XML
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="missing-columns">
          <Card>
            <CardHeader>
              <CardTitle>Missing Columns</CardTitle>
              <CardDescription>
                Columns that need to be added to existing tables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(
                  missingColumns.reduce((acc, col) => {
                    if (!acc[col.table]) acc[col.table] = [];
                    acc[col.table].push(col);
                    return acc;
                  }, {} as Record<string, typeof missingColumns>)
                ).map(([table, columns]) => (
                  <Card key={table}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-mono">{table}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {columns.map((col, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <span className="font-mono">{col.column}</span>
                            <span className="text-muted-foreground">{col.purpose}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>Implementation Recommendations</CardTitle>
              <CardDescription>
                Step-by-step recommendations for implementing complete XML data storage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Phase 1: Immediate Enhancements</AlertTitle>
                  <AlertDescription>
                    Add missing columns to existing tables: tally_trn_voucher, trn_accounting, trn_batch
                  </AlertDescription>
                </Alert>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Phase 2: New Tables Creation</AlertTitle>
                  <AlertDescription>
                    Create new tables for party details, address information, GST details, and transport information
                  </AlertDescription>
                </Alert>

                <Alert>
                  <Database className="h-4 w-4" />
                  <AlertTitle>Phase 3: Advanced Features</AlertTitle>
                  <AlertDescription>
                    Implement tax breakup tables, payment terms, and enhanced master data relationships
                  </AlertDescription>
                </Alert>

                <div className="mt-6">
                  <h4 className="font-semibold mb-2">Priority Order:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Add reference, alter_id, total_amount to tally_trn_voucher</li>
                    <li>Create trn_party_details for customer/supplier information</li>
                    <li>Create trn_gst_details for GST compliance</li>
                    <li>Create trn_address_details for shipping/billing addresses</li>
                    <li>Create trn_tax_details for tax breakup</li>
                    <li>Enhance inventory tables with rates and quantities</li>
                    <li>Add transport and banking detail tables</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
