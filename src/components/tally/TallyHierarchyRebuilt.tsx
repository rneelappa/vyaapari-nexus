import { useState, useEffect, useCallback } from "react";
import { ChevronRight, ChevronDown, Building2, Folder, FileText, Settings, TrendingUp, Database, Package, Users, Calculator, Warehouse } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { sidebarDataService, type CompanyData } from "@/services/sidebar-data-service";
import { LoadingErrorState } from "@/components/common/LoadingErrorState";

// Tally menu structure with icons
const tallyMenuStructure = {
  masters: {
    name: "Masters",
    icon: Database,
    items: [
      { name: "Groups", path: "/tally/masters/groups", icon: Folder },
      { name: "Ledgers", path: "/tally/masters/ledgers", icon: FileText },
      { name: "Stock Items", path: "/tally/masters/stock-items", icon: Package },
      { name: "Cost Centers", path: "/tally/masters/cost-centers", icon: Calculator },
      { name: "Cost Categories", path: "/tally/masters/cost-categories", icon: TrendingUp },
      { name: "Godowns", path: "/tally/masters/godowns", icon: Warehouse },
      { name: "UOM", path: "/tally/masters/uom", icon: Calculator },
      { name: "Employees", path: "/tally/masters/employees", icon: Users },
      { name: "Payheads", path: "/tally/masters/payheads", icon: Calculator },
      { name: "Voucher Types", path: "/tally/masters/voucher-types", icon: FileText }
    ]
  },
  transactions: {
    name: "Transactions",
    icon: FileText,
    items: [
      { name: "Accounting", path: "/tally/transactions/accounting", icon: Calculator },
      { name: "Inventory", path: "/tally/transactions/inventory", icon: Package },
      { name: "Non-Accounting", path: "/tally/transactions/non-accounting", icon: FileText }
    ]
  },
  display: {
    name: "Display",
    icon: TrendingUp,
    items: [
      { name: "Statistics", path: "/tally/display/statistics", icon: TrendingUp },
      { name: "Day Book", path: "/tally/display/day-book", icon: FileText },
      { name: "Reports", path: "/tally/display/reports", icon: FileText },
      { name: "Financial Statements", path: "/tally/display/financial-statements", icon: TrendingUp }
    ]
  },
  utilities: {
    name: "Utilities",
    icon: Settings,
    items: [
      { name: "Configuration", path: "/tally/utilities/configuration", icon: Settings }
    ]
  }
};

interface Company {
  id: string;
  name: string;
  divisions: Division[];
}

interface Division {
  id: string;
  name: string;
  company_id: string;
  tally_enabled: boolean;
  is_active: boolean;
}

interface CompanyHierarchyItemProps {
  company: Company;
  isExpanded: boolean;
  onToggle: () => void;
}

function CompanyHierarchyItem({ company, isExpanded, onToggle }: CompanyHierarchyItemProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  if (!company.divisions.length) return null;

  return (
    <div>
      <SidebarMenuItem>
        <SidebarMenuButton 
          onClick={onToggle}
          className="flex items-center gap-2 w-full hover:bg-accent/50 transition-colors"
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${company.name}`}
        >
          <Building2 className="h-4 w-4 flex-shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left truncate">{company.name}</span>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      {isExpanded && !collapsed && (
        <div className="ml-2 border-l border-border/50 pl-2">
          {company.divisions.map((division) => (
            <DivisionHierarchyItem key={division.id} division={division} />
          ))}
        </div>
      )}
    </div>
  );
}

interface DivisionHierarchyItemProps {
  division: Division;
}

function DivisionHierarchyItem({ division }: DivisionHierarchyItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  // Auto-expand if current route is within Tally
  useEffect(() => {
    if (location.pathname.startsWith('/tally/')) {
      setIsExpanded(true);
    }
  }, [location.pathname]);

  return (
    <div>
      <SidebarMenuItem>
        <SidebarMenuButton 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 w-full hover:bg-accent/50 transition-colors"
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${division.name} Tally workspace`}
        >
          <Building2 className="h-4 w-4 flex-shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left truncate">{division.name}</span>
              <div className="flex items-center gap-1">
                <div 
                  className="w-2 h-2 rounded-full bg-green-500" 
                  title="Tally Enabled"
                  aria-label="Tally Enabled"
                />
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>

      {isExpanded && !collapsed && (
        <div className="ml-2 space-y-1">
          {/* Blue gradient Tally workspace block - PRESERVED STYLING */}
          <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-200/20 rounded-md p-2 space-y-1">
            {Object.entries(tallyMenuStructure).map(([key, section]) => (
              <TallyMenuSection 
                key={key} 
                section={section} 
                level={2}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface TallyMenuSectionProps {
  section: {
    name: string;
    icon: any;
    items: Array<{
      name: string;
      path: string;
      icon: any;
    }>;
  };
  level: number;
}

function TallyMenuSection({ section, level }: TallyMenuSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  // Auto-expand if current route is within this section
  useEffect(() => {
    const isInSection = section.items.some(item => 
      location.pathname.startsWith(item.path)
    );
    if (isInSection) {
      setIsExpanded(true);
    }
  }, [location.pathname, section.items]);

  const SectionIcon = section.icon;

  return (
    <div>
      <SidebarMenuItem>
        <SidebarMenuButton 
          onClick={() => setIsExpanded(!isExpanded)}
          className={`
            flex items-center gap-2 w-full text-blue-700 hover:bg-blue-50/50 transition-colors
            ${level > 0 ? `ml-${level}` : ''}
          `}
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${section.name} section`}
        >
          <SectionIcon className="h-4 w-4 flex-shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left font-medium">{section.name}</span>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>

      {isExpanded && !collapsed && (
        <div className="ml-4 space-y-1">
          {section.items.map((item) => {
            const ItemIcon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to={item.path}
                    className={`
                      flex items-center gap-2 text-sm
                      ${isActive 
                        ? 'bg-blue-100 text-blue-900 font-medium' 
                        : 'text-blue-600 hover:bg-blue-50/50'
                      }
                      transition-colors
                    `}
                  >
                    <ItemIcon className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function TallyHierarchyRebuilt() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());

  const fetchTallyData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const tallyData = await sidebarDataService.fetchTallyHierarchy();
      setCompanies(tallyData);
    } catch (err) {
      console.error('Error fetching Tally hierarchy:', err);
      setError(err instanceof Error ? err.message : 'Failed to load Tally data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTallyData();
  }, [fetchTallyData]);

  const toggleCompany = useCallback((companyId: string) => {
    setExpandedCompanies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(companyId)) {
        newSet.delete(companyId);
      } else {
        newSet.add(companyId);
      }
      return newSet;
    });
  }, []);

  const retry = useCallback(() => {
    sidebarDataService.clearCache();
    fetchTallyData();
  }, [fetchTallyData]);

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-blue-700 font-semibold">
        Tally Workspace
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <LoadingErrorState 
          loading={loading} 
          error={error} 
          onRetry={retry}
        >
          <SidebarMenu>
            {companies.length === 0 ? (
              <div className="text-sm text-muted-foreground p-2 text-center">
                No Tally-enabled divisions found
              </div>
            ) : (
              companies.map((company) => (
                <CompanyHierarchyItem
                  key={company.id}
                  company={company}
                  isExpanded={expandedCompanies.has(company.id)}
                  onToggle={() => toggleCompany(company.id)}
                />
              ))
            )}
          </SidebarMenu>
        </LoadingErrorState>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}