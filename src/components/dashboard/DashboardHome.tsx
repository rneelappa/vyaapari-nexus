import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Briefcase, Plus, Crown, Shield, UserCheck, Settings, TrendingUp, MessageCircle, FileText } from "lucide-react";

const mockStats = {
  totalCompanies: 3,
  totalUsers: 157,
  activeWorkspaces: 12,
  recentActivity: 48
};

const mockCompanies = [
  {
    id: "comp1",
    name: "Acme Corporation",
    role: "Company Admin",
    divisions: 3,
    workspaces: 8,
    members: 45,
    status: "active"
  },
  {
    id: "comp2", 
    name: "TechStart Inc",
    role: "User",
    divisions: 2,
    workspaces: 4,
    members: 23,
    status: "active"
  },
  {
    id: "comp3",
    name: "Global Solutions Ltd",
    role: "Division Admin",
    divisions: 5,
    workspaces: 12,
    members: 89,
    status: "active"
  }
];

const roleIcons = {
  "Super Admin": Crown,
  "Company Admin": Shield,
  "Division Admin": UserCheck,
  "Workspace Admin": Settings,
  "User": Users,
};

const recentActivities = [
  {
    id: 1,
    type: "message",
    content: "New message in Engineering Workspace",
    time: "2 minutes ago",
    icon: MessageCircle
  },
  {
    id: 2,
    type: "file",
    content: "Document uploaded to Product Drive",
    time: "15 minutes ago", 
    icon: FileText
  },
  {
    id: 3,
    type: "user",
    content: "Sarah Johnson joined Marketing Division",
    time: "1 hour ago",
    icon: Users
  },
  {
    id: 4,
    type: "workspace",
    content: "New workspace 'AI Research' created",
    time: "3 hours ago",
    icon: Briefcase
  }
];

export function DashboardHome() {
  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="gradient-hero rounded-lg p-6 text-white shadow-medium">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome to Vyaapari360ERP</h1>
            <p className="text-white/90 text-lg">Manage your organization hierarchy and collaborate efficiently</p>
          </div>
          <div className="flex items-center gap-2">
            <Crown size={20} className="text-accent" />
            <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Super Admin</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{mockStats.totalCompanies}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{mockStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +23% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workspaces</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{mockStats.activeWorkspaces}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{mockStats.recentActivity}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              Last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Companies Overview */}
        <div className="lg:col-span-2">
          <Card className="shadow-soft">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Your Companies</CardTitle>
                  <CardDescription>Organizations you have access to</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus size={16} />
                  New Company
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockCompanies.map((company) => {
                const RoleIcon = roleIcons[company.role as keyof typeof roleIcons] || Users;
                return (
                  <div key={company.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-smooth cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 size={20} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{company.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <RoleIcon size={12} className="text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{company.role}</span>
                          <Badge variant="secondary" className="text-xs">
                            {company.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{company.members} members</div>
                      <div className="text-xs text-muted-foreground">
                        {company.divisions} divisions • {company.workspaces} workspaces
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-xl">Recent Activity</CardTitle>
            <CardDescription>Latest updates across your organization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity) => {
              const ActivityIcon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-smooth">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <ActivityIcon size={14} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{activity.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}