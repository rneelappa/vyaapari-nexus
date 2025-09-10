import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const moduleInfo = {
  accounting: {
    title: "Accounting Transactions",
    description: "Process accounting vouchers and entries",
    icon: "🧮",
  },
  "non-accounting": {
    title: "Non-Accounting Transactions", 
    description: "Handle non-accounting transactions",
    icon: "📄",
  },
  inventory: {
    title: "Inventory Transactions",
    description: "Manage stock movements and inventory",
    icon: "📦",
  },
};

export default function TallyTransactionPage() {
  const { module } = useParams();
  const moduleData = moduleInfo[module as keyof typeof moduleInfo];

  if (!moduleData) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Module Not Found</CardTitle>
            <CardDescription>The requested transaction module could not be found.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{moduleData.icon}</span>
        <div>
          <h1 className="text-3xl font-bold">{moduleData.title}</h1>
          <p className="text-muted-foreground">{moduleData.description}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>New Entry</CardTitle>
            <CardDescription>Create a new transaction</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Start a new transaction entry.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction List</CardTitle>
            <CardDescription>View all transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Browse and manage existing transactions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>Transaction reports and analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Generate reports for transaction analysis.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}