
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface UseUserLocationReturn {
  userLocation: UserLocation | null;
  isLoading: boolean;
  error: string | null;
  requestLocation: () => void;
}

export const useUserLocation = (): UseUserLocationReturn => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const requestLocation = () => {
    if (!navigator.geolocation) {
      const errorMsg = 'Geolocalização não é suportada neste navegador';
      setError(errorMsg);
      toast({
        title: "Erro de Localização",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    };

    const successHandler = (position: GeolocationPosition) => {
      const location: UserLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };
      
      setUserLocation(location);
      setIsLoading(false);
      
      console.log('Localização obtida com sucesso:', location);
      
      toast({
        title: "Localização Encontrada",
        description: `Sua localização foi detectada com precisão de ${Math.round(location.accuracy)}m`,
      });
    };

    const errorHandler = (error: GeolocationPositionError) => {
      let errorMessage = 'Erro desconhecido ao obter localização';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Permissão de localização negada pelo usuário';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Localização indisponível no momento';
          break;
        case error.TIMEOUT:
          errorMessage = 'Tempo limite para obter localização excedido';
          break;
      }
      
      setError(errorMessage);
      setIsLoading(false);
      
      console.error('Erro ao obter localização:', errorMessage);
      
      toast({
        title: "Erro de Localização",
        description: errorMessage,
        variant: "destructive",
      });
    };

    navigator.geolocation.getCurrentPosition(successHandler, errorHandler, options);
  };

  // Solicitar localização automaticamente ao montar o componente
  useEffect(() => {
    requestLocation();
  }, []);

  return {
    userLocation,
    isLoading,
    error,
    requestLocation,
  };
};
