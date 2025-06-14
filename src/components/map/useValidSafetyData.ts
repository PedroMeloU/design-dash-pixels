
import { useMemo } from 'react';

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

/**
 * Hook para filtrar safetyData e logar quaisquer dados inválidos.
 */
export function useValidSafetyData(safetyData: SafetyData[]) {
  return useMemo(() => {
    return safetyData.filter(data => {
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
  }, [safetyData]);
}
