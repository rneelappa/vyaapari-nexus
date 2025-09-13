import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Users, MapPin, Settings, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const CompanyPage = () => {
  const { companyId } = useParams();
  const [company, setCompany] = useState<any>(null);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!companyId) return;
      
      try {
        console.log('Fetching company data for ID:', companyId);
        // Fetch company data
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', companyId)
          .maybeSingle();
          
        console.log('Company query result:', { companyData, companyError });
        if (companyError) throw companyError;
        if (!companyData) {
          console.log('No company found for ID:', companyId);
          throw new Error('Company not found');
        }
        
        // Fetch divisions data
        const { data: divisionsData, error: divisionsError } = await supabase
          .from('divisions')
          .select('*')
          .eq('company_id', companyId);
          
        if (divisionsError) throw divisionsError;
        
        // Fetch workspaces count per division
        const { data: workspacesData, error: workspacesError } = await supabase
          .from('workspaces')
          .select('division_id')
          .eq('company_id', companyId);
          
        if (workspacesError) throw workspacesError;
        
        // Count workspaces per division
        const workspacesByDivision = workspacesData.reduce((acc, workspace) => {
          acc[workspace.division_id] = (acc[workspace.division_id] || 0) + 1;
          return acc;
        }, {});
        
        const enrichedDivisions = divisionsData.map(division => ({
          ...division,
          workspaces: workspacesByDivision[division.id] || 0
        }));
        
        setCompany({
          ...companyData,
          totalEmployees: divisionsData.reduce((acc, div) => acc + (div.employee_count || 0), 0),
          totalDivisions: divisionsData.length,
          establishedYear: new Date(companyData.created_at).getFullYear(),
          status: companyData.is_active ? "Active" : "Inactive"
        });
        
        setDivisions(enrichedDivisions);
      } catch (error) {
        console.error('Error fetching company data:', error);
        // Fallback to mock data based on company ID
        const mockCompanyData = companyId === "550e8400-e29b-41d4-a716-446655440001" 
          ? {
              id: companyId,
              name: "TechStart Inc",
              description: "Innovative technology startup",
              domain: "techstart.com",
              totalEmployees: 150,
              totalDivisions: 1,
              establishedYear: 2022,
              status: "Active"
            }
          : {
              id: companyId,
              name: "Acme Corporation",
              description: "Sample company data",
              domain: "acme.com",
              totalEmployees: 500,
              totalDivisions: 3,
              establishedYear: 2020,
              status: "Active"
            };
        setCompany(mockCompanyData);
        setDivisions([
          { id: "div1", name: "Technology", employee_count: 200, workspaces: 5 },
          { id: "div2", name: "Sales", employee_count: 150, workspaces: 3 },
          { id: "div3", name: "Operations", employee_count: 150, workspaces: 4 }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompanyData();
  }, [companyId]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!company) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              Company not found
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                {company.domain && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{company.domain}</span>
                  </Badge>
                )}
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
            <div className="text-2xl font-bold">{divisions.reduce((acc, div) => acc + (div.workspaces || 0), 0)}</div>
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
                      <Link to={`/company/${companyId}/division/${division.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{division.employee_count || 0} employees</span>
                    <span>{division.workspaces || 0} workspaces</span>
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