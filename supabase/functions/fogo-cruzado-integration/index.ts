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
  
  try {
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

    console.log('Auth response status:', authResponse.status);
    console.log('Auth response headers:', Object.fromEntries(authResponse.headers.entries()));

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error('Authentication failed:', authResponse.status, errorText);
      throw new Error(`Authentication failed: ${authResponse.status} - ${errorText}`);
    }

    const authData = await authResponse.json();
    console.log('Auth response data:', authData);
    
    // Verificar se a resposta tem a estrutura esperada conforme documentação
    if (!authData.data?.accessToken) {
      console.error('Invalid authentication response structure:', authData);
      throw new Error('Invalid authentication response: missing accessToken');
    }

    cachedToken = authData.data.accessToken;
    // Usar expiresIn da resposta se disponível, senão usar 1 hora por padrão
    const expiresInSeconds = authData.data.expiresIn || 3600;
    tokenExpiry = Date.now() + (expiresInSeconds * 1000);
    
    console.log('Authentication successful, token expires in:', expiresInSeconds, 'seconds');
    return cachedToken;
  } catch (error) {
    console.error('Error during authentication:', error);
    throw new Error(`Authentication error: ${error.message}`);
  }
};

const refreshToken = async (currentToken: string): Promise<string> => {
  console.log('Refreshing token...');
  
  try {
    const refreshResponse = await fetch('https://api-service.fogocruzado.org.br/api/v2/auth/refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${currentToken}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('Refresh response status:', refreshResponse.status);

    if (!refreshResponse.ok) {
      console.log('Token refresh failed, re-authenticating...');
      return await authenticateWithFogoCruzado();
    }

    const refreshData = await refreshResponse.json();
    console.log('Refresh response data:', refreshData);
    
    if (refreshData.data?.accessToken) {
      cachedToken = refreshData.data.accessToken;
      const expiresInSeconds = refreshData.data.expiresIn || 3600;
      tokenExpiry = Date.now() + (expiresInSeconds * 1000);
      console.log('Token refreshed successfully');
      return cachedToken;
    }
    
    throw new Error('Token refresh failed: invalid response');
  } catch (error) {
    console.error('Error during token refresh:', error);
    throw new Error(`Token refresh error: ${error.message}`);
  }
};

const fetchWithAuth = async (url: string, token: string, retryCount = 0): Promise<any> => {
  console.log(`Making request to: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    console.log(`Response status for ${url}:`, response.status);

    // Se o token expirou, tentar renovar
    if (response.status === 401 && retryCount === 0) {
      console.log('Token expired, attempting refresh...');
      const newToken = await refreshToken(token);
      return fetchWithAuth(url, newToken, 1);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API request failed for ${url}:`, response.status, errorText);
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`Response data structure for ${url}:`, {
      hasData: !!data.data,
      dataLength: Array.isArray(data.data) ? data.data.length : 'not array',
      msg: data.msg
    });
    
    return data;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
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

    // Buscar dados de estados conforme documentação
    console.log('Fetching states data...');
    const statesData = await fetchWithAuth('https://api-service.fogocruzado.org.br/api/v2/states', token);
    const bahiaState = statesData.data?.find((state: any) => 
      state.name?.toLowerCase().includes('bahia') || state.name === 'Bahia'
    );
    if (!bahiaState) {
      console.error('Available states:', statesData.data?.map((s: any) => s.name));
      throw new Error('Bahia state not found in API response');
    }

    console.log('Found Bahia state:', bahiaState);

    // Buscar cidades da Bahia
    console.log('Fetching cities data for Bahia...');
    const citiesData = await fetchWithAuth(`https://api-service.fogocruzado.org.br/api/v2/cities?stateId=${bahiaState.id}`, token);
    const salvadorCity = citiesData.data?.find((city: any) => 
      city.name?.toLowerCase().includes('salvador') || city.name === 'Salvador'
    );
    if (!salvadorCity) {
      console.error('Available cities in Bahia:', citiesData.data?.map((c: any) => c.name));
      throw new Error('Salvador city not found in API response');
    }

    console.log('Found Salvador city:', salvadorCity);

    // Não tentar mais buscar bairros (endpoint não documentado/não funcional)
    console.warn('[Fogo Cruzado Integration] O endpoint de bairros (neighborhoods) não está documentado ou funcional. Pulando busca de bairros.');

    // Definir período para buscar ocorrências (últimos 6 meses)
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    console.log(`Fetching occurrences from ${startDate} to ${endDate}...`);

    // Buscar ocorrências das APIs documentadas normalmente
    let allOccurrences: any[] = [];
    let page = 1;
    const take = 1000;
    let hasMoreData = true;

    while (hasMoreData) {
      const occurrencesUrl = `https://api-service.fogocruzado.org.br/api/v2/occurrences?initialdate=${startDate}&finaldate=${endDate}&idState=${bahiaState.id}&idCities=${salvadorCity.id}&page=${page}&take=${take}`;
      console.log(`Fetching page ${page} of occurrences...`);
      const occurrencesResponse = await fetchWithAuth(occurrencesUrl, token);
      if (occurrencesResponse.data && occurrencesResponse.data.length > 0) {
        allOccurrences = allOccurrences.concat(occurrencesResponse.data);
        page++;
        const pageMeta = occurrencesResponse.pageMeta;
        if (pageMeta && !pageMeta.hasNextPage) {
          hasMoreData = false;
        } else if (occurrencesResponse.data.length < take) {
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
          continue;
        }

        let deaths = 0;
        let wounded = 0;
        if (incident.victims && Array.isArray(incident.victims)) {
          incident.victims.forEach((victim: any) => {
            if (victim.situation === 'Dead') deaths++;
            else if (victim.situation === 'Wounded') wounded++;
          });
        }

        // Se não tiver bairro, colocar como 'Indisponível'
        const neighborhoodName = incident.neighborhood?.name || "Indisponível";

        const processedIncident = {
          external_id: incident.id.toString(),
          incident_type: incident.contextInfo?.mainReason?.name || 'Não especificado',
          date: incident.date,
          latitude: incident.latitude ? parseFloat(incident.latitude) : null,
          longitude: incident.longitude ? parseFloat(incident.longitude) : null,
          address: incident.address || null,
          neighborhood: neighborhoodName,
          city: incident.city?.name || null,
          state: incident.state?.name || null,
          deaths: deaths,
          wounded: wounded,
          description: incident.contextInfo?.mainReason?.name || null
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

    // Não atualizar tabela safety_index por bairro, pois sem bairros não é possível granularidade correta
    // Apenas log para debugging e mantenha o app funcionando
    console.warn('[Fogo Cruzado Integration] Ignorando cálculo de safety_index por bairro devido à indisponibilidade dos dados de bairros.');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Dados atualizados (sem bairros). ${processedIncidents.length} novos incidentes salvos. O cálculo de safety_index por bairro foi pulado devido à ausência desse endpoint na API.`,
        data: {
          total_occurrences_fetched: allOccurrences.length,
          new_incidents: processedIncidents.length,
          period: `${startDate} até ${endDate}`
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
        error: error.message || 'Erro interno do servidor',
        details: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
