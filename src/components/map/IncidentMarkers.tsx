
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

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

interface IncidentMarkersProps {
  map: mapboxgl.Map | null;
  incidents: Incident[];
}

const getIncidentColor = (incidentType: string, deaths: number, wounded: number) => {
  if (deaths > 0) return '#DC2626'; // Red for fatal incidents
  if (wounded > 0) return '#EA580C'; // Orange for incidents with wounded
  if (incidentType.toLowerCase().includes('tiroteio') || incidentType.toLowerCase().includes('disparo')) {
    return '#D97706'; // Amber for shootings
  }
  return '#7C2D12'; // Brown for other incidents
};

const getIncidentIcon = (incidentType: string, deaths: number) => {
  if (deaths > 0) return '💀';
  if (incidentType.toLowerCase().includes('tiroteio')) return '🔫';
  if (incidentType.toLowerCase().includes('disparo')) return '💥';
  return '⚠️';
};

export const IncidentMarkers: React.FC<IncidentMarkersProps> = ({ map, incidents }) => {
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!map) return;

    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers for incidents
    incidents.forEach(incident => {
      if (!incident.latitude || !incident.longitude) return;

      const color = getIncidentColor(incident.incident_type, incident.deaths, incident.wounded);
      const icon = getIncidentIcon(incident.incident_type, incident.deaths);

      // Create marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'incident-marker';
      markerElement.style.cssText = `
        width: 30px;
        height: 30px;
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        position: relative;
      `;
      markerElement.innerHTML = icon;

      // Add pulse animation for recent incidents (last 7 days)
      const incidentDate = new Date(incident.date);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      if (incidentDate > sevenDaysAgo) {
        markerElement.style.animation = 'pulse 2s infinite';
        const style = document.createElement('style');
        style.textContent = `
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 ${color}80; }
            70% { box-shadow: 0 0 0 10px ${color}00; }
            100% { box-shadow: 0 0 0 0 ${color}00; }
          }
        `;
        document.head.appendChild(style);
      }

      // Create popup content
      const popupContent = `
        <div style="color: #000; max-width: 250px;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">
            ${icon} ${incident.incident_type}
          </h3>
          <div style="font-size: 12px; line-height: 1.4;">
            <p style="margin: 4px 0;"><strong>Data:</strong> ${new Date(incident.date).toLocaleDateString('pt-BR')}</p>
            ${incident.neighborhood ? `<p style="margin: 4px 0;"><strong>Bairro:</strong> ${incident.neighborhood}</p>` : ''}
            ${incident.address ? `<p style="margin: 4px 0;"><strong>Endereço:</strong> ${incident.address}</p>` : ''}
            ${incident.deaths > 0 ? `<p style="margin: 4px 0; color: #DC2626;"><strong>Mortes:</strong> ${incident.deaths}</p>` : ''}
            ${incident.wounded > 0 ? `<p style="margin: 4px 0; color: #EA580C;"><strong>Feridos:</strong> ${incident.wounded}</p>` : ''}
            ${incident.description ? `<p style="margin: 4px 0;"><strong>Descrição:</strong> ${incident.description.substring(0, 100)}${incident.description.length > 100 ? '...' : ''}</p>` : ''}
          </div>
        </div>
      `;

      // Create marker
      const marker = new mapboxgl.Marker({
        element: markerElement,
        anchor: 'center'
      })
      .setLngLat([incident.longitude, incident.latitude])
      .setPopup(
        new mapboxgl.Popup({ 
          offset: 25,
          className: 'incident-popup',
          maxWidth: '300px'
        }).setHTML(popupContent)
      )
      .addTo(map);

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    };
  }, [map, incidents]);

  return null;
};
