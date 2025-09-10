/**
 * Inventory Analytics System
 * Provides comprehensive inventory analysis including ABC analysis, reorder optimization, and stock movement insights
 * Built on Tally ERP inventory data with advanced analytics
 */

import { supabase } from '@/integrations/supabase/client';

export interface InventoryItem {
  id: string;
  name: string;
  code: string;
  uom: string;
  currentStock: number;
  unitCost: number;
  totalValue: number;
  category: string;
  supplier: string;
  lastMovementDate: string;
  averageConsumption: number;
  leadTime: number;
}

export interface ABCAnalysis {
  category: 'A' | 'B' | 'C';
  items: InventoryItem[];
  count: number;
  totalValue: number;
  percentage: number;
  recommendations: string[];
}

export interface StockMovement {
  itemId: string;
  itemName: string;
  date: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  unitCost: number;
  totalValue: number;
  reference: string;
  reason: string;
}

export interface ReorderAnalysis {
  itemId: string;
  itemName: string;
  currentStock: number;
  averageConsumption: number;
  leadTime: number;
  reorderPoint: number;
  reorderQuantity: number;
  stockoutRisk: 'low' | 'medium' | 'high';
  urgency: 'immediate' | 'soon' | 'normal';
  recommendations: string[];
}

export interface InventoryMetrics {
  totalItems: number;
  totalValue: number;
  averageItemValue: number;
  turnoverRatio: number;
  stockoutRate: number;
  carryingCost: number;
  obsolescenceRisk: number;
  topPerformers: InventoryItem[];
  slowMoving: InventoryItem[];
  deadStock: InventoryItem[];
}

export interface InventoryTrends {
  period: string;
  totalValue: number;
  totalQuantity: number;
  averageUnitCost: number;
  turnoverRatio: number;
  stockoutCount: number;
}

export interface SupplierAnalysis {
  supplierId: string;
  supplierName: string;
  totalItems: number;
  totalValue: number;
  averageLeadTime: number;
  reliability: number;
  quality: number;
  recommendations: string[];
}

class InventoryAnalytics {
  private companyId: string;

  constructor(companyId: string) {
    this.companyId = companyId;
  }

  /**
   * Perform ABC Analysis on inventory
   */
  async performABCAnalysis(): Promise<ABCAnalysis[]> {
    try {
      // Get all inventory items with their values
      const items = await this.getInventoryItems();
      
      // Sort by total value (descending)
      const sortedItems = items.sort((a, b) => b.totalValue - a.totalValue);
      
      // Calculate cumulative percentages
      const totalValue = sortedItems.reduce((sum, item) => sum + item.totalValue, 0);
      let cumulativeValue = 0;
      
      const abcItems: Array<{item: InventoryItem, cumulativePercentage: number}> = [];
      
      for (const item of sortedItems) {
        cumulativeValue += item.totalValue;
        const cumulativePercentage = (cumulativeValue / totalValue) * 100;
        abcItems.push({ item, cumulativePercentage });
      }
      
      // Categorize items
      const categoryA = abcItems.filter(item => item.cumulativePercentage <= 80);
      const categoryB = abcItems.filter(item => item.cumulativePercentage > 80 && item.cumulativePercentage <= 95);
      const categoryC = abcItems.filter(item => item.cumulativePercentage > 95);
      
      // Create ABC analysis results
      const results: ABCAnalysis[] = [
        {
          category: 'A',
          items: categoryA.map(item => item.item),
          count: categoryA.length,
          totalValue: categoryA.reduce((sum, item) => sum + item.item.totalValue, 0),
          percentage: categoryA.length > 0 ? (categoryA[categoryA.length - 1].cumulativePercentage) : 0,
          recommendations: [
            'Implement strict inventory control',
            'Frequent monitoring and review',
            'Consider vendor-managed inventory',
            'High priority for reorder optimization'
          ]
        },
        {
          category: 'B',
          items: categoryB.map(item => item.item),
          count: categoryB.length,
          totalValue: categoryB.reduce((sum, item) => sum + item.item.totalValue, 0),
          percentage: categoryB.length > 0 ? (categoryB[categoryB.length - 1].cumulativePercentage - categoryA[categoryA.length - 1]?.cumulativePercentage || 0) : 0,
          recommendations: [
            'Moderate inventory control',
            'Regular review cycles',
            'Standard reorder procedures',
            'Monitor for category changes'
          ]
        },
        {
          category: 'C',
          items: categoryC.map(item => item.item),
          count: categoryC.length,
          totalValue: categoryC.reduce((sum, item) => sum + item.item.totalValue, 0),
          percentage: categoryC.length > 0 ? (100 - (categoryB[categoryB.length - 1]?.cumulativePercentage || 0)) : 0,
          recommendations: [
            'Simple inventory control',
            'Less frequent reviews',
            'Bulk ordering strategies',
            'Consider consignment or drop-shipping'
          ]
        }
      ];
      
      return results;
    } catch (error) {
      console.error('Error performing ABC analysis:', error);
      throw new Error('Failed to perform ABC analysis');
    }
  }

