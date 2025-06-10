
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { User, Settings, Bell, Shield, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/', { replace: true });
    }
  };

  const menuItems = [
    { icon: User, label: 'Dados Pessoais', action: () => {} },
    { icon: Bell, label: 'Notificações', action: () => {} },
    { icon: Shield, label: 'Privacidade e Segurança', action: () => {} },
    { icon: Settings, label: 'Configurações', action: () => {} },
    { icon: HelpCircle, label: 'Ajuda e Suporte', action: () => {} },
    { icon: LogOut, label: 'Sair', action: handleLogout, danger: true },
  ];

  return (
    <main className="h-screen w-full bg-[#F5F7FA] flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4 pt-safe">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1F3C88] flex items-center gap-2">
          <User size={24} className="sm:w-7 sm:h-7" />
          Perfil
        </h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Gerencie suas configurações e dados</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-32">
        {/* User Info Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#1F3C88] rounded-full flex items-center justify-center">
              <User size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">Usuário</h2>
              <p className="text-gray-600">usuario@email.com</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-3">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <button
                key={index}
                onClick={item.action}
                className={`w-full bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center gap-4 transition-all hover:bg-gray-50 active:scale-98 ${
                  item.danger ? 'text-red-600' : 'text-gray-900'
                }`}
              >
                <IconComponent size={20} className={item.danger ? 'text-red-500' : 'text-[#1F3C88]'} />
                <span className="flex-1 text-left font-medium">{item.label}</span>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              </button>
            );
          })}
        </div>

        {/* App Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">Versão 1.0.0</p>
          <p className="text-gray-400 text-xs mt-1">© 2024 Safety App</p>
        </div>
      </div>

      <BottomNavigation />
    </main>
  );
};

export default Profile;
