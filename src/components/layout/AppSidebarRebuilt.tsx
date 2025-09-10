import { useState, useEffect, useCallback } from "react";
import { Building, Building2, Users, ChevronRight, ChevronDown, AlertTriangle } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { UserProfile } from "./UserProfile";
import { TallyHierarchyRebuilt } from "@/components/tally/TallyHierarchyRebuilt";
import { WorkspaceModulesRebuilt } from "@/components/workspace/WorkspaceModulesRebuilt";
import { ErrorBoundary } from "@/components/auth/ErrorBoundary";
import { LoadingErrorState } from "@/components/common/LoadingErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import { sidebarDataService, type CompanyData, type DivisionData, type WorkspaceData } from "@/services/sidebar-data-service";

// Role icons mapping
const roleIcons = {
  admin: Users,
  manager: Building2,
  workspace_member: Building,
  viewer: Building
};

interface HierarchyItemProps {
  item: CompanyData | DivisionData | WorkspaceData;
  level: number;
  type: 'company' | 'division' | 'workspace';
  isExpanded: boolean;
  onToggle: () => void;
  hasChildren: boolean;
  children?: React.ReactNode;
}

function HierarchyItem({ item, level, type, isExpanded, onToggle, hasChildren, children }: HierarchyItemProps) {
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  
  const getIcon = () => {
    switch (type) {
      case 'company': return Building2;
      case 'division': return Building;
      case 'workspace': return Users;
      default: return Building;
    }
  };

  const Icon = getIcon();
  const baseUrl = type === 'workspace' ? `/workspace/${item.id}` : 
                  type === 'division' ? `/division/${item.id}` : 
                  `/company/${item.id}`;
  
  const isActive = location.pathname.startsWith(baseUrl);
  const shouldShowTallyIndicator = type === 'division' && 'tally_enabled' in item && item.tally_enabled;

  return (
    <div>
      <SidebarMenuItem>
        <SidebarMenuButton 
          asChild={!hasChildren}
          className={`
            ${isActive ? 'bg-accent text-accent-foreground font-medium' : 'hover:bg-accent/50'}
            ${level > 0 ? `ml-${level * 4}` : ''}
            transition-colors duration-200
          `}
        >
          {hasChildren ? (
            <button
              onClick={onToggle}
              className="flex items-center gap-2 w-full"
              aria-expanded={isExpanded}
              aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${item.name}`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left truncate">{item.name}</span>
                  <div className="flex items-center gap-1">
                    {shouldShowTallyIndicator && (
                      <div 
                        className="w-2 h-2 rounded-full bg-green-500" 
                        title="Tally Enabled"
                        aria-label="Tally Enabled"
                      />
                    )}
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                </>
              )}
            </button>
          ) : (
            <NavLink to={baseUrl} className="flex items-center gap-2">
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.name}</span>
                  {shouldShowTallyIndicator && (
                    <div 
                      className="w-2 h-2 rounded-full bg-green-500" 
                      title="Tally Enabled"
                      aria-label="Tally Enabled"
                    />
                  )}
                </>
              )}
            </NavLink>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      {hasChildren && isExpanded && !collapsed && (
        <div className="ml-2 border-l border-border/50 pl-2">
          {children}
        </div>
      )}
    </div>
  );
}

interface HierarchyItemContainerProps {
  item: CompanyData | DivisionData | WorkspaceData;
  level: number;
  type: 'company' | 'division' | 'workspace';
  children?: React.ReactNode;
}

function HierarchyItemContainer({ item, level, type, children }: HierarchyItemContainerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  
  const hasChildren = (type === 'company' && 'divisions' in item && item.divisions.length > 0) ||
                     (type === 'division' && 'workspaces' in item && item.workspaces.length > 0);

  // Auto-expand if current route is within this item's hierarchy
  useEffect(() => {
    const baseUrl = type === 'workspace' ? `/workspace/${item.id}` : 
                    type === 'division' ? `/division/${item.id}` : 
                    `/company/${item.id}`;
    
    if (location.pathname.startsWith(baseUrl) && hasChildren) {
      setIsExpanded(true);
    }
  }, [location.pathname, item.id, type, hasChildren]);

  return (
    <HierarchyItem
      item={item}
      level={level}
      type={type}
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
      hasChildren={hasChildren}
    >
      {children}
    </HierarchyItem>
  );
}

function SidebarSkeleton() {
  return (
    <div className="space-y-2 p-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-1">
          <Skeleton className="h-8 w-full" />
          <div className="ml-4 space-y-1">
            <Skeleton className="h-6 w-5/6" />
            <Skeleton className="h-6 w-4/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface AppSidebarContentProps {}

function AppSidebarContent({}: AppSidebarContentProps) {
  const { user } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      
      const organizationData = await sidebarDataService.fetchOrganizationData(user.id);
      setCompanies(organizationData);
    } catch (err) {
      console.error('Error fetching sidebar data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load sidebar data');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Clear cache on unmount
  useEffect(() => {
    return () => {
      // Cleanup is simpler now
    };
  }, []);

  const retry = useCallback(() => {
    sidebarDataService.clearCache();
    fetchData();
  }, [fetchData]);

  // Extract workspace ID from current route
  const currentWorkspaceId = location.pathname.startsWith('/workspace/') 
    ? location.pathname.split('/')[2] 
    : null;

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Organization</SidebarGroupLabel>
          <SidebarGroupContent>
            <LoadingErrorState 
              loading={loading} 
              error={error} 
              onRetry={retry}
            >
              <SidebarMenu>
                {companies.map((company) => (
                  <HierarchyItemContainer
                    key={company.id}
                    item={company}
                    level={0}
                    type="company"
                  >
                    {company.divisions.map((division) => (
                      <HierarchyItemContainer
                        key={division.id}
                        item={division}
                        level={1}
                        type="division"
                      >
                        {division.workspaces.map((workspace) => (
                          <HierarchyItemContainer
                            key={workspace.id}
                            item={workspace}
                            level={2}
                            type="workspace"
                          />
                        ))}
                      </HierarchyItemContainer>
                    ))}
                  </HierarchyItemContainer>
                ))}
              </SidebarMenu>
            </LoadingErrorState>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && currentWorkspaceId && (
          <ErrorBoundary>
            <WorkspaceModulesRebuilt workspaceId={currentWorkspaceId} />
          </ErrorBoundary>
        )}

        {!collapsed && (
          <ErrorBoundary>
            <TallyHierarchyRebuilt />
          </ErrorBoundary>
        )}
      </SidebarContent>
      
      <UserProfile />
    </Sidebar>
  );
}

export function AppSidebar() {
  return (
    <ErrorBoundary fallback={
      <Sidebar>
        <SidebarContent>
          <div className="flex items-center justify-center p-4 text-center">
            <div className="space-y-2">
              <AlertTriangle className="h-8 w-8 text-destructive mx-auto" />
              <p className="text-sm text-muted-foreground">Sidebar unavailable</p>
            </div>
          </div>
        </SidebarContent>
      </Sidebar>
    }>
      <AppSidebarContent />
    </ErrorBoundary>
  );
}