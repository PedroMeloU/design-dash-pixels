
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, AlertTriangle, User } from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      id: 'home',
      icon: Home,
      label: 'Home',
      path: '/dashboard',
      isActive: location.pathname === '/dashboard'
    },
    {
      id: 'search',
      icon: Search,
      label: 'Buscar',
      path: '/search',
      isActive: location.pathname === '/search'
    },
    {
      id: 'reports',
      icon: AlertTriangle,
      label: 'Reportes',
      path: '/crime-reports',
      isActive: location.pathname === '/crime-reports'
    },
    {
      id: 'profile',
      icon: User,
      label: 'Perfil',
      path: '/profile',
      isActive: location.pathname === '/profile'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
      <div className="flex items-center justify-around h-20 px-4">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                item.isActive 
                  ? 'bg-[#1F3C88] text-white' 
                  : 'text-gray-500 hover:text-[#1F3C88] hover:bg-gray-50'
              }`}
            >
              <IconComponent size={24} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
