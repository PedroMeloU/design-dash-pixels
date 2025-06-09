
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Cache do token para evitar autenticações desnecessárias
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

const authenticateWithFogoCruzado = async (): Promise<string> => {
  // Verificar se o token ainda é válido (com margem de 5 minutos)
  if (cachedToken && Date.now() < tokenExpiry - 300000) {
    console.log('Using cached token');
    return cachedToken;
  }

  console.log('Authenticating with Fogo Cruzado API...');
  
  const authResponse = await fetch('https://api-service.fogocruzado.org.br/api/v2/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'pedrohenrique.melo@ucsal.edu.br',
      password: 'Pl1234ll.@'
    })
  });

  if (!authResponse.ok) {
    throw new Error(`Authentication failed: ${authResponse.status} ${authResponse.statusText}`);
  }

  const authData = await authResponse.json();
  
  if (!authData.success || !authData.data?.accessToken) {
    throw new Error('Invalid authentication response');
  }

  cachedToken = authData.data.accessToken;
  // Definir expiração do token para 1 hora
  tokenExpiry = Date.now() + 3600000;
  
  console.log('Authentication successful');
  return cachedToken;
};

const refreshToken = async (currentToken: string): Promise<string> => {
  console.log('Refreshing token...');
  
  const refreshResponse = await fetch('https://api-service.fogocruzado.org.br/api/v2/auth/refresh', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${currentToken}`,
      'Content-Type': 'application/json',
    }
  });

  if (!refreshResponse.ok) {
    console.log('Token refresh failed, re-authenticating...');
    return await authenticateWithFogoCruzado();
  }

  const refreshData = await refreshResponse.json();
  
  if (refreshData.success && refreshData.data?.accessToken) {
    cachedToken = refreshData.data.accessToken;
    tokenExpiry = Date.now() + 3600000;
    console.log('Token refreshed successfully');
    return cachedToken;
  }
  
  throw new Error('Token refresh failed');
};

const fetchWithAuth = async (url: string, token: string, retryCount = 0): Promise<any> => {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });

  // Se o token expirou, tentar renovar
  if (response.status === 401 && retryCount === 0) {
    console.log('Token expired, attempting refresh...');
    const newToken = await refreshToken(token);
    return fetchWithAuth(url, newToken, 1);
  }

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

const calculateSafetyPercentage = (crimeCount: number, populationFactor: number = 1000): number => {
  // Fórmula: Segurança = 100 - (crimes por 1000 habitantes * fator de ajuste)
  // Assumindo que 50 crimes por 1000 habitantes = 0% de segurança
  const maxCrimesFor0Percent = 50;
  const crimesPerThousand = (crimeCount / populationFactor) * 1000;
  const unsafetyPercentage = Math.min((crimesPerThousand / maxCrimesFor0Percent) * 100, 100);
  const safetyPercentage = Math.max(100 - unsafetyPercentage, 0);
  
  return Math.round(safetyPercentage * 100) / 100; // Arredondar para 2 casas decimais
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Autenticar com a API do Fogo Cruzado
    const token = await authenticateWithFogoCruzado();

    // Buscar dados de estados e cidades para mapear bairros
    console.log('Fetching states and cities data...');
    const statesData = await fetchWithAuth('https://api-service.fogocruzado.org.br/api/v2/states', token);
    
    // Encontrar a Bahia
    const bahiaState = statesData.data?.find((state: any) => state.name === 'Bahia' || state.acronym === 'BA');
    if (!bahiaState) {
      throw new Error('Bahia state not found');
    }

    const citiesData = await fetchWithAuth(`https://api-service.fogocruzado.org.br/api/v2/cities?state=${bahiaState.id}`, token);
    
    // Encontrar Salvador
    const salvadorCity = citiesData.data?.find((city: any) => city.name === 'Salvador');
    if (!salvadorCity) {
      throw new Error('Salvador city not found');
    }

    // Buscar bairros de Salvador
    const neighborhoodsData = await fetchWithAuth(`https://api-service.fogocruzado.org.br/api/v2/neighborhoods?city=${salvadorCity.id}`, token);

    // Definir período para buscar ocorrências (últimos 6 meses)
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    console.log(`Fetching occurrences from ${startDate} to ${endDate}...`);

    // Buscar ocorrências com paginação
    let allOccurrences: any[] = [];
    let page = 1;
    const limit = 1000;
    let hasMoreData = true;

    while (hasMoreData) {
      const occurrencesUrl = `https://api-service.fogocruzado.org.br/api/v2/occurrences?initialdate=${startDate}&finaldate=${endDate}&state=${bahiaState.id}&city=${salvadorCity.id}&limit=${limit}&page=${page}`;
      
      const occurrencesData = await fetchWithAuth(occurrencesUrl, token);
      
      if (occurrencesData.data && occurrencesData.data.length > 0) {
        allOccurrences = allOccurrences.concat(occurrencesData.data);
        page++;
        
        // Se retornou menos que o limite, provavelmente é a última página
        if (occurrencesData.data.length < limit) {
          hasMoreData = false;
        }
      } else {
        hasMoreData = false;
      }
    }

    console.log(`Total occurrences fetched: ${allOccurrences.length}`);

    // Processar e armazenar incidentes na tabela existente
    const processedIncidents = [];
    
    for (const incident of allOccurrences) {
      try {
        // Verificar se o incidente já existe
        const { data: existingIncident } = await supabaseClient
          .from('fogo_cruzado_incidents')
          .select('id')
          .eq('external_id', incident.id.toString())
          .single();

        if (existingIncident) {
          continue; // Pular se já existe
        }

        const processedIncident = {
          external_id: incident.id.toString(),
          incident_type: incident.occurrence_type?.name || 'Não especificado',
          date: incident.date,
          latitude: incident.latitude ? parseFloat(incident.latitude) : null,
          longitude: incident.longitude ? parseFloat(incident.longitude) : null,
          address: incident.address || null,
          neighborhood: incident.neighborhood?.name || null,
          city: incident.city?.name || null,
          state: incident.state?.name || null,
          deaths: incident.deaths || 0,
          wounded: incident.wounded || 0,
          description: incident.description || null
        };

        const { error } = await supabaseClient
          .from('fogo_cruzado_incidents')
          .insert(processedIncident);

        if (error) {
          console.error('Error inserting incident:', error);
        } else {
          processedIncidents.push(processedIncident);
        }
      } catch (error) {
        console.error('Error processing incident:', error);
      }
    }

    // Calcular índice de segurança por bairro
    console.log('Calculating safety index by neighborhood...');
    
    const neighborhoodCrimeCount = new Map<string, number>();
    
    // Contar crimes por bairro
    allOccurrences.forEach(incident => {
      const neighborhood = incident.neighborhood?.name || 'Não especificado';
      neighborhoodCrimeCount.set(neighborhood, (neighborhoodCrimeCount.get(neighborhood) || 0) + 1);
    });

    // Atualizar tabela safety_index
    const safetyUpdates = [];
    
    for (const neighborhood of neighborhoodsData.data || []) {
      const crimeCount = neighborhoodCrimeCount.get(neighborhood.name) || 0;
      const safetyPercentage = calculateSafetyPercentage(crimeCount);
      
      // Tentar atualizar registro existente ou inserir novo
      const { data: existingSafety } = await supabaseClient
        .from('safety_index')
        .select('id')
        .eq('neighborhood', neighborhood.name)
        .eq('city', 'Salvador')
        .eq('state', 'BA')
        .single();

      const safetyData = {
        neighborhood: neighborhood.name,
        city: 'Salvador',
        state: 'BA',
        latitude: neighborhood.latitude ? parseFloat(neighborhood.latitude) : null,
        longitude: neighborhood.longitude ? parseFloat(neighborhood.longitude) : null,
        safety_percentage: safetyPercentage,
        crime_count: crimeCount,
        last_calculated: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (existingSafety) {
        // Atualizar
        const { error } = await supabaseClient
          .from('safety_index')
          .update(safetyData)
          .eq('id', existingSafety.id);
          
        if (error) {
          console.error('Error updating safety data:', error);
        }
      } else {
        // Inserir
        const { error } = await supabaseClient
          .from('safety_index')
          .insert(safetyData);
          
        if (error) {
          console.error('Error inserting safety data:', error);
        }
      }
      
      safetyUpdates.push({
        neighborhood: neighborhood.name,
        safety_percentage: safetyPercentage,
        crime_count: crimeCount
      });
    }

    console.log(`Safety index calculated for ${safetyUpdates.length} neighborhoods`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully processed ${processedIncidents.length} new incidents and updated safety index for ${safetyUpdates.length} neighborhoods`,
        data: {
          total_occurrences_fetched: allOccurrences.length,
          new_incidents: processedIncidents.length,
          neighborhoods_updated: safetyUpdates.length,
          safety_summary: safetyUpdates.slice(0, 10) // Primeiros 10 para resumo
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in fogo-cruzado-integration:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Internal server error',
        details: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
