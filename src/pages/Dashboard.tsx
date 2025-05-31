
import React from 'react';
import { InteractiveMap } from '@/components/map/InteractiveMap';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';

const Dashboard: React.FC = () => {
  console.log('Dashboard component rendering');
  
  return (
    <main className="relative h-screen w-full overflow-hidden bg-gray-100">
      <div className="absolute inset-0">
        <InteractiveMap />
      </div>
      
      {/* Overlay content */}
      <div className="relative z-10 h-full flex flex-col pointer-events-none">
        {/* Header area - pode ser usado para futuras funcionalidades */}
        <div className="flex-1">
          {/* Conteúdo futuro pode ser adicionado aqui */}
        </div>
        
        {/* Bottom navigation */}
        <div className="pointer-events-auto">
          <BottomNavigation />
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
