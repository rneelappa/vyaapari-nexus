import { supabase } from "@/integrations/supabase/client";

// Circuit breaker for preventing infinite retries
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private readonly threshold = 3;
  private readonly timeout = 30000; // 30 seconds

  canExecute(): boolean {
    if (this.failures >= this.threshold) {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure < this.timeout) {
        return false;
      }
      // Reset after timeout
      this.failures = 0;
    }
    return true;
  }

  onSuccess(): void {
    this.failures = 0;
  }

  onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
  }
}

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
  private circuitBreaker = new CircuitBreaker();

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
    console.log('[SidebarDataService] fetchOrganizationData called for userId:', userId);
    
    // Check if user is authenticated
    if (!userId) {
      console.error('[SidebarDataService] No userId provided, cannot fetch data');
      throw new Error('User not authenticated');
    }

    // Check circuit breaker
    if (!this.circuitBreaker.canExecute()) {
      console.error('[SidebarDataService] Circuit breaker is open, preventing request');
      throw new Error('Service temporarily unavailable due to repeated failures');
    }

    const cacheKey = `organization_${userId}`;
    const cached = this.getFromCache<CompanyData[]>(cacheKey);
    if (cached) {
      console.log('[SidebarDataService] Returning cached organization data, items:', cached.length);
      return cached;
    }
    console.log('[SidebarDataService] No cache found, fetching fresh data');

    try {
      console.log('[SidebarDataService] Fetching companies...');
      // Get companies
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id, name, description');

      if (companiesError || !companies?.length) {
        console.error('[SidebarDataService] Error fetching companies:', companiesError);
        console.log('[SidebarDataService] Companies data:', companies);
        return [];
      }
      console.log('[SidebarDataService] Fetched companies:', companies.length, 'items');

      // Get divisions
      const companyIds = companies.map(c => c.id);
      console.log('[SidebarDataService] Fetching divisions for company IDs:', companyIds);
      const { data: divisions } = await supabase
        .from('divisions')
        .select('id, name, company_id, tally_enabled, is_active, budget, employee_count, performance_score')
        .in('company_id', companyIds)
        .eq('is_active', true);
      
      console.log('[SidebarDataService] Fetched divisions:', divisions?.length || 0, 'items');

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

      console.log('[SidebarDataService] Structured result:', result.length, 'companies');
      this.setCache(cacheKey, result);
      console.log('[SidebarDataService] Successfully cached organization data');
      this.circuitBreaker.onSuccess();
      return result;
    } catch (error) {
      console.error('[SidebarDataService] Error in fetchOrganizationData:', error);
      this.circuitBreaker.onFailure();
      throw error;
    }
  }

  async fetchTallyHierarchy(): Promise<CompanyData[]> {
    console.log('[SidebarDataService] fetchTallyHierarchy called');
    
    // Check authentication status
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) {
      console.error('[SidebarDataService] User not authenticated for Tally data');
      throw new Error('User not authenticated');
    }

    // Check circuit breaker
    if (!this.circuitBreaker.canExecute()) {
      console.error('[SidebarDataService] Circuit breaker is open for Tally data');
      throw new Error('Tally service temporarily unavailable');
    }

    const cacheKey = 'tally_hierarchy';
    const cached = this.getFromCache<CompanyData[]>(cacheKey);
    if (cached) {
      console.log('[SidebarDataService] Returning cached Tally hierarchy data, items:', cached.length);
      return cached;
    }
    console.log('[SidebarDataService] No Tally cache found, fetching fresh data');

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
      this.circuitBreaker.onSuccess();
      return result;
    } catch (error) {
      console.error('Error in fetchTallyHierarchy:', error);
      this.circuitBreaker.onFailure();
      throw error;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const sidebarDataService = new SidebarDataService();