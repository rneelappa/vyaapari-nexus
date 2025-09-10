import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, 
  FileBarChart, 
  TrendingUp, 
  TrendingDown, 
  Calculator,
  Calendar,
  DollarSign
} from "lucide-react";

interface FinancialStatementItem {
  name: string;
  currentYear: number;
  previousYear: number;
  change: number;
  level: number;
}

const mockProfitLossItems: FinancialStatementItem[] = [
  { name: "Sales", currentYear: 2450000, previousYear: 2200000, change: 11.4, level: 0 },
  { name: "Less: Sales Returns", currentYear: -50000, previousYear: -30000, change: -66.7, level: 1 },
  { name: "Net Sales", currentYear: 2400000, previousYear: 2170000, change: 10.6, level: 0 },
  { name: "Cost of Goods Sold", currentYear: -1500000, previousYear: -1350000, change: -11.1, level: 1 },
  { name: "Gross Profit", currentYear: 900000, previousYear: 820000, change: 9.8, level: 0 },
  { name: "Operating Expenses", currentYear: -200000, previousYear: -180000, change: -11.1, level: 1 },
  { name: "Administrative Expenses", currentYear: -150000, previousYear: -140000, change: -7.1, level: 2 },
  { name: "Selling Expenses", currentYear: -50000, previousYear: -40000, change: -25.0, level: 2 },
  { name: "Operating Profit", currentYear: 700000, previousYear: 640000, change: 9.4, level: 0 },
  { name: "Other Income", currentYear: 50000, previousYear: 40000, change: 25.0, level: 1 },
  { name: "Other Expenses", currentYear: -30000, previousYear: -25000, change: -20.0, level: 1 },
  { name: "Profit Before Tax", currentYear: 720000, previousYear: 655000, change: 9.9, level: 0 },
  { name: "Tax Expense", currentYear: -180000, previousYear: -163750, change: -9.9, level: 1 },
  { name: "Net Profit", currentYear: 540000, previousYear: 491250, change: 9.9, level: 0 }
];

const mockBalanceSheetItems: FinancialStatementItem[] = [
  { name: "ASSETS", currentYear: 0, previousYear: 0, change: 0, level: 0 },
  { name: "Current Assets", currentYear: 1200000, previousYear: 1100000, change: 9.1, level: 1 },
  { name: "Cash and Bank", currentYear: 300000, previousYear: 250000, change: 20.0, level: 2 },
  { name: "Sundry Debtors", currentYear: 500000, previousYear: 450000, change: 11.1, level: 2 },
  { name: "Stock in Hand", currentYear: 400000, previousYear: 400000, change: 0.0, level: 2 },
  { name: "Fixed Assets", currentYear: 800000, previousYear: 750000, change: 6.7, level: 1 },
  { name: "Plant and Machinery", currentYear: 600000, previousYear: 550000, change: 9.1, level: 2 },
  { name: "Furniture and Fixtures", currentYear: 200000, previousYear: 200000, change: 0.0, level: 2 },
  { name: "Total Assets", currentYear: 2000000, previousYear: 1850000, change: 8.1, level: 0 },
  { name: "LIABILITIES", currentYear: 0, previousYear: 0, change: 0, level: 0 },
  { name: "Current Liabilities", currentYear: 600000, previousYear: 550000, change: 9.1, level: 1 },
  { name: "Sundry Creditors", currentYear: 300000, previousYear: 280000, change: 7.1, level: 2 },
  { name: "Bank Overdraft", currentYear: 200000, previousYear: 200000, change: 0.0, level: 2 },
  { name: "Outstanding Expenses", currentYear: 100000, previousYear: 70000, change: 42.9, level: 2 },
  { name: "Long Term Liabilities", currentYear: 400000, previousYear: 400000, change: 0.0, level: 1 },
  { name: "Term Loan", currentYear: 400000, previousYear: 400000, change: 0.0, level: 2 },
  { name: "Capital", currentYear: 1000000, previousYear: 900000, change: 11.1, level: 1 },
  { name: "Total Liabilities", currentYear: 2000000, previousYear: 1850000, change: 8.1, level: 0 }
];

export default function FinancialStatementsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("current");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-muted-foreground";
  };

  const getIndentation = (level: number) => {
    return level * 20;
  };

  const getFontWeight = (level: number) => {
    return level === 0 ? "font-bold" : level === 1 ? "font-semibold" : "font-normal";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Statements</h1>
          <p className="text-muted-foreground">
            Profit & Loss Statement and Balance Sheet reports
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Select Period
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profit-loss" className="w-full">
        <TabsList>
          <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
          <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
          <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="profit-loss" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileBarChart className="h-5 w-5" />
                <span>Profit & Loss Statement</span>
              </CardTitle>
              <CardDescription>
                For the year ended March 31, 2025
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Particulars</TableHead>
                    <TableHead className="text-right">Current Year</TableHead>
                    <TableHead className="text-right">Previous Year</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockProfitLossItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell 
                        className={`${getFontWeight(item.level)}`}
                        style={{ paddingLeft: `${getIndentation(item.level)}px` }}
                      >
                        {item.name}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={item.currentYear >= 0 ? "text-green-600" : "text-red-600"}>
                          {formatCurrency(item.currentYear)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={item.previousYear >= 0 ? "text-green-600" : "text-red-600"}>
                          {formatCurrency(item.previousYear)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {getChangeIcon(item.change)}
                          <span className={getChangeColor(item.change)}>
                            {item.change > 0 ? '+' : ''}{item.change}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance-sheet" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>Balance Sheet</span>
              </CardTitle>
              <CardDescription>
                As at March 31, 2025
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Particulars</TableHead>
                    <TableHead className="text-right">Current Year</TableHead>
                    <TableHead className="text-right">Previous Year</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockBalanceSheetItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell 
                        className={`${getFontWeight(item.level)}`}
                        style={{ paddingLeft: `${getIndentation(item.level)}px` }}
                      >
                        {item.name}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.currentYear !== 0 ? (
                          <span className="text-green-600">
                            {formatCurrency(item.currentYear)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.previousYear !== 0 ? (
                          <span className="text-green-600">
                            {formatCurrency(item.previousYear)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.change !== 0 ? (
                          <div className="flex items-center justify-end space-x-1">
                            {getChangeIcon(item.change)}
                            <span className={getChangeColor(item.change)}>
                              {item.change > 0 ? '+' : ''}{item.change}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cash-flow" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Cash Flow Statement</span>
              </CardTitle>
              <CardDescription>
                For the year ended March 31, 2025
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                <div className="text-center">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Cash Flow Statement would be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
