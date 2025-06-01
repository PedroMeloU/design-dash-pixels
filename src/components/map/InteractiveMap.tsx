
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Corrigindo os ícones padrão do Leaflet de forma mais robusta
const fixLeafletIcons = () => {
  try {
    // Remove the default icon URL getter
    if (L.Icon.Default.prototype._getIconUrl) {
      delete L.Icon.Default.prototype._getIconUrl;
    }

    // Set default icon options
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
  } catch (error) {
    console.warn('Error setting up Leaflet icons:', error);
  }
};

// Chama a configuração dos ícones imediatamente
fixLeafletIcons();

// Componente auxiliar para forçar o redimensionamento do mapa
const ResizeMap = () => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      if (map) {
        map.invalidateSize();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

export const InteractiveMap = () => {
  const defaultPosition = [-23.5505, -46.6333]; // São Paulo

  return (
    <div className="absolute inset-0 z-0 h-screen w-screen">
      <MapContainer
        center={defaultPosition}
        zoom={13}
        className="h-full w-full"
        zoomControl={false}
        style={{ minHeight: '400px' }}
        whenCreated={(mapInstance) => {
          console.log('Map created successfully:', mapInstance);
        }}
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
