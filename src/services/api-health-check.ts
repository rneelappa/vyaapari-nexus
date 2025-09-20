/**
 * API Health Check Service
 * Checks if the local Express API server is available
 * Safe for lovable.dev deployment - no environment changes
 */

export interface ApiHealthStatus {
  isHealthy: boolean;
  isReachable: boolean;
  responseTime?: number;
  error?: string;
  lastChecked: Date;
}

class ApiHealthChecker {
  private cache: Map<string, ApiHealthStatus> = new Map();
  private readonly CACHE_DURATION = 30000; // 30 seconds
  private readonly TIMEOUT = 5000; // 5 seconds

  async checkApiHealth(endpoint: string = '/api/health'): Promise<ApiHealthStatus> {
    const cacheKey = endpoint;
    const cached = this.cache.get(cacheKey);
    
    // Return cached result if still valid
    if (cached && Date.now() - cached.lastChecked.getTime() < this.CACHE_DURATION) {
      return cached;
    }

    const startTime = Date.now();
    const status: ApiHealthStatus = {
      isHealthy: false,
      isReachable: false,
      lastChecked: new Date()
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

      const response = await fetch(endpoint, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      clearTimeout(timeoutId);
      status.responseTime = Date.now() - startTime;
      status.isReachable = true;
      status.isHealthy = response.ok;

      if (!response.ok) {
        status.error = `HTTP ${response.status}: ${response.statusText}`;
      }
    } catch (error) {
      status.responseTime = Date.now() - startTime;
      status.isReachable = false;
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          status.error = 'Request timeout';
        } else if (error.message.includes('Failed to fetch')) {
          status.error = 'Network error - API server not reachable';
        } else {
          status.error = error.message;
        }
      } else {
        status.error = 'Unknown error occurred';
      }
    }

    // Cache the result
    this.cache.set(cacheKey, status);
    return status;
  }

  async checkMultipleEndpoints(endpoints: string[]): Promise<Record<string, ApiHealthStatus>> {
    const results: Record<string, ApiHealthStatus> = {};
    
    // Check all endpoints in parallel
    const promises = endpoints.map(async (endpoint) => {
      const status = await this.checkApiHealth(endpoint);
      results[endpoint] = status;
    });

    await Promise.all(promises);
    return results;
  }

  // Clear cache (useful for manual refresh)
  clearCache() {
    this.cache.clear();
  }

  // Get cached status without making a new request
  getCachedStatus(endpoint: string = '/api/health'): ApiHealthStatus | null {
    const cached = this.cache.get(endpoint);
    if (cached && Date.now() - cached.lastChecked.getTime() < this.CACHE_DURATION) {
      return cached;
    }
    return null;
  }
}

// Export singleton instance
export const apiHealthChecker = new ApiHealthChecker();

// Export factory for testing
export const createApiHealthChecker = () => new ApiHealthChecker();

// Common API endpoints to check
export const COMMON_API_ENDPOINTS = [
  '/api/health',
  '/api/tally/vouchers',
  '/api/tally/ledgers',
  '/api/tally/groups'
];

// Helper function to check if any API is available
export const isAnyApiAvailable = async (): Promise<boolean> => {
  const results = await apiHealthChecker.checkMultipleEndpoints(COMMON_API_ENDPOINTS);
  return Object.values(results).some(status => status.isHealthy);
};

// Helper function to get the best available API endpoint
export const getBestApiEndpoint = async (): Promise<string | null> => {
  const results = await apiHealthChecker.checkMultipleEndpoints(COMMON_API_ENDPOINTS);
  
  // Find the first healthy endpoint
  for (const [endpoint, status] of Object.entries(results)) {
    if (status.isHealthy) {
      return endpoint;
    }
  }
  
  return null;
};
