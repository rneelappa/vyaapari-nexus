import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronDown, ChevronRight, FileText, Package, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoucherType {
  guid: string;
  name: string;
  parent: string;
  affects_stock: number;
  is_deemedpositive: number;
  numbering_method: string;
  children?: VoucherType[];
}

interface VoucherTypeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTypeSelect: (voucherType: VoucherType) => void;
  companyId: string;
  divisionId: string;
}

export function VoucherTypeSelector({ 
  open, 
  onOpenChange, 
  onTypeSelect, 
  companyId, 
  divisionId 
}: VoucherTypeSelectorProps) {
  const { toast } = useToast();
  const [voucherTypes, setVoucherTypes] = useState<VoucherType[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      fetchVoucherTypes();
    }
  }, [open, companyId, divisionId]);

  const fetchVoucherTypes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mst_vouchertype')
        .select('guid, name, parent, affects_stock, is_deemedpositive, numbering_method')
        .or(`and(company_id.eq.${companyId},division_id.eq.${divisionId}),and(company_id.is.null,division_id.is.null)`)
        .order('name');

      if (error) {
        console.error('Error fetching voucher types:', error);
        toast({
          title: "Error",
          description: "Failed to fetch voucher types",
          variant: "destructive"
        });
        return;
      }

      const typesWithHierarchy = buildVoucherTypeTree(data || []);
      setVoucherTypes(typesWithHierarchy);
      
      // Auto-expand root nodes
      const rootNodes = (data || []).filter(type => !type.parent || type.parent === '').map(type => type.name);
      setExpandedNodes(new Set(rootNodes));
      
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch voucher types",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const buildVoucherTypeTree = (flatTypes: VoucherType[]): VoucherType[] => {
    const typeMap = new Map<string, VoucherType>();
    const rootTypes: VoucherType[] = [];

    // Create map of all types
    flatTypes.forEach(type => {
      typeMap.set(type.name, { ...type, children: [] });
    });

    // Build tree structure
    flatTypes.forEach(type => {
      const typeNode = typeMap.get(type.name)!;
      if (type.parent && type.parent !== type.name && type.parent.trim() !== '') {
        const parentNode = typeMap.get(type.parent);
        if (parentNode) {
          parentNode.children!.push(typeNode);
        } else {
          rootTypes.push(typeNode);
        }
      } else {
        rootTypes.push(typeNode);
      }
    });

    return rootTypes;
  };

  const toggleExpanded = (typeName: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(typeName)) {
      newExpanded.delete(typeName);
    } else {
      newExpanded.add(typeName);
    }
    setExpandedNodes(newExpanded);
  };

  const handleTypeSelect = (voucherType: VoucherType) => {
    onTypeSelect(voucherType);
    onOpenChange(false);
  };

  const getTypeIcon = (voucherType: VoucherType) => {
    if (voucherType.affects_stock === 1) {
      return <Package className="h-4 w-4 text-blue-600" />;
    }
    if (voucherType.is_deemedpositive === 1) {
      return <DollarSign className="h-4 w-4 text-green-600" />;
    }
    return <FileText className="h-4 w-4 text-gray-600" />;
  };

  const getTypeDescription = (voucherType: VoucherType) => {
    const descriptions = [];
    if (voucherType.affects_stock === 1) {
      descriptions.push('Stock Affecting');
    }
    if (voucherType.is_deemedpositive === 1) {
      descriptions.push('Credit Nature');
    }
    if (voucherType.numbering_method) {
      descriptions.push(`Numbering: ${voucherType.numbering_method}`);
    }
    return descriptions.join(' • ');
  };

  const renderVoucherTypeNode = (voucherType: VoucherType, level: number = 0): React.ReactNode => {
    const hasChildren = voucherType.children && voucherType.children.length > 0;
    const isExpanded = expandedNodes.has(voucherType.name);
    const description = getTypeDescription(voucherType);

    return (
      <div key={voucherType.guid}>
        <div 
          className={`flex items-center gap-2 py-2 px-3 hover:bg-muted rounded cursor-pointer transition-colors`}
          style={{ marginLeft: `${level * 16}px` }}
        >
          <div className="w-4 flex justify-center">
            {hasChildren ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(voucherType.name);
                }}
              >
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </Button>
            ) : (
              <div className="h-3 w-3" />
            )}
          </div>
          
          <div 
            className="flex-1 flex items-center gap-2"
            onClick={() => handleTypeSelect(voucherType)}
          >
            {getTypeIcon(voucherType)}
            
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{voucherType.name}</div>
              {description && (
                <div className="text-sm text-muted-foreground truncate">
                  {description}
                </div>
              )}
            </div>
            
            <div className="flex gap-1">
              {voucherType.affects_stock === 1 && (
                <Badge variant="secondary" className="text-xs">
                  Stock
                </Badge>
              )}
              {voucherType.is_deemedpositive === 1 && (
                <Badge variant="outline" className="text-xs">
                  Credit
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {voucherType.children!.map(child => renderVoucherTypeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Select Voucher Type
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 min-h-0">
          <div className="mb-4 p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Choose the type of voucher you want to create. Browse through the categories to find the appropriate voucher type.
            </p>
            <div className="flex gap-4 mt-2 text-xs">
              <div className="flex items-center gap-1">
                <Package className="h-3 w-3 text-blue-600" />
                <span>Stock Affecting</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-green-600" />
                <span>Credit Nature</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-3 w-3 text-gray-600" />
                <span>General</span>
              </div>
            </div>
          </div>
          
          <ScrollArea className="h-96">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                ))}
              </div>
            ) : voucherTypes.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-medium mb-2">No Voucher Types Found</h3>
                <p className="text-sm">
                  No voucher types are configured for this company and division.
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {voucherTypes.map(voucherType => renderVoucherTypeNode(voucherType))}
              </div>
            )}
          </ScrollArea>
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}