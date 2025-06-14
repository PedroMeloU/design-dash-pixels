
import React, { useEffect, useRef, useCallback, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { useFogoCruzadoData } from '@/hooks/useFogoCruzadoData';
import { getSafetyColor } from './getSafetyColor';
import { getSafetyIcon } from './getSafetyIcon';
import { getSafetyLabel } from './getSafetyLabel';
import { useValidSafetyData } from './useValidSafetyData';
import { SafetyMarkerModal } from './SafetyMarkerModal';

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

export const SafetyMarkers: React.FC<{
  map: mapboxgl.Map | null;
  safetyData: SafetyData[];
}> = ({ map, safetyData }) => {
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const layerIdRef = useRef<string | null>(null);
  const regionLayerIdRef = useRef<string | null>(null);
  const onZoomListenerRef = useRef<(() => void) | null>(null);
  const { incidents } = useFogoCruzadoData();
  const validSafetyData = useValidSafetyData(safetyData);
  const [modalData, setModalData] = useState<null | {
    data: SafetyData;
    relatedIncidents: any[];
  }>(null);

  // Otimiza criação dos marcadores sem reprocessar em excesso
  const placeSafetyMarkers = useCallback(() => {
    if (!map) return;

    // Limpa marcadores antigos
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    const zoom = map.getZoom();
    if (zoom < 13) return; // Só mostra no zoom ideal

    validSafetyData.forEach(data => {
      if (!data.latitude || !data.longitude) return;
      const color = getSafetyColor(data.safety_percentage);
      const icon = getSafetyIcon(data.safety_percentage);
      const label = getSafetyLabel(data.safety_percentage);

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

      markerElement.addEventListener('click', (e) => {
        e.stopPropagation();
        let relatedIncidents: any[] = [];
        if (incidents && Array.isArray(incidents)) {
          relatedIncidents = incidents
            .filter(inc =>
              inc.neighborhood &&
              data.neighborhood &&
              inc.neighborhood.trim().toLocaleLowerCase() === data.neighborhood.trim().toLocaleLowerCase()
            )
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 3);
        }
        setModalData({ data, relatedIncidents });
      });

      const marker = new mapboxgl.Marker({
        element: markerElement,
        anchor: 'center'
      })
        .setLngLat([data.longitude, data.latitude])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [map, validSafetyData, incidents]);

  useEffect(() => {
    if (!map) return;

    // Remove event listener antigo antes de adicionar outro
    if (onZoomListenerRef.current) {
      map.off('zoom', onZoomListenerRef.current);
      onZoomListenerRef.current = null;
    }

    // Remove marcadores e camadas antigas
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

    if (validSafetyData.length === 0) {
      return;
    }

    // Região colorida
    const regionLayerId = `safety-region-fill-${Date.now()}`;
    regionLayerIdRef.current = regionLayerId;
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

    // Heatmap
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

    // Adiciona marcadores e controle de evento só uma vez
    placeSafetyMarkers();
    const boundListener = () => placeSafetyMarkers();
    map.on('zoom', boundListener);
    onZoomListenerRef.current = boundListener;

    return () => {
      // Limpa tudo de novo
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
      if (onZoomListenerRef.current) {
        map.off('zoom', onZoomListenerRef.current);
        onZoomListenerRef.current = null;
      }
    };
  }, [map, validSafetyData, incidents, placeSafetyMarkers]);

  return (
    <>
      <SafetyMarkerModal
        open={!!modalData}
        data={modalData?.data || null}
        relatedIncidents={modalData?.relatedIncidents || []}
        onClose={() => setModalData(null)}
      />
    </>
  );
};
