/**
 * Financial Analytics Service
 * Currently using mock data - will be replaced with real database queries
 */

import { mockFinancialAnalytics, type FinancialPeriod, type ProfitLossData, type BalanceSheetData, type FinancialMetrics } from './mock-financial-analytics';

// Re-export types and use mock service for now
export { type FinancialPeriod, type ProfitLossData, type BalanceSheetData, type FinancialMetrics };

export const financialAnalytics = mockFinancialAnalytics;