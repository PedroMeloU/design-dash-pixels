
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Authenticate with Fogo Cruzado API using the new endpoint
    const authResponse = await fetch('https://api-service.fogocruzado.org.br/api/v2/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'pedrohenrique.melo@ucsal.edu.br',
        password: 'Pl1234ll.@'
      })
    })

    if (!authResponse.ok) {
      throw new Error('Failed to authenticate with Fogo Cruzado API')
    }

    const authData = await authResponse.json()
    const token = authData.data.accessToken

    console.log('Authentication successful, token received')

    // Get current date and date from 30 days ago for the query
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Fetch incidents from Fogo Cruzado API - using the correct API service endpoint
    const incidentsResponse = await fetch(
      `https://api-service.fogocruzado.org.br/api/v2/occurrences?initialdate=${startDate}&finaldate=${endDate}&state=BA&limit=1000`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    )

    if (!incidentsResponse.ok) {
      throw new Error('Failed to fetch incidents from Fogo Cruzado API')
    }

    const incidentsData = await incidentsResponse.json()
    const incidents = incidentsData.data || []

    console.log(`Fetched ${incidents.length} incidents from Fogo Cruzado API`)

    // Process and store incidents in our database
    const processedIncidents = []
    
    for (const incident of incidents) {
      try {
        // Check if incident already exists
        const { data: existingIncident } = await supabaseClient
          .from('fogo_cruzado_incidents')
          .select('id')
          .eq('external_id', incident.id.toString())
          .single()

        if (existingIncident) {
          continue // Skip if already exists
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
        }

        const { error } = await supabaseClient
          .from('fogo_cruzado_incidents')
          .insert(processedIncident)

        if (error) {
          console.error('Error inserting incident:', error)
        } else {
          processedIncidents.push(processedIncident)
        }
      } catch (error) {
        console.error('Error processing incident:', error)
      }
    }

    console.log(`Successfully processed ${processedIncidents.length} new incidents`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully processed ${processedIncidents.length} new incidents`,
        total_fetched: incidents.length,
        new_incidents: processedIncidents.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in fogo-cruzado-integration:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
