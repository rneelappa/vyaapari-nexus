import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Edit, Trash2, Target, Building, Users, TrendingUp } from "lucide-react";

interface CostCenter {
  guid: string;
  name: string;
  parent: string;
  category: string;
  allocated_amount: number;
  employee_count: number;
  is_active: boolean;
}

const mockCostCenters: CostCenter[] = [
  {
    guid: "1",
    name: "Production Department",
    parent: "Manufacturing",
    category: "Direct Costs",
    allocated_amount: 500000,
    employee_count: 25,
    is_active: true
  },
  {
    guid: "2",
    name: "Quality Control",
    parent: "Manufacturing",
    category: "Direct Costs", 
    allocated_amount: 150000,
    employee_count: 8,
    is_active: true
  },
  {
    guid: "3",
    name: "Sales & Marketing",
    parent: "Administration",
    category: "Indirect Costs",
    allocated_amount: 300000,
    employee_count: 12,
    is_active: true
  },
  {
    guid: "4",
    name: "Human Resources",
    parent: "Administration",
    category: "Indirect Costs",
    allocated_amount: 200000,
    employee_count: 5,
    is_active: true
  },
  {
    guid: "5",
    name: "IT Department",
    parent: "Support",
    category: "Indirect Costs",
    allocated_amount: 100000,
    employee_count: 3,
    is_active: false
  }
];

export default function CostCentersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [costCenters] = useState<CostCenter[]>(mockCostCenters);

  const filteredCostCenters = costCenters.filter(center =>
    center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    center.parent.toLowerCase().includes(searchTerm.toLowerCase()) ||
    center.category.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold">Cost Centers</h1>
          <p className="text-muted-foreground">
            Manage cost centers for expense allocation and tracking
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Cost Center
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cost Center Management</CardTitle>
          <CardDescription>
            Organizational units for cost allocation and budget tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cost centers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Centers</TabsTrigger>
              <TabsTrigger value="manufacturing">Manufacturing</TabsTrigger>
              <TabsTrigger value="administration">Administration</TabsTrigger>
              <TabsTrigger value="support">Support</TabsTrigger>
              <TabsTrigger value="active">Active Only</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cost Center</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Allocated Amount</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCostCenters.map((center) => (
                    <TableRow key={center.guid}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          {center.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Building className="h-3 w-3 text-muted-foreground" />
                          <Badge variant="outline">{center.parent}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={center.category === "Direct Costs" ? "default" : "secondary"}
                        >
                          {center.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-3 w-3 text-green-600" />
                          <span className="font-medium text-green-600">
                            {formatCurrency(center.allocated_amount)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">{center.employee_count}</span>
                          <span className="text-sm text-muted-foreground">people</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {center.is_active ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
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
