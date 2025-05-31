
import React from 'react';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';

const Favorites: React.FC = () => {
  return (
    <main className="h-screen w-full bg-[#F5F7FA] flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1F3C88] mb-4">Favoritos</h1>
          <p className="text-gray-600">Seus lugares favoritos aparecerão aqui</p>
        </div>
      </div>
      <BottomNavigation />
    </main>
  );
};

export default Favorites;
