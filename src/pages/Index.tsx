import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Building2, Plus, Users, TrendingUp, Database, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Company {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  _count: {
    divisions: number;
  };
}

export default function Index() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        console.log('Index: Starting to fetch companies...');
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('*')
          .eq('archived', false);

        console.log('Index: Companies query result:', { companiesData, companiesError });

        if (companiesError) {
          console.error('Error fetching companies:', companiesError);
          return;
        }

        console.log('Index: Starting to fetch divisions...');
        const { data: divisionsData, error: divisionsError } = await supabase
          .from('divisions')
          .select('company_id');

        console.log('Index: Divisions query result:', { divisionsData, divisionsError });

        if (divisionsError) {
          console.error('Error fetching divisions:', divisionsError);
          return;
        }

        const companiesWithCounts = companiesData.map(company => ({
          ...company,
          _count: {
            divisions: divisionsData.filter(division => division.company_id === company.id).length
          }
        }));

        console.log('Index: Final companies with counts:', companiesWithCounts);
        setCompanies(companiesWithCounts);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome to Vyaapari360ERP
            </h1>
            <p className="text-muted-foreground">
              Manage your organizations, divisions, and Tally workspaces efficiently.
            </p>
          </div>
          <Button className="mt-4 lg:mt-0">
            <Plus size={16} className="mr-2" />
            Create New Company
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companies.length}</div>
            </CardContent>
          </Card>
          
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Divisions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {companies.reduce((sum, company) => sum + company._count.divisions, 0)}
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active User</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user?.email?.split('@')[0] || 'User'}</div>
            </CardContent>
          </Card>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Card key={company.id} className="shadow-soft hover:shadow-medium transition-smooth group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                    <CardDescription className="mt-2">
                      {company.description || "No description available"}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {company._count.divisions} divisions
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Database size={14} className="mr-1" />
                    Created {new Date(company.created_at).toLocaleDateString()}
                  </div>
                  <Link to={`/company/${company.id}`}>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-smooth"
                    >
                      View <ArrowRight size={14} className="ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {companies.length === 0 && (
          <div className="text-center py-12">
            <Building2 size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No companies found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first company.
            </p>
            <Button>
              <Plus size={16} className="mr-2" />
              Create Company
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}