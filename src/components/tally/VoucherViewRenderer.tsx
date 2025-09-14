import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  FileText,
  Calculator,
  Receipt,
  Package,
  MapPin,
  Database,
  Clock,
  MoreHorizontal
} from 'lucide-react';
import { EnhancedVoucherDetails } from './EnhancedVoucherDetails';
import { VoucherOverview } from './VoucherOverview';
import { VoucherAccountingEntries } from './VoucherAccountingEntries';
import { VoucherAssociatedLedgers } from './VoucherAssociatedLedgers';
import { VoucherInventoryDetails } from './VoucherInventoryDetails';

interface TabConfig {
  id: string;
  name: string;
  enabled: boolean;
  mandatory: boolean;
  order: number;
  icon: string;
  sections?: string[];
  options?: Record<string, any>;
}

interface ViewConfig {
  tabs: TabConfig[];
  theme?: string;
  layout?: string;
  name?: string;
}

interface VoucherViewRendererProps {
  voucherGuid: string;
  voucherType: string;
  companyId: string;
  divisionId: string;
  onClose?: () => void;
}

const ICON_MAP = {
  FileText,
  Calculator,
  Receipt,
  Package,
  MapPin,
  Database,
  Clock,
  MoreHorizontal
};

export function VoucherViewRenderer({ 
  voucherGuid, 
  voucherType, 
  companyId, 
  divisionId, 
  onClose 
}: VoucherViewRendererProps) {
  const [viewConfig, setViewConfig] = useState<ViewConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [useMasterView, setUseMasterView] = useState(false);
  const [visibleTabs, setVisibleTabs] = useState<TabConfig[]>([]);
  const [overflowTabs, setOverflowTabs] = useState<TabConfig[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const tabsListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchVoucherView();
  }, [voucherType, companyId, divisionId]);

  useEffect(() => {
    if (viewConfig) {
      const enabledTabs = viewConfig.tabs
        .filter(tab => tab.enabled)
        .sort((a, b) => a.order - b.order);
      
      if (enabledTabs.length > 0 && !activeTab) {
        setActiveTab(enabledTabs[0].id);
      }

      handleTabOverflow(enabledTabs);
    }
  }, [viewConfig, activeTab]);

  useEffect(() => {
    const handleResize = () => {
      if (viewConfig) {
        const enabledTabs = viewConfig.tabs
          .filter(tab => tab.enabled)
          .sort((a, b) => a.order - b.order);
        handleTabOverflow(enabledTabs);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewConfig, activeTab]);

  const handleTabOverflow = (enabledTabs: TabConfig[]) => {
    // For mobile/small screens, show max 3 tabs, rest go to overflow
    const maxVisibleTabs = window.innerWidth < 640 ? 2 : window.innerWidth < 768 ? 3 : window.innerWidth < 1024 ? 4 : 6;
    
    if (enabledTabs.length <= maxVisibleTabs) {
      setVisibleTabs(enabledTabs);
      setOverflowTabs([]);
    } else {
      // Always keep the active tab visible
      const activeTabIndex = enabledTabs.findIndex(tab => tab.id === activeTab);
      let visible = enabledTabs.slice(0, maxVisibleTabs - 1);
      
      // If active tab is not in visible range, replace the last visible tab with it
      if (activeTabIndex >= maxVisibleTabs - 1) {
        visible[maxVisibleTabs - 2] = enabledTabs[activeTabIndex];
      }
      
      const overflow = enabledTabs.filter(tab => !visible.find(v => v.id === tab.id));
      
      setVisibleTabs(visible);
      setOverflowTabs(overflow);
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    
    // If tab is in overflow, we need to recalculate visible/overflow
    if (viewConfig) {
      const enabledTabs = viewConfig.tabs
        .filter(tab => tab.enabled)
        .sort((a, b) => a.order - b.order);
      handleTabOverflow(enabledTabs);
    }
  };

  const fetchVoucherView = async () => {
    setLoading(true);
    try {
      // First, try to find a specific view for this voucher type - simplified without relations
      const { data: typeViewData, error: typeViewError } = await supabase
        .from('voucher_type_views' as any)
        .select('*')
        .eq('voucher_type_name', voucherType)
        .or(`and(company_id.eq.${companyId},division_id.eq.${divisionId}),and(company_id.is.null,division_id.is.null)`)
        .maybeSingle();

      if (typeViewError) {
        console.warn('Error fetching voucher type view:', typeViewError);
      }

      let selectedView = null;

      // If we found a type association, fetch the actual view
      if (typeViewData && (typeViewData as any).voucher_view_id) {
        const { data: viewData, error: viewError } = await supabase
          .from('voucher_views' as any)
          .select('*')
          .eq('id', (typeViewData as any).voucher_view_id)
          .maybeSingle();

        if (viewError) {
          console.warn('Error fetching associated view:', viewError);
        } else {
          selectedView = viewData;
        }
      }

      // If no specific view found, try to find a default view
      if (!selectedView) {
        const { data: defaultViewData, error: defaultViewError } = await supabase
          .from('voucher_views' as any)
          .select('*')
          .eq('is_default', true)
          .or(`and(company_id.eq.${companyId},division_id.eq.${divisionId}),and(company_id.is.null,division_id.is.null)`)
          .maybeSingle();

        if (defaultViewError) {
          console.warn('Error fetching default view:', defaultViewError);
        }

        selectedView = defaultViewData;
      }

      if (selectedView && selectedView.view_config) {
        setViewConfig(selectedView.view_config);
        setUseMasterView(false);
      } else {
        // No custom view found, use master view
        setUseMasterView(true);
      }
    } catch (error) {
      console.error('Error fetching voucher view:', error);
      setUseMasterView(true);
    } finally {
      setLoading(false);
    }
  };

  // Loading state - show skeleton to avoid duplicate inner tabs
  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-6 w-40 rounded-md bg-muted animate-pulse" />
        <div className="h-10 w-full rounded-md bg-muted animate-pulse" />
        <div className="h-64 w-full rounded-md bg-muted animate-pulse" />
      </div>
    );
  }

  // If should use master view, render EnhancedVoucherDetails
  if (useMasterView || !viewConfig) {
    return (
      <EnhancedVoucherDetails
        voucherGuid={voucherGuid}
        companyId={companyId}
        divisionId={divisionId}
        onClose={onClose}
      />
    );
  }

  // Filter and sort enabled tabs
  const enabledTabs = viewConfig.tabs
    .filter(tab => tab.enabled)
    .sort((a, b) => a.order - b.order);

  // Get view name from config or fallback
  const viewName = viewConfig.name || `${voucherType} Custom View`;

  return (
    <div className="p-6 space-y-6">
      {/* View Header with prominent name */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{viewName}</h1>
          <Badge variant="outline">Custom View</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Displaying {voucherType} with custom layout
        </p>
      </div>

      {/* Custom Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="flex items-center gap-2">
          <TabsList 
            ref={tabsListRef}
            className="flex-1 grid gap-1"
            style={{ gridTemplateColumns: `repeat(${visibleTabs.length}, 1fr)` }}
          >
            {visibleTabs.map((tab) => {
              const IconComponent = ICON_MAP[tab.icon as keyof typeof ICON_MAP] || FileText;
              
              return (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id} 
                  className="flex items-center gap-2 text-sm"
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {tab.name === 'Accounting Entries' ? 'Accounting' : 
                     tab.name === 'Associated Ledgers' ? 'Ledgers' : tab.name}
                  </span>
                  <span className="sm:hidden">
                    {tab.name === 'Accounting Entries' ? 'Acc' : 
                     tab.name === 'Associated Ledgers' ? 'Led' : 
                     tab.name.length > 6 ? tab.name.substring(0, 6) + '...' : tab.name}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {overflowTabs.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="px-2">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-48 bg-background border shadow-md z-50"
              >
                {overflowTabs.map((tab) => {
                  const IconComponent = ICON_MAP[tab.icon as keyof typeof ICON_MAP] || FileText;
                  
                  return (
                    <DropdownMenuItem
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <IconComponent className="h-4 w-4" />
                      {tab.name === 'Accounting Entries' ? 'Accounting' : 
                       tab.name === 'Associated Ledgers' ? 'Ledgers' : tab.name}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {enabledTabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            {tab.id === 'overview' ? (
              <VoucherOverview
                voucherGuid={voucherGuid}
                companyId={companyId}
                divisionId={divisionId}
              />
            ) : (tab.id === 'accounting' || tab.name === 'Accounting Entries') ? (
              <VoucherAccountingEntries
                voucherGuid={voucherGuid}
                companyId={companyId}
                divisionId={divisionId}
              />
            ) : (tab.id === 'ledgers' || tab.name === 'Associated Ledgers') ? (
              <VoucherAssociatedLedgers
                voucherGuid={voucherGuid}
                companyId={companyId}
                divisionId={divisionId}
              />
            ) : (tab.id === 'inventory' || tab.name === 'Inventory') ? (
              <VoucherInventoryDetails
                voucherGuid={voucherGuid}
                companyId={companyId}
                divisionId={divisionId}
              />
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground mb-4">
                  Showing {tab.name} content for voucher {voucherGuid}
                </div>
                <div className="p-4 border rounded-lg bg-muted/50">
                  <p>Content for {tab.name} tab will be implemented here.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Tab sections: {tab.sections?.join(', ') || 'None configured'}
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}