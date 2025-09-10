/**
 * API Health Check Hook
 * Provides reactive API health status with automatic polling
 * Safe for lovable.dev deployment - no environment changes
 */

import { useState, useEffect, useCallback } from 'react';
import { apiHealthChecker, ApiHealthStatus, isAnyApiAvailable, getBestApiEndpoint } from '@/services/api-health-check';

export interface UseApiHealthOptions {
  endpoint?: string;
  pollInterval?: number; // in milliseconds
  autoStart?: boolean;
}

export interface UseApiHealthReturn {
  status: ApiHealthStatus | null;
  isChecking: boolean;
  isApiAvailable: boolean;
  bestEndpoint: string | null;
  checkHealth: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
}

export const useApiHealth = (options: UseApiHealthOptions = {}): UseApiHealthReturn => {
  const {
    endpoint = '/api/health',
    pollInterval = 30000, // 30 seconds
    autoStart = true
  } = options;

  const [status, setStatus] = useState<ApiHealthStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isApiAvailable, setIsApiAvailable] = useState(false);
  const [bestEndpoint, setBestEndpoint] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const checkHealth = useCallback(async () => {
    if (isChecking) return; // Prevent concurrent checks
    
    setIsChecking(true);
    try {
      const [healthStatus, anyAvailable, bestEndpointResult] = await Promise.all([
        apiHealthChecker.checkApiHealth(endpoint),
        isAnyApiAvailable(),
        getBestApiEndpoint()
      ]);
      
      setStatus(healthStatus);
      setIsApiAvailable(anyAvailable);
      setBestEndpoint(bestEndpointResult);
    } catch (error) {
      console.error('Error checking API health:', error);
      setStatus({
        isHealthy: false,
        isReachable: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        lastChecked: new Date()
      });
      setIsApiAvailable(false);
      setBestEndpoint(null);
    } finally {
      setIsChecking(false);
    }
  }, [endpoint, isChecking]);

  const startPolling = useCallback(() => {
    if (pollingInterval) return; // Already polling
    
    // Initial check
    checkHealth();
    
    // Set up polling
    const interval = setInterval(checkHealth, pollInterval);
    setPollingInterval(interval);
  }, [checkHealth, pollInterval, pollingInterval]);

  const stopPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [pollingInterval]);

  // Auto-start polling on mount
  useEffect(() => {
    if (autoStart) {
      startPolling();
    }
    
    return () => {
      stopPolling();
    };
  }, [autoStart, startPolling, stopPolling]);

  return {
    status,
    isChecking,
    isApiAvailable,
    bestEndpoint,
    checkHealth,
    startPolling,
    stopPolling
  };
};

// Hook for multiple API endpoints
export const useMultipleApiHealth = (endpoints: string[] = ['/api/health']) => {
  const [statuses, setStatuses] = useState<Record<string, ApiHealthStatus>>({});
  const [isChecking, setIsChecking] = useState(false);
  const [isAnyAvailable, setIsAnyAvailable] = useState(false);

  const checkAllHealth = useCallback(async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    try {
      const results = await apiHealthChecker.checkMultipleEndpoints(endpoints);
      setStatuses(results);
      setIsAnyAvailable(Object.values(results).some(status => status.isHealthy));
    } catch (error) {
      console.error('Error checking multiple API health:', error);
      setIsAnyAvailable(false);
    } finally {
      setIsChecking(false);
    }
  }, [endpoints, isChecking]);

  useEffect(() => {
    checkAllHealth();
  }, [checkAllHealth]);

  return {
    statuses,
    isChecking,
    isAnyAvailable,
    checkAllHealth
  };
};
