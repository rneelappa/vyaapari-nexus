/**
 * Mock Inventory Analytics Service
 * Provides mock data for inventory analytics until database schema is properly set up
 */

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

export interface StockMovement {
  id: string;
  stock_item_id: string;
  item_name: string;
  date: string;
  movement_type: string;
  quantity: number;
  unit_cost: number;
  total_value: number;
  reference: string;
  reason: string;
}

export interface InventoryAnalysis {
  totalItems: number;
  totalValue: number;
  averageTurnover: number;
  stockoutItems: number;
  overstockItems: number;
  categoryBreakdown: Record<string, number>;
  movementTrends: Array<{
    date: string;
    inward: number;
    outward: number;
  }>;
}

class MockInventoryAnalytics {
  async getInventoryOverview(): Promise<InventoryAnalysis> {
    return {
      totalItems: 150,
      totalValue: 2500000,
      averageTurnover: 6.5,
      stockoutItems: 5,
      overstockItems: 12,
      categoryBreakdown: {
        'Raw Materials': 800000,
        'Work in Progress': 400000,
        'Finished Goods': 1000000,
        'Consumables': 300000
      },
      movementTrends: [
        { date: '2024-01-01', inward: 50000, outward: 45000 },
        { date: '2024-01-02', inward: 60000, outward: 55000 },
        { date: '2024-01-03', inward: 55000, outward: 50000 }
      ]
    };
  }

  async getCurrentInventory(): Promise<InventoryItem[]> {
    return [
      {
        id: '1',
        name: 'Product A',
        code: 'PA001',
        uom: 'Pcs',
        currentStock: 100,
        unitCost: 50,
        totalValue: 5000,
        category: 'Finished Goods',
        supplier: 'Supplier A',
        lastMovementDate: '2024-01-15',
        averageConsumption: 10,
        leadTime: 15
      },
      {
        id: '2',
        name: 'Raw Material B',
        code: 'RM002',
        uom: 'Kg',
        currentStock: 500,
        unitCost: 25,
        totalValue: 12500,
        category: 'Raw Materials',
        supplier: 'Supplier B',
        lastMovementDate: '2024-01-14',
        averageConsumption: 50,
        leadTime: 7
      }
    ];
  }

  async getStockMovements(): Promise<StockMovement[]> {
    return [
      {
        id: '1',
        stock_item_id: '1',
        item_name: 'Product A',
        date: '2024-01-15',
        movement_type: 'Inward',
        quantity: 50,
        unit_cost: 50,
        total_value: 2500,
        reference: 'PO001',
        reason: 'Purchase'
      },
      {
        id: '2',
        stock_item_id: '1',
        item_name: 'Product A',
        date: '2024-01-16',
        movement_type: 'Outward',
        quantity: 25,
        unit_cost: 50,
        total_value: 1250,
        reference: 'SO001',
        reason: 'Sale'
      }
    ];
  }

  async getSlowMovingItems(): Promise<StockMovement[]> {
    return [
      {
        id: '3',
        stock_item_id: '3',
        item_name: 'Old Product C',
        date: '2023-12-01',
        movement_type: 'Inward',
        quantity: 100,
        unit_cost: 30,
        total_value: 3000,
        reference: 'PO002',
        reason: 'No recent movement'
      }
    ];
  }

  async getInventoryTurnover() {
    return {
      overall: 6.5,
      byCategory: {
        'Raw Materials': 8.2,
        'Work in Progress': 12.0,
        'Finished Goods': 5.5,
        'Consumables': 15.0
      },
      trends: [
        { period: '2024-Q1', turnover: 6.2 },
        { period: '2024-Q2', turnover: 6.8 },
        { period: '2024-Q3', turnover: 6.5 }
      ]
    };
  }

  async getABCAnalysis() {
    return {
      categoryA: { items: 15, percentage: 10, value: 80 },
      categoryB: { items: 45, percentage: 30, value: 15 },
      categoryC: { items: 90, percentage: 60, value: 5 }
    };
  }

  async getStockLevels() {
    return {
      adequate: 120,
      reorderPoint: 15,
      stockout: 5,
      overstock: 10,
      total: 150
    };
  }
}

export const mockInventoryAnalytics = new MockInventoryAnalytics();