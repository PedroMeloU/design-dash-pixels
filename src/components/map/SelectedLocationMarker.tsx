
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

interface SelectedLocationMarkerProps {
  map: mapboxgl.Map | null;
  selectedLocation: { center: [number, number]; name: string } | null;
  mapLoaded: boolean;
}

export const SelectedLocationMarker: React.FC<SelectedLocationMarkerProps> = ({ 
  map, 
  selectedLocation, 
  mapLoaded 
}) => {
  const selectedMarker = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!map || !mapLoaded || !selectedLocation) return;

    // Remover marcador anterior
    if (selectedMarker.current) {
      selectedMarker.current.remove();
    }

    // Criar marcador para localização selecionada
    const selectedMarkerElement = document.createElement('div');
    selectedMarkerElement.className = 'selected-location-marker';
    selectedMarkerElement.style.cssText = `
      width: 30px;
      height: 30px;
      background: #ef4444;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 3px 12px rgba(0,0,0,0.4);
      cursor: pointer;
      position: relative;
    `;

    // Adicionar pino no topo
    const pin = document.createElement('div');
    pin.style.cssText = `
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-bottom: 10px solid #ef4444;
    `;
    selectedMarkerElement.appendChild(pin);

    selectedMarker.current = new mapboxgl.Marker({
      element: selectedMarkerElement,
      anchor: 'bottom'
    })
    .setLngLat(selectedLocation.center)
    .setPopup(
      new mapboxgl.Popup({ offset: 25, className: 'custom-popup' })
        .setHTML(`<div style="color: #000; font-weight: 500;">📍 ${selectedLocation.name}</div>`)
    )
    .addTo(map);

    // Mover mapa para a localização selecionada
    map.flyTo({
      center: selectedLocation.center,
      zoom: 16,
      duration: 2000
    });

    return () => {
      if (selectedMarker.current) {
        selectedMarker.current.remove();
      }
    };
  }, [map, selectedLocation, mapLoaded]);

  return null;
};
