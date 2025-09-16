import React, { createContext, useContext, useState, useEffect } from 'react';
import { tallyApi } from '@/services/tallyApiService';
import { useAuth } from '@/hooks/useAuth';

interface TallyContextType {
  companyId: string;
  divisionId: string;
  apiService: typeof tallyApi;
  isConnected: boolean;
  lastSyncTime: Date | null;
  setCompanyId: (id: string) => void;
  setDivisionId: (id: string) => void;
  testConnection: () => Promise<boolean>;
}

const TallyContext = createContext<TallyContextType | undefined>(undefined);

interface TallyProviderProps {
  children: React.ReactNode;
}

export function TallyProvider({ children }: TallyProviderProps) {
  const { user } = useAuth();
  
  // Default company and division IDs (can be overridden)
  const [companyId, setCompanyId] = useState('629f49fb-983e-4141-8c48-e1423b39e921');
  const [divisionId, setDivisionId] = useState('37f3cc0c-58ad-4baf-b309-360116ffc3cd');
  const [isConnected, setIsConnected] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    // Test API connection on mount
    testConnection();
  }, []);

  const testConnection = async (): Promise<boolean> => {
    try {
      const connected = await tallyApi.testConnection();
      setIsConnected(connected);
      if (connected) {
        setLastSyncTime(new Date());
      }
      return connected;
    } catch (error) {
      console.error('Tally API connection test failed:', error);
      setIsConnected(false);
      return false;
    }
  };

  const contextValue: TallyContextType = {
    companyId,
    divisionId,
    apiService: tallyApi,
    isConnected,
    lastSyncTime,
    setCompanyId,
    setDivisionId,
    testConnection
  };

  return (
    <TallyContext.Provider value={contextValue}>
      {children}
    </TallyContext.Provider>
  );
}

export function useTally(): TallyContextType {
  const context = useContext(TallyContext);
  if (context === undefined) {
    throw new Error('useTally must be used within a TallyProvider');
  }
  return context;
}

export default TallyContext;
