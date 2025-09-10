import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const moduleInfo = {
  daybook: {
    title: "DayBook",
    description: "Daily transaction summary and reports",
    icon: "📅",
  },
  statistics: {
    title: "Statistics", 
    description: "Business analytics and statistics",
    icon: "📊",
  },
  "financial-statements": {
    title: "Financial Statements",
    description: "Balance sheet, P&L and financial reports",
    icon: "📈",
  },
  reports: {
    title: "Reports",
    description: "Comprehensive business reports",
    icon: "📋",
  },
};

export default function TallyDisplayPage() {
  const { module } = useParams();
  const moduleData = moduleInfo[module as keyof typeof moduleInfo];

  if (!moduleData) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Module Not Found</CardTitle>
            <CardDescription>The requested display module could not be found.</CardDescription>
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
            <CardTitle>Generate Report</CardTitle>
            <CardDescription>Create new {moduleData.title.toLowerCase()}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Generate and view {moduleData.title.toLowerCase()}.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saved Reports</CardTitle>
            <CardDescription>Access previously generated reports</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Browse and download saved reports.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customize</CardTitle>
            <CardDescription>Configure report settings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Customize report formats and parameters.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}