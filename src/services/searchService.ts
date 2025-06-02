
interface SearchResult {
  id: string;
  place_name: string;
  center: [number, number];
  place_type: string[];
  context?: Array<{
    id: string;
    text: string;
  }>;
}

interface SearchResponse {
  features: SearchResult[];
}

const MAPBOX_TOKEN = 'pk.eyJ1IjoicGVkcm9tZWxvIiwiYSI6ImNtYmQ0NnU2ZjF1eG0ybW9kampic2l0dnIifQ.3AKo52hZMDfkH54OitiNuA';

export const searchPlaces = async (query: string, proximity?: [number, number]): Promise<SearchResult[]> => {
  if (!query.trim()) return [];

  try {
    const proximityParam = proximity ? `&proximity=${proximity[0]},${proximity[1]}` : '';
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=br&language=pt&limit=5${proximityParam}`
    );
    
    if (!response.ok) {
      throw new Error('Erro ao buscar localização');
    }

    const data: SearchResponse = await response.json();
    return data.features;
  } catch (error) {
    console.error('Erro na busca:', error);
    return [];
  }
};
