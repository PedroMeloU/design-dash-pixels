
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  heading: number | null;
  error: string | null;
  loading: boolean;
}

interface MapContainerProps {
  location: GeolocationState;
  onMapLoad: (map: mapboxgl.Map) => void;
}

export const MapContainer: React.FC<MapContainerProps> = ({ location, onMapLoad }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

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
      style: 'mapbox://styles/mapbox/streets-v12',
      center: initialCenter,
      zoom: location.latitude && location.longitude ? 15 : 13,
      pitch: 0,
      bearing: 0,
      attributionControl: false
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
      onMapLoad(map.current!);
      
      // Tentar ativar o tracking automático se a localização estiver disponível
      if (location.latitude && location.longitude) {
        geolocateControl.trigger();
      }
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [location, onMapLoad]);

  return (
    <div 
      ref={mapContainer} 
      className="h-full w-full"
      style={{ minHeight: '100vh' }}
    />
  );
};
