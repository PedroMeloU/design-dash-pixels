
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export const InteractiveMap: React.FC = () => {
  const defaultPosition: [number, number] = [-23.5505, -46.6333]; // São Paulo coordinates
  const mapRef = useRef<any>(null);

  useEffect(() => {
    console.log('InteractiveMap component mounted');
    
    // Force map resize after component mounts
    const timer = setTimeout(() => {
      if (mapRef.current) {
        console.log('Invalidating map size');
        mapRef.current.invalidateSize();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  console.log('Rendering InteractiveMap with position:', defaultPosition);

  return (
    <div className="absolute inset-0 z-0" style={{ height: '100vh', width: '100vw' }}>
      <MapContainer
        ref={mapRef}
        center={defaultPosition}
        zoom={13}
        className="h-full w-full"
        zoomControl={false}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={defaultPosition}>
          <Popup>
            Sua localização atual
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};
