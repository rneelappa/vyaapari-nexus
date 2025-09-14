import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, TreePine } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AccountGroup {
  guid: string;
  name: string;
  parent: string;
  primary_group: string;
  voucherCount?: number;
  children?: AccountGroup[];
}

interface AccountGroupsSelectorProps {
  companyId: string;
  divisionId: string;
  selectedGroup: string | null;
  onGroupSelect: (groupName: string | null) => void;
  totalVouchers: number;
}

export const AccountGroupsSelector: React.FC<AccountGroupsSelectorProps> = ({
  companyId,
  divisionId,
  selectedGroup,
  onGroupSelect,
  totalVouchers
}) => {
  const { toast } = useToast();
  const [groups, setGroups] = useState<AccountGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open && groups.length === 0) {
      fetchAccountGroups();
    }
  }, [open, companyId, divisionId]);

  const fetchAccountGroups = async () => {
    setLoading(true);
    try {
      // Fetch groups with voucher counts
      const { data: groupsData, error: groupsError } = await supabase
        .from('mst_group')
        .select('guid, name, parent, primary_group')
        .or(`and(company_id.eq.${companyId},division_id.eq.${divisionId}),and(company_id.is.null,division_id.is.null)`)
        .order('name');

      if (groupsError) throw groupsError;

      // Get voucher counts by executing the query directly
      const { data: voucherCounts, error: countsError } = await supabase
        .from('mst_ledger')
        .select(`
          parent,
          tally_trn_voucher!inner(guid)
        `)
        .or(`and(company_id.eq.${companyId},division_id.eq.${divisionId}),and(company_id.is.null,division_id.is.null)`)
        .not('parent', 'is', null)
        .neq('parent', '');

      if (countsError) {
        console.warn('Could not fetch voucher counts:', countsError);
      }

      // Count vouchers by group
      const groupCounts = (voucherCounts || []).reduce((acc: Record<string, number>, item: any) => {
        const groupName = item.parent;
        if (groupName) {
          acc[groupName] = (acc[groupName] || 0) + (item.tally_trn_voucher?.length || 0);
        }
        return acc;
      }, {});

      const groupsWithCounts = (groupsData || []).map(group => ({
        ...group,
        voucherCount: groupCounts[group.name] || 0
      }));

      setGroups(buildGroupTree(groupsWithCounts));
    } catch (error) {
      console.error('Error fetching account groups:', error);
      toast({
        title: "Error",
        description: "Failed to fetch account groups",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const buildGroupTree = (flatGroups: AccountGroup[]): AccountGroup[] => {
    const groupMap = new Map<string, AccountGroup>();
    const rootGroups: AccountGroup[] = [];

    // Create map of all groups
    flatGroups.forEach(group => {
      groupMap.set(group.name, { ...group, children: [] });
    });

    // Build tree structure
    flatGroups.forEach(group => {
      const groupNode = groupMap.get(group.name)!;
      if (group.parent && group.parent !== group.name) {
        const parentNode = groupMap.get(group.parent);
        if (parentNode) {
          parentNode.children!.push(groupNode);
        } else {
          rootGroups.push(groupNode);
        }
      } else {
        rootGroups.push(groupNode);
      }
    });

    return rootGroups;
  };

  const toggleExpanded = (groupName: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedNodes(newExpanded);
  };

  const renderGroupNode = (group: AccountGroup, level: number = 0): React.ReactNode => {
    const hasChildren = group.children && group.children.length > 0;
    const isExpanded = expandedNodes.has(group.name);
    const isSelected = selectedGroup === group.name;

    return (
      <div key={group.guid}>
        <div 
          className={`flex items-center gap-1 py-1 px-2 hover:bg-muted rounded cursor-pointer ${isSelected ? 'bg-primary/10' : ''}`}
          style={{ marginLeft: `${level * 16}px` }}
          onClick={() => onGroupSelect(isSelected ? null : group.name)}
        >
          <div className="w-4 flex justify-center">
            {hasChildren ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(group.name);
                }}
              >
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </Button>
            ) : (
              <div className="h-3 w-3" />
            )}
          </div>
          
          <span className={`text-sm flex-1 ${isSelected ? 'font-semibold' : ''}`}>
            {group.name}
          </span>
          
          {group.voucherCount !== undefined && group.voucherCount > 0 && (
            <Badge variant="secondary" className="text-xs h-5 px-1">
              {group.voucherCount}
            </Badge>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {group.children!.map(child => renderGroupNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-7 text-xs justify-between min-w-[140px]">
          <div className="flex items-center gap-1">
            <TreePine className="h-3 w-3" />
            {selectedGroup || 'All Groups'}
          </div>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Account Groups</h4>
            <Badge variant="outline" className="text-xs">
              {totalVouchers} total
            </Badge>
          </div>
          {selectedGroup && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs mt-1"
              onClick={() => {
                onGroupSelect(null);
                setOpen(false);
              }}
            >
              Clear Selection
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-80">
          <div className="p-2">
            {loading ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                Loading groups...
              </div>
            ) : groups.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No account groups found
              </div>
            ) : (
              <div className="space-y-1">
                {groups.map(group => renderGroupNode(group))}
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};