
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

interface UserLocationMarkerProps {
  map: mapboxgl.Map | null;
  latitude: number;
  longitude: number;
  accuracy: number;
}

export const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({
  map,
  latitude,
  longitude,
  accuracy,
}) => {
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const accuracyCircleRef = useRef<string | null>(null);

  useEffect(() => {
    if (!map) return;

    const addMarkerAndCircle = () => {
      // Remove marcador anterior se existir
      if (markerRef.current) {
        markerRef.current.remove();
      }

      // Remove círculo de precisão anterior se existir
      if (accuracyCircleRef.current) {
        try {
          if (map && map.getStyle() && map.getLayer && map.getLayer(accuracyCircleRef.current)) {
            map.removeLayer(accuracyCircleRef.current);
          }
          if (map && map.getStyle() && map.getSource && map.getSource(accuracyCircleRef.current)) {
            map.removeSource(accuracyCircleRef.current);
          }
        } catch (error) {
          console.warn('Error removing previous accuracy circle:', error);
        }
      }

      // Criar elemento customizado para o marcador do usuário
      const userMarkerElement = document.createElement('div');
      userMarkerElement.className = 'user-location-marker';
      userMarkerElement.style.cssText = `
        width: 20px;
        height: 20px;
        background: #3B82F6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        position: relative;
      `;

      // Adicionar pulso ao marcador
      const pulseElement = document.createElement('div');
      pulseElement.style.cssText = `
        position: absolute;
        top: -3px;
        left: -3px;
        width: 26px;
        height: 26px;
        border: 2px solid #3B82F6;
        border-radius: 50%;
        animation: pulse 2s infinite;
        opacity: 0.6;
      `;

      // Adicionar animação CSS
      const style = document.createElement('style');
      style.textContent = `
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          70% {
            transform: scale(2);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 0.6;
          }
        }
      `;
      document.head.appendChild(style);

      userMarkerElement.appendChild(pulseElement);

      // Criar e adicionar marcador
      markerRef.current = new mapboxgl.Marker({
        element: userMarkerElement,
        anchor: 'center'
      })
      .setLngLat([longitude, latitude])
      .setPopup(
        new mapboxgl.Popup({ offset: 25, className: 'user-location-popup' })
          .setHTML(`
            <div style="color: #000; font-weight: 500; text-align: center;">
              <div style="font-size: 16px; margin-bottom: 4px;">📍 Sua Localização</div>
              <div style="font-size: 12px; color: #666;">
                Precisão: ${Math.round(accuracy)}m
              </div>
            </div>
          `)
      )
      .addTo(map);

      // Adicionar círculo de precisão se a precisão for relevante (> 50m)
      if (accuracy > 50) {
        const circleId = `user-accuracy-circle-${Date.now()}`;
        accuracyCircleRef.current = circleId;

        try {
          map.addSource(circleId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [longitude, latitude]
              },
              properties: {}
            }
          });

          map.addLayer({
            id: circleId,
            type: 'circle',
            source: circleId,
            paint: {
              'circle-radius': {
                stops: [
                  [0, 0],
                  [20, accuracy * 0.3] // Aproximação visual do raio de precisão
                ],
                base: 2
              },
              'circle-color': '#3B82F6',
              'circle-opacity': 0.1,
              'circle-stroke-color': '#3B82F6',
              'circle-stroke-width': 1,
              'circle-stroke-opacity': 0.3
            }
          });
        } catch (error) {
          console.warn('Error adding accuracy circle:', error);
        }
      }

      // Centralizar mapa na localização do usuário
      map.flyTo({
        center: [longitude, latitude],
        zoom: 16,
        duration: 2000
      });
    };

    // Check if map style is loaded before adding marker and sources
    if (map.isStyleLoaded()) {
      addMarkerAndCircle();
    } else {
      // Wait for style to load
      const handleStyleLoad = () => {
        addMarkerAndCircle();
        map.off('style.load', handleStyleLoad);
      };
      map.on('style.load', handleStyleLoad);
    }

    // Cleanup
    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      
      if (accuracyCircleRef.current && map) {
        try {
          // Verificar se o mapa ainda existe e tem o estilo carregado
          if (map.getStyle && map.getStyle()) {
            if (map.getLayer && map.getLayer(accuracyCircleRef.current)) {
              map.removeLayer(accuracyCircleRef.current);
            }
            if (map.getSource && map.getSource(accuracyCircleRef.current)) {
              map.removeSource(accuracyCircleRef.current);
            }
          }
        } catch (error) {
          console.warn('Error during cleanup:', error);
        }
        accuracyCircleRef.current = null;
      }
    };
  }, [map, latitude, longitude, accuracy]);

  return null;
};
