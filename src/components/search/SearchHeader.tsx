
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Navigation } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { searchPlaces } from '@/services/searchService';

interface SearchResult {
  id: string;
  place_name: string;
  center: [number, number];
  place_type: string[];
}

interface SearchHeaderProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect?: (location: { center: [number, number]; name: string }) => void;
  userLocation?: [number, number] | null;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({ 
  isOpen, 
  onClose, 
  onLocationSelect,
  userLocation 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSuggestions([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchPlaces(searchQuery, userLocation || undefined);
        setSuggestions(results);
      } catch (error) {
        console.error('Erro na busca:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, userLocation]);

  const handleLocationSelect = (location: SearchResult) => {
    if (onLocationSelect) {
      onLocationSelect({
        center: location.center,
        name: location.place_name
      });
    }
    setSearchQuery(location.place_name);
    setSuggestions([]);
    onClose();
  };

  const handleMyLocation = () => {
    if (userLocation && onLocationSelect) {
      onLocationSelect({
        center: userLocation,
        name: 'Minha Localização'
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 left-0 right-0 z-20 bg-white shadow-xl border-b border-gray-200">
      <div className="p-4 pb-2">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Buscar endereços, pontos de interesse..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 text-base rounded-xl border-2 focus:border-[#1F3C88]"
              autoFocus
            />
            {loading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#1F3C88] border-t-transparent"></div>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {userLocation && (
          <button
            onClick={handleMyLocation}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#1F3C88] text-white mb-2 hover:bg-[#1a3470] transition-colors"
          >
            <Navigation size={18} />
            <span className="font-medium">Ir para minha localização</span>
          </button>
        )}
      </div>
      
      {suggestions.length > 0 && (
        <div className="max-h-80 overflow-y-auto border-t border-gray-100">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => handleLocationSelect(suggestion)}
              className="w-full flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-b-0"
            >
              <MapPin size={18} className="text-[#1F3C88] mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{suggestion.place_name}</p>
                <p className="text-sm text-gray-500 capitalize">
                  {suggestion.place_type.join(', ')}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {searchQuery && suggestions.length === 0 && !loading && (
        <div className="p-4 text-center text-gray-500 border-t border-gray-100">
          <p>Nenhum resultado encontrado para "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
};
