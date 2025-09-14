import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  FileText,
  Calculator,
  Receipt,
  Package,
  MapPin,
  Database,
  Clock
} from 'lucide-react';
import { EnhancedVoucherDetails } from './EnhancedVoucherDetails';
import { VoucherOverview } from './VoucherOverview';
import { VoucherAccountingEntries } from './VoucherAccountingEntries';

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
  Clock
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

  useEffect(() => {
    fetchVoucherView();
  }, [voucherType, companyId, divisionId]);

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
      <Tabs defaultValue={enabledTabs[0]?.id} className="w-full">
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${enabledTabs.length}, 1fr)` }}>
          {enabledTabs.map((tab) => {
            const IconComponent = ICON_MAP[tab.icon as keyof typeof ICON_MAP] || FileText;
            
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                <IconComponent className="h-4 w-4" />
                {tab.name}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {enabledTabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            {tab.id === 'overview' ? (
              <VoucherOverview
                voucherGuid={voucherGuid}
                companyId={companyId}
                divisionId={divisionId}
              />
            ) : tab.id === 'accounting' ? (
              <VoucherAccountingEntries
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