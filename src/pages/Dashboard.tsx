import React, { useState } from 'react';
import { InteractiveMap } from '@/components/map/InteractiveMap';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { SearchHeader } from '@/components/search/SearchHeader';
import { UpdateDataButton } from '@/components/map/UpdateDataButton';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useFogoCruzadoData } from '@/hooks/useFogoCruzadoData';
import { AutoIncidentConfirmation } from '@/components/reports/AutoIncidentConfirmation';

const Dashboard: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ center: [number, number]; name: string } | null>(null);
  const location = useGeolocation();
  const { updateFogoCruzadoData, isUpdating } = useFogoCruzadoData();
  
  console.log('Dashboard component rendering');
  
  const handleLocationSelect = (locationData: { center: [number, number]; name: string }) => {
    setSelectedLocation(locationData);
  };

  const userLocation = location.latitude && location.longitude 
    ? [location.longitude, location.latitude] as [number, number]
    : null;
  
  return (
    <main className="relative h-screen w-full overflow-hidden bg-gray-100">
      <AutoIncidentConfirmation />
      <div className="absolute inset-0">
        <InteractiveMap selectedLocation={selectedLocation} />
      </div>
      
      {/* Update Data Button */}
      <UpdateDataButton 
        onUpdate={updateFogoCruzadoData} 
        isUpdating={isUpdating} 
      />
      
      {/* Search Header */}
      <SearchHeader 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)}
        onLocationSelect={handleLocationSelect}
        userLocation={userLocation}
      />
      
      {/* Overlay content */}
      <div className="relative z-10 h-full flex flex-col pointer-events-none">
        {/* Header area - pode ser usado para futuras funcionalidades */}
        <div className="flex-1">
          {/* Conteúdo futuro pode ser adicionado aqui */}
        </div>
        
        {/* Bottom navigation */}
        <div className="pointer-events-auto pb-safe">
          <BottomNavigation />
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
