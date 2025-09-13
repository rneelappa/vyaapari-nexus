import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, RefreshCw, FileText, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAccountingLedgers } from "@/hooks/useAccountingLedgers";

export default function AccountingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Use the accounting ledgers hook
  const { ledgers, loading, error, refresh } = useAccountingLedgers();

  const handleCreateTransaction = (ledgerName: string) => {
    const pathParts = location.pathname.split('/');
    const divisionIndex = pathParts.indexOf('division');
    const companyIndex = pathParts.indexOf('company');
    
    if (divisionIndex > -1 && companyIndex > -1 && pathParts[divisionIndex + 1] && pathParts[companyIndex + 1]) {
      const divisionId = pathParts[divisionIndex + 1];
      const companyId = pathParts[companyIndex + 1];
      // For now, show a message since we don't have specific forms for each ledger
      toast({
        title: "Create Transaction",
        description: `Create transaction for ${ledgerName} - Feature coming soon`,
      });
    }
  };

  const filteredLedgers = ledgers.filter(ledger =>
    ledger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ledger.parent.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getBalanceIcon = (balance: number) => {
    return balance >= 0 ? 
      <TrendingUp className="h-4 w-4 text-green-600" /> : 
      <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getBalanceBadge = (balance: number) => {
    return balance >= 0 ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Dr {formatCurrency(Math.abs(balance))}
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-red-100 text-red-800">
        Cr {formatCurrency(Math.abs(balance))}
      </Badge>
    );
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Please log in to view accounting ledgers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accounting Ledgers</h1>
          <p className="text-muted-foreground">
            View ledger balances, transaction counts, and debit/credit totals
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
            placeholder="Search ledgers..."
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
              <span className="ml-2 text-muted-foreground">Loading accounting ledgers...</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              Accounting Ledgers
              <Badge variant="secondary" className="ml-auto">
                {filteredLedgers.length} ledgers
              </Badge>
            </CardTitle>
            <CardDescription>
              Ledger balances with debit/credit totals and transaction counts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredLedgers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchTerm ? 'No ledgers match your search.' : 'No accounting ledgers found.'}
                </p>
                {!searchTerm && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Check if the company and division have ledger data.
                  </p>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ledger Name</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead className="text-right">Debit Total</TableHead>
                    <TableHead className="text-right">Credit Total</TableHead>
                    <TableHead className="text-right">Current Balance</TableHead>
                    <TableHead className="text-right">Vouchers</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLedgers.map((ledger) => (
                    <TableRow 
                      key={ledger.guid}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getBalanceIcon(ledger.net_balance)}
                          {ledger.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                          {ledger.parent}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-green-600 font-medium">
                          {formatCurrency(ledger.total_debit)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-red-600 font-medium">
                          {formatCurrency(ledger.total_credit)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {getBalanceBadge(ledger.net_balance)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge 
                          variant={ledger.voucher_count > 0 ? "default" : "secondary"}
                          className={ledger.voucher_count > 0 ? "bg-blue-100 text-blue-800" : ""}
                        >
                          {ledger.voucher_count.toLocaleString()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreateTransaction(ledger.name);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Transaction
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