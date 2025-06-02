
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, AlertTriangle, User } from 'lucide-react';

interface BottomNavigationProps {
  onSearchClick?: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ onSearchClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchClick = () => {
    // Sempre navegar para dashboard e abrir busca
    if (location.pathname !== '/dashboard') {
      navigate('/dashboard');
    }
    // Usar timeout para garantir que o dashboard foi renderizado
    setTimeout(() => {
      if (onSearchClick) {
        onSearchClick();
      }
    }, 100);
  };

  const navItems = [
    {
      id: 'home',
      icon: Home,
      label: 'Home',
      path: '/dashboard',
      isActive: location.pathname === '/dashboard',
      onClick: () => navigate('/dashboard')
    },
    {
      id: 'search',
      icon: Search,
      label: 'Buscar',
      path: '/dashboard',
      isActive: false, // Nunca ativo já que é uma ação
      onClick: handleSearchClick
    },
    {
      id: 'reports',
      icon: AlertTriangle,
      label: 'Reportes',
      path: '/crime-reports',
      isActive: location.pathname === '/crime-reports',
      onClick: () => navigate('/crime-reports')
    },
    {
      id: 'profile',
      icon: User,
      label: 'Perfil',
      path: '/profile',
      isActive: location.pathname === '/profile',
      onClick: () => navigate('/profile')
    }
  ];

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 mx-auto max-w-sm">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`flex flex-col items-center justify-center space-y-1 px-4 py-3 rounded-xl transition-all duration-300 min-w-[60px] ${
                  item.isActive 
                    ? 'bg-[#1F3C88] text-white shadow-lg scale-105' 
                    : 'text-gray-600 hover:text-[#1F3C88] hover:bg-gray-50/70 active:scale-95'
                }`}
              >
                <IconComponent size={20} className="stroke-[1.5]" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
