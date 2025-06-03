
import React, { useState } from 'react';
import { MapContainer } from './MapContainer';
import { LoadingOverlay } from './LoadingOverlay';
import { useGeolocation } from '@/hooks/useGeolocation';

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
      
      {!mapLoaded && <LoadingOverlay />}
    </div>
  );
};
