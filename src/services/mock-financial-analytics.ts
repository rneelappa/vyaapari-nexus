/**
 * Mock Financial Analytics Service
 * Provides mock data for financial analytics until database columns are properly set up
 */

export interface FinancialPeriod {
  startDate: string;
  endDate: string;
}

export interface ProfitLossData {
  revenue: {
    total: number;
    breakdown: Record<string, number>;
  };
  expenses: {
    total: number;
    breakdown: Record<string, number>;
  };
  grossProfit: number;
  operatingProfit: number;
  netProfit: number;
  margins: {
    grossMargin: number;
    operatingMargin: number;
    netMargin: number;
  };
}

export interface BalanceSheetData {
  assets: {
    total: number;
    current: number;
    fixed: number;
    breakdown: Record<string, number>;
  };
  liabilities: {
    total: number;
    current: number;
    longTerm: number;
    breakdown: Record<string, number>;
  };
  equity: {
    total: number;
    paidUp: number;
    retained: number;
  };
}

export interface FinancialMetrics {
  profitability: {
    grossMargin: number;
    operatingMargin: number;
    netMargin: number;
    returnOnAssets: number;
    returnOnEquity: number;
  };
  liquidity: {
    currentRatio: number;
    quickRatio: number;
    cashRatio: number;
  };
  efficiency: {
    assetTurnover: number;
    inventoryTurnover: number;
    receivablesTurnover: number;
  };
  leverage: {
    debtToAssets: number;
    debtToEquity: number;
    interestCoverage: number;
  };
}

class MockFinancialAnalytics {
  async generateProfitLoss(period: FinancialPeriod): Promise<ProfitLossData> {
    // Mock P&L data
    return {
      revenue: {
        total: 1500000,
        breakdown: {
          'Product Sales': 1200000,
          'Service Revenue': 300000
        }
      },
      expenses: {
        total: 1100000,
        breakdown: {
          'Cost of Goods Sold': 800000,
          'Operating Expenses': 200000,
          'Administrative Expenses': 100000
        }
      },
      grossProfit: 700000,
      operatingProfit: 500000,
      netProfit: 400000,
      margins: {
        grossMargin: 46.67,
        operatingMargin: 33.33,
        netMargin: 26.67
      }
    };
  }

  async generateBalanceSheet(period: FinancialPeriod): Promise<BalanceSheetData> {
    // Mock balance sheet data
    return {
      assets: {
        total: 2500000,
        current: 1000000,
        fixed: 1500000,
        breakdown: {
          'Cash': 200000,
          'Accounts Receivable': 300000,
          'Inventory': 500000,
          'Equipment': 800000,
          'Buildings': 700000
        }
      },
      liabilities: {
        total: 1000000,
        current: 400000,
        longTerm: 600000,
        breakdown: {
          'Accounts Payable': 200000,
          'Short-term Loans': 200000,
          'Long-term Debt': 600000
        }
      },
      equity: {
        total: 1500000,
        paidUp: 1000000,
        retained: 500000
      }
    };
  }

  async calculateFinancialMetrics(period: FinancialPeriod): Promise<FinancialMetrics> {
    // Mock financial metrics
    return {
      profitability: {
        grossMargin: 46.67,
        operatingMargin: 33.33,
        netMargin: 26.67,
        returnOnAssets: 16.0,
        returnOnEquity: 26.67
      },
      liquidity: {
        currentRatio: 2.5,
        quickRatio: 1.25,
        cashRatio: 0.5
      },
      efficiency: {
        assetTurnover: 0.6,
        inventoryTurnover: 3.0,
        receivablesTurnover: 5.0
      },
      leverage: {
        debtToAssets: 0.4,
        debtToEquity: 0.67,
        interestCoverage: 8.33
      }
    };
  }

  async getCashFlow(period: FinancialPeriod) {
    return {
      operating: 450000,
      investing: -200000,
      financing: -100000,
      netCashFlow: 150000,
      openingBalance: 150000,
      closingBalance: 300000
    };
  }

  async getFinancialRatios(period: FinancialPeriod) {
    return {
      liquidity: {
        currentRatio: 2.5,
        quickRatio: 1.25,
        cashRatio: 0.5
      },
      activity: {
        receivablesTurnover: 5.0,
        inventoryTurnover: 3.0,
        assetTurnover: 0.6
      },
      profitability: {
        grossProfitMargin: 46.67,
        operatingMargin: 33.33,
        netProfitMargin: 26.67,
        returnOnAssets: 16.0,
        returnOnEquity: 26.67
      },
      leverage: {
        debtRatio: 0.4,
        debtToEquity: 0.67,
        interestCoverage: 8.33
      }
    };
  }
}

export const mockFinancialAnalytics = new MockFinancialAnalytics();