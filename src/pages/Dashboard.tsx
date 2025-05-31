
import React from 'react';
import { InteractiveMap } from '@/components/map/InteractiveMap';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';

const Dashboard: React.FC = () => {
  return (
    <main className="relative h-screen w-full overflow-hidden">
      {/* Mapa interativo como background */}
      <InteractiveMap />
      
      {/* Overlay content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header area - pode ser usado para futuras funcionalidades */}
        <div className="flex-1 pointer-events-none">
          {/* Conteúdo futuro pode ser adicionado aqui */}
        </div>
        
        {/* Bottom navigation */}
        <BottomNavigation />
      </div>
    </main>
  );
};

export default Dashboard;
