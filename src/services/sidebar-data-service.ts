import { supabase } from "@/integrations/supabase/client";

// Types for sidebar data
export interface CompanyData {
  id: string;
  name: string;
  description?: string;
  divisions: DivisionData[];
}

export interface DivisionData {
  id: string;
  name: string;
  company_id: string;
  tally_enabled: boolean;
  is_active: boolean;
  budget?: number;
  employee_count?: number;
  performance_score?: number;
  workspaces: WorkspaceData[];
}

export interface WorkspaceData {
  id: string;
  name: string;
  description?: string;
  division_id: string;
  is_active: boolean;
}

class SidebarDataService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && Date.now() - entry.timestamp < this.CACHE_TTL) {
      return entry.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  async fetchOrganizationData(userId: string): Promise<CompanyData[]> {
    const cacheKey = `organization_${userId}`;
    const cached = this.getFromCache<CompanyData[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Get companies
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id, name, description');

      if (companiesError || !companies?.length) {
        console.error('Error fetching companies:', companiesError);
        return [];
      }

      // Get divisions
      const companyIds = companies.map(c => c.id);
      const { data: divisions } = await supabase
        .from('divisions')
        .select('id, name, company_id, tally_enabled, is_active, budget, employee_count, performance_score')
        .in('company_id', companyIds)
        .eq('is_active', true);

      // Skip workspaces for now due to RLS permissions
      const workspaces: any[] = [];

      // Structure hierarchically
      const result = companies.map(company => ({
        id: company.id,
        name: company.name,
        description: company.description,
        divisions: (divisions || [])
          .filter(div => div.company_id === company.id)
          .map(division => ({
            id: division.id,
            name: division.name,
            company_id: division.company_id,
            tally_enabled: division.tally_enabled || false,
            is_active: division.is_active,
            budget: division.budget,
            employee_count: division.employee_count,
            performance_score: division.performance_score,
            workspaces: workspaces
              .filter(ws => ws.division_id === division.id)
              .map(workspace => ({
                id: workspace.id,
                name: workspace.name,
                description: workspace.description,
                division_id: workspace.division_id,
                is_active: workspace.is_active
              }))
          }))
      }));

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error in fetchOrganizationData:', error);
      return [];
    }
  }

  async fetchTallyHierarchy(): Promise<CompanyData[]> {
    const cacheKey = 'tally_hierarchy';
    const cached = this.getFromCache<CompanyData[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Get companies
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id, name');

      if (companiesError || !companies?.length) {
        console.error('Error fetching companies for Tally:', companiesError);
        return [];
      }

      // Get Tally-enabled divisions
      const { data: divisions } = await supabase
        .from('divisions')
        .select('id, name, company_id, tally_enabled, is_active')
        .eq('tally_enabled', true)
        .eq('is_active', true);

      // Filter companies with Tally divisions
      const result = companies
        .filter(company => 
          divisions?.some(div => div.company_id === company.id)
        )
        .map(company => ({
          id: company.id,
          name: company.name,
          divisions: (divisions || [])
            .filter(div => div.company_id === company.id)
            .map(division => ({
              id: division.id,
              name: division.name,
              company_id: division.company_id,
              tally_enabled: division.tally_enabled,
              is_active: division.is_active,
              workspaces: []
            }))
        }));

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error in fetchTallyHierarchy:', error);
      return [];
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const sidebarDataService = new SidebarDataService();