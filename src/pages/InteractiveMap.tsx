import React, { useState, useEffect } from 'react';
import { MapContainer } from './MapContainer';
import { useGeolocation } from '@/hooks/useGeolocation';
import { SafetyLegend } from './SafetyLegend';
import { MapFilters } from './MapFilters';

interface InteractiveMapProps {
  selectedLocation?: { center: [number, number]; name: string } | null;
}

interface MapFilters {
  showCrimeData: boolean;
  showPoliceStations: boolean;
  showHospitals: boolean;
  timeRange: '24h' | '7d' | '30d';
  crimeTypes: string[];
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ selectedLocation }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<MapFilters>({
    showCrimeData: true,
    showPoliceStations: true,
    showHospitals: true,
    timeRange: '7d',
    crimeTypes: ['homicidio_doloso', 'roubo_transeunte', 'furto']
  });
  const location = useGeolocation();

  const handleFilterChange = (newFilters: Partial<MapFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="absolute inset-0 z-0 h-screen w-screen">
      <MapContainer 
        location={location}
        selectedLocation={selectedLocation}
        onMapLoad={() => setMapLoaded(true)}
        filters={filters}
      />
      
      <SafetyLegend isVisible={mapLoaded} />
      
      <MapFilters
        isVisible={showFilters}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClose={() => setShowFilters(false)}
      />
      
      {/* Filter Toggle Button */}
      {mapLoaded && (
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="absolute top-4 right-4 z-20 bg-white rounded-lg p-3 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3" />
          </svg>
        </button>
      )}
      
      {!mapLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1F3C88]"></div>
            <p className="text-[#1F3C88] font-medium">Carregando mapa...</p>
          </div>
        </div>
      )}
    </div>
  );
};

