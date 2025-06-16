import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, MapPin, Clock, Star, Navigation } from 'lucide-react';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { searchPlaces } from '@/services/searchService';
import { useGeolocation } from '@/hooks/useGeolocation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  place_name: string;
  center: [number, number];
  place_type: string[];
}

interface SearchHistory {
  id: string;
  query: string;
  place_name: string;
  latitude: number;
  longitude: number;
  searched_at: string;
}

const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const location = useGeolocation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchSearchHistory = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .eq('user_id', user.id)
      .order('searched_at', { ascending: false })
      .limit(10);
    
    if (!error && data) {
      setSearchHistory(data);
    }
  };

  const saveToHistory = async (result: SearchResult) => {
    if (!user) return;

    await supabase
      .from('search_history')
      .insert({
        user_id: user.id,
        query: query,
        place_name: result.place_name,
        latitude: result.center[1],
        longitude: result.center[0]
      });
    
    fetchSearchHistory();
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const userLocation = location.latitude && location.longitude 
        ? [location.longitude, location.latitude] as [number, number]
        : undefined;
      
      const searchResults = await searchPlaces(query, userLocation);
      setResults(searchResults);
    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = async (result: SearchResult) => {
    console.log('Local selecionado:', result);
    await saveToHistory(result);
    
    // Navegar para o dashboard com a localização selecionada
    navigate('/dashboard', { 
      state: { 
        selectedLocation: {
          center: result.center,
          name: result.place_name
        }
      }
    });
  };

  const handleHistoryClick = (historyItem: SearchHistory) => {
    navigate('/dashboard', { 
      state: { 
        selectedLocation: {
          center: [historyItem.longitude, historyItem.latitude] as [number, number],
          name: historyItem.place_name
        }
      }
    });
  };

  const getCurrentLocation = () => {
    if (location.latitude && location.longitude) {
      navigate('/dashboard', { 
        state: { 
          selectedLocation: {
            center: [location.longitude, location.latitude] as [number, number],
            name: 'Sua localização atual'
          }
        }
      });
    }
  };

  useEffect(() => {
    fetchSearchHistory();
  }, [user]);

  return (
    <main className="h-screen w-full bg-[#F5F7FA] flex flex-col">
      <div className="flex-1 p-4 pb-20">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1F3C88] mb-2">Buscar Localização</h1>
          <p className="text-gray-600">Encontre endereços, pontos de referência e locais</p>
        </div>

        {/* Current Location Button */}
        <div className="mb-4">
          <Button
            onClick={getCurrentLocation}
            disabled={!location.latitude || !location.longitude}
            className="w-full bg-green-600 hover:bg-green-700 text-white h-12"
          >
            <Navigation size={20} className="mr-2" />
            {location.latitude && location.longitude 
              ? 'Usar Minha Localização Atual' 
              : 'Obtendo localização...'}
          </Button>
        </div>

        {/* Search Input */}
        <div className="mb-6">
          <div className="relative">
            <Input
              type="text"
              placeholder="Digite um endereço ou local..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 pr-20 h-12 text-base"
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Button 
              onClick={handleSearch}
              disabled={isSearching || !query.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 bg-[#1F3C88] hover:bg-[#1a3470]"
            >
              {isSearching ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>
        </div>

        {/* Search Results */}
        {results.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Resultados da Busca</h2>
            <div className="space-y-2">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="w-full p-4 bg-white rounded-lg border border-gray-200 hover:border-[#1F3C88] hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="text-[#1F3C88] mt-1 flex-shrink-0" size={18} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{result.place_name}</p>
                      <p className="text-sm text-gray-500">
                        {result.place_type?.join(', ') || 'Local'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search History */}
        {results.length === 0 && searchHistory.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Clock size={20} />
              Buscas Recentes
            </h2>
            <div className="space-y-2">
              {searchHistory.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleHistoryClick(item)}
                  className="w-full p-4 bg-white rounded-lg border border-gray-200 hover:border-[#1F3C88] hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="flex items-start gap-3">
                    <Clock className="text-gray-400 mt-1 flex-shrink-0" size={16} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.place_name}</p>
                      <p className="text-sm text-gray-500 truncate">
                        Buscado: "{item.query}"
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(item.searched_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {results.length === 0 && searchHistory.length === 0 && !query && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <SearchIcon size={48} className="text-gray-300 mb-4" />
            <h2 className="text-lg font-semibold text-gray-600 mb-2">Comece sua busca</h2>
            <p className="text-gray-500 max-w-sm">
              Digite o nome de um local, endereço ou ponto de referência para encontrar informações de segurança
            </p>
          </div>
        )}
      </div>
      
      <BottomNavigation />
    </main>
  );
};

export default Search;

