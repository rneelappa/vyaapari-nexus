import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Settings, 
  FileText, 
  Search,
  Grid,
  List
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { VoucherViewBuilder } from './VoucherViewBuilder';

interface VoucherView {
  id: string;
  name: string;
  description?: string;
  company_id?: string;
  division_id?: string;
  is_default: boolean;
  view_config: any;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

interface VoucherTypeView {
  id: string;
  voucher_type_name: string;
  voucher_view_id: string;
  company_id?: string;
  division_id?: string;
  voucher_view?: VoucherView;
}

interface VoucherViewsManagerProps {
  companyId: string;
  divisionId: string;
}

export function VoucherViewsManager({ companyId, divisionId }: VoucherViewsManagerProps) {
  const { toast } = useToast();
  const [views, setViews] = useState<VoucherView[]>([]);
  const [typeViews, setTypeViews] = useState<VoucherTypeView[]>([]);
  const [voucherTypes, setVoucherTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedView, setSelectedView] = useState<VoucherView | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchData();
  }, [companyId, divisionId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch voucher views
      const { data: viewsData, error: viewsError } = await supabase
        .from('voucher_views' as any)
        .select('*')
        .or(`and(company_id.eq.${companyId},division_id.eq.${divisionId}),and(company_id.is.null,division_id.is.null)`)
        .order('created_at', { ascending: false });

      if (viewsError) throw viewsError;

      // Fetch voucher type associations - simplified without relations
      const { data: typeViewsData, error: typeViewsError } = await supabase
        .from('voucher_type_views' as any)
        .select('*')
        .or(`and(company_id.eq.${companyId},division_id.eq.${divisionId}),and(company_id.is.null,division_id.is.null)`);

      if (typeViewsError) throw typeViewsError;

      // Fetch available voucher types
      const { data: voucherTypesData, error: voucherTypesError } = await supabase
        .from('bkp_mst_vouchertype')
        .select('name')
        .or(`and(company_id.eq.${companyId},division_id.eq.${divisionId}),and(company_id.is.null,division_id.is.null)`)
        .order('name');

      if (voucherTypesError) throw voucherTypesError;

      setViews((viewsData as any) || []);
      setTypeViews((typeViewsData as any) || []);
      // Remove duplicates and ensure unique voucher types
      const uniqueVoucherTypes = [...new Set(voucherTypesData?.map((v: any) => v.name) || [])];
      setVoucherTypes(uniqueVoucherTypes);
    } catch (error) {
      console.error('Error fetching voucher views:', error);
      toast({
        title: "Error",
        description: "Failed to fetch voucher views",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateView = () => {
    setSelectedView(null);
    setShowBuilder(true);
  };

  const handleEditView = (view: VoucherView) => {
    setSelectedView(view);
    setShowBuilder(true);
  };

  const handleDeleteView = async (viewId: string) => {
    try {
      const { error } = await supabase
        .from('voucher_views' as any)
        .delete()
        .eq('id', viewId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Voucher view deleted successfully"
      });
      
      fetchData();
    } catch (error) {
      console.error('Error deleting view:', error);
      toast({
        title: "Error",
        description: "Failed to delete voucher view",
        variant: "destructive"
      });
    }
  };

  const handleViewSaved = () => {
    setShowBuilder(false);
    setSelectedView(null);
    fetchData();
  };

  const filteredViews = views.filter(view =>
    view.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    view.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAssociatedTypes = (viewId: string) => {
    return typeViews
      .filter((tv: any) => tv.voucher_view_id === viewId)
      .map((tv: any) => tv.voucher_type_name);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Voucher Views Manager
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage custom voucher display views
          </p>
        </div>
        
        <Button onClick={handleCreateView} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create View
        </Button>
      </div>

      {/* Search and View Mode */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search views..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center border rounded-md">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="rounded-r-none"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="rounded-l-none"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Views Display */}
      {filteredViews.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">No Voucher Views Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'No views match your search criteria.' : 'Create your first custom voucher view to get started.'}
            </p>
            {!searchQuery && (
              <Button onClick={handleCreateView}>
                <Plus className="h-4 w-4 mr-2" />
                Create First View
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
          {filteredViews.map((view) => {
            const associatedTypes = getAssociatedTypes(view.id);
            
            return (
              <Card key={view.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {view.name}
                        {view.is_default && <Badge variant="secondary">Default</Badge>}
                      </CardTitle>
                      {view.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {view.description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Associated Voucher Types */}
                  <div>
                    <p className="text-sm font-medium mb-2">Associated Types:</p>
                    {associatedTypes.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {associatedTypes.map((type) => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No associations</p>
                    )}
                  </div>

                  <Separator />

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditView(view)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>View Configuration</DialogTitle>
                          <DialogDescription>
                            Preview of {view.name} configuration
                          </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="h-96">
                          <pre className="text-xs bg-muted p-4 rounded">
                            {JSON.stringify(view.view_config, null, 2)}
                          </pre>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteView(view.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* View Builder Dialog */}
      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>
              {selectedView ? `Edit View: ${selectedView.name}` : 'Create New View'}
            </DialogTitle>
            <DialogDescription>
              Configure tabs and sections for voucher display
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 overflow-auto">
            <div className="pr-4">
              <VoucherViewBuilder
                view={selectedView}
                companyId={companyId}
                divisionId={divisionId}
                voucherTypes={voucherTypes}
                onSave={handleViewSaved}
                onCancel={() => setShowBuilder(false)}
              />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}