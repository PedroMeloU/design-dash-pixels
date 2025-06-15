import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Incident = Database['public']['Tables']['fogo_cruzado_incidents']['Row'];

export const useFogoCruzadoData = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchIncidents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('fogo_cruzado_incidents')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setIncidents(data || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateFogoCruzadoData = async () => {
    setIsUpdating(true);
    setError(null);
    try {
      // Fetch the latest data from the external API
      const response = await fetch('https://fogo-cruzado-api.herokuapp.com/api/incidents');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const apiData = await response.json();

      // Transform the API data to match the database schema
      const transformedData = apiData.incidents.map((item: any) => ({
        external_id: item.id.toString(),
        incident_type: item.incident_type,
        date: item.date,
        latitude: item.latitude,
        longitude: item.longitude,
        address: item.address,
        neighborhood: item.neighborhood,
        city: item.city,
        state: item.state,
        deaths: item.deaths,
        wounded: item.wounded,
        description: item.description,
      }));

      // Fetch existing external_ids from the database
      const { data: existingIncidents, error: selectError } = await supabase
        .from('fogo_cruzado_incidents')
        .select('external_id');

      if (selectError) {
        throw new Error(selectError.message);
      }

      const existingExternalIds = existingIncidents ? existingIncidents.map(item => item.external_id) : [];

      // Filter out incidents that already exist in the database
      const newIncidents = transformedData.filter(item => !existingExternalIds.includes(item.external_id));

      if (newIncidents.length > 0) {
        // Insert the new incidents into the database
        const { error: insertError } = await supabase
          .from('fogo_cruzado_incidents')
          .insert(newIncidents);

        if (insertError) {
          throw new Error(insertError.message);
        }
        console.log(`${newIncidents.length} new incidents added to the database.`);
      } else {
        console.log('No new incidents to add.');
      }

      // Refresh the incidents data
      await fetchIncidents();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  return {
    incidents,
    isLoading,
    error,
    updateFogoCruzadoData,
    isUpdating,
  };
};
