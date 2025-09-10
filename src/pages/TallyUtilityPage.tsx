import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const moduleInfo = {
  configuration: {
    title: "Tally Configuration",
    description: "System settings and configuration",
    icon: "⚙️",
  },
};

export default function TallyUtilityPage() {
  const { module } = useParams();
  const moduleData = moduleInfo[module as keyof typeof moduleInfo];

  if (!moduleData) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Module Not Found</CardTitle>
            <CardDescription>The requested utility module could not be found.</CardDescription>
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
            <CardTitle>Company Settings</CardTitle>
            <CardDescription>Configure company information</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Set up company details and preferences.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage users and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configure user access and roles.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Backup</CardTitle>
            <CardDescription>Backup and restore data</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Manage data backup and recovery.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Configure security options</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Set up security and access controls.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integration</CardTitle>
            <CardDescription>Third-party integrations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configure external system integrations.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Maintenance</CardTitle>
            <CardDescription>System optimization tools</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Perform system maintenance and optimization.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}