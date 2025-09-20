import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Network, 
  TreePine, 
  FileText, 
  Users, 
  Package, 
  Building,
  TrendingUp,
  Calendar,
  Eye,
  ChevronRight,
  Database,
  BarChart3,
  Receipt,
  RefreshCw
} from 'lucide-react';
import { tallyApi, type ApiResponse } from '@/services/tallyApiService';
import { useToast } from '@/hooks/use-toast';

interface EntitySearchResult {
  entityType: 'ledger' | 'group' | 'stock-item' | 'voucher' | 'voucher-type';
  entity: any;
  relationshipCount: number;
  hierarchyPath: string;
}

interface EntityRelationshipExplorerProps {
  companyId: string;
  divisionId: string;
  initialEntity?: {
    type: string;
    id: string;
  };
}

export function EntityRelationshipExplorer({ 
  companyId, 
  divisionId, 
  initialEntity 
}: EntityRelationshipExplorerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<EntitySearchResult[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [entityRelationships, setEntityRelationships] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [relationshipLoading, setRelationshipLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialEntity) {
      loadEntityRelationships(initialEntity.type, initialEntity.id);
    }
  }, [initialEntity]);

  const performUniversalSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      setLoading(true);
      const results: EntitySearchResult[] = [];

      // Search across all entity types
      const [ledgersResponse, groupsResponse, stockItemsResponse, voucherTypesResponse] = await Promise.all([
        tallyApi.getLedgers(companyId, divisionId, { search: searchTerm, limit: 10 }),
        tallyApi.getGroups(companyId, divisionId, { search: searchTerm, limit: 10 }),
        tallyApi.getStockItems(companyId, divisionId, { search: searchTerm, limit: 10 }),
        tallyApi.getVoucherTypes(companyId, divisionId, { search: searchTerm, limit: 10 })
      ]);

      // Add ledgers to results
      if (ledgersResponse.success) {
        ledgersResponse.data.forEach(ledger => {
          results.push({
            entityType: 'ledger',
            entity: ledger,
            relationshipCount: 0, // Would be calculated from API
            hierarchyPath: `${ledger.parent} → ${ledger.name}`
          });
        });
      }

      // Add groups to results
      if (groupsResponse.success) {
        groupsResponse.data.forEach(group => {
          results.push({
            entityType: 'group',
            entity: group,
            relationshipCount: 0,
            hierarchyPath: `${group.parent} → ${group.name}`
          });
        });
      }

      // Add stock items to results
      if (stockItemsResponse.success) {
        stockItemsResponse.data.forEach(item => {
          results.push({
            entityType: 'stock-item',
            entity: item,
            relationshipCount: 0,
            hierarchyPath: `${item.parent} → ${item.name}`
          });
        });
      }

      // Add voucher types to results
      if (voucherTypesResponse.success) {
        voucherTypesResponse.data.forEach(type => {
          results.push({
            entityType: 'voucher-type',
            entity: type,
            relationshipCount: 0,
            hierarchyPath: type.name
          });
        });
      }

      setSearchResults(results);
      console.log(`Universal search found ${results.length} results across all entity types`);

    } catch (error) {
      console.error('Universal search failed:', error);
      toast({
        title: "Search Failed",
        description: "Failed to search across entities",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEntityRelationships = async (entityType: string, entityId: string) => {
    try {
      setRelationshipLoading(true);
      let response: ApiResponse<any>;

      switch (entityType) {
        case 'ledger':
          response = await tallyApi.getLedgerComplete(companyId, divisionId, entityId);
          break;
        case 'stock-item':
          response = await tallyApi.getStockItemComplete(companyId, divisionId, entityId);
          break;
        case 'voucher':
          response = await tallyApi.getVoucherComplete(companyId, divisionId, entityId);
          break;
        default:
          throw new Error(`Unsupported entity type: ${entityType}`);
      }

      if (!response.success) {
        throw new Error(response.error || 'Failed to load relationships');
      }

      setEntityRelationships(response.data);
      setSelectedEntity({ type: entityType, id: entityId, data: response.data });
      
      console.log('Entity relationships loaded:', response.data);

    } catch (error) {
      console.error('Failed to load entity relationships:', error);
      toast({
        title: "Error",
        description: "Failed to load entity relationships",
        variant: "destructive"
      });
    } finally {
      setRelationshipLoading(false);
    }
  };

  const handleEntitySelect = (result: EntitySearchResult) => {
    loadEntityRelationships(result.entityType, result.entity.guid || result.entity.name);
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'ledger': return <FileText className="h-4 w-4" />;
      case 'group': return <Users className="h-4 w-4" />;
      case 'stock-item': return <Package className="h-4 w-4" />;
      case 'voucher': return <Receipt className="h-4 w-4" />;
      case 'voucher-type': return <FileText className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const getEntityTypeColor = (entityType: string) => {
    switch (entityType) {
      case 'ledger': return 'bg-blue-100 text-blue-800';
      case 'group': return 'bg-green-100 text-green-800';
      case 'stock-item': return 'bg-purple-100 text-purple-800';
      case 'voucher': return 'bg-orange-100 text-orange-800';
      case 'voucher-type': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Entity Relationship Explorer</h1>
        <p className="text-muted-foreground">
          Discover connections across all Tally entities with complete relationship mapping
        </p>
      </div>

      {/* Universal Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Universal Entity Search
          </CardTitle>
          <CardDescription>
            Search across 3,600+ Tally records (Ledgers, Groups, Stock Items, Voucher Types)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Search across all entities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && performUniversalSearch()}
            />
            <Button onClick={performUniversalSearch} disabled={loading}>
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Search Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Search Results ({searchResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-3 hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => handleEntitySelect(result)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getEntityIcon(result.entityType)}
                        <div>
                          <div className="font-semibold">{result.entity.name}</div>
                          <div className="text-sm text-muted-foreground font-mono">
                            {result.hierarchyPath}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getEntityTypeColor(result.entityType)}>
                          {result.entityType.replace('-', ' ')}
                        </Badge>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                ))}
                {searchResults.length === 0 && searchTerm && !loading && (
                  <div className="text-center py-8 text-muted-foreground">
                    No entities found matching "{searchTerm}"
                  </div>
                )}
                {searchResults.length === 0 && !searchTerm && (
                  <div className="text-center py-8 text-muted-foreground">
                    Enter a search term to find entities across all Tally data
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Entity Relationships */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Network className="h-5 w-5 mr-2" />
              Entity Relationships
            </CardTitle>
          </CardHeader>
          <CardContent>
            {relationshipLoading ? (
              <div className="space-y-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ) : selectedEntity ? (
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {/* Entity Basic Info */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      {getEntityIcon(selectedEntity.type)}
                      <span className="font-semibold">Selected Entity</span>
                    </div>
                    <div className="space-y-1">
                      <div className="font-mono text-sm">{selectedEntity.data.name || selectedEntity.id}</div>
                      {selectedEntity.data.hierarchy && (
                        <div className="text-sm text-muted-foreground">
                          Path: {selectedEntity.data.hierarchy.fullPath}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Relationships Display */}
                  {entityRelationships && (
                    <div className="space-y-4">
                      {/* Transaction Relationships */}
                      {entityRelationships.transactionRelationships && (
                        <div className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-2 flex items-center">
                            <Receipt className="h-4 w-4 mr-2" />
                            Transaction Relationships
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Total Vouchers:</span>
                              <span className="ml-2 font-semibold">
                                {entityRelationships.transactionRelationships.totalVouchers}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Total Amount:</span>
                              <span className="ml-2 font-semibold">
                                ₹{entityRelationships.transactionRelationships.totalAmount?.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                          {entityRelationships.transactionRelationships.voucherTypes && (
                            <div className="mt-2">
                              <span className="text-sm text-muted-foreground">Voucher Types:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {entityRelationships.transactionRelationships.voucherTypes.map((type: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {type}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Hierarchy Relationships */}
                      {entityRelationships.hierarchy && (
                        <div className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-2 flex items-center">
                            <TreePine className="h-4 w-4 mr-2" />
                            Hierarchy Relationships
                          </h4>
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm text-muted-foreground">Full Path:</span>
                              <div className="font-mono text-sm mt-1 p-2 bg-muted rounded">
                                {entityRelationships.hierarchy.fullPath}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Hierarchy Level:</span>
                                <span className="ml-2 font-semibold">
                                  {entityRelationships.hierarchy.level}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Is Top Level:</span>
                                <Badge variant={entityRelationships.hierarchy.isTopLevel ? 'default' : 'secondary'} className="ml-2">
                                  {entityRelationships.hierarchy.isTopLevel ? 'Yes' : 'No'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Child Relationships */}
                      {entityRelationships.childLedgers && entityRelationships.childLedgers.length > 0 && (
                        <div className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-2 flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            Child Entities ({entityRelationships.childLedgers.length})
                          </h4>
                          <div className="space-y-2">
                            {entityRelationships.childLedgers.slice(0, 5).map((child: any, index: number) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                                <span className="font-semibold">{child.name}</span>
                                <span className="text-sm text-muted-foreground">
                                  ₹{child.closing_balance?.toLocaleString('en-IN')}
                                </span>
                              </div>
                            ))}
                            {entityRelationships.childLedgers.length > 5 && (
                              <div className="text-sm text-muted-foreground text-center">
                                ... and {entityRelationships.childLedgers.length - 5} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Balance Analysis */}
                      {entityRelationships.balanceAnalysis && (
                        <div className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-2 flex items-center">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Balance Analysis
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Opening Balance:</span>
                              <span className="ml-2 font-semibold">
                                ₹{entityRelationships.balanceAnalysis.openingBalance?.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Closing Balance:</span>
                              <span className="ml-2 font-semibold">
                                ₹{entityRelationships.balanceAnalysis.closingBalance?.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Movement:</span>
                              <span className={`ml-2 font-semibold ${entityRelationships.balanceAnalysis.movement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {entityRelationships.balanceAnalysis.movement >= 0 ? '+' : ''}₹{entityRelationships.balanceAnalysis.movement?.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Balance Type:</span>
                              <Badge variant={entityRelationships.balanceAnalysis.balanceType === 'Debit' ? 'default' : 'secondary'} className="ml-2">
                                {entityRelationships.balanceAnalysis.balanceType}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Stock Analysis */}
                      {entityRelationships.stockAnalysis && (
                        <div className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-2 flex items-center">
                            <Package className="h-4 w-4 mr-2" />
                            Stock Analysis
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Opening Stock:</span>
                              <span className="ml-2 font-semibold">
                                {entityRelationships.stockAnalysis.openingStock?.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Closing Stock:</span>
                              <span className="ml-2 font-semibold">
                                {entityRelationships.stockAnalysis.closingStock?.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Current Rate:</span>
                              <span className="ml-2 font-semibold">
                                ₹{entityRelationships.stockAnalysis.currentRate?.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Stock Value:</span>
                              <span className="ml-2 font-semibold">
                                ₹{entityRelationships.stockAnalysis.stockValue?.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select an entity from search results to explore its relationships</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Search Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {searchResults.filter(r => r.entityType === 'ledger').length}
                </div>
                <div className="text-sm text-muted-foreground">Ledgers</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">
                  {searchResults.filter(r => r.entityType === 'group').length}
                </div>
                <div className="text-sm text-muted-foreground">Groups</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">
                  {searchResults.filter(r => r.entityType === 'stock-item').length}
                </div>
                <div className="text-sm text-muted-foreground">Stock Items</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-600">
                  {searchResults.filter(r => r.entityType === 'voucher-type').length}
                </div>
                <div className="text-sm text-muted-foreground">Voucher Types</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default EntityRelationshipExplorer;
