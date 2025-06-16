import React from 'react';
import { X, Filter, Clock, Shield, MapPin, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface MapFiltersProps {
  isVisible: boolean;
  filters: {
    showCrimeData: boolean;
    showPoliceStations: boolean;
    showHospitals: boolean;
    timeRange: '24h' | '7d' | '30d';
    crimeTypes: string[];
  };
  onFilterChange: (filters: any) => void;
  onClose: () => void;
}

const crimeTypeOptions = [
  { id: 'homicidio_doloso', label: 'Homicídio Doloso', color: 'bg-red-500' },
  { id: 'latrocinio', label: 'Latrocínio', color: 'bg-red-400' },
  { id: 'roubo_transeunte', label: 'Roubo a Transeunte', color: 'bg-orange-500' },
  { id: 'roubo_veiculo', label: 'Roubo de Veículo', color: 'bg-orange-400' },
  { id: 'furto', label: 'Furto', color: 'bg-yellow-500' },
  { id: 'estupro', label: 'Estupro', color: 'bg-red-600' },
  { id: 'tentativa_homicidio', label: 'Tentativa de Homicídio', color: 'bg-red-300' },
  { id: 'outros', label: 'Outros', color: 'bg-gray-500' }
];

export const MapFilters: React.FC<MapFiltersProps> = ({
  isVisible,
  filters,
  onFilterChange,
  onClose
}) => {
  if (!isVisible) return null;

  const handleCrimeTypeToggle = (crimeType: string, checked: boolean) => {
    const newCrimeTypes = checked
      ? [...filters.crimeTypes, crimeType]
      : filters.crimeTypes.filter(type => type !== crimeType);
    
    onFilterChange({ crimeTypes: newCrimeTypes });
  };

  return (
    <div className="absolute inset-0 z-30 bg-black/50 flex items-end sm:items-center sm:justify-center">
      <div className="bg-white w-full sm:w-96 sm:rounded-xl shadow-xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-[#1F3C88]" />
            <h2 className="text-lg font-semibold text-gray-900">Filtros do Mapa</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Time Range */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={18} className="text-[#1F3C88]" />
              <h3 className="font-medium text-gray-900">Período</h3>
            </div>
            <Select
              value={filters.timeRange}
              onValueChange={(value: '24h' | '7d' | '30d') => onFilterChange({ timeRange: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Últimas 24 horas</SelectItem>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Layer Visibility */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={18} className="text-[#1F3C88]" />
              <h3 className="font-medium text-gray-900">Camadas do Mapa</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Dados de Criminalidade</span>
                <Switch
                  checked={filters.showCrimeData}
                  onCheckedChange={(checked) => onFilterChange({ showCrimeData: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Delegacias de Polícia</span>
                <Switch
                  checked={filters.showPoliceStations}
                  onCheckedChange={(checked) => onFilterChange({ showPoliceStations: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Hospitais</span>
                <Switch
                  checked={filters.showHospitals}
                  onCheckedChange={(checked) => onFilterChange({ showHospitals: checked })}
                />
              </div>
            </div>
          </div>

          {/* Crime Types */}
          {filters.showCrimeData && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield size={18} className="text-[#1F3C88]" />
                <h3 className="font-medium text-gray-900">Tipos de Crime</h3>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {crimeTypeOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={option.id}
                      checked={filters.crimeTypes.includes(option.id)}
                      onCheckedChange={(checked) => 
                        handleCrimeTypeToggle(option.id, checked as boolean)
                      }
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <div className={`w-3 h-3 rounded-full ${option.color}`} />
                      <label 
                        htmlFor={option.id} 
                        className="text-sm text-gray-700 cursor-pointer flex-1"
                      >
                        {option.label}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Ações Rápidas</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFilterChange({
                  crimeTypes: crimeTypeOptions.map(opt => opt.id)
                })}
                className="flex-1"
              >
                Selecionar Todos
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFilterChange({ crimeTypes: [] })}
                className="flex-1"
              >
                Limpar Seleção
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <Button
            onClick={onClose}
            className="w-full bg-[#1F3C88] hover:bg-[#1a3470]"
          >
            Aplicar Filtros
          </Button>
        </div>
      </div>
    </div>
  );
};

