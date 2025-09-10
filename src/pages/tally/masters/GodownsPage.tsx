import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Edit, Trash2, Warehouse, MapPin, Package } from "lucide-react";

interface Godown {
  guid: string;
  name: string;
  parent: string;
  address: string;
  stock_count: number;
  total_value: number;
}

const mockGodowns: Godown[] = [
  {
    guid: "1",
    name: "Main Warehouse",
    parent: "Primary",
    address: "123 Industrial Area, Phase 1, Bangalore",
    stock_count: 45,
    total_value: 2500000
  },
  {
    guid: "2",
    name: "Raw Material Store",
    parent: "Main Warehouse",
    address: "123 Industrial Area, Phase 1, Bangalore - Block A",
    stock_count: 25,
    total_value: 1200000
  },
  {
    guid: "3",
    name: "Finished Goods Store",
    parent: "Main Warehouse", 
    address: "123 Industrial Area, Phase 1, Bangalore - Block B",
    stock_count: 20,
    total_value: 1300000
  },
  {
    guid: "4",
    name: "Branch Office Store",
    parent: "Secondary",
    address: "456 Commercial Street, Chennai",
    stock_count: 15,
    total_value: 450000
  }
];

export default function GodownsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [godowns] = useState<Godown[]>(mockGodowns);

  const filteredGodowns = godowns.filter(godown =>
    godown.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    godown.parent.toLowerCase().includes(searchTerm.toLowerCase()) ||
    godown.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Godowns</h1>
          <p className="text-muted-foreground">
            Manage warehouse locations and storage facilities
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Godown
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Warehouse Locations</CardTitle>
          <CardDescription>
            Physical storage locations with stock information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search godowns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Godowns</TabsTrigger>
              <TabsTrigger value="primary">Primary</TabsTrigger>
              <TabsTrigger value="secondary">Secondary</TabsTrigger>
              <TabsTrigger value="high-value">High Value</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Godown Name</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Stock Items</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGodowns.map((godown) => (
                    <TableRow key={godown.guid}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <Warehouse className="h-4 w-4 text-muted-foreground" />
                          {godown.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{godown.parent}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm max-w-48 truncate">
                            {godown.address}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Package className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">{godown.stock_count}</span>
                          <span className="text-sm text-muted-foreground">items</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium text-green-600">
                          {formatCurrency(godown.total_value)}
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
