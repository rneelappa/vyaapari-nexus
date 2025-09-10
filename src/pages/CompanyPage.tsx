import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Users, MapPin, Settings } from "lucide-react";

const CompanyPage = () => {
  const { companyId } = useParams();
  
  // Mock company data - in real app this would come from API
  const company = {
    id: companyId,
    name: "Vyaapari360ERP",
    description: "Leading ERP solution provider with global presence",
    address: "Mumbai, Maharashtra, India",
    totalEmployees: 1250,
    totalDivisions: 4,
    establishedYear: 2018,
    status: "Active"
  };

  const divisions = [
    { id: "div1", name: "Technology Division", employees: 450, workspaces: 8 },
    { id: "div2", name: "Sales & Marketing", employees: 320, workspaces: 6 },
    { id: "div3", name: "Operations", employees: 280, workspaces: 5 },
    { id: "div4", name: "Human Resources", employees: 200, workspaces: 4 }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Company Header */}
      <div className="gradient-subtle rounded-lg p-6 border">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{company.name}</h1>
              <p className="text-muted-foreground mt-1">{company.description}</p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{company.address}</span>
                </Badge>
                <Badge variant="outline">Est. {company.establishedYear}</Badge>
                <Badge className="bg-accent text-accent-foreground">{company.status}</Badge>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Manage Company
          </Button>
        </div>
      </div>

      {/* Company Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company.totalEmployees.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all divisions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Divisions</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company.totalDivisions}</div>
            <p className="text-xs text-muted-foreground">Operational divisions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workspaces</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{divisions.reduce((acc, div) => acc + div.workspaces, 0)}</div>
            <p className="text-xs text-muted-foreground">Active workspaces</p>
          </CardContent>
        </Card>
      </div>

      {/* Divisions Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Divisions Overview</CardTitle>
          <CardDescription>Manage and view all company divisions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {divisions.map((division) => (
              <Card key={division.id} className="border hover:shadow-medium transition-smooth cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{division.name}</CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/company/${companyId}/division/${division.id}`}>
                        View Details
                      </a>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{division.employees} employees</span>
                    <span>{division.workspaces} workspaces</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyPage;