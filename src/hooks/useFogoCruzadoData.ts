
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FogoCruzadoIncident {
  id: string;
  external_id: string;
  incident_type: string;
  date: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  deaths: number;
  wounded: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export const useFogoCruzadoData = () => {
  const [incidents, setIncidents] = useState<FogoCruzadoIncident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchIncidents = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('fogo_cruzado_incidents')
        .select('*')
        .order('date', { ascending: false })
        .limit(500);

      if (error) throw error;
      setIncidents(data || []);
    } catch (err) {
      console.error('Error fetching Fogo Cruzado incidents:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFogoCruzadoData = async () => {
    try {
      setIsUpdating(true);
      const { data, error } = await supabase.functions.invoke('fogo-cruzado-integration');
      
      if (error) throw error;
      
      console.log('Fogo Cruzado data updated:', data);
      await fetchIncidents(); // Refresh local data
      return data;
    } catch (err) {
      console.error('Error updating Fogo Cruzado data:', err);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  return {
    incidents,
    isLoading,
    error,
    isUpdating,
    refetch: fetchIncidents,
    updateFogoCruzadoData
  };
};
