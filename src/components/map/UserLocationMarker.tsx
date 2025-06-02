
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  heading: number | null;
  error: string | null;
  loading: boolean;
}

interface UserLocationMarkerProps {
  map: mapboxgl.Map | null;
  location: GeolocationState;
  mapLoaded: boolean;
}

export const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({ 
  map, 
  location, 
  mapLoaded 
}) => {
  const userMarker = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!map || !mapLoaded || !location.latitude || !location.longitude) return;

    // Remover marcador anterior
    if (userMarker.current) {
      userMarker.current.remove();
    }

    // Criar elemento customizado para o marcador do usuário
    const userMarkerElement = document.createElement('div');
    userMarkerElement.className = 'user-location-marker';
    userMarkerElement.style.cssText = `
      width: 20px;
      height: 20px;
      background: #1F3C88;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      cursor: pointer;
    `;

    // Adicionar marcador do usuário
    userMarker.current = new mapboxgl.Marker({
      element: userMarkerElement,
      anchor: 'center'
    })
    .setLngLat([location.longitude, location.latitude])
    .setPopup(
      new mapboxgl.Popup({ offset: 25, className: 'custom-popup' })
        .setHTML(`
          <div style="color: #000; font-weight: 500;">
            📍 Sua localização atual
            ${location.accuracy ? `<br><small>Precisão: ${Math.round(location.accuracy)}m</small>` : ''}
          </div>
        `)
    )
    .addTo(map);

    // Atualizar orientação se disponível
    if (location.heading !== null) {
      map.setBearing(location.heading);
    }

    return () => {
      if (userMarker.current) {
        userMarker.current.remove();
      }
    };
  }, [map, location, mapLoaded]);

  return null;
};
