
import React from 'react';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';

const Profile: React.FC = () => {
  return (
    <main className="h-screen w-full bg-[#F5F7FA] flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1F3C88] mb-4">Perfil</h1>
          <p className="text-gray-600">Configurações do usuário em desenvolvimento</p>
        </div>
      </div>
      <BottomNavigation />
    </main>
  );
};

export default Profile;
