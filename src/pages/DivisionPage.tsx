import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Building2, Users, Target, TrendingUp, Settings, MessageSquare, FolderOpen, CheckSquare } from "lucide-react";
import ManageDivisionDialog from "@/components/division/ManageDivisionDialog";
import { supabase } from "@/integrations/supabase/client";

const DivisionPage = () => {
  const { companyId, divisionId } = useParams();
  const [manageDivisionOpen, setManageDivisionOpen] = useState(false);
  const [divisionData, setDivisionData] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [division, setDivision] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch company data
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', companyId)
          .single();

        if (companyError) {
          console.error('Error fetching company:', companyError);
          return;
        }

        // Fetch division data
        const { data: divisionData, error: divisionError } = await supabase
          .from('divisions')
          .select('*')
          .eq('id', divisionId)
          .eq('company_id', companyId)
          .single();

        if (divisionError) {
          console.error('Error fetching division:', divisionError);
          return;
        }

        setCompany(companyData);
        setDivision(divisionData);
        setDivisionData(divisionData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (companyId && divisionId) {
      fetchData();
    }
  }, [companyId, divisionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading division...</p>
        </div>
      </div>
    );
  }

  if (!company || !division) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">Division not found</h2>
          <p className="text-muted-foreground mt-2">The requested division could not be found.</p>
        </div>
      </div>
    );
  }

  // Use current division data or fall back to fetched data
  const currentDivision = divisionData || division;

  const handleDivisionUpdate = (updatedDivision: any) => {
    setDivisionData(updatedDivision);
  };

  const workspaces = [
    { 
      id: "ws1", 
      name: "Frontend Development", 
      members: 12,
      role: "Team Lead",
      modules: {
        chat: { active: true, unread: 5 },
        drive: { active: true, files: 127 },
        tasks: { active: true, pending: 8 }
      }
    },
    { 
      id: "ws2", 
      name: "Backend Engineering", 
      members: 15,
      role: "Senior Developer",
      modules: {
        chat: { active: true, unread: 2 },
        drive: { active: true, files: 89 },
        tasks: { active: true, pending: 12 }
      }
    },
    { 
      id: "ws3", 
      name: "DevOps & Infrastructure", 
      members: 8,
      role: "Team Member",
      modules: {
        chat: { active: true, unread: 0 },
        drive: { active: true, files: 67 },
        tasks: { active: true, pending: 3 }
      }
    },
    { 
      id: "ws4", 
      name: "Quality Assurance", 
      members: 10,
      role: "QA Lead",
      modules: {
        chat: { active: true, unread: 1 },
        drive: { active: true, files: 98 },
        tasks: { active: true, pending: 15 }
      }
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/company/${companyId}`}>{company.name}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{currentDivision.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Division Header */}
      <div className="gradient-subtle rounded-lg p-6 border">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-accent rounded-lg flex items-center justify-center">
              <Building2 className="h-8 w-8 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{currentDivision.name}</h1>
              <p className="text-muted-foreground mt-1">{currentDivision.description}</p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>Manager: {currentDivision.manager_name || currentDivision.manager}</span>
                </Badge>
                <Badge className="bg-accent text-accent-foreground">{currentDivision.status}</Badge>
              </div>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setManageDivisionOpen(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Manage Division
          </Button>
        </div>
      </div>

      {/* Division Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentDivision.employee_count || currentDivision.employees}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Allocated</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(currentDivision.budget / 10000000).toFixed(1)} Cr</div>
            <p className="text-xs text-muted-foreground">Current fiscal year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(currentDivision.performance_score * 10).toFixed(1) || currentDivision.performance}%</div>
            <p className="text-xs text-muted-foreground">Above target</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workspaces</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workspaces.length}</div>
            <p className="text-xs text-muted-foreground">Active teams</p>
          </CardContent>
        </Card>
      </div>

      {/* Workspaces Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Division Workspaces</CardTitle>
          <CardDescription>Manage teams and access workspace modules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {workspaces.map((workspace) => (
              <Card key={workspace.id} className="border hover:shadow-medium transition-smooth">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{workspace.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {workspace.members} members
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {workspace.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  {/* Module Access Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center space-x-2"
                      asChild
                    >
                      <Link to={`/workspace/${workspace.id}/chat`}>
                        <MessageSquare className="h-4 w-4" />
                        <span className="hidden sm:inline">Chat</span>
                        {workspace.modules.chat.unread > 0 && (
                          <Badge variant="destructive" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                            {workspace.modules.chat.unread}
                          </Badge>
                        )}
                      </Link>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center space-x-2"
                      asChild
                    >
                      <Link to={`/workspace/${workspace.id}/drive`}>
                        <FolderOpen className="h-4 w-4" />
                        <span className="hidden sm:inline">Drive</span>
                        <span className="text-xs text-muted-foreground ml-1">
                          {workspace.modules.drive.files}
                        </span>
                      </Link>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center space-x-2"
                      asChild
                    >
                      <Link to={`/workspace/${workspace.id}/tasks`}>
                        <CheckSquare className="h-4 w-4" />
                        <span className="hidden sm:inline">Tasks</span>
                        {workspace.modules.tasks.pending > 0 && (
                          <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs bg-warning text-warning-foreground">
                            {workspace.modules.tasks.pending}
                          </Badge>
                        )}
                      </Link>
                    </Button>
                  </div>
                  
                  {/* Workspace Overview Link */}
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link to={`/workspace/${workspace.id}`}>
                      View Workspace Overview
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Manage Division Dialog */}
      <ManageDivisionDialog
        open={manageDivisionOpen}
        onOpenChange={setManageDivisionOpen}
        division={currentDivision}
        onDivisionUpdate={handleDivisionUpdate}
      />
    </div>
  );
};

export default DivisionPage;