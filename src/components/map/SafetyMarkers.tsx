
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

interface SafetyData {
  neighborhood: string;
  city: string;
  state: string;
  safety_percentage: number;
  crime_count: number;
  last_calculated: string;
  latitude?: number;
  longitude?: number;
}

interface SafetyMarkersProps {
  map: mapboxgl.Map | null;
  safetyData: SafetyData[];
}

const getSafetyColor = (safetyPercentage: number): string => {
  if (safetyPercentage >= 80) return '#10B981'; // Verde - Muito seguro
  if (safetyPercentage >= 60) return '#F59E0B'; // Amarelo - Moderadamente seguro
  if (safetyPercentage >= 40) return '#EF4444'; // Vermelho - Pouco seguro
  return '#7F1D1D'; // Vermelho escuro - Muito perigoso
};

const getSafetyIcon = (safetyPercentage: number): string => {
  if (safetyPercentage >= 80) return '🛡️';
  if (safetyPercentage >= 60) return '⚠️';
  if (safetyPercentage >= 40) return '⚡';
  return '🚨';
};

const getSafetyLabel = (safetyPercentage: number): string => {
  if (safetyPercentage >= 80) return 'Muito Seguro';
  if (safetyPercentage >= 60) return 'Moderadamente Seguro';
  if (safetyPercentage >= 40) return 'Pouco Seguro';
  return 'Perigoso';
};

export const SafetyMarkers: React.FC<SafetyMarkersProps> = ({ map, safetyData }) => {
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const layerIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!map) return;

    // Remover marcadores existentes
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Remover camada existente se houver
    if (layerIdRef.current && map.getLayer(layerIdRef.current)) {
      map.removeLayer(layerIdRef.current);
      map.removeSource(layerIdRef.current);
    }

    // Filtrar apenas dados com coordenadas válidas
    const validSafetyData = safetyData.filter(data => 
      data.latitude && data.longitude && !isNaN(data.latitude) && !isNaN(data.longitude)
    );

    if (validSafetyData.length === 0) {
      console.log('No valid safety data with coordinates found');
      return;
    }

    // Criar fonte de dados para heatmap
    const layerId = `safety-heatmap-${Date.now()}`;
    layerIdRef.current = layerId;

    const heatmapData = {
      type: 'FeatureCollection' as const,
      features: validSafetyData.map(data => ({
        type: 'Feature' as const,
        properties: {
          safety_percentage: data.safety_percentage,
          crime_count: data.crime_count,
          neighborhood: data.neighborhood
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [data.longitude!, data.latitude!]
        }
      }))
    };

    // Adicionar fonte de dados
    map.addSource(layerId, {
      type: 'geojson',
      data: heatmapData
    });

    // Adicionar camada de heatmap
    map.addLayer({
      id: layerId,
      type: 'heatmap',
      source: layerId,
      maxzoom: 15,
      paint: {
        'heatmap-weight': [
          'interpolate',
          ['linear'],
          ['get', 'crime_count'],
          0, 0,
          50, 1
        ],
        'heatmap-intensity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 1,
          15, 3
        ],
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(33,102,172,0)',
          0.2, 'rgb(103,169,207)',
          0.4, 'rgb(209,229,240)',
          0.6, 'rgb(253,219,199)',
          0.8, 'rgb(239,138,98)',
          1, 'rgb(178,24,43)'
        ],
        'heatmap-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 2,
          15, 20
        ],
        'heatmap-opacity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          7, 1,
          15, 0
        ]
      }
    });

    // Adicionar marcadores individuais para zoom alto
    validSafetyData.forEach(data => {
      if (!data.latitude || !data.longitude) return;

      const color = getSafetyColor(data.safety_percentage);
      const icon = getSafetyIcon(data.safety_percentage);
      const label = getSafetyLabel(data.safety_percentage);

      // Criar elemento do marcador
      const markerElement = document.createElement('div');
      markerElement.className = 'safety-marker';
      markerElement.style.cssText = `
        width: 35px;
        height: 35px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        box-shadow: 0 3px 12px rgba(0,0,0,0.4);
        cursor: pointer;
        position: relative;
        transition: transform 0.2s ease;
      `;
      markerElement.innerHTML = icon;

      // Adicionar efeito hover
      markerElement.addEventListener('mouseenter', () => {
        markerElement.style.transform = 'scale(1.2)';
      });
      markerElement.addEventListener('mouseleave', () => {
        markerElement.style.transform = 'scale(1)';
      });

      // Conteúdo do popup
      const popupContent = `
        <div style="color: #000; max-width: 280px; padding: 8px;">
          <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: ${color};">
            ${icon} ${data.neighborhood}
          </h3>
          <div style="font-size: 13px; line-height: 1.5;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-weight: 500;">Índice de Segurança:</span>
              <span style="color: ${color}; font-weight: 600;">${data.safety_percentage.toFixed(1)}%</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-weight: 500;">Classificação:</span>
              <span style="color: ${color}; font-weight: 600;">${label}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-weight: 500;">Ocorrências:</span>
              <span>${data.crime_count}</span>
            </div>
            <div style="font-size: 11px; color: #666; margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">
              Última atualização: ${new Date(data.last_calculated).toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>
      `;

      // Criar marcador
      const marker = new mapboxgl.Marker({
        element: markerElement,
        anchor: 'center'
      })
      .setLngLat([data.longitude, data.latitude])
      .setPopup(
        new mapboxgl.Popup({ 
          offset: 25,
          className: 'safety-popup',
          maxWidth: '320px',
          closeButton: true,
          closeOnClick: false
        }).setHTML(popupContent)
      );

      // Mostrar marcador apenas em zoom alto
      const updateMarkerVisibility = () => {
        const zoom = map.getZoom();
        if (zoom > 12) {
          marker.addTo(map);
        } else {
          marker.remove();
        }
      };

      // Atualizar visibilidade inicial e em mudanças de zoom
      updateMarkerVisibility();
      map.on('zoom', updateMarkerVisibility);

      markersRef.current.push(marker);
    });

    // Cleanup
    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      
      if (layerIdRef.current && map.getLayer(layerIdRef.current)) {
        map.removeLayer(layerIdRef.current);
        map.removeSource(layerIdRef.current);
      }
    };
  }, [map, safetyData]);

  return null;
};
