
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useGeolocation } from '@/hooks/useGeolocation';

interface InteractiveMapProps {
  selectedLocation?: { center: [number, number]; name: string } | null;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ selectedLocation }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const selectedMarker = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const location = useGeolocation();

  useEffect(() => {
    if (!mapContainer.current) return;

    // Configurar token do Mapbox
    mapboxgl.accessToken = 'pk.eyJ1IjoicGVkcm9tZWxvIiwiYSI6ImNtYmQ0NnU2ZjF1eG0ybW9kampic2l0dnIifQ.3AKo52hZMDfkH54OitiNuA';
    
    // Coordenadas padrão (São Paulo)
    const defaultCenter: [number, number] = [-46.6333, -23.5505];
    
    // Usar localização do usuário se disponível
    const initialCenter = location.latitude && location.longitude 
      ? [location.longitude, location.latitude] as [number, number]
      : defaultCenter;

    // Inicializar mapa
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12', // Estilo mais claro para mobile
      center: initialCenter,
      zoom: location.latitude && location.longitude ? 15 : 13,
      pitch: 0,
      bearing: 0,
      attributionControl: false // Remove atribuição para mais espaço
    });

    // Adicionar controles de navegação otimizados para mobile
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
        showZoom: true,
        showCompass: true
      }),
      'top-right'
    );

    // Adicionar controle de geolocalização
    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
        timeout: 6000
      },
      trackUserLocation: true,
      showUserHeading: true,
      showAccuracyCircle: true
    });

    map.current.addControl(geolocateControl, 'top-right');

    map.current.on('load', () => {
      setMapLoaded(true);
      
      // Tentar ativar o tracking automático se a localização estiver disponível
      if (location.latitude && location.longitude) {
        geolocateControl.trigger();
      }
    });

    // Cleanup
    return () => {
      if (userMarker.current) {
        userMarker.current.remove();
      }
      if (selectedMarker.current) {
        selectedMarker.current.remove();
      }
      map.current?.remove();
    };
  }, []);

  // Atualizar marcador do usuário quando a localização mudar
  useEffect(() => {
    if (!map.current || !mapLoaded || !location.latitude || !location.longitude) return;

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
    .addTo(map.current);

    // Atualizar orientação se disponível
    if (location.heading !== null) {
      map.current.setBearing(location.heading);
    }
  }, [location, mapLoaded]);

  // Mover mapa para localização selecionada
  useEffect(() => {
    if (!map.current || !mapLoaded || !selectedLocation) return;

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
    .addTo(map.current);

    // Mover mapa para a localização selecionada
    map.current.flyTo({
      center: selectedLocation.center,
      zoom: 16,
      duration: 2000
    });
  }, [selectedLocation, mapLoaded]);

  return (
    <div className="absolute inset-0 z-0 h-screen w-screen">
      <div 
        ref={mapContainer} 
        className="h-full w-full"
        style={{ minHeight: '100vh' }}
      />
      
      {/* Loading overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1F3C88] border-t-transparent"></div>
            <p className="text-gray-600 font-medium">Carregando mapa...</p>
          </div>
        </div>
      )}

      {/* Custom styles */}
      <style jsx>{`
        .custom-popup .mapboxgl-popup-content {
          padding: 8px 12px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .custom-popup .mapboxgl-popup-tip {
          border-top-color: white;
        }
      `}</style>
    </div>
  );
};
