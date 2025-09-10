import { supabase } from "@/integrations/supabase/client";

export interface TallyApiFilters {
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface TallyApiRequest {
  action: 'getCompanies' | 'getLedgers' | 'getGroups' | 'getStockItems' | 'getVouchers' | 'getCostCenters' | 'getGodowns' | 'getEmployees';
  divisionId?: string;
  companyId?: string;
  filters?: TallyApiFilters;
}

export interface TallyApiResponse<T = any> {
  data: T[];
  count: number;
  error?: string;
}

class TallyApiService {
  private async callTallyApi<T = any>(request: TallyApiRequest): Promise<TallyApiResponse<T>> {
    try {
      console.log('Calling Tally API with request:', request);
      
      const { data, error } = await supabase.functions.invoke('tally-api', {
        body: request
      });

      if (error) {
        console.error('Tally API error:', error);
        throw new Error(error.message || 'Failed to fetch data from Tally API');
      }

      return data as TallyApiResponse<T>;
    } catch (error) {
      console.error('Error calling Tally API:', error);
      throw error;
    }
  }

  async getCompanies(filters?: TallyApiFilters): Promise<TallyApiResponse> {
    return this.callTallyApi({
      action: 'getCompanies',
      filters
    });
  }

  async getLedgers(companyId?: string, divisionId?: string, filters?: TallyApiFilters): Promise<TallyApiResponse> {
    return this.callTallyApi({
      action: 'getLedgers',
      companyId,
      divisionId,
      filters
    });
  }

  async getGroups(companyId?: string, divisionId?: string, filters?: TallyApiFilters): Promise<TallyApiResponse> {
    return this.callTallyApi({
      action: 'getGroups',
      companyId,
      divisionId,
      filters
    });
  }

  async getStockItems(companyId?: string, divisionId?: string, filters?: TallyApiFilters): Promise<TallyApiResponse> {
    return this.callTallyApi({
      action: 'getStockItems',
      companyId,
      divisionId,
      filters
    });
  }

  async getVouchers(companyId?: string, divisionId?: string, filters?: TallyApiFilters): Promise<TallyApiResponse> {
    return this.callTallyApi({
      action: 'getVouchers',
      companyId,
      divisionId,
      filters
    });
  }

  async getCostCenters(companyId?: string, divisionId?: string, filters?: TallyApiFilters): Promise<TallyApiResponse> {
    return this.callTallyApi({
      action: 'getCostCenters',
      companyId,
      divisionId,
      filters
    });
  }

  async getGodowns(companyId?: string, divisionId?: string, filters?: TallyApiFilters): Promise<TallyApiResponse> {
    return this.callTallyApi({
      action: 'getGodowns',
      companyId,
      divisionId,
      filters
    });
  }

  async getEmployees(companyId?: string, divisionId?: string, filters?: TallyApiFilters): Promise<TallyApiResponse> {
    return this.callTallyApi({
      action: 'getEmployees',
      companyId,
      divisionId,
      filters
    });
  }
}

export const tallyApiService = new TallyApiService();