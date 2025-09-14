import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { 
  GripVertical,
  Plus,
  Trash2,
  FileText,
  Calculator,
  Receipt,
  Package,
  MapPin,
  Database,
  Clock,
  Save,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface VoucherView {
  id: string;
  name: string;
  description?: string;
  view_config: ViewConfig;
  is_default: boolean;
}

interface VoucherViewBuilderProps {
  view?: VoucherView | null;
  companyId: string;
  divisionId: string;
  voucherTypes: string[];
  onSave: () => void;
  onCancel: () => void;
}

const DEFAULT_TABS: TabConfig[] = [
  {
    id: 'overview',
    name: 'Overview',
    enabled: true,
    mandatory: true,
    order: 1,
    icon: 'FileText',
    sections: ['basic_info', 'financial_summary']
  },
  {
    id: 'accounting',
    name: 'Accounting Entries',
    enabled: true,
    mandatory: false,
    order: 2,
    icon: 'Calculator',
    options: {
      show_debit_credit: true,
      group_by: 'ledger'
    }
  },
  {
    id: 'ledgers',
    name: 'Associated Ledgers',
    enabled: true,
    mandatory: false,
    order: 3,
    icon: 'Receipt'
  },
  {
    id: 'inventory',
    name: 'Inventory',
    enabled: false,
    mandatory: false,
    order: 4,
    icon: 'Package'
  },
  {
    id: 'addresses',
    name: 'Addresses',
    enabled: false,
    mandatory: false,
    order: 5,
    icon: 'MapPin'
  },
  {
    id: 'master-data',
    name: 'Master Data',
    enabled: true,
    mandatory: false,
    order: 6,
    icon: 'Database'
  },
  {
    id: 'audit',
    name: 'Audit Trail',
    enabled: true,
    mandatory: true,
    order: 7,
    icon: 'Clock'
  }
];

const ICON_MAP = {
  FileText,
  Calculator,
  Receipt,
  Package,
  MapPin,
  Database,
  Clock
};

export function VoucherViewBuilder({ 
  view, 
  companyId, 
  divisionId, 
  voucherTypes, 
  onSave, 
  onCancel 
}: VoucherViewBuilderProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [viewName, setViewName] = useState(view?.name || '');
  const [viewDescription, setViewDescription] = useState(view?.description || '');
  const [isDefault, setIsDefault] = useState(view?.is_default || false);
  const [tabs, setTabs] = useState<TabConfig[]>(
    view?.view_config?.tabs || DEFAULT_TABS
  );
  const [selectedVoucherTypes, setSelectedVoucherTypes] = useState<string[]>([]);

  useEffect(() => {
    if (view) {
      fetchAssociatedTypes();
    }
  }, [view]);

  const fetchAssociatedTypes = async () => {
    if (!view) return;
    
    try {
      const { data, error } = await supabase
        .from('voucher_type_views' as any)
        .select('voucher_type_name')
        .eq('voucher_view_id', view.id);

      if (error) throw error;
      setSelectedVoucherTypes(data?.map((d: any) => d.voucher_type_name) || []);
    } catch (error) {
      console.error('Error fetching associated types:', error);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(tabs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order values
    const updatedTabs = items.map((tab, index) => ({
      ...tab,
      order: index + 1
    }));

    setTabs(updatedTabs);
  };

  const toggleTabEnabled = (tabId: string) => {
    setTabs(tabs.map(tab => {
      if (tab.id === tabId && !tab.mandatory) {
        return { ...tab, enabled: !tab.enabled };
      }
      return tab;
    }));
  };

  const updateTabOption = (tabId: string, option: string, value: any) => {
    setTabs(tabs.map(tab => {
      if (tab.id === tabId) {
        return {
          ...tab,
          options: {
            ...tab.options,
            [option]: value
          }
        };
      }
      return tab;
    }));
  };

  const handleSave = async () => {
    if (!viewName.trim()) {
      toast({
        title: "Error",
        description: "View name is required",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const viewConfig: ViewConfig = {
        tabs: tabs.sort((a, b) => a.order - b.order)
      };

      const viewData = {
        name: viewName,
        description: viewDescription || null,
        company_id: companyId,
        division_id: divisionId,
        is_default: isDefault,
        view_config: viewConfig
      };

      let viewId: string;

      if (view) {
        // Update existing view
        const { error } = await supabase
          .from('voucher_views' as any)
          .update(viewData)
          .eq('id', view.id);

        if (error) throw error;
        viewId = view.id;
      } else {
        // Create new view
        const { data, error } = await supabase
          .from('voucher_views' as any)
          .insert(viewData)
          .select()
          .single();

        if (error) throw error;
        viewId = (data as any).id;
      }

      // Update voucher type associations
      if (selectedVoucherTypes.length > 0) {
        // Delete existing associations
        await supabase
          .from('voucher_type_views' as any)
          .delete()
          .eq('voucher_view_id', viewId);

        // Insert new associations
        const associations = selectedVoucherTypes.map(typeName => ({
          voucher_type_name: typeName,
          voucher_view_id: viewId,
          company_id: companyId,
          division_id: divisionId
        }));

        const { error: associationError } = await supabase
          .from('voucher_type_views' as any)
          .insert(associations);

        if (associationError) throw associationError;
      }

      toast({
        title: "Success",
        description: `Voucher view ${view ? 'updated' : 'created'} successfully`
      });

      onSave();
    } catch (error) {
      console.error('Error saving voucher view:', error);
      toast({
        title: "Error",
        description: `Failed to ${view ? 'update' : 'create'} voucher view`,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-h-full overflow-auto">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="view-name">View Name *</Label>
              <Input
                id="view-name"
                value={viewName}
                onChange={(e) => setViewName(e.target.value)}
                placeholder="Enter view name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="is-default">Default View</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is-default"
                  checked={isDefault}
                  onCheckedChange={setIsDefault}
                />
                <Label htmlFor="is-default" className="text-sm text-muted-foreground">
                  Use as default for unassociated voucher types
                </Label>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="view-description">Description</Label>
            <Textarea
              id="view-description"
              value={viewDescription}
              onChange={(e) => setViewDescription(e.target.value)}
              placeholder="Optional description for this view"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Voucher Type Associations */}
      <Card>
        <CardHeader>
          <CardTitle>Voucher Type Associations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Associated Voucher Types</Label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {voucherTypes.map((type) => (
                <Badge
                  key={type}
                  variant={selectedVoucherTypes.includes(type) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    if (selectedVoucherTypes.includes(type)) {
                      setSelectedVoucherTypes(prev => prev.filter(t => t !== type));
                    } else {
                      setSelectedVoucherTypes(prev => [...prev, type]);
                    }
                  }}
                >
                  {type}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Click to toggle voucher types that will use this view
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tab Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Tab Configuration</CardTitle>
        </CardHeader>
        <CardContent className="max-h-96 overflow-y-auto">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="tabs">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {tabs.map((tab, index) => {
                    const IconComponent = ICON_MAP[tab.icon as keyof typeof ICON_MAP] || FileText;
                    
                    return (
                      <Draggable key={tab.id} draggableId={tab.id} index={index}>
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`${!tab.enabled && !tab.mandatory ? 'opacity-50' : ''}`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center gap-4">
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                </div>
                                
                                <IconComponent className="h-4 w-4" />
                                
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{tab.name}</span>
                                    {tab.mandatory && <Badge variant="secondary">Mandatory</Badge>}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  {!tab.mandatory && (
                                    <Switch
                                      checked={tab.enabled}
                                      onCheckedChange={() => toggleTabEnabled(tab.id)}
                                    />
                                  )}
                                  
                                  <span className="text-sm text-muted-foreground">
                                    Order: {tab.order}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Tab-specific options */}
                              {tab.id === 'accounting' && tab.enabled && (
                                <div className="mt-4 pt-4 border-t space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      checked={tab.options?.show_debit_credit || false}
                                      onCheckedChange={(value) => updateTabOption(tab.id, 'show_debit_credit', value)}
                                    />
                                    <Label className="text-sm">Show Debit/Credit columns</Label>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2">
                                    <Label className="text-sm">Group by:</Label>
                                    <Select
                                      value={tab.options?.group_by || 'ledger'}
                                      onValueChange={(value) => updateTabOption(tab.id, 'group_by', value)}
                                    >
                                      <SelectTrigger className="w-32">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="ledger">Ledger</SelectItem>
                                        <SelectItem value="amount">Amount</SelectItem>
                                        <SelectItem value="none">None</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </CardContent>
      </Card>

      {/* Actions - Fixed at bottom */}
      <div className="sticky bottom-0 bg-background border-t pt-4 flex items-center justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : (view ? 'Update View' : 'Create View')}
        </Button>
      </div>
    </div>
  );
}