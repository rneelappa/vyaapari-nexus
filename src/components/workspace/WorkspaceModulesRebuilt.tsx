import { MessageSquare, FolderOpen, CheckSquare } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

interface WorkspaceModulesRebuiltProps {
  workspaceId: string;
}

export function WorkspaceModulesRebuilt({ workspaceId }: WorkspaceModulesRebuiltProps) {
  const location = useLocation();

  const modules = [
    {
      name: "Chat",
      path: `/workspace/${workspaceId}/chat`,
      icon: MessageSquare,
      description: "Team communication"
    },
    {
      name: "Drive",
      path: `/workspace/${workspaceId}/drive`,
      icon: FolderOpen,
      description: "File management"
    },
    {
      name: "Tasks",
      path: `/workspace/${workspaceId}/tasks`,
      icon: CheckSquare,
      description: "Task tracking"
    }
  ];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workspace Modules</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {modules.map((module) => {
            const Icon = module.icon;
            const isActive = location.pathname === module.path;
            
            return (
              <SidebarMenuItem key={module.path}>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to={module.path}
                    className={`
                      flex items-center gap-2
                      ${isActive 
                        ? 'bg-accent text-accent-foreground font-medium' 
                        : 'hover:bg-accent/50'
                      }
                      transition-colors duration-200
                    `}
                    title={module.description}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{module.name}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}