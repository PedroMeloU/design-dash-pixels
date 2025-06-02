
import React, { useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { useGeolocation } from '@/hooks/useGeolocation';
import { MapContainer } from './MapContainer';
import { UserLocationMarker } from './UserLocationMarker';
import { SelectedLocationMarker } from './SelectedLocationMarker';
import { LoadingOverlay } from './LoadingOverlay';

interface InteractiveMapProps {
  selectedLocation?: { center: [number, number]; name: string } | null;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ selectedLocation }) => {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const location = useGeolocation();

  const handleMapLoad = (mapInstance: mapboxgl.Map) => {
    setMap(mapInstance);
    setMapLoaded(true);
  };

  return (
    <div className="absolute inset-0 z-0 h-screen w-screen">
      <MapContainer location={location} onMapLoad={handleMapLoad} />
      
      <UserLocationMarker 
        map={map} 
        location={location} 
        mapLoaded={mapLoaded} 
      />
      
      <SelectedLocationMarker 
        map={map} 
        selectedLocation={selectedLocation} 
        mapLoaded={mapLoaded} 
      />
      
      <LoadingOverlay isVisible={!mapLoaded} />
    </div>
  );
};
