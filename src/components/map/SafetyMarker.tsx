
import React, { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import { getSafetyColor } from "./getSafetyColor";
import { getSafetyIcon } from "./getSafetyIcon";
import { getSafetyLabel } from "./getSafetyLabel";
import { useRelatedIncidents } from "./useRelatedIncidents";

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
  neighborhood: string | null;
  date: string;
  [key: string]: any;
}

interface SafetyMarkerProps {
  map: mapboxgl.Map;
  data: SafetyData;
  incidents: Incident[];
  onClick: (data: SafetyData, relatedIncidents: Incident[]) => void;
}

export const SafetyMarker: React.FC<SafetyMarkerProps> = ({
  map,
  data,
  incidents,
  onClick,
}) => {
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const relatedIncidents = useRelatedIncidents(incidents, data.neighborhood);

  useEffect(() => {
    if (!map || !data.latitude || !data.longitude) return;

    const color = getSafetyColor(data.safety_percentage);
    const icon = getSafetyIcon(data.safety_percentage);

    const markerElement = document.createElement("div");
    markerElement.className = "safety-marker";
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
    markerElement.addEventListener("mouseenter", () => {
      markerElement.style.transform = "scale(1.2)";
    });
    markerElement.addEventListener("mouseleave", () => {
      markerElement.style.transform = "scale(1)";
    });
    markerElement.addEventListener("click", (e) => {
      e.stopPropagation();
      onClick(data, relatedIncidents);
    });

    markerRef.current = new mapboxgl.Marker({
      element: markerElement,
      anchor: "center",
    })
      .setLngLat([data.longitude, data.latitude])
      .addTo(map);

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
    };
  }, [
    map,
    data.latitude,
    data.longitude,
    data.safety_percentage,
    data.neighborhood,
    relatedIncidents,
    onClick,
  ]);

  return null;
};
