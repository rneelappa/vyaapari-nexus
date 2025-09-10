import { useState } from "react";
import { ChevronDown, ChevronRight, Building2, Users, Briefcase, MessageCircle, FolderOpen, CheckSquare, Settings, Crown, Shield, UserCheck, Building, Calculator, BookOpen, FileText, BarChart3, Database, Package, Warehouse, Target, FileSignature, TrendingUp, PieChart, FileBarChart, Activity } from "lucide-react";
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

// Mock data structure - updated with real company UUIDs from database
const mockData = {
  companies: [
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Acme Corporation",
      role: "Company Admin",
      divisions: [
        {
          id: "div1",
          name: "Engineering",
          role: "Division Admin",
          workspaces: [
            { id: "ws1", name: "Web Development", role: "Workspace Admin" },
            { id: "ws2", name: "Mobile Apps", role: "User" },
          ]
        },
        {
          id: "div2",
          name: "Marketing",
          role: "User",
          workspaces: [
            { id: "ws3", name: "Digital Campaigns", role: "User" },
          ]
        }
      ]
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      name: "TechStart Inc",
      role: "User",
      divisions: [
        {
          id: "div3",
          name: "Product",
          role: "User",
          workspaces: [
            { id: "ws4", name: "Design System", role: "User" },
          ]
        }
      ]
    }
  ]
};

// Tally workspace structure
const tallyWorkspaces = {
  masters: {
    name: "Masters",
    icon: Database,
    children: [
      { name: "Groups", icon: Users, path: "/tally/masters/groups" },
      { name: "Ledgers", icon: BookOpen, path: "/tally/masters/ledgers" },
      { name: "Stock Items", icon: Package, path: "/tally/masters/stock-items" },
      { name: "Godowns", icon: Warehouse, path: "/tally/masters/godowns" },
      { name: "Cost Centers", icon: Target, path: "/tally/masters/cost-centers" },
      { name: "Voucher Types", icon: FileSignature, path: "/tally/masters/voucher-types" },
    ]
  },
  transactions: {
    name: "Transactions",
    icon: TrendingUp,
    children: [
      { name: "Accounting", icon: Calculator, path: "/tally/transactions/accounting" },
      { name: "Non-Accounting", icon: FileText, path: "/tally/transactions/non-accounting" },
      { name: "Inventory", icon: Package, path: "/tally/transactions/inventory" },
    ]
  },
  display: {
    name: "Display",
    icon: BarChart3,
    children: [
      { name: "DayBook", icon: BookOpen, path: "/tally/display/daybook" },
      { name: "Statistics", icon: PieChart, path: "/tally/display/statistics" },
      { name: "Financial Statements", icon: FileBarChart, path: "/tally/display/financial-statements" },
      { name: "Reports", icon: Activity, path: "/tally/display/reports" },
    ]
  },
  utilities: {
    name: "Utilities",
    icon: Settings,
    children: [
      { name: "Tally Configuration", icon: Settings, path: "/tally/utilities/configuration" },
    ]
  }
};

const roleIcons = {
  "Super Admin": Crown,
  "Company Admin": Shield,
  "Division Admin": UserCheck,
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
      // Find parent company ID for division
      const company = mockData.companies.find(c => c.divisions.some(d => d.id === item.id));
      return company ? `/company/${company.id}/division/${item.id}` : "#";
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
                {item.role === "Company Admin" || item.role === "Division Admin" || item.role === "Workspace Admin" ? (
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

const TallyWorkspaceItem = ({ item, level, isExpanded, onToggle }: {
  item: any;
  level: number;
  isExpanded?: boolean;
  onToggle?: () => void;
}) => {
  const location = useLocation();
  const hasChildren = item.children && item.children.length > 0;
  const indent = level * 12;

  // Check if current item is active - exact path match only
  const isActive = item.path && location.pathname === item.path;
  
  // Check if any child is active (for parent highlighting)
  const hasActiveChild = hasChildren && item.children?.some((child: any) => 
    child.path && location.pathname === child.path
  );

  return (
    <div className="list-none">
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <div
            className={`flex items-center w-full rounded-lg transition-smooth
              ${isActive ? 'bg-primary text-primary-foreground shadow-soft' : 
                hasActiveChild ? 'bg-accent text-accent-foreground' : 'hover:bg-muted/50'}
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
            {item.path ? (
              <Link
                to={item.path}
                className="flex items-center flex-1 p-2 rounded-lg transition-smooth"
              >
                <item.icon size={16} className="mr-2 flex-shrink-0" />
                <span className="flex-1 truncate text-sm font-medium">{item.name}</span>
              </Link>
            ) : (
              <div className="flex items-center flex-1 p-2 rounded-lg transition-smooth">
                <item.icon size={16} className="mr-2 flex-shrink-0" />
                <span className="flex-1 truncate text-sm font-medium">{item.name}</span>
              </div>
            )}
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {hasChildren && isExpanded && (
        <div className="mt-1">
          {item.children?.map((child: any) => (
            <TallyWorkspaceItem key={child.name} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const TallyWorkspaceContainer = ({ item, level }: { item: any; level: number }) => {
  const location = useLocation();
  
  // Check if any child is active to auto-expand
  const hasActiveChild = item.children?.some((child: any) => 
    child.path && location.pathname === child.path
  );
  
  const [isExpanded, setIsExpanded] = useState(hasActiveChild);
  
  // Update expansion state when route changes
  useState(() => {
    if (hasActiveChild && !isExpanded) {
      setIsExpanded(true);
    }
  });
  
  return (
    <TallyWorkspaceItem
      item={item}
      level={level}
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
    />
  );
};

const TallyWorkspaces = () => {
  const workspaceCategories = Object.values(tallyWorkspaces);

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground px-3">
        Tally Workspaces
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="list-none">
          {mockData.companies.map((company) => 
            company.divisions.map((division) => (
              <div key={`${company.id}-${division.id}`} className="mb-2">
                <div className="text-xs font-medium text-muted-foreground px-3 mb-1">
                  {division.name}
                </div>
                {workspaceCategories.map((category) => (
                  <TallyWorkspaceContainer key={category.name} item={category} level={1} />
                ))}
              </div>
            ))
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === "collapsed";
  
  // Extract workspace ID from URL for module navigation
  const workspaceMatch = location.pathname.match(/\/workspace\/([^\/]+)/);
  const currentWorkspaceId = workspaceMatch ? workspaceMatch[1] : null;

  if (isCollapsed) {
    return (
      <div className="w-16 border-r border-border bg-sidebar flex-shrink-0">
        <div className="p-2 h-full">
          <div className="flex flex-col items-center gap-2">
            <Building2 size={24} className="text-primary" />
            <div className="w-8 h-px bg-border" />
            {mockData.companies.map((company) => (
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
            <SidebarMenu className="list-none">
              {mockData.companies.map((company) => (
                <HierarchyItemContainer key={company.id} item={company} type="company" level={0} />
              ))}
            </SidebarMenu>
          </div>

          <WorkspaceModules workspaceId={currentWorkspaceId} />

          {/* Divider */}
          <div className="my-4 px-3">
            <div className="h-px bg-border"></div>
          </div>

          <TallyWorkspaces />
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
              <Users size={16} className="text-accent-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-muted-foreground">Super Admin</p>
            </div>
            <Settings size={16} className="text-muted-foreground cursor-pointer hover:text-foreground transition-fast" />
          </div>
        </div>
      </div>
    </div>
  );
}