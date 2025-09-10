/**
 * Financial Analytics Engine
 * Provides comprehensive financial analysis including P&L, Balance Sheet, and Cash Flow
 * Built on Tally ERP data with advanced calculations and insights
 */

import { supabase } from '@/integrations/supabase/client';

export interface FinancialPeriod {
  startDate: string;
  endDate: string;
  periodType: 'monthly' | 'quarterly' | 'yearly' | 'custom';
}

export interface ProfitLossData {
  revenue: {
    total: number;
    breakdown: Array<{
      account: string;
      amount: number;
      percentage: number;
    }>;
  };
  expenses: {
    total: number;
    breakdown: Array<{
      account: string;
      amount: number;
      percentage: number;
    }>;
  };
  grossProfit: number;
  operatingProfit: number;
  netProfit: number;
  margins: {
    grossMargin: number;
    operatingMargin: number;
    netMargin: number;
  };
  trends: {
    revenueGrowth: number;
    expenseGrowth: number;
    profitGrowth: number;
  };
}

export interface BalanceSheetData {
  assets: {
    current: {
      total: number;
      breakdown: Array<{
        account: string;
        amount: number;
        percentage: number;
      }>;
    };
    fixed: {
      total: number;
      breakdown: Array<{
        account: string;
        amount: number;
        percentage: number;
      }>;
    };
    total: number;
  };
  liabilities: {
    current: {
      total: number;
      breakdown: Array<{
        account: string;
        amount: number;
        percentage: number;
      }>;
    };
    longTerm: {
      total: number;
      breakdown: Array<{
        account: string;
        amount: number;
        percentage: number;
      }>;
    };
    total: number;
  };
  equity: {
    total: number;
    breakdown: Array<{
      account: string;
      amount: number;
      percentage: number;
    }>;
  };
  ratios: {
    currentRatio: number;
    quickRatio: number;
    debtToEquity: number;
    returnOnEquity: number;
  };
}

export interface CashFlowData {
  operating: {
    netIncome: number;
    adjustments: Array<{
      description: string;
      amount: number;
    }>;
    workingCapitalChanges: number;
    total: number;
  };
  investing: {
    total: number;
    breakdown: Array<{
      description: string;
      amount: number;
    }>;
  };
  financing: {
    total: number;
    breakdown: Array<{
      description: string;
      amount: number;
    }>;
  };
  netCashFlow: number;
  beginningCash: number;
  endingCash: number;
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
    debtToEquity: number;
    debtToAssets: number;
    interestCoverage: number;
  };
}

class FinancialAnalytics {
  private companyId: string;

  constructor(companyId: string) {
    this.companyId = companyId;
  }

  /**
   * Generate Profit & Loss Statement
   */
  async generateProfitLoss(period: FinancialPeriod): Promise<ProfitLossData> {
    try {
      // Get revenue accounts
      const revenueData = await this.getAccountData('revenue', period);
      
      // Get expense accounts
      const expenseData = await this.getAccountData('expense', period);
      
      // Calculate totals
      const totalRevenue = revenueData.reduce((sum, item) => sum + item.amount, 0);
      const totalExpenses = expenseData.reduce((sum, item) => sum + item.amount, 0);
      
      // Calculate profits
      const grossProfit = totalRevenue - this.getCostOfGoodsSold(expenseData);
      const operatingProfit = grossProfit - this.getOperatingExpenses(expenseData);
      const netProfit = operatingProfit - this.getOtherExpenses(expenseData);
      
      // Calculate margins
      const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
      const operatingMargin = totalRevenue > 0 ? (operatingProfit / totalRevenue) * 100 : 0;
      const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
      
      // Calculate trends (compare with previous period)
      const previousPeriod = this.getPreviousPeriod(period);
      const previousRevenue = await this.getTotalRevenue(previousPeriod);
      const previousExpenses = await this.getTotalExpenses(previousPeriod);
      const previousProfit = previousRevenue - previousExpenses;
      
      const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
      const expenseGrowth = previousExpenses > 0 ? ((totalExpenses - previousExpenses) / previousExpenses) * 100 : 0;
      const profitGrowth = previousProfit !== 0 ? ((netProfit - previousProfit) / Math.abs(previousProfit)) * 100 : 0;
      
      return {
        revenue: {
          total: totalRevenue,
          breakdown: revenueData.map(item => ({
            account: item.account,
            amount: item.amount,
            percentage: totalRevenue > 0 ? (item.amount / totalRevenue) * 100 : 0
          }))
        },
        expenses: {
          total: totalExpenses,
          breakdown: expenseData.map(item => ({
            account: item.account,
            amount: item.amount,
            percentage: totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0
          }))
        },
        grossProfit,
        operatingProfit,
        netProfit,
        margins: {
          grossMargin,
          operatingMargin,
          netMargin
        },
        trends: {
          revenueGrowth,
          expenseGrowth,
          profitGrowth
        }
      };
    } catch (error) {
      console.error('Error generating P&L:', error);
      throw new Error('Failed to generate Profit & Loss statement');
    }
  }

