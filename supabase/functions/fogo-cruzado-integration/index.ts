
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FogoCruzadoIncident {
  id: string;
  date: string;
  state: string;
  city: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  deaths: number;
  wounded: number;
  incident_type: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting Fogo Cruzado integration...");

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Authenticate with Fogo Cruzado API
    console.log("Authenticating with Fogo Cruzado API...");
    const authResponse = await fetch("https://api.fogocruzado.org.br/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "pedrohenrique.melo@ucsal.edu.br",
        password: "Pl1234ll.@",
      }),
    });

    if (!authResponse.ok) {
      throw new Error(`Authentication failed: ${authResponse.status}`);
    }

    const authData = await authResponse.json();
    const token = authData.access_token;
    console.log("Authentication successful");

    // Fetch incidents from Salvador, BA (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];

    console.log(`Fetching incidents from ${startDate} to ${endDate}...`);
    const incidentsResponse = await fetch(
      `https://api.fogocruzado.org.br/api/incidents?state=BA&city=Salvador&start_date=${startDate}&end_date=${endDate}`,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!incidentsResponse.ok) {
      throw new Error(`Failed to fetch incidents: ${incidentsResponse.status}`);
    }

    const incidentsData = await incidentsResponse.json();
    const incidents: FogoCruzadoIncident[] = incidentsData.data || [];
    
    console.log(`Found ${incidents.length} incidents`);

    // Process incidents and update safety index by neighborhood
    const neighborhoodStats = new Map<string, {
      incidents: number;
      deaths: number;
      wounded: number;
      weight: number;
    }>();

    incidents.forEach((incident) => {
      const neighborhood = incident.neighborhood || 'Não informado';
      const stats = neighborhoodStats.get(neighborhood) || {
        incidents: 0,
        deaths: 0,
        wounded: 0,
        weight: 0
      };

      stats.incidents += 1;
      stats.deaths += incident.deaths || 0;
      stats.wounded += incident.wounded || 0;
      // Weight: 5 for deaths, 3 for wounded, 2 for incidents
      stats.weight += (incident.deaths * 5) + (incident.wounded * 3) + 2;

      neighborhoodStats.set(neighborhood, stats);
    });

    // Find max weight for normalization
    let maxWeight = 0;
    neighborhoodStats.forEach(stats => {
      if (stats.weight > maxWeight) {
        maxWeight = stats.weight;
      }
    });

    console.log(`Processing ${neighborhoodStats.size} neighborhoods, max weight: ${maxWeight}`);

    // Update safety index for each neighborhood
    for (const [neighborhood, stats] of neighborhoodStats) {
      const safetyPercentage = maxWeight > 0 ? 100 - ((stats.weight / maxWeight) * 100) : 50;
      
      console.log(`Updating ${neighborhood}: ${safetyPercentage.toFixed(2)}% safety`);

      const { error } = await supabaseClient
        .from('safety_index')
        .upsert({
          neighborhood,
          city: 'Salvador',
          state: 'BA',
          safety_percentage: Math.round(safetyPercentage * 100) / 100,
          crime_count: stats.incidents,
          last_calculated: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'neighborhood,city,state'
        });

      if (error) {
        console.error(`Error updating ${neighborhood}:`, error);
      }
    }

    console.log("Fogo Cruzado integration completed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${incidents.length} incidents across ${neighborhoodStats.size} neighborhoods`,
        neighborhoods_updated: Array.from(neighborhoodStats.keys()),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in Fogo Cruzado integration:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