  /**
   * Analyze reorder requirements
   */
  async analyzeReorderRequirements(): Promise<ReorderAnalysis[]> {
    try {
      const items = await this.getInventoryItems();
      const stockMovements = await this.getStockMovements();
      
      const reorderAnalysis: ReorderAnalysis[] = [];
      
      for (const item of items) {
        // Calculate average consumption
        const itemMovements = stockMovements.filter(movement => movement.itemId === item.id);
        const outMovements = itemMovements.filter(movement => movement.type === 'out');
        const totalConsumption = outMovements.reduce((sum, movement) => sum + movement.quantity, 0);
        const daysInPeriod = this.getDaysInPeriod();
        const averageConsumption = daysInPeriod > 0 ? totalConsumption / daysInPeriod : 0;
        
        // Calculate reorder point (safety stock + lead time consumption)
        const safetyStock = averageConsumption * 7; // 7 days safety stock
        const leadTimeConsumption = averageConsumption * item.leadTime;
        const reorderPoint = safetyStock + leadTimeConsumption;
        
        // Calculate reorder quantity (EOQ)
        const reorderQuantity = this.calculateEOQ(averageConsumption, item.unitCost);
        
        // Determine stockout risk
        const daysUntilStockout = item.currentStock / averageConsumption;
        let stockoutRisk: 'low' | 'medium' | 'high' = 'low';
        if (daysUntilStockout <= item.leadTime) {
          stockoutRisk = 'high';
        } else if (daysUntilStockout <= item.leadTime + 7) {
          stockoutRisk = 'medium';
        }
        
        // Determine urgency
        let urgency: 'immediate' | 'soon' | 'normal' = 'normal';
        if (item.currentStock <= reorderPoint) {
          urgency = 'immediate';
        } else if (item.currentStock <= reorderPoint * 1.2) {
          urgency = 'soon';
        }
        
        // Generate recommendations
        const recommendations: string[] = [];
        if (urgency === 'immediate') {
          recommendations.push('URGENT: Place reorder immediately');
        } else if (urgency === 'soon') {
          recommendations.push('Plan reorder within 1-2 days');
        }
        
        if (stockoutRisk === 'high') {
          recommendations.push('High stockout risk - consider increasing safety stock');
        }
        
        if (item.leadTime > 30) {
          recommendations.push('Long lead time - consider alternative suppliers');
        }
        
        reorderAnalysis.push({
          itemId: item.id,
          itemName: item.name,
          currentStock: item.currentStock,
          averageConsumption,
          leadTime: item.leadTime,
          reorderPoint,
          reorderQuantity,
          stockoutRisk,
          urgency,
          recommendations
        });
      }
      
      return reorderAnalysis.sort((a, b) => {
        if (a.urgency === 'immediate' && b.urgency !== 'immediate') return -1;
        if (b.urgency === 'immediate' && a.urgency !== 'immediate') return 1;
        if (a.stockoutRisk === 'high' && b.stockoutRisk !== 'high') return -1;
        if (b.stockoutRisk === 'high' && a.stockoutRisk !== 'high') return 1;
        return a.reorderPoint - a.currentStock - (b.reorderPoint - b.currentStock);
      });
    } catch (error) {
      console.error('Error analyzing reorder requirements:', error);
      throw new Error('Failed to analyze reorder requirements');
    }
  }

