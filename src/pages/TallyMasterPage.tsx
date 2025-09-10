import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const moduleInfo = {
  groups: {
    title: "Groups",
    description: "Manage account groups and categories",
    icon: "📁",
  },
  ledgers: {
    title: "Ledgers", 
    description: "Create and manage ledger accounts",
    icon: "📖",
  },
  "stock-items": {
    title: "Stock Items",
    description: "Manage inventory and stock items",
    icon: "📦",
  },
  godowns: {
    title: "Godowns",
    description: "Manage storage locations and warehouses",
    icon: "🏪",
  },
  "cost-centers": {
    title: "Cost Centers",
    description: "Configure cost and profit centers",
    icon: "🎯",
  },
  "voucher-types": {
    title: "Voucher Types",
    description: "Setup different voucher types",
    icon: "🧾",
  },
};

export default function TallyMasterPage() {
  const { module } = useParams();
  const moduleData = moduleInfo[module as keyof typeof moduleInfo];

  if (!moduleData) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Module Not Found</CardTitle>
            <CardDescription>The requested master module could not be found.</CardDescription>
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
            <CardTitle>Create New</CardTitle>
            <CardDescription>Add a new {moduleData.title.toLowerCase()}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Click here to create a new {moduleData.title.toLowerCase()} entry.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>View All</CardTitle>
            <CardDescription>Browse existing {moduleData.title.toLowerCase()}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View and manage all existing {moduleData.title.toLowerCase()}.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Import/Export</CardTitle>
            <CardDescription>Data management tools</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Import or export {moduleData.title.toLowerCase()} data.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}