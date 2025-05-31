
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Corrigir os ícones padrão do Leaflet (importando via CDN)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente filho para forçar o redimensionamento do mapa
const ResizeMap = () => {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => clearTimeout(timer);
  }, [map]);

  return null;
};

export const InteractiveMap: React.FC = () => {
  const defaultPosition: [number, number] = [-23.5505, -46.6333]; // São Paulo

  return (
    <div className="absolute inset-0 z-0" style={{ height: '100vh', width: '100vw' }}>
      <MapContainer
        center={defaultPosition}
        zoom={13}
        className="h-full w-full"
        zoomControl={false}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
      >
        {/* Redimensiona corretamente após o render */}
        <ResizeMap />

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