  /**
   * Calculate inventory metrics
   */
  async calculateInventoryMetrics(): Promise<InventoryMetrics> {
    try {
      const items = await this.getInventoryItems();
      const stockMovements = await this.getStockMovements();
      
      const totalItems = items.length;
      const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0);
      const averageItemValue = totalItems > 0 ? totalValue / totalItems : 0;
      
      // Calculate turnover ratio
      const totalConsumption = stockMovements
        .filter(movement => movement.type === 'out')
        .reduce((sum, movement) => sum + movement.totalValue, 0);
      const turnoverRatio = totalValue > 0 ? totalConsumption / totalValue : 0;
      
      // Calculate stockout rate
      const stockoutCount = items.filter(item => item.currentStock <= 0).length;
      const stockoutRate = totalItems > 0 ? (stockoutCount / totalItems) * 100 : 0;
      
      // Calculate carrying cost (assume 25% of inventory value)
      const carryingCost = totalValue * 0.25;
      
      // Calculate obsolescence risk
      const obsolescenceRisk = this.calculateObsolescenceRisk(items);
      
      // Identify top performers (high turnover, high value)
      const topPerformers = items
        .filter(item => item.totalValue > averageItemValue)
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, 10);
      
      // Identify slow moving items
      const slowMoving = items.filter(item => {
        const itemMovements = stockMovements.filter(movement => movement.itemId === item.id);
        const outMovements = itemMovements.filter(movement => movement.type === 'out');
        const totalConsumption = outMovements.reduce((sum, movement) => sum + movement.quantity, 0);
        return totalConsumption < item.currentStock * 0.1; // Less than 10% of stock consumed
      });
      