  /**
   * Generate Balance Sheet
   */
  async generateBalanceSheet(period: FinancialPeriod): Promise<BalanceSheetData> {
    try {
      // Get asset accounts
      const currentAssets = await this.getAccountData('current_assets', period);
      const fixedAssets = await this.getAccountData('fixed_assets', period);
      
      // Get liability accounts
      const currentLiabilities = await this.getAccountData('current_liabilities', period);
      const longTermLiabilities = await this.getAccountData('long_term_liabilities', period);
      
      // Get equity accounts
      const equity = await this.getAccountData('equity', period);
      
      // Calculate totals
      const totalCurrentAssets = currentAssets.reduce((sum, item) => sum + item.amount, 0);
      const totalFixedAssets = fixedAssets.reduce((sum, item) => sum + item.amount, 0);
      const totalAssets = totalCurrentAssets + totalFixedAssets;
      
      const totalCurrentLiabilities = currentLiabilities.reduce((sum, item) => sum + item.amount, 0);
      const totalLongTermLiabilities = longTermLiabilities.reduce((sum, item) => sum + item.amount, 0);
      const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;
      
      const totalEquity = equity.reduce((sum, item) => sum + item.amount, 0);
      
      // Calculate ratios
      const currentRatio = totalCurrentLiabilities > 0 ? totalCurrentAssets / totalCurrentLiabilities : 0;
      const quickRatio = this.calculateQuickRatio(currentAssets, currentLiabilities);
      const debtToEquity = totalEquity > 0 ? totalLiabilities / totalEquity : 0;
      const returnOnEquity = await this.calculateReturnOnEquity(period);
      
      return {
        assets: {
          current: {
            total: totalCurrentAssets,
            breakdown: currentAssets.map(item => ({
              account: item.account,
              amount: item.amount,
              percentage: totalCurrentAssets > 0 ? (item.amount / totalCurrentAssets) * 100 : 0
            }))
          },
          fixed: {
            total: totalFixedAssets,
            breakdown: fixedAssets.map(item => ({
              account: item.account,
              amount: item.amount,
              percentage: totalFixedAssets > 0 ? (item.amount / totalFixedAssets) * 100 : 0
            }))
          },
          total: totalAssets
        },
        liabilities: {
          current: {
            total: totalCurrentLiabilities,
            breakdown: currentLiabilities.map(item => ({
              account: item.account,
              amount: item.amount,
              percentage: totalCurrentLiabilities > 0 ? (item.amount / totalCurrentLiabilities) * 100 : 0
            }))
          },
          longTerm: {
            total: totalLongTermLiabilities,
            breakdown: longTermLiabilities.map(item => ({
              account: item.account,
              amount: item.amount,
              percentage: totalLongTermLiabilities > 0 ? (item.amount / totalLongTermLiabilities) * 100 : 0
            }))
          },
          total: totalLiabilities
        },
        equity: {
          total: totalEquity,
          breakdown: equity.map(item => ({
            account: item.account,
            amount: item.amount,
            percentage: totalEquity > 0 ? (item.amount / totalEquity) * 100 : 0
          }))
        },
        ratios: {
          currentRatio,
          quickRatio,
          debtToEquity,
          returnOnEquity
        }
      };
    } catch (error) {
      console.error('Error generating Balance Sheet:', error);
      throw new Error('Failed to generate Balance Sheet');
    }
  }

