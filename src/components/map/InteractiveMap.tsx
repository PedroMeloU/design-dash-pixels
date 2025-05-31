import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Corrigindo os ícones padrão do Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Componente auxiliar para forçar o redimensionamento do mapa
const ResizeMap = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);
  return null;
};

export const InteractiveMap: React.FC = () => {
  const defaultPosition: [number, number] = [-23.5505, -46.6333]; // São Paulo

  return (
    <div style={{ height: '100vh', width: '100vw' }} className="absolute inset-0 z-0 h-screen w-screen">
      <MapContainer
        center={defaultPosition}
        zoom={13}
        className="h-full w-full"
        zoomControl={false}
        style={{ minHeight: '400px' }}
      >
        <ResizeMap />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={defaultPosition}>
          <Popup>Sua localização atual</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};
