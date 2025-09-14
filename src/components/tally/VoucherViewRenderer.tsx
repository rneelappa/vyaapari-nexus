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

  // If loading or should use master view, render EnhancedVoucherDetails
  if (loading || useMasterView || !viewConfig) {
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

  return (
    <div className="p-6 space-y-6">
      {/* Custom View Header */}
      <div className="flex items-center gap-2">
        <Badge variant="outline">Custom View</Badge>
        <span className="text-sm text-muted-foreground">
          Displaying {voucherType} with custom layout
        </span>
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
            {/* For now, we'll render the master view content for each tab */}
            {/* In a full implementation, each tab would have its own specialized component */}
            <EnhancedVoucherDetails
              voucherGuid={voucherGuid}
              companyId={companyId}
              divisionId={divisionId}
              onClose={onClose}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}