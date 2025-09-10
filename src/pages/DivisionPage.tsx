import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Building2, Users, Target, TrendingUp, Settings, MessageSquare, FolderOpen, CheckSquare } from "lucide-react";

const DivisionPage = () => {
  const { companyId, divisionId } = useParams();
  
  // Mock division data - in real app this would come from API
  const division = {
    id: divisionId,
    name: "Technology Division",
    description: "Driving innovation through cutting-edge technology solutions",
    manager: "Sarah Johnson",
    employees: 450,
    budget: "₹2.5 Cr",
    performance: 94,
    status: "Active"
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
              <Link to={`/company/${companyId}`}>Company</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{division.name}</BreadcrumbPage>
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
              <h1 className="text-3xl font-bold text-foreground">{division.name}</h1>
              <p className="text-muted-foreground mt-1">{division.description}</p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>Manager: {division.manager}</span>
                </Badge>
                <Badge className="bg-accent text-accent-foreground">{division.status}</Badge>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm">
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
            <div className="text-2xl font-bold">{division.employees}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Allocated</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{division.budget}</div>
            <p className="text-xs text-muted-foreground">Current fiscal year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{division.performance}%</div>
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
    </div>
  );
};

export default DivisionPage;