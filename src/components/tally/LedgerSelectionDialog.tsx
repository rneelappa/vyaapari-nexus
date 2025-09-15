import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Search, Check, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface LedgerOption {
  name: string;
  type: string;
  source: string;
}

interface LedgerSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (ledger: LedgerOption) => void;
  companyId: string;
  divisionId: string;
  selectedLedger?: string;
  title?: string;
}

export function LedgerSelectionDialog({
  open,
  onOpenChange,
  onSelect,
  companyId,
  divisionId,
  selectedLedger,
  title = "Select Ledger"
}: LedgerSelectionDialogProps) {
  const [ledgers, setLedgers] = useState<LedgerOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  const fetchLedgers = async (query: string = '', pageNum: number = 1, append: boolean = false) => {
    if (!companyId || !divisionId) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '50'
      });
      
      if (query.trim()) {
        params.append('q', query.trim());
      }

      const response = await fetch(
        `https://tally-sync-vyaapari360-production.up.railway.app/api/v1/ledgers/${companyId}/${divisionId}/suggest?${params}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch ledgers');
      }
      
      const data = await response.json();
      
      if (data.success) {
        const newLedgers = data.data.ledgers || [];
        setLedgers(prev => append ? [...prev, ...newLedgers] : newLedgers);
        setTotalPages(data.data.pages || 1);
        setHasMore(pageNum < (data.data.pages || 1));
      } else {
        throw new Error(data.message || 'Failed to fetch ledgers');
      }
    } catch (error) {
      console.error('Error fetching ledgers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch ledgers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (open) {
      setPage(1);
      setSearchQuery('');
      fetchLedgers('', 1, false);
    }
  }, [open, companyId, divisionId]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (open) {
        setPage(1);
        fetchLedgers(searchQuery, 1, false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchLedgers(searchQuery, nextPage, true);
    }
  };

  const handleSelect = (ledger: LedgerOption) => {
    onSelect(ledger);
    onOpenChange(false);
  };

  const getLedgerTypeColor = (type: string) => {
    const colors = {
      'cash': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'bank': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'sales': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'purchase': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'tax': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'service': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'general': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    };
    return colors[type as keyof typeof colors] || colors.general;
  };

  const getSourceBadge = (source: string) => {
    const labels = {
      'party': 'Party',
      'ledger': 'Ledger',
      'inventory_accounting': 'Inventory'
    };
    return labels[source as keyof typeof labels] || source;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="ledger-search">Search Ledgers</Label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="ledger-search"
                placeholder="Search by ledger name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Results */}
          <ScrollArea className="h-96 border rounded-md">
            <div className="p-4 space-y-2">
              {loading && ledgers.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading ledgers...</span>
                </div>
              ) : ledgers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No ledgers found
                </div>
              ) : (
                <>
                  {ledgers.map((ledger, index) => (
                    <div
                      key={`${ledger.name}-${index}`}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedLedger === ledger.name ? 'bg-primary/10 border-primary' : ''
                      }`}
                      onClick={() => handleSelect(ledger)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{ledger.name}</p>
                          {selectedLedger === ledger.name && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="flex gap-2 mt-1">
                          <Badge className={getLedgerTypeColor(ledger.type)} variant="secondary">
                            {ledger.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {getSourceBadge(ledger.source)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Load More */}
                  {hasMore && (
                    <div className="flex justify-center pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLoadMore}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          `Load More (${page}/${totalPages})`
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}