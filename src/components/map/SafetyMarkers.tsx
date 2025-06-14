import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useFogoCruzadoData } from '@/hooks/useFogoCruzadoData';

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

interface Incident {
  id: string;
  incident_type: string;
  date: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  neighborhood: string | null;
  deaths: number;
  wounded: number;
  description: string | null;
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
  const regionLayerIdRef = useRef<string | null>(null);

  // Use incidents data to show related occurrences in popups
  const { incidents } = useFogoCruzadoData();

  useEffect(() => {
    if (!map) return;

    // Remover marcadores e layers existentes
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    if (layerIdRef.current && map.getLayer(layerIdRef.current)) {
      map.removeLayer(layerIdRef.current);
      map.removeSource(layerIdRef.current);
    }
    if (regionLayerIdRef.current && map.getLayer(regionLayerIdRef.current)) {
      map.removeLayer(regionLayerIdRef.current);
      map.removeSource(regionLayerIdRef.current);
    }

    // Novo filtro robusto: latitude/longitude válidos, diferentes de 0, não null, não string
    const validSafetyData = safetyData.filter(data => {
      const lat = typeof data.latitude === 'number' ? data.latitude : Number(data.latitude);
      const lng = typeof data.longitude === 'number' ? data.longitude : Number(data.longitude);
      const isValid =
        lat !== undefined && lng !== undefined &&
        !isNaN(lat) && !isNaN(lng) &&
        lat !== 0 && lng !== 0 &&
        Math.abs(lat) > 0.05 && Math.abs(lng) > 0.05;
      if (!isValid) {
        console.warn(
          `[SafetyMarkers] Ignorando bairro "${data.neighborhood}" de "${data.city}" pois tem coordenadas inválidas (lat/lng:`, 
          data.latitude, data.longitude, ')'
        );
      }
      return isValid;
    });

    if (validSafetyData.length === 0) {
      console.log('No valid safety data with coordinates found');
      return;
    }

    // [1] Pintar as regiões: adicionar camada GeoJSON de polígonos simples baseados na posição do marcador
    // Usa buffers circulares para simular a região do bairro
    const regionLayerId = `safety-region-fill-${Date.now()}`;
    regionLayerIdRef.current = regionLayerId;

    // Gerar geojson de regiões circulares (buffer ~250m para visual leve em zoom alto)
    const regionsGeoJson = {
      type: 'FeatureCollection' as const,
      features: validSafetyData.map(data => ({
        type: 'Feature' as const,
        properties: {
          safety_percentage: data.safety_percentage,
          neighborhood: data.neighborhood,
          color: getSafetyColor(data.safety_percentage),
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [data.longitude!, data.latitude!],
        },
      })),
    };

    // Simula "buffers" circulares pequenos
    map.addSource(regionLayerId, {
      type: 'geojson',
      data: regionsGeoJson,
    });

    map.addLayer({
      id: regionLayerId,
      type: 'circle',
      source: regionLayerId,
      paint: {
        'circle-radius': [
          'interpolate', ['linear'], ['zoom'],
          10, 30,
          13, 60,
          16, 140,
        ],
        'circle-color': ['get', 'color'],
        'circle-opacity': 0.16,
        'circle-stroke-color': ['get', 'color'],
        'circle-stroke-width': 1,
        'circle-stroke-opacity': 0.2,
      },
      filter: ['!', ['has', 'point_count']],
    });

    // [2] Adicionar camada de heatmap (mesmo que antes)
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

    map.addSource(layerId, {
      type: 'geojson',
      data: heatmapData
    });

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

    // [3] Marcadores de segurança com informações extras
    validSafetyData.forEach(data => {
      if (!data.latitude || !data.longitude) return;

      const color = getSafetyColor(data.safety_percentage);
      const icon = getSafetyIcon(data.safety_percentage);
      const label = getSafetyLabel(data.safety_percentage);

      // Filtra ocorrências recentes (até 3) para o bairro/cidade do marcador
      let relatedIncidents: Incident[] = [];
      if (incidents && Array.isArray(incidents)) {
        relatedIncidents = incidents
          .filter(inc =>
            inc.neighborhood &&
            data.neighborhood &&
            inc.neighborhood.trim().toLocaleLowerCase() === data.neighborhood.trim().toLocaleLowerCase()
          )
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 3); // mostre só 3 mais recentes
      }

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
              <span style="font-weight: 500;">Ocorrências (6 meses):</span>
              <span>${data.crime_count}</span>
            </div>
            <div style="font-size: 11px; color: #666; margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">
              Última atualização: ${new Date(data.last_calculated).toLocaleDateString('pt-BR')}
            </div>
          </div>
          ${relatedIncidents.length > 0 ? `
            <div style="font-size:12px;margin-top:8px">
              <strong>Ocorrências recentes:</strong>
              <ul style="padding-left:16px; margin: 6px 0 0 0;">
                ${relatedIncidents
                  .map(inc =>
                    `<li>
                      <span title="${new Date(inc.date).toLocaleString('pt-BR')}">
                        ${new Date(inc.date).toLocaleDateString('pt-BR')}
                      </span>
                      - ${inc.incident_type}${inc.deaths ? `, <span style="color:#DC2626">Mortes:${inc.deaths}</span>` : ''}
                      ${inc.wounded ? `, <span style="color:#EA580C">Feridos:${inc.wounded}</span>` : ''}
                    </li>`
                  ).join('')}
              </ul>
            </div>
          ` : ''}
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
      if (regionLayerIdRef.current && map.getLayer(regionLayerIdRef.current)) {
        map.removeLayer(regionLayerIdRef.current);
        map.removeSource(regionLayerIdRef.current);
      }
    };
  }, [map, safetyData, incidents]);

  return null;
};
