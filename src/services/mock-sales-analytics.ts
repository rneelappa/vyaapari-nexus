/**
 * Mock Sales Analytics Service
 * Provides mock data for sales analytics until database schema is properly set up
 */

export interface SalesAnalysis {
  period: {
    current: number;
    previous: number;
    growth: number;
    growthPercentage: number;
  };
  trends: Array<{
    date: string;
    amount: number;
  }>;
  breakdown: {
    byProduct: Array<{
      product: string;
      revenue: number;
      percentage: number;
    }>;
    byCustomer: Array<{
      customer: string;
      revenue: number;
      percentage: number;
    }>;
    byRegion: Array<{
      region: string;
      revenue: number;
      percentage: number;
    }>;
    bySalesperson: Array<{
      salesperson: string;
      revenue: number;
      percentage: number;
    }>;
  };
}

export interface SalesMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  customerAcquisitionCost: number;
  customerLifetimeValue: number;
}

export interface SalesPipeline {
  stages: Array<{
    name: string;
    count: number;
    value: number;
    conversionRate: number;
  }>;
  totalValue: number;
  averageDealSize: number;
  salesCycle: number;
}

class MockSalesAnalytics {
  async analyzeRevenue(period: { startDate: string; endDate: string }): Promise<SalesAnalysis> {
    return {
      period: {
        current: 1500000,
        previous: 1200000,
        growth: 300000,
        growthPercentage: 25
      },
      trends: [
        { date: '2024-01-01', amount: 45000 },
        { date: '2024-01-02', amount: 52000 },
        { date: '2024-01-03', amount: 48000 },
        { date: '2024-01-04', amount: 55000 },
        { date: '2024-01-05', amount: 50000 }
      ],
      breakdown: {
        byProduct: [
          { product: 'Product A', revenue: 600000, percentage: 40 },
          { product: 'Product B', revenue: 450000, percentage: 30 },
          { product: 'Product C', revenue: 300000, percentage: 20 },
          { product: 'Others', revenue: 150000, percentage: 10 }
        ],
        byCustomer: [
          { customer: 'Customer A', revenue: 400000, percentage: 26.67 },
          { customer: 'Customer B', revenue: 350000, percentage: 23.33 },
          { customer: 'Customer C', revenue: 300000, percentage: 20 },
          { customer: 'Others', revenue: 450000, percentage: 30 }
        ],
        byRegion: [
          { region: 'North', revenue: 600000, percentage: 40 },
          { region: 'South', revenue: 450000, percentage: 30 },
          { region: 'East', revenue: 300000, percentage: 20 },
          { region: 'West', revenue: 150000, percentage: 10 }
        ],
        bySalesperson: [
          { salesperson: 'John Doe', revenue: 500000, percentage: 33.33 },
          { salesperson: 'Jane Smith', revenue: 400000, percentage: 26.67 },
          { salesperson: 'Bob Johnson', revenue: 350000, percentage: 23.33 },
          { salesperson: 'Others', revenue: 250000, percentage: 16.67 }
        ]
      }
    };
  }

  async getSalesMetrics(): Promise<SalesMetrics> {
    return {
      totalRevenue: 1500000,
      totalOrders: 1250,
      averageOrderValue: 1200,
      conversionRate: 12.5,
      customerAcquisitionCost: 150,
      customerLifetimeValue: 5000
    };
  }

  async getSalesPipeline(): Promise<SalesPipeline> {
    return {
      stages: [
        { name: 'Lead', count: 100, value: 500000, conversionRate: 50 },
        { name: 'Qualified', count: 50, value: 400000, conversionRate: 60 },
        { name: 'Proposal', count: 30, value: 300000, conversionRate: 70 },
        { name: 'Negotiation', count: 21, value: 250000, conversionRate: 80 },
        { name: 'Closed Won', count: 17, value: 200000, conversionRate: 100 }
      ],
      totalValue: 1650000,
      averageDealSize: 12000,
      salesCycle: 45
    };
  }

  async getTopPerformers() {
    return {
      products: [
        { name: 'Product A', revenue: 600000, units: 1200 },
        { name: 'Product B', revenue: 450000, units: 900 },
        { name: 'Product C', revenue: 300000, units: 600 }
      ],
      customers: [
        { name: 'Customer A', revenue: 400000, orders: 80 },
        { name: 'Customer B', revenue: 350000, orders: 70 },
        { name: 'Customer C', revenue: 300000, orders: 60 }
      ],
      salespersons: [
        { name: 'John Doe', revenue: 500000, deals: 42 },
        { name: 'Jane Smith', revenue: 400000, deals: 35 },
        { name: 'Bob Johnson', revenue: 350000, deals: 30 }
      ]
    };
  }

  async getSalesForecasting() {
    return {
      nextQuarter: 1650000,
      confidence: 85,
      trends: [
        { month: '2024-04', forecast: 520000, actual: 500000 },
        { month: '2024-05', forecast: 540000, actual: 520000 },
        { month: '2024-06', forecast: 560000, actual: null }
      ]
    };
  }

  async getCustomerAnalysis() {
    return {
      newCustomers: 45,
      returningCustomers: 180,
      churnRate: 8.5,
      retentionRate: 91.5,
      averageLifetime: 24,
      segments: {
        high_value: { count: 25, revenue: 750000 },
        medium_value: { count: 100, revenue: 600000 },
        low_value: { count: 125, revenue: 150000 }
      }
    };
  }

  async getConversionAnalysis() {
    return {
      funnelStages: [
        { stage: 'Visitors', count: 10000, conversionRate: 100 },
        { stage: 'Leads', count: 1000, conversionRate: 10 },
        { stage: 'Qualified', count: 500, conversionRate: 5 },
        { stage: 'Customers', count: 125, conversionRate: 1.25 }
      ],
      channels: {
        organic: { visitors: 4000, conversions: 60, rate: 1.5 },
        paid: { visitors: 3000, conversions: 45, rate: 1.5 },
        referral: { visitors: 2000, conversions: 15, rate: 0.75 },
        direct: { visitors: 1000, conversions: 5, rate: 0.5 }
      }
    };
  }
}

export const mockSalesAnalytics = new MockSalesAnalytics();