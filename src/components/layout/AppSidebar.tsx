import { useState } from "react";
import { ChevronDown, ChevronRight, Building2, Users, Briefcase, MessageCircle, FolderOpen, CheckSquare, Settings, Crown, Shield, UserCheck } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
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

// Mock data structure
const mockData = {
  companies: [
    {
      id: "comp1",
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
      id: "comp2",
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
      case "company": return Building2;
      case "division": return Briefcase;
      case "workspace": return Users;
      default: return Users;
    }
  };

  const Icon = getIcon();
  const indent = level * 12;

  return (
    <div>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <div
            className={`flex items-center w-full p-2 rounded-lg transition-smooth cursor-pointer
              ${location.pathname.includes(item.id) ? 'bg-accent text-accent-foreground shadow-soft' : 'hover:bg-muted/50'}
            `}
            style={{ paddingLeft: `${12 + indent}px` }}
            onClick={onToggle}
          >
            {hasChildren && (
              <div className="mr-1">
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </div>
            )}
            <Icon size={16} className="mr-2 flex-shrink-0" />
            <span className="flex-1 truncate text-sm font-medium">{item.name}</span>
            <div className="flex items-center gap-1 ml-2">
              <RoleIcon size={12} className="text-muted-foreground" />
              {item.role === "Company Admin" || item.role === "Division Admin" || item.role === "Workspace Admin" ? (
                <Badge variant="secondary" className="text-xs py-0 px-1">Admin</Badge>
              ) : null}
            </div>
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
  
  // Extract workspace ID from URL for module navigation
  const workspaceMatch = location.pathname.match(/\/workspace\/([^\/]+)/);
  const currentWorkspaceId = workspaceMatch ? workspaceMatch[1] : null;

  if (isCollapsed) {
    return (
      <Sidebar className="w-16">
        <SidebarContent className="p-2">
          <div className="flex flex-col items-center gap-2">
            <Building2 size={24} className="text-primary" />
            <div className="w-8 h-px bg-border" />
            {mockData.companies.map((company) => (
              <div key={company.id} className="p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                <Building2 size={16} />
              </div>
            ))}
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar className="w-80">
      <SidebarContent className="gradient-subtle">
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

        <div className="flex-1 p-2">
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground px-3 mb-2">
              Organization Hierarchy
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mockData.companies.map((company) => (
                  <HierarchyItemContainer key={company.id} item={company} type="company" level={0} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <WorkspaceModules workspaceId={currentWorkspaceId} />
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
      </SidebarContent>
    </Sidebar>
  );
}