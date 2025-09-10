import { useState, useEffect } from 'react';

export const useTallyApiKey = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // For now, we'll use a placeholder since this should be configured at deployment level
    // In a real implementation, this would be handled through user settings or environment
    const storedApiKey = localStorage.getItem('tally_api_key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    } else {
      // Set a default/placeholder for development
      setApiKey('TALLY_API_KEY_PLACEHOLDER');
    }
    setIsLoading(false);
  }, []);

  const updateApiKey = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem('tally_api_key', newApiKey);
  };

  return { apiKey, isLoading, error, updateApiKey };
};