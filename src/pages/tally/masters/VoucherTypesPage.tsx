import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Edit, Trash2, FileSignature, Calculator, Package, Settings } from "lucide-react";

interface VoucherType {
  guid: string;
  name: string;
  parent: string;
  numbering_method: string;
  is_deemedpositive: boolean;
  affects_stock: boolean;
  voucher_count: number;
  last_used: string;
}

const mockVoucherTypes: VoucherType[] = [
  {
    guid: "1",
    name: "Sales",
    parent: "Sales",
    numbering_method: "Automatic",
    is_deemedpositive: false,
    affects_stock: true,
    voucher_count: 1250,
    last_used: "2025-01-15"
  },
  {
    guid: "2",
    name: "Purchase",
    parent: "Purchase",
    numbering_method: "Automatic",
    is_deemedpositive: true,
    affects_stock: true,
    voucher_count: 890,
    last_used: "2025-01-14"
  },
  {
    guid: "3",
    name: "Payment",
    parent: "Payment",
    numbering_method: "Automatic",
    is_deemedpositive: true,
    affects_stock: false,
    voucher_count: 2100,
    last_used: "2025-01-15"
  },
  {
    guid: "4",
    name: "Receipt",
    parent: "Receipt",
    numbering_method: "Automatic",
    is_deemedpositive: false,
    affects_stock: false,
    voucher_count: 1800,
    last_used: "2025-01-15"
  },
  {
    guid: "5",
    name: "Journal",
    parent: "Journal",
    numbering_method: "Manual",
    is_deemedpositive: false,
    affects_stock: false,
    voucher_count: 450,
    last_used: "2025-01-12"
  },
  {
    guid: "6",
    name: "Stock Journal",
    parent: "Stock",
    numbering_method: "Automatic",
    is_deemedpositive: false,
    affects_stock: true,
    voucher_count: 120,
    last_used: "2025-01-10"
  }
];

export default function VoucherTypesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [voucherTypes] = useState<VoucherType[]>(mockVoucherTypes);

  const filteredVoucherTypes = voucherTypes.filter(type =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.parent.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.numbering_method.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getVoucherIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'sales':
      case 'purchase':
        return <Package className="h-4 w-4 text-blue-600" />;
      case 'payment':
      case 'receipt':
        return <Calculator className="h-4 w-4 text-green-600" />;
      case 'journal':
      case 'stock journal':
        return <FileSignature className="h-4 w-4 text-purple-600" />;
      default:
        return <FileSignature className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Voucher Types</h1>
          <p className="text-muted-foreground">
            Manage different types of vouchers and their configurations
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Voucher Type
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Voucher Type Configuration</CardTitle>
          <CardDescription>
            Configure voucher types, numbering methods, and transaction properties
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search voucher types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Types</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="purchase">Purchase</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
              <TabsTrigger value="stock">Stock</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Voucher Type</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Numbering</TableHead>
                    <TableHead>Nature</TableHead>
                    <TableHead>Affects Stock</TableHead>
                    <TableHead>Usage Count</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVoucherTypes.map((type) => (
                    <TableRow key={type.guid}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          {getVoucherIcon(type.name)}
                          {type.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{type.parent}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Settings className="h-3 w-3 text-muted-foreground" />
                          <Badge 
                            variant={type.numbering_method === "Automatic" ? "default" : "secondary"}
                          >
                            {type.numbering_method}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={type.is_deemedpositive ? "default" : "secondary"}
                        >
                          {type.is_deemedpositive ? "Debit" : "Credit"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {type.affects_stock ? (
                          <Badge variant="default">Yes</Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium">{type.voucher_count.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(type.last_used).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
