import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { IncidentMarkers } from './IncidentMarkers';
import { UserLocationMarker } from './UserLocationMarker';
import { useFogoCruzadoData } from '@/hooks/useFogoCruzadoData';
import { useUserLocation } from '@/hooks/useUserLocation';
import { SafetyMarkers } from './SafetyMarkers';
import { useSafetyData } from '@/hooks/useSafetyData';

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
  selectedLocation?: { center: [number, number]; name: string } | null;
  onMapLoad: () => void;
}

export const MapContainer: React.FC<MapContainerProps> = ({ 
  location, 
  selectedLocation, 
  onMapLoad 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const selectedMarker = useRef<mapboxgl.Marker | null>(null);
  
  const { incidents } = useFogoCruzadoData();
  const { userLocation } = useUserLocation();
  const { safetyData } = useSafetyData();

  useEffect(() => {
    if (!mapContainer.current) return;

    // Configure Mapbox token
    mapboxgl.accessToken = 'pk.eyJ1IjoicGVkcm9tZWxvIiwiYSI6ImNtYmQ0NnU2ZjF1eG0ybW9kampic2l0dnIifQ.3AKo52hZMDfkH54OitiNuA';
    
    // Default coordinates (São Paulo)
    const defaultCenter: [number, number] = [-46.6333, -23.5505];
    
    // Use user location if available
    const initialCenter = location.latitude && location.longitude 
      ? [location.longitude, location.latitude] as [number, number]
      : defaultCenter;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: initialCenter,
      zoom: location.latitude && location.longitude ? 15 : 13,
      pitch: 0,
      bearing: 0,
      attributionControl: false
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
        showZoom: true,
        showCompass: true
      }),
      'top-right'
    );

    // Add geolocation control
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
      onMapLoad();
      
      // Try to activate automatic tracking if location is available
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

  // Update user marker when location changes
  useEffect(() => {
    if (!map.current || !location.latitude || !location.longitude) return;

    // Remove previous marker
    if (userMarker.current) {
      userMarker.current.remove();
    }

    // Create custom element for user marker
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

    // Add user marker
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

    // Update orientation if available
    if (location.heading !== null && map.current) {
      map.current.setBearing(location.heading);
    }
  }, [location]);

  // Move map to selected location
  useEffect(() => {
    if (!map.current || !selectedLocation) return;

    // Remove previous marker
    if (selectedMarker.current) {
      selectedMarker.current.remove();
    }

    // Create marker for selected location
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

    // Add pin on top
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

    // Move map to selected location
    map.current.flyTo({
      center: selectedLocation.center,
      zoom: 16,
      duration: 2000
    });
  }, [selectedLocation]);

  return (
    <div className="relative h-full w-full">
      <div 
        ref={mapContainer} 
        className="h-full w-full"
        style={{ minHeight: '100vh' }}
      />
      <IncidentMarkers map={map.current} incidents={incidents} />
      <SafetyMarkers map={map.current} safetyData={safetyData} />
      {userLocation && (
        <UserLocationMarker
          map={map.current}
          latitude={userLocation.latitude}
          longitude={userLocation.longitude}
          accuracy={userLocation.accuracy}
        />
      )}
    </div>
  );
};