  /**
   * Generate Cash Flow Statement
   */
  async generateCashFlow(period: FinancialPeriod): Promise<CashFlowData> {
    try {
      // Get net income from P&L
      const pnlData = await this.generateProfitLoss(period);
      const netIncome = pnlData.netProfit;
      
      // Calculate operating cash flow
      const operatingAdjustments = await this.getOperatingAdjustments(period);
      const workingCapitalChanges = await this.getWorkingCapitalChanges(period);
      const operatingCashFlow = netIncome + operatingAdjustments.reduce((sum, adj) => sum + adj.amount, 0) + workingCapitalChanges;
      
      // Get investing activities
      const investingActivities = await this.getInvestingActivities(period);
      const totalInvesting = investingActivities.reduce((sum, item) => sum + item.amount, 0);
      
      // Get financing activities
      const financingActivities = await this.getFinancingActivities(period);
      const totalFinancing = financingActivities.reduce((sum, item) => sum + item.amount, 0);
      
      // Calculate net cash flow
      const netCashFlow = operatingCashFlow + totalInvesting + totalFinancing;
      
      // Get beginning and ending cash
      const beginningCash = await this.getBeginningCash(period);
      const endingCash = beginningCash + netCashFlow;
      
      return {
        operating: {
          netIncome,
          adjustments: operatingAdjustments,
          workingCapitalChanges,
          total: operatingCashFlow
        },
        investing: {
          total: totalInvesting,
          breakdown: investingActivities
        },
        financing: {
          total: totalFinancing,
          breakdown: financingActivities
        },
        netCashFlow,
        beginningCash,
        endingCash
      };
    } catch (error) {
      console.error('Error generating Cash Flow:', error);
      throw new Error('Failed to generate Cash Flow statement');
    }
  }

  /**
   * Calculate comprehensive financial metrics
   */
  async calculateFinancialMetrics(period: FinancialPeriod): Promise<FinancialMetrics> {
    try {
      const pnlData = await this.generateProfitLoss(period);
      const balanceSheetData = await this.generateBalanceSheet(period);
      
      // Profitability ratios
      const returnOnAssets = await this.calculateReturnOnAssets(period, pnlData.netProfit, balanceSheetData.assets.total);
      
      // Liquidity ratios
      const cashRatio = await this.calculateCashRatio(period);
      
      // Efficiency ratios
      const assetTurnover = await this.calculateAssetTurnover(period, pnlData.revenue.total, balanceSheetData.assets.total);
      const inventoryTurnover = await this.calculateInventoryTurnover(period);
      const receivablesTurnover = await this.calculateReceivablesTurnover(period);
      
      // Leverage ratios
      const debtToAssets = balanceSheetData.assets.total > 0 ? balanceSheetData.liabilities.total / balanceSheetData.assets.total : 0;
      const interestCoverage = await this.calculateInterestCoverage(period, pnlData.operatingProfit);
      
      return {
        profitability: {
          grossMargin: pnlData.margins.grossMargin,
          operatingMargin: pnlData.margins.operatingMargin,
          netMargin: pnlData.margins.netMargin,
          returnOnAssets,
          returnOnEquity: balanceSheetData.ratios.returnOnEquity
        },
        liquidity: {
          currentRatio: balanceSheetData.ratios.currentRatio,
          quickRatio: balanceSheetData.ratios.quickRatio,
          cashRatio
        },
        efficiency: {
          assetTurnover,
          inventoryTurnover,
          receivablesTurnover
        },
        leverage: {
          debtToEquity: balanceSheetData.ratios.debtToEquity,
          debtToAssets,
          interestCoverage
        }
      };
    } catch (error) {
      console.error('Error calculating financial metrics:', error);
      throw new Error('Failed to calculate financial metrics');
    }
  }

  // Helper methods
  private async getAccountData(accountType: string, period: FinancialPeriod): Promise<Array<{account: string, amount: number}>> {
    const { data, error } = await supabase
      .from('trn_accounting')
      .select(`
        mst_ledger!inner(name, primary_group),
        debit,
        credit
      `)
      .eq('company_id', this.companyId)
      .gte('created_at', period.startDate)
      .lte('created_at', period.endDate);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Group by account and calculate net amount
    const accountMap = new Map<string, number>();
    
    for (const entry of data || []) {
      const accountName = entry.mst_ledger.name;
      const netAmount = (entry.debit || 0) - (entry.credit || 0);
      
      if (accountMap.has(accountName)) {
        accountMap.set(accountName, accountMap.get(accountName)! + netAmount);
      } else {
        accountMap.set(accountName, netAmount);
      }
    }

    return Array.from(accountMap.entries()).map(([account, amount]) => ({
      account,
      amount: Math.abs(amount)
    }));
  }

  private getCostOfGoodsSold(expenseData: Array<{account: string, amount: number}>): number {
    const cogsAccounts = ['Cost of Goods Sold', 'Direct Materials', 'Direct Labor', 'Manufacturing Overhead'];
    return expenseData
      .filter(item => cogsAccounts.some(cogs => item.account.includes(cogs)))
      .reduce((sum, item) => sum + item.amount, 0);
  }

