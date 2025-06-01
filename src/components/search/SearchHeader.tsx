
import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchHeaderProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 left-0 right-0 z-20 bg-white shadow-lg border-b border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Pesquisar locais e destinos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-3 text-base"
            autoFocus
          />
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={20} className="text-gray-600" />
        </button>
      </div>
      
      {searchQuery && (
        <div className="mt-3 bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600">
            Buscando por: <span className="font-medium">"{searchQuery}"</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Funcionalidade de busca em desenvolvimento
          </p>
        </div>
      )}
    </div>
  );
};
