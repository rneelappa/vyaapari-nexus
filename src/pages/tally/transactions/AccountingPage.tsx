import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, RefreshCw, FileText } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useVoucherTypesByCategory } from "@/hooks/useVoucherTypesByCategory";

export default function AccountingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Use the voucher types hook
  const { categories, loading, error, refresh } = useVoucherTypesByCategory();

  const handleVoucherTypeClick = (voucherType: {guid: string, name: string, parent: string}) => {
    if (voucherType.name.toLowerCase() === 'sales' || voucherType.parent.toLowerCase() === 'sales') {
      const pathParts = location.pathname.split('/');
      const divisionIndex = pathParts.indexOf('division');
      const companyIndex = pathParts.indexOf('company');
      
      if (divisionIndex > -1 && companyIndex > -1 && pathParts[divisionIndex + 1] && pathParts[companyIndex + 1]) {
        const divisionId = pathParts[divisionIndex + 1];
        const companyId = pathParts[companyIndex + 1];
        navigate(`/company/${companyId}/division/${divisionId}/tally/transactions/sales/create`);
      } else {
        navigate('/tally/transactions/sales/create');
      }
    } else {
      // Handle other voucher types - could navigate to specific forms
      toast({
        title: "Coming Soon",
        description: `${voucherType.name} voucher creation form will be available soon`,
      });
    }
  };

  const filteredAccountingVoucherTypes = categories.accounting.filter(vt =>
    vt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vt.parent.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Please log in to view accounting voucher types.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accounting Voucher Types</h1>
          <p className="text-muted-foreground">
            View and manage accounting voucher types and their transaction counts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
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

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
            <Button 
              variant="outline" 
              onClick={refresh} 
              className="mt-2"
              disabled={loading}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading voucher types...</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Accounting Voucher Types
              <Badge variant="secondary" className="ml-auto">
                {filteredAccountingVoucherTypes.length} types
              </Badge>
            </CardTitle>
            <CardDescription>
              Financial transaction voucher types with voucher counts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredAccountingVoucherTypes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchTerm ? 'No voucher types match your search.' : 'No accounting voucher types found.'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Voucher Type</TableHead>
                    <TableHead>Parent Category</TableHead>
                    <TableHead className="text-right">Voucher Count</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccountingVoucherTypes.map((voucherType) => (
                    <TableRow 
                      key={voucherType.guid}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleVoucherTypeClick(voucherType)}
                    >
                      <TableCell className="font-medium">
                        {voucherType.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                          {voucherType.parent}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge 
                          variant={voucherType.count > 0 ? "default" : "secondary"}
                          className={voucherType.count > 0 ? "bg-green-100 text-green-800" : ""}
                        >
                          {voucherType.count.toLocaleString()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVoucherTypeClick(voucherType);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Create
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}