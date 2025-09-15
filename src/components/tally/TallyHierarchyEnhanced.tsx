import { useState, useEffect, useCallback } from "react";
import { ChevronRight, ChevronDown, Building2, Folder, FileText, Settings, TrendingUp, Database, Package, Users, Calculator, Warehouse, RefreshCw, Network, BarChart3 } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingErrorState } from "@/components/common/LoadingErrorState";
import { useAuth } from "@/hooks/useAuth";
import { tallyApi, type ApiResponse, type HierarchyData } from "@/services/tallyApiService";

// Enhanced Tally menu structure with API integration
const tallyMenuStructure = {
  masters: {
    name: "Masters",
    icon: Database,
    items: [
      { name: "Groups", path: "/tally/masters/groups", icon: Folder, apiEndpoint: "groups" },
      { name: "Ledgers", path: "/tally/masters/ledgers", icon: FileText, apiEndpoint: "ledgers" },
      { name: "Stock Items", path: "/tally/masters/stock-items", icon: Package, apiEndpoint: "stock-items" },
      { name: "Voucher Types", path: "/tally/masters/voucher-types", icon: FileText, apiEndpoint: "voucher-types" }
    ]
  },
  transactions: {
    name: "Transactions",
    icon: FileText,
    items: [
      { name: "Voucher Management", path: "/tally/transactions/voucher-management", icon: FileText },
      { name: "Enhanced Vouchers", path: "/tally/transactions/enhanced", icon: Network },
      { name: "Monthly Analysis", path: "/tally/analysis/monthly", icon: BarChart3 }
    ]
  },
  reports: {
    name: "Financial Reports",
    icon: TrendingUp,
    items: [
      { name: "Balance Sheet", path: "/tally/reports/balance-sheet", icon: TrendingUp },
      { name: "Profit & Loss", path: "/tally/reports/profit-loss", icon: BarChart3 },
      { name: "Trial Balance", path: "/tally/reports/trial-balance", icon: Calculator }
    ]
  },
  relationships: {
    name: "Relationships",
    icon: Network,
    items: [
      { name: "Entity Explorer", path: "/tally/relationships/explorer", icon: Network },
      { name: "Hierarchy Viewer", path: "/tally/relationships/hierarchy", icon: Folder },
      { name: "Monthly Analysis", path: "/tally/relationships/monthly", icon: BarChart3 }
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
  tally_url?: string | null;
  last_sync_success?: string | null;
  sync_status?: string;
}

interface ApiMetrics {
  totalLedgers: number;
  totalGroups: number;
  totalStockItems: number;
  totalVoucherTypes: number;
  lastSyncDate: string | null;
}

interface TallyHierarchyEnhancedProps {
  companies: Company[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export function TallyHierarchyEnhanced({ 
  companies, 
  isLoading, 
  error, 
  onRefresh 
}: TallyHierarchyEnhancedProps) {
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['masters', 'transactions']));
  const [apiMetrics, setApiMetrics] = useState<ApiMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";

  // Load API metrics for the first active division
  useEffect(() => {
    loadApiMetrics();
  }, [companies]);

  const loadApiMetrics = async () => {
    try {
      setMetricsLoading(true);
      
      // Find first active division
      const activeCompany = companies.find(c => c.divisions.some(d => d.tally_enabled && d.is_active));
      const activeDivision = activeCompany?.divisions.find(d => d.tally_enabled && d.is_active);
      
      if (!activeCompany || !activeDivision) return;

      // Load metrics from API
      const [ledgersResponse, groupsResponse, stockItemsResponse, voucherTypesResponse] = await Promise.all([
        tallyApi.getLedgers(activeCompany.id, activeDivision.id, { limit: 1 }),
        tallyApi.getGroups(activeCompany.id, activeDivision.id, { limit: 1 }),
        tallyApi.getStockItems(activeCompany.id, activeDivision.id, { limit: 1 }),
        tallyApi.getVoucherTypes(activeCompany.id, activeDivision.id, { limit: 1 })
      ]);

      setApiMetrics({
        totalLedgers: ledgersResponse.metadata.pagination?.total || 0,
        totalGroups: groupsResponse.metadata.pagination?.total || 0,
        totalStockItems: stockItemsResponse.metadata.pagination?.total || 0,
        totalVoucherTypes: voucherTypesResponse.metadata.pagination?.total || 0,
        lastSyncDate: activeDivision.last_sync_success
      });

    } catch (error) {
      console.error('Failed to load API metrics:', error);
    } finally {
      setMetricsLoading(false);
    }
  };

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

  const toggleSection = useCallback((sectionKey: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionKey)) {
        newSet.delete(sectionKey);
      } else {
        newSet.add(sectionKey);
      }
      return newSet;
    });
  }, []);

  if (isLoading) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Tally Workspace</SidebarGroupLabel>
        <SidebarGroupContent>
          <LoadingErrorState 
            isLoading={true} 
            error={null} 
            onRetry={() => {}} 
            loadingMessage="Loading Tally workspace..."
          />
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (error || !companies.length) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Tally Workspace</SidebarGroupLabel>
        <SidebarGroupContent>
          <LoadingErrorState 
            isLoading={false} 
            error={error || "No companies available"} 
            onRetry={onRefresh}
            retryLabel="Refresh Companies"
          />
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex items-center justify-between">
        <span>Tally Workspace</span>
        {!collapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </SidebarGroupLabel>
      
      <SidebarGroupContent>
        <SidebarMenu>
          {/* API Metrics Display */}
          {!collapsed && apiMetrics && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <div className="text-xs font-semibold mb-2 flex items-center">
                <Database className="h-3 w-3 mr-1" />
                Live API Metrics
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span>Ledgers:</span>
                  <Badge variant="outline" className="h-4 text-xs">
                    {apiMetrics.totalLedgers}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Groups:</span>
                  <Badge variant="outline" className="h-4 text-xs">
                    {apiMetrics.totalGroups}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Stock Items:</span>
                  <Badge variant="outline" className="h-4 text-xs">
                    {apiMetrics.totalStockItems}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>V.Types:</span>
                  <Badge variant="outline" className="h-4 text-xs">
                    {apiMetrics.totalVoucherTypes}
                  </Badge>
                </div>
              </div>
              {apiMetrics.lastSyncDate && (
                <div className="text-xs text-muted-foreground mt-2">
                  Last sync: {new Date(apiMetrics.lastSyncDate).toLocaleDateString()}
                </div>
              )}
            </div>
          )}

          {/* Companies */}
          {companies.map((company) => (
            <div key={company.id}>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => toggleCompany(company.id)}
                  className="flex items-center gap-2 w-full hover:bg-accent/50 transition-colors"
                  aria-expanded={expandedCompanies.has(company.id)}
                >
                  <Building2 className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left truncate">{company.name}</span>
                      {expandedCompanies.has(company.id) ? (
                        <ChevronDown className="h-4 w-4 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 flex-shrink-0" />
                      )}
                    </>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Divisions and Tally Menu */}
              {expandedCompanies.has(company.id) && !collapsed && (
                <div className="ml-4 space-y-1">
                  {/* Divisions */}
                  {company.divisions.map((division) => (
                    <div key={division.id} className="space-y-1">
                      <div className="flex items-center gap-2 py-1 px-2 text-sm">
                        <div className={`w-2 h-2 rounded-full ${division.tally_enabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className="flex-1 truncate">{division.name}</span>
                        {division.tally_enabled && (
                          <Badge variant="outline" className="text-xs">
                            Tally
                          </Badge>
                        )}
                      </div>

                      {/* Tally Menu for this division */}
                      {division.tally_enabled && (
                        <div className="ml-4 space-y-1">
                          {Object.entries(tallyMenuStructure).map(([sectionKey, section]) => (
                            <div key={sectionKey}>
                              <SidebarMenuItem>
                                <SidebarMenuButton
                                  onClick={() => toggleSection(sectionKey)}
                                  className="flex items-center gap-2 w-full text-sm hover:bg-accent/30"
                                  aria-expanded={expandedSections.has(sectionKey)}
                                >
                                  <section.icon className="h-4 w-4 flex-shrink-0" />
                                  <span className="flex-1 text-left">{section.name}</span>
                                  {expandedSections.has(sectionKey) ? (
                                    <ChevronDown className="h-3 w-3" />
                                  ) : (
                                    <ChevronRight className="h-3 w-3" />
                                  )}
                                </SidebarMenuButton>
                              </SidebarMenuItem>

                              {/* Section Items */}
                              {expandedSections.has(sectionKey) && (
                                <div className="ml-4 space-y-1">
                                  {section.items.map((item) => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                      <SidebarMenuItem key={item.path}>
                                        <SidebarMenuButton
                                          asChild
                                          className={`text-sm hover:bg-accent/20 ${isActive ? 'bg-accent text-accent-foreground' : ''}`}
                                        >
                                          <NavLink 
                                            to={item.path}
                                            className="flex items-center gap-2 w-full"
                                          >
                                            <item.icon className="h-3 w-3 flex-shrink-0" />
                                            <span className="flex-1">{item.name}</span>
                                            {/* Show API metrics for master data */}
                                            {sectionKey === 'masters' && apiMetrics && (
                                              <Badge variant="outline" className="text-xs h-4">
                                                {item.apiEndpoint === 'ledgers' && apiMetrics.totalLedgers}
                                                {item.apiEndpoint === 'groups' && apiMetrics.totalGroups}
                                                {item.apiEndpoint === 'stock-items' && apiMetrics.totalStockItems}
                                                {item.apiEndpoint === 'voucher-types' && apiMetrics.totalVoucherTypes}
                                              </Badge>
                                            )}
                                          </NavLink>
                                        </SidebarMenuButton>
                                      </SidebarMenuItem>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export default TallyHierarchyEnhanced;
