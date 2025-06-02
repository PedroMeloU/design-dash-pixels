
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SafetyData {
  neighborhood: string;
  city: string;
  state: string;
  safety_percentage: number;
  crime_count: number;
  last_calculated: string;
  latitude?: number;
  longitude?: number;
}

export const useSafetyData = () => {
  const [safetyData, setSafetyData] = useState<SafetyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSafetyData = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('safety_index')
        .select('*')
        .order('safety_percentage', { ascending: false });

      if (error) throw error;
      setSafetyData(data || []);
    } catch (err) {
      console.error('Error fetching safety data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFogoCruzadoData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('fogo-cruzado-integration');
      if (error) throw error;
      
      console.log('Fogo Cruzado data updated:', data);
      await fetchSafetyData(); // Refresh local data
      return data;
    } catch (err) {
      console.error('Error updating Fogo Cruzado data:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchSafetyData();
  }, []);

  return {
    safetyData,
    isLoading,
    error,
    refetch: fetchSafetyData,
    updateFogoCruzadoData
  };
};
