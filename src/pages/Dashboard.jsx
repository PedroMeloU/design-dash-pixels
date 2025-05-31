
import React from 'react';
import { InteractiveMap } from '@/components/map/InteractiveMap';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';

const Dashboard = () => {
  console.log('Dashboard component rendering');
  
  return (
    <main className="relative h-screen w-full overflow-hidden bg-gray-100">
      <div className="absolute inset-0">
        <InteractiveMap />
      </div>
      
      <div className="relative z-10 h-full flex flex-col pointer-events-none">
        <div className="flex-1">
        </div>
        
        <div className="pointer-events-auto">
          <BottomNavigation />
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
