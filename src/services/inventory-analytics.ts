/**
 * Inventory Analytics Service
 * Currently using mock data - will be replaced with real database queries
 */

import { mockInventoryAnalytics, type InventoryItem, type StockMovement, type InventoryAnalysis } from './mock-inventory-analytics';

// Re-export types and use mock service for now
export { type InventoryItem, type StockMovement, type InventoryAnalysis };

export const inventoryAnalytics = mockInventoryAnalytics;