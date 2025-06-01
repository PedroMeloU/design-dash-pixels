
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export const InteractiveMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Configurar token do Mapbox
    mapboxgl.accessToken = 'pk.eyJ1IjoicGVkcm9tZWxvIiwiYSI6ImNtYmQ0NnU2ZjF1eG0ybW9kampic2l0dnIifQ.3AKo52hZMDfkH54OitiNuA';
    
    // Inicializar mapa
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11', // Modo escuro
      center: [-46.6333, -23.5505], // São Paulo
      zoom: 13,
      pitch: 0,
      bearing: 0
    });

    // Adicionar controles de navegação
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Adicionar marcador na localização padrão
    new mapboxgl.Marker({
      color: '#1F3C88'
    })
    .setLngLat([-46.6333, -23.5505])
    .setPopup(
      new mapboxgl.Popup({ offset: 25 })
        .setHTML('<div style="color: #000;">Sua localização atual</div>')
    )
    .addTo(map.current);

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 h-screen w-screen">
      <div 
        ref={mapContainer} 
        className="h-full w-full"
        style={{ minHeight: '100vh' }}
      />
    </div>
  );
};
