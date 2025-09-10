import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Building2, Users, MessageCircle, FolderOpen, CheckSquare, Settings, Crown, Shield, UserCheck, Building, LogOut } from "lucide-react";
import { NavLink, useLocation, Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import TallyHierarchy from "@/components/tally/TallyHierarchy";
import { UserProfile } from "./UserProfile";
import { supabase } from "@/integrations/supabase/client";

interface CompanyData {
  id: string;
  name: string;
  description?: string;
  role: string;
  divisions: DivisionData[];
}

interface DivisionData {
  id: string;
  name: string;
  description?: string;
  role: string;
  company_id: string;
  tally_enabled: boolean;
  workspaces: WorkspaceData[];
}

interface WorkspaceData {
  id: string;
  name: string;
  description?: string;
  role: string;
  is_default: boolean;
}

const roleIcons = {
  "Super Admin": Crown,
  "Company Admin": Shield,
  "Division Admin": UserCheck,
  "Tally Admin": Settings,
  "Workspace Admin": Settings,
  "User": Users,
};

interface HierarchyItemProps {
  item: any;
  type: "company" | "division" | "workspace";
  level: number;
  isExpanded?: boolean;
  onToggle?: () => void;
}

const HierarchyItem = ({ item, type, level, isExpanded, onToggle }: HierarchyItemProps) => {
  const location = useLocation();
  const hasChildren = (type === "company" && item.divisions?.length) || (type === "division" && item.workspaces?.length);
  const RoleIcon = roleIcons[item.role as keyof typeof roleIcons] || Users;

  const getIcon = () => {
    switch (type) {
      case "company": return Building;
      case "division": return Building2;
      case "workspace": return Users;
      default: return Users;
    }
  };

  const Icon = getIcon();
  const indent = level * 12;

  const getNavigationPath = () => {
    if (type === "company") return `/company/${item.id}`;
    if (type === "division") {
      return `/company/${item.company_id}/division/${item.id}`;
    }
    if (type === "workspace") return `/workspace/${item.id}`;
    return "#";
  };

  return (
    <div className="list-none">
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <div
            className={`flex items-center w-full rounded-lg transition-smooth
              ${location.pathname.includes(item.id) ? 'bg-accent text-accent-foreground shadow-soft' : 'hover:bg-muted/50'}
            `}
            style={{ paddingLeft: `${12 + indent}px` }}
          >
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggle?.();
                }}
                className="mr-1 p-1 rounded hover:bg-accent/20 transition-smooth"
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            )}
            <Link
              to={getNavigationPath()}
              className="flex items-center flex-1 p-2 rounded-lg transition-smooth"
            >
              <Icon size={16} className="mr-2 flex-shrink-0" />
              <span className="flex-1 truncate text-sm font-medium">{item.name}</span>
              <div className="flex items-center gap-1 ml-2">
                <RoleIcon size={12} className="text-muted-foreground" />
                {item.tally_enabled && (
                  <Badge variant="outline" className="text-xs py-0 px-1 bg-green-50 text-green-700 border-green-200">
                    Tally
                  </Badge>
                )}
                {(item.role === "Company Admin" || item.role === "Division Admin" || item.role === "Workspace Admin" || item.role === "Tally Admin") ? (
                  <Badge variant="secondary" className="text-xs py-0 px-1">Admin</Badge>
                ) : null}
              </div>
            </Link>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {hasChildren && isExpanded && (
        <div className="mt-1">
          {type === "company" && item.divisions?.map((division: any) => (
            <HierarchyItemContainer key={division.id} item={division} type="division" level={level + 1} />
          ))}
          {type === "division" && item.workspaces?.map((workspace: any) => (
            <HierarchyItem key={workspace.id} item={workspace} type="workspace" level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const HierarchyItemContainer = ({ item, type, level }: { item: any; type: "company" | "division"; level: number }) => {
  const [isExpanded, setIsExpanded] = useState(level === 0); // Companies expanded by default
  
  return (
    <HierarchyItem
      item={item}
      type={type}
      level={level}
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
    />
  );
};

const WorkspaceModules = ({ workspaceId }: { workspaceId?: string }) => {
  const location = useLocation();
  const modules = [
    { name: "Chat", icon: MessageCircle, path: `/workspace/${workspaceId}/chat` },
    { name: "Drive", icon: FolderOpen, path: `/workspace/${workspaceId}/drive` },
    { name: "Tasks", icon: CheckSquare, path: `/workspace/${workspaceId}/tasks` },
  ];

  if (!workspaceId) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground px-3">
        Workspace Modules
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {modules.map((module) => (
            <SidebarMenuItem key={module.name}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={module.path}
                  className={({ isActive }) =>
                    `flex items-center p-2 rounded-lg transition-smooth ml-6 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-soft"
                        : "hover:bg-muted/50"
                    }`
                  }
                >
                  <module.icon size={16} className="mr-2" />
                  <span className="text-sm font-medium">{module.name}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === "collapsed";
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // Extract workspace ID from URL for module navigation
  const workspaceMatch = location.pathname.match(/\/workspace\/([^\/]+)/);
  const currentWorkspaceId = workspaceMatch ? workspaceMatch[1] : null;

  useEffect(() => {
    const fetchOrganizationData = async () => {
      console.log('AppSidebar: Starting to fetch organization data, user:', user?.id);
      
      if (!user) {
        console.log('AppSidebar: No user found, setting loading to false');
        setLoading(false);
        return;
      }
      
      try {
        console.log('AppSidebar: Fetching organization data...');
        setLoading(true);
        
        // Fetch companies
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('*')
          .eq('is_active', true);

        if (companiesError) {
          console.error('AppSidebar: Error fetching companies:', companiesError);
          setLoading(false);
          return;
        }

        console.log('AppSidebar: Companies fetched:', companiesData?.length || 0, 'companies');

        // Fetch divisions
        const { data: divisionsData, error: divisionsError } = await supabase
          .from('divisions')
          .select('*')
          .eq('is_active', true);

        if (divisionsError) {
          console.error('AppSidebar: Error fetching divisions:', divisionsError);
          setLoading(false);
          return;
        }

        console.log('AppSidebar: Divisions fetched:', divisionsData?.length || 0, 'divisions');

        // Fetch workspaces
        const { data: workspacesData, error: workspacesError } = await supabase
          .from('workspaces')
          .select('*');

        if (workspacesError) {
          console.error('AppSidebar: Error fetching workspaces:', workspacesError);
          setLoading(false);
          return;
        }

        console.log('AppSidebar: Workspaces fetched:', workspacesData?.length || 0, 'workspaces');

        // Structure the data
        const structuredCompanies: CompanyData[] = (companiesData || []).map(company => {
          const companyDivisions = (divisionsData || [])
            .filter(division => division.company_id === company.id)
            .map(division => ({
              id: division.id,
              name: division.name,
              description: division.description,
              role: division.tally_enabled ? "Tally Admin" : "Division Admin",
              company_id: company.id,
              tally_enabled: division.tally_enabled || false,
              workspaces: (workspacesData || [])
                .filter(workspace => workspace.division_id === division.id)
                .map(workspace => ({
                  id: workspace.id,
                  name: workspace.name,
                  description: workspace.description,
                  role: "Workspace Admin",
                  is_default: workspace.is_default || false
                }))
            }));
          
          return {
            id: company.id,
            name: company.name,
            description: company.description,
            role: "Super Admin", // For now, all roles are Super Admin since user is super admin
            divisions: companyDivisions
          };
        });

        console.log('AppSidebar: Structured companies:', structuredCompanies.length, 'companies with hierarchy');
        console.log('AppSidebar: Full structured data:', JSON.stringify(structuredCompanies, null, 2));
        setCompanies(structuredCompanies);
        setLoading(false);
      } catch (error) {
        console.error('AppSidebar: Error fetching organization data:', error);
        setLoading(false);
      }
    };

    fetchOrganizationData();
  }, [user]);

  if (isCollapsed) {
    return (
      <div className="w-16 border-r border-border bg-sidebar flex-shrink-0">
        <div className="p-2 h-full">
          <div className="flex flex-col items-center gap-2">
            <Building2 size={24} className="text-primary" />
            <div className="w-8 h-px bg-border" />
            {companies.map((company) => (
              <div key={company.id} className="p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                <Building2 size={16} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-r border-border bg-sidebar flex-shrink-0 h-full">
      <div className="gradient-subtle h-full flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Building2 size={16} className="text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Vyaapari360ERP</h2>
              <p className="text-xs text-muted-foreground">Enterprise Platform</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-2 overflow-y-auto">
          <div className="mb-4">
            <div className="text-xs font-semibold text-muted-foreground px-3 mb-2">
              Organization Hierarchy
            </div>
            {loading ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">Loading organization data...</div>
            ) : companies.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No organizations found
                {user ? '' : ' (Please log in)'}
              </div>
            ) : (
              <SidebarMenu className="list-none">
                {companies.map((company) => {
                  console.log('AppSidebar: Rendering company:', company.name, 'with', company.divisions.length, 'divisions');
                  return (
                    <HierarchyItemContainer key={company.id} item={company} type="company" level={0} />
                  );
                })}
              </SidebarMenu>
            )}
          </div>

          <WorkspaceModules workspaceId={currentWorkspaceId} />

          {/* Divider */}
          <div className="my-4 px-3">
            <div className="h-px bg-border"></div>
          </div>

          <TallyHierarchy />
        </div>

        <UserProfile />
      </div>
    </div>
  );
}