import { useState } from "react";
import { useLocation, NavLink } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Building2,
  Users,
  MessageSquare,
  FolderOpen,
  CheckSquare,
  Settings,
  User,
  FileText,
  Monitor,
  Layers,
  Book,
  Package,
  Warehouse,
  Target,
  Receipt,
  Calculator,
  Package2,
  Calendar,
  BarChart3,
  FileBarChart,
  FileSearch,
  Cog,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useTallyWorkspaces } from "@/hooks/useWorkspaces";
import { useWorkspaceModules, WorkspaceModule } from "@/hooks/useWorkspaceModules";
import { useCompanies, useDivisions, useWorkspacesByDivision } from "@/hooks/useHierarchy";

const iconMap = {
  FolderOpen,
  FileText,
  Monitor,
  Settings,
  Layers,
  Book,
  Package,
  Warehouse,
  Target,
  Receipt,
  Calculator,
  Package2,
  Calendar,
  BarChart3,
  FileBarChart,
  FileSearch,
  Cog,
};

// Database-driven hierarchy components
const CompanyItem = ({ company }: { company: any }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: divisions } = useDivisions(company.id);
  const location = useLocation();
  const isActive = location.pathname.includes(`/company/${company.id}`);

  return (
    <div>
      <SidebarMenuItem>
        <SidebarMenuButton asChild size="sm">
          <div
            className={`flex items-center space-x-2 cursor-pointer ${
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span 
              className="h-4 w-4 flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </span>
            <Building2 className="h-4 w-4" />
            <NavLink to={`/company/${company.id}`} className="flex-1">
              {company.name}
            </NavLink>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      {isExpanded && divisions && (
        <div className="ml-6 space-y-1">
          {divisions.map((division) => (
            <DivisionItem
              key={division.id}
              division={division}
              companyId={company.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const DivisionItem = ({ division, companyId }: { division: any; companyId: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: workspaces } = useWorkspacesByDivision(division.id);
  const location = useLocation();
  const isActive = location.pathname.includes(`/division/${division.id}`);

  return (
    <div>
      <SidebarMenuItem>
        <SidebarMenuButton asChild size="sm">
          <div
            className={`flex items-center space-x-2 cursor-pointer ${
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span 
              className="h-4 w-4 flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </span>
            <Users className="h-4 w-4" />
            <NavLink to={`/company/${companyId}/division/${division.id}`} className="flex-1">
              {division.name}
            </NavLink>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      {isExpanded && workspaces && (
        <div className="ml-6 space-y-1">
          {workspaces.map((workspace) => (
            <WorkspaceItem
              key={workspace.id}
              workspace={workspace}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const WorkspaceItem = ({ workspace }: { workspace: any }) => {
  const location = useLocation();
  const isActive = location.pathname.includes(`/workspace/${workspace.id}`);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild size="sm">
        <NavLink
          to={`/workspace/${workspace.id}`}
          className={`flex items-center space-x-2 ${
            isActive
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FolderOpen className="h-4 w-4" />
          <span>{workspace.name}</span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const OrganizationHierarchy = () => {
  const { data: companies, isLoading } = useCompanies();

  if (isLoading) {
    return <div className="p-4 text-sm text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-1">
      {companies?.map((company) => (
        <CompanyItem key={company.id} company={company} />
      ))}
    </div>
  );
};

// Tally Module Tree Component
const TallyModuleTree = ({ module, workspaceId, basePath }: { 
  module: WorkspaceModule; 
  workspaceId: string;
  basePath: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  
  const IconComponent = iconMap[module.icon as keyof typeof iconMap] || FolderOpen;
  const fullPath = `${basePath}${module.path}`;
  const isActive = location.pathname === fullPath;

  const toggleExpanded = () => {
    if (module.is_expandable) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div>
      <SidebarMenuItem>
        <SidebarMenuButton asChild size="sm">
          <div
            className={`flex items-center space-x-2 cursor-pointer ${
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={module.is_expandable ? toggleExpanded : undefined}
          >
            {module.is_expandable && (
              <span className="h-4 w-4 flex items-center justify-center">
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </span>
            )}
            <IconComponent className="h-4 w-4" />
            {module.is_expandable ? (
              <span>{module.name}</span>
            ) : (
              <NavLink to={fullPath} className="flex-1">
                {module.name}
              </NavLink>
            )}
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      {module.is_expandable && isExpanded && module.children && (
        <div className="ml-6 space-y-1">
          {module.children.map((child) => (
            <TallyModuleTree
              key={child.id}
              module={child}
              workspaceId={workspaceId}
              basePath={basePath}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Tally Workspace Component
const TallyWorkspaceSection = () => {
  const { data: tallyWorkspaces, isLoading } = useTallyWorkspaces();
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(new Set());

  const toggleWorkspace = (workspaceId: string) => {
    const newExpanded = new Set(expandedWorkspaces);
    if (newExpanded.has(workspaceId)) {
      newExpanded.delete(workspaceId);
    } else {
      newExpanded.add(workspaceId);
    }
    setExpandedWorkspaces(newExpanded);
  };

  if (isLoading) return <div className="p-4 text-sm text-muted-foreground">Loading Tally workspaces...</div>;

  return (
    <div className="space-y-2">
      {tallyWorkspaces?.map((workspace: any) => (
        <TallyWorkspaceItem
          key={workspace.id}
          workspace={workspace}
          isExpanded={expandedWorkspaces.has(workspace.id)}
          onToggle={() => toggleWorkspace(workspace.id)}
        />
      ))}
    </div>
  );
};

const TallyWorkspaceItem = ({ 
  workspace, 
  isExpanded, 
  onToggle 
}: { 
  workspace: any; 
  isExpanded: boolean; 
  onToggle: () => void; 
}) => {
  const { data: modules } = useWorkspaceModules(workspace.id);
  const basePath = `/workspace/${workspace.id}`;

  return (
    <div>
      <SidebarMenuItem>
        <SidebarMenuButton asChild size="sm">
          <div
            className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50"
            onClick={onToggle}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <Settings className="h-4 w-4" />
            <span>Tally - {workspace.divisions?.name}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      {isExpanded && modules && (
        <div className="ml-6 space-y-1">
          {modules.map((module) => (
            <TallyModuleTree
              key={module.id}
              module={module}
              workspaceId={workspace.id}
              basePath={basePath}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";

  return (
    <Sidebar className={collapsed ? "w-14" : "w-80"}>
      <SidebarHeader className="border-b">
        <div className="flex items-center space-x-2 px-4 py-2">
          <Building2 className="h-6 w-6 text-primary" />
          {!collapsed && (
            <span className="text-lg font-semibold">Vyaapari360</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {!collapsed && (
          <div className="px-2 py-4">
            <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
              ORGANIZATION
            </div>
            <OrganizationHierarchy />
          </div>
        )}

        {/* Tally Workspaces Section */}
        {!collapsed && (
          <div className="mt-6 px-2">
            <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
              TALLY WORKSPACES
            </div>
            <TallyWorkspaceSection />
          </div>
        )}
      </SidebarContent>

      {/* User Profile Section */}
      {!collapsed && (
        <div className="border-t p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Alex Johnson</p>
              <p className="text-xs text-muted-foreground truncate">alex@acme.com</p>
            </div>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Sidebar>
  );
}