      // Identify dead stock (no movement in 90 days)
      const deadStock = items.filter(item => {
        const itemMovements = stockMovements.filter(movement => movement.itemId === item.id);
        const lastMovement = itemMovements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        if (!lastMovement) return true;
        const daysSinceLastMovement = (new Date().getTime() - new Date(lastMovement.date).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceLastMovement > 90;
      });
      
      return {
        totalItems,
        totalValue,
        averageItemValue,
        turnoverRatio,
        stockoutRate,
        carryingCost,
        obsolescenceRisk,
        topPerformers,
        slowMoving,
        deadStock
      };
    } catch (error) {
      console.error('Error calculating inventory metrics:', error);
      throw new Error('Failed to calculate inventory metrics');
    }
  }

  /**
   * Analyze inventory trends over time
   */
  async analyzeInventoryTrends(periods: number = 12): Promise<InventoryTrends[]> {
    try {
      const trends: InventoryTrends[] = [];
      const currentDate = new Date();
      
      for (let i = periods - 1; i >= 0; i--) {
        const periodStart = new Date(currentDate);
        periodStart.setMonth(periodStart.getMonth() - i);
        periodStart.setDate(1);
        
        const periodEnd = new Date(periodStart);
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        periodEnd.setDate(0);
        
        const periodItems = await this.getInventoryItemsForPeriod(periodStart, periodEnd);
        const periodMovements = await this.getStockMovementsForPeriod(periodStart, periodEnd);
        
        const totalValue = periodItems.reduce((sum, item) => sum + item.totalValue, 0);
        const totalQuantity = periodItems.reduce((sum, item) => sum + item.currentStock, 0);
        const averageUnitCost = totalQuantity > 0 ? totalValue / totalQuantity : 0;
        
        const totalConsumption = periodMovements
          .filter(movement => movement.type === 'out')
          .reduce((sum, movement) => sum + movement.totalValue, 0);
        const turnoverRatio = totalValue > 0 ? totalConsumption / totalValue : 0;
        
        const stockoutCount = periodItems.filter(item => item.currentStock <= 0).length;
        
        trends.push({
          period: periodStart.toISOString().slice(0, 7), // YYYY-MM format
          totalValue,
          totalQuantity,
          averageUnitCost,
          turnoverRatio,
          stockoutCount
        });
      }
      
      return trends;
    } catch (error) {
      console.error('Error analyzing inventory trends:', error);
      throw new Error('Failed to analyze inventory trends');
    }
  }

  /**
   * Analyze supplier performance
   */
  async analyzeSupplierPerformance(): Promise<SupplierAnalysis[]> {
    try {
      const items = await this.getInventoryItems();
      const stockMovements = await this.getStockMovements();
      
      // Group items by supplier
      const supplierMap = new Map<string, {
        items: InventoryItem[];
        movements: StockMovement[];
      }>();
      
      for (const item of items) {
        if (!supplierMap.has(item.supplier)) {
          supplierMap.set(item.supplier, { items: [], movements: [] });
        }
        supplierMap.get(item.supplier)!.items.push(item);
      }
      
      for (const movement of stockMovements) {
        const item = items.find(i => i.id === movement.itemId);
        if (item && supplierMap.has(item.supplier)) {
          supplierMap.get(item.supplier)!.movements.push(movement);
        }
      }
      
      const supplierAnalysis: SupplierAnalysis[] = [];
      
      for (const [supplierName, data] of supplierMap) {
        const totalItems = data.items.length;
        const totalValue = data.items.reduce((sum, item) => sum + item.totalValue, 0);
        
        // Calculate average lead time (simplified)
        const averageLeadTime = data.items.reduce((sum, item) => sum + item.leadTime, 0) / totalItems;
        
        // Calculate reliability (based on stockout rate)
        const stockoutCount = data.items.filter(item => item.currentStock <= 0).length;
        const reliability = totalItems > 0 ? ((totalItems - stockoutCount) / totalItems) * 100 : 0;
        
        // Calculate quality (simplified - based on return rate)
        const quality = 95; // Simplified for now
        
        const recommendations: string[] = [];
        if (reliability < 80) {
          recommendations.push('Improve supply reliability');
        }
        if (averageLeadTime > 30) {
          recommendations.push('Reduce lead times');
        }
        if (totalValue > 100000) {
          recommendations.push('Consider volume discounts');
        }
        
        supplierAnalysis.push({
          supplierId: supplierName, // Using name as ID for now
          supplierName,
          totalItems,
          totalValue,
          averageLeadTime,
          reliability,
          quality,
          recommendations
        });
      }
      
      return supplierAnalysis.sort((a, b) => b.totalValue - a.totalValue);
    } catch (error) {
      console.error('Error analyzing supplier performance:', error);
      throw new Error('Failed to analyze supplier performance');
    }
  }

  // Helper methods
  private async getInventoryItems(): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('mst_stock_item')
      .select('*')
      .eq('company_id', this.companyId);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // This is a simplified version - in reality, you'd need to calculate current stock
    // from inventory transactions
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      code: item.code || '',
      uom: item.uom || '',
      currentStock: 100, // Simplified
      unitCost: 50, // Simplified
      totalValue: 5000, // Simplified
      category: item.stock_group || '',
      supplier: 'Default Supplier', // Simplified
      lastMovementDate: new Date().toISOString(),
      averageConsumption: 10, // Simplified
      leadTime: 15 // Simplified
    }));
  }

  private async getStockMovements(): Promise<StockMovement[]> {
    const { data, error } = await supabase
      .from('trn_inventory')
      .select(`
        *,
        mst_stock_item!inner(name)
      `)
      .eq('company_id', this.companyId)
      .order('date', { ascending: false });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return (data || []).map(movement => ({
      itemId: movement.stock_item_id,
      itemName: movement.mst_stock_item.name,
      date: movement.date,
      type: movement.quantity > 0 ? 'in' : 'out',
      quantity: Math.abs(movement.quantity),
      unitCost: movement.unit_cost || 0,
      totalValue: Math.abs(movement.quantity) * (movement.unit_cost || 0),
      reference: movement.reference || '',
      reason: movement.reason || ''
    }));
  }

  private getDaysInPeriod(): number {
    // Simplified - return 30 days
    return 30;
  }

  private calculateEOQ(annualDemand: number, unitCost: number): number {
    // Simplified EOQ calculation
    const orderingCost = 100; // Simplified
    const holdingCost = unitCost * 0.25; // 25% of unit cost
    
    return Math.sqrt((2 * annualDemand * orderingCost) / holdingCost);
  }

  private calculateObsolescenceRisk(items: InventoryItem[]): number {
    // Simplified obsolescence risk calculation
    const slowMovingItems = items.filter(item => item.averageConsumption < item.currentStock * 0.1);
    return items.length > 0 ? (slowMovingItems.length / items.length) * 100 : 0;
  }

  private async getInventoryItemsForPeriod(startDate: Date, endDate: Date): Promise<InventoryItem[]> {
    // Simplified - return current items
    return await this.getInventoryItems();
  }

  private async getStockMovementsForPeriod(startDate: Date, endDate: Date): Promise<StockMovement[]> {
    const { data, error } = await supabase
      .from('trn_inventory')
      .select(`
        *,
        mst_stock_item!inner(name)
      `)
      .eq('company_id', this.companyId)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .order('date', { ascending: false });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return (data || []).map(movement => ({
      itemId: movement.stock_item_id,
      itemName: movement.mst_stock_item.name,
      date: movement.date,
      type: movement.quantity > 0 ? 'in' : 'out',
      quantity: Math.abs(movement.quantity),
      unitCost: movement.unit_cost || 0,
      totalValue: Math.abs(movement.quantity) * (movement.unit_cost || 0),
      reference: movement.reference || '',
      reason: movement.reason || ''
    }));
  }
}

export default InventoryAnalytics;
