/**
 * Sales Analytics Service
 * Currently using mock data - will be replaced with real database queries
 */

import { mockSalesAnalytics, type SalesAnalysis, type SalesMetrics, type SalesPipeline } from './mock-sales-analytics';

// Re-export types and use mock service for now
export { type SalesAnalysis, type SalesMetrics, type SalesPipeline };

export const salesAnalytics = mockSalesAnalytics;