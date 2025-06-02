
import { useState, useEffect } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  heading: number | null;
  error: string | null;
  loading: boolean;
}

export const useGeolocation = (enableHighAccuracy = true) => {
  const [location, setLocation] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    heading: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        error: 'Geolocation não é suportado neste dispositivo',
        loading: false,
      }));
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy,
      timeout: 10000,
      maximumAge: 60000,
    };

    const successHandler = (position: GeolocationPosition) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading,
        error: null,
        loading: false,
      });
    };

    const errorHandler = (error: GeolocationPositionError) => {
      let errorMessage = 'Erro desconhecido';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Acesso à localização foi negado';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Localização indisponível';
          break;
        case error.TIMEOUT:
          errorMessage = 'Timeout ao obter localização';
          break;
      }
      
      setLocation(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
    };

    // Obter localização inicial
    navigator.geolocation.getCurrentPosition(successHandler, errorHandler, options);

    // Monitorar mudanças de localização
    const watchId = navigator.geolocation.watchPosition(successHandler, errorHandler, options);

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [enableHighAccuracy]);

  return location;
};
