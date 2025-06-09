import React, { useState } from 'react';
import { MapContainer } from './MapContainer';
import { useGeolocation } from '@/hooks/useGeolocation';
import { SafetyLegend } from './SafetyLegend';

interface InteractiveMapProps {
  selectedLocation?: { center: [number, number]; name: string } | null;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ selectedLocation }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const location = useGeolocation();

  return (
    <div className="absolute inset-0 z-0 h-screen w-screen">
      <MapContainer 
        location={location}
        selectedLocation={selectedLocation}
        onMapLoad={() => setMapLoaded(true)}
      />
      
      <SafetyLegend isVisible={mapLoaded} />
      
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