  private getOperatingExpenses(expenseData: Array<{account: string, amount: number}>): number {
    const operatingAccounts = ['Operating Expenses', 'Selling Expenses', 'Administrative Expenses'];
    return expenseData
      .filter(item => operatingAccounts.some(op => item.account.includes(op)))
      .reduce((sum, item) => sum + item.amount, 0);
  }

  private getOtherExpenses(expenseData: Array<{account: string, amount: number}>): number {
    const otherAccounts = ['Interest Expense', 'Tax Expense', 'Other Expenses'];
    return expenseData
      .filter(item => otherAccounts.some(other => item.account.includes(other)))
      .reduce((sum, item) => sum + item.amount, 0);
  }

  private getPreviousPeriod(period: FinancialPeriod): FinancialPeriod {
    const startDate = new Date(period.startDate);
    const endDate = new Date(period.endDate);
    const duration = endDate.getTime() - startDate.getTime();
    
    return {
      startDate: new Date(startDate.getTime() - duration).toISOString().split('T')[0],
      endDate: new Date(endDate.getTime() - duration).toISOString().split('T')[0],
      periodType: period.periodType
    };
  }

  private async getTotalRevenue(period: FinancialPeriod): Promise<number> {
    const revenueData = await this.getAccountData('revenue', period);
    return revenueData.reduce((sum, item) => sum + item.amount, 0);
  }

  private async getTotalExpenses(period: FinancialPeriod): Promise<number> {
    const expenseData = await this.getAccountData('expense', period);
    return expenseData.reduce((sum, item) => sum + item.amount, 0);
  }

  private calculateQuickRatio(currentAssets: Array<{account: string, amount: number}>, currentLiabilities: Array<{account: string, amount: number}>): number {
    const liquidAssets = currentAssets
      .filter(item => !item.account.includes('Inventory'))
      .reduce((sum, item) => sum + item.amount, 0);
    const totalCurrentLiabilities = currentLiabilities.reduce((sum, item) => sum + item.amount, 0);
    
    return totalCurrentLiabilities > 0 ? liquidAssets / totalCurrentLiabilities : 0;
  }

  private async calculateReturnOnEquity(period: FinancialPeriod): Promise<number> {
    const pnlData = await this.generateProfitLoss(period);
    const balanceSheetData = await this.generateBalanceSheet(period);
    
    return balanceSheetData.equity.total > 0 ? (pnlData.netProfit / balanceSheetData.equity.total) * 100 : 0;
  }

  private async getOperatingAdjustments(period: FinancialPeriod): Promise<Array<{description: string, amount: number}>> {
    // This would typically involve depreciation, amortization, etc.
    // For now, return empty array
    return [];
  }

  private async getWorkingCapitalChanges(period: FinancialPeriod): Promise<number> {
    // Calculate changes in working capital
    return 0; // Simplified for now
  }

  private async getInvestingActivities(period: FinancialPeriod): Promise<Array<{description: string, amount: number}>> {
    // Get capital expenditures, asset purchases, etc.
    return []; // Simplified for now
  }

  private async getFinancingActivities(period: FinancialPeriod): Promise<Array<{description: string, amount: number}>> {
    // Get loan proceeds, equity issuances, dividends, etc.
    return []; // Simplified for now
  }

  private async getBeginningCash(period: FinancialPeriod): Promise<number> {
    // Get cash balance at beginning of period
    return 0; // Simplified for now
  }

  private async calculateReturnOnAssets(netProfit: number, totalAssets: number): Promise<number> {
    return totalAssets > 0 ? (netProfit / totalAssets) * 100 : 0;
  }

  private async calculateCashRatio(period: FinancialPeriod): Promise<number> {
    // Calculate cash and cash equivalents ratio
    return 0; // Simplified for now
  }

  private async calculateAssetTurnover(revenue: number, totalAssets: number): Promise<number> {
    return totalAssets > 0 ? revenue / totalAssets : 0;
  }

  private async calculateInventoryTurnover(period: FinancialPeriod): Promise<number> {
    // Calculate inventory turnover ratio
    return 0; // Simplified for now
  }

  private async calculateReceivablesTurnover(period: FinancialPeriod): Promise<number> {
    // Calculate receivables turnover ratio
    return 0; // Simplified for now
  }

  private async calculateInterestCoverage(operatingProfit: number): Promise<number> {
    // Calculate interest coverage ratio
    return 0; // Simplified for now
  }
}

export default FinancialAnalytics;
