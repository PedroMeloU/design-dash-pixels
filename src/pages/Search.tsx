
import React, { useState } from 'react';
import { Search as SearchIcon, MapPin, Clock } from 'lucide-react';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { searchPlaces } from '@/services/searchService';
import { useGeolocation } from '@/hooks/useGeolocation';

interface SearchResult {
  id: string;
  place_name: string;
  center: [number, number];
  place_type: string[];
}

const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches] = useState<string[]>([
    'Centro, São Paulo',
    'Avenida Paulista',
    'Terminal Rodoviário'
  ]);
  const location = useGeolocation();

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

  const handleResultClick = (result: SearchResult) => {
    console.log('Local selecionado:', result);
    // Aqui você pode navegar para o mapa ou fazer algo com o resultado
  };

  return (
    <main className="h-screen w-full bg-[#F5F7FA] flex flex-col">
      <div className="flex-1 p-4 pb-20">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1F3C88] mb-2">Buscar Localização</h1>
          <p className="text-gray-600">Encontre endereços, pontos de referência e locais</p>
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

        {/* Recent Searches */}
        {results.length === 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Clock size={20} />
              Buscas Recentes
            </h2>
            <div className="space-y-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(search)}
                  className="w-full p-4 bg-white rounded-lg border border-gray-200 hover:border-[#1F3C88] hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="text-gray-400" size={16} />
                    <span className="text-gray-900">{search}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <BottomNavigation />
    </main>
  );
};

export default Search;
