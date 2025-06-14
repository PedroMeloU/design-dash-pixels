
import React, { useEffect, useRef, useCallback, useState } from "react";
import mapboxgl from "mapbox-gl";
import { useFogoCruzadoData } from "@/hooks/useFogoCruzadoData";
import { useValidSafetyData } from "./useValidSafetyData";
import { SafetyMarkerModal } from "./SafetyMarkerModal";
import { SafetyMarker } from "./SafetyMarker";

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
  const layerIdRef = useRef<string | null>(null);
  const regionLayerIdRef = useRef<string | null>(null);
  const onZoomListenerRef = useRef<(() => void) | null>(null);
  const { incidents } = useFogoCruzadoData();
  const validSafetyData = useValidSafetyData(safetyData);

  // Modal state
  const [modalData, setModalData] = useState<null | {
    data: SafetyData;
    relatedIncidents: any[];
  }>(null);

  // Handler for opening modal with related incidents
  const handleOpenModal = useCallback((data: SafetyData, relatedIncidents: any[]) => {
    setModalData(null); // force re-mount
    setTimeout(() => setModalData({ data, relatedIncidents }), 0);
  }, []);

  const placeSafetyRegionsAndHeatmap = useCallback(() => {
    if (!map) return;
    // Remove old layers/sources
    if (layerIdRef.current && map.getLayer(layerIdRef.current)) {
      map.removeLayer(layerIdRef.current);
      map.removeSource(layerIdRef.current);
    }
    if (regionLayerIdRef.current && map.getLayer(regionLayerIdRef.current)) {
      map.removeLayer(regionLayerIdRef.current);
      map.removeSource(regionLayerIdRef.current);
    }
    if (!validSafetyData.length) return;
    // Região colorida
    const regionLayerId = `safety-region-fill-${Date.now()}`;
    regionLayerIdRef.current = regionLayerId;
    const regionsGeoJson = {
      type: "FeatureCollection" as const,
      features: validSafetyData.map((data) => ({
        type: "Feature" as const,
        properties: {
          safety_percentage: data.safety_percentage,
          neighborhood: data.neighborhood,
          color: require("./getSafetyColor").getSafetyColor(data.safety_percentage),
        },
        geometry: {
          type: "Point" as const,
          coordinates: [data.longitude!, data.latitude!],
        },
      })),
    };
    map.addSource(regionLayerId, {
      type: "geojson",
      data: regionsGeoJson,
    });
    map.addLayer({
      id: regionLayerId,
      type: "circle",
      source: regionLayerId,
      paint: {
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          10,
          30,
          13,
          60,
          16,
          140,
        ],
        "circle-color": ["get", "color"],
        "circle-opacity": 0.16,
        "circle-stroke-color": ["get", "color"],
        "circle-stroke-width": 1,
        "circle-stroke-opacity": 0.2,
      },
      filter: ["!", ["has", "point_count"]],
    });

    // Heatmap
    const layerId = `safety-heatmap-${Date.now()}`;
    layerIdRef.current = layerId;
    const heatmapData = {
      type: "FeatureCollection" as const,
      features: validSafetyData.map((data) => ({
        type: "Feature" as const,
        properties: {
          safety_percentage: data.safety_percentage,
          crime_count: data.crime_count,
          neighborhood: data.neighborhood,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [data.longitude!, data.latitude!],
        },
      })),
    };
    map.addSource(layerId, {
      type: "geojson",
      data: heatmapData,
    });
    map.addLayer({
      id: layerId,
      type: "heatmap",
      source: layerId,
      maxzoom: 15,
      paint: {
        "heatmap-weight": [
          "interpolate",
          ["linear"],
          ["get", "crime_count"],
          0,
          0,
          50,
          1,
        ],
        "heatmap-intensity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          0,
          1,
          15,
          3,
        ],
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0,
          "rgba(33,102,172,0)",
          0.2,
          "rgb(103,169,207)",
          0.4,
          "rgb(209,229,240)",
          0.6,
          "rgb(253,219,199)",
          0.8,
          "rgb(239,138,98)",
          1,
          "rgb(178,24,43)",
        ],
        "heatmap-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          0,
          2,
          15,
          20,
        ],
        "heatmap-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          7,
          1,
          15,
          0,
        ],
      },
    });
  }, [map, validSafetyData]);

  // Regions and heatmap layers
  useEffect(() => {
    if (!map) return;

    // Remove listeners/layers before re-adding
    if (onZoomListenerRef.current) {
      map.off("zoom", onZoomListenerRef.current);
      onZoomListenerRef.current = null;
    }
    // Clean up old layers
    if (layerIdRef.current && map.getLayer(layerIdRef.current)) {
      map.removeLayer(layerIdRef.current);
      map.removeSource(layerIdRef.current);
    }
    if (regionLayerIdRef.current && map.getLayer(regionLayerIdRef.current)) {
      map.removeLayer(regionLayerIdRef.current);
      map.removeSource(regionLayerIdRef.current);
    }
    placeSafetyRegionsAndHeatmap();

    // Re-render markers on zoom events
    const trigger = () => setZoomed((z) => z + 1);
    map.on("zoom", trigger);
    onZoomListenerRef.current = trigger;

    return () => {
      if (layerIdRef.current && map.getLayer(layerIdRef.current)) {
        map.removeLayer(layerIdRef.current);
        map.removeSource(layerIdRef.current);
      }
      if (regionLayerIdRef.current && map.getLayer(regionLayerIdRef.current)) {
        map.removeLayer(regionLayerIdRef.current);
        map.removeSource(regionLayerIdRef.current);
      }
      if (onZoomListenerRef.current) {
        map.off("zoom", onZoomListenerRef.current);
        onZoomListenerRef.current = null;
      }
    };
  }, [map, validSafetyData, placeSafetyRegionsAndHeatmap]);

  // For trigger marker rerender on zoom
  const [zoomed, setZoomed] = useState(0);

  // Markers (renders only at zoom >= 13)
  const renderMarkers = () => {
    if (!map) return null;
    if (map.getZoom() < 13) return null;
    return validSafetyData.map((data) =>
      data.latitude && data.longitude ? (
        <SafetyMarker
          key={`${data.neighborhood}-${data.latitude}-${data.longitude}`}
          map={map}
          data={data}
          incidents={incidents || []}
          onClick={handleOpenModal}
        />
      ) : null
    );
  };

  return (
    <>
      {renderMarkers()}
      <SafetyMarkerModal
        open={!!modalData}
        data={modalData?.data || null}
        relatedIncidents={modalData?.relatedIncidents || []}
        onClose={() => setModalData(null)}
      />
    </>
  );
};
