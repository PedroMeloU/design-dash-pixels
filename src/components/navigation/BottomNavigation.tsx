
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
    <div className="fixed bottom-6 left-4 right-4 z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20">
        <div className="flex items-center justify-around px-6 py-3">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center space-y-1 px-4 py-3 rounded-xl transition-all duration-300 min-w-[60px] ${
                  item.isActive 
                    ? 'bg-[#1F3C88] text-white shadow-lg scale-105' 
                    : 'text-gray-600 hover:text-[#1F3C88] hover:bg-gray-50/50'
                }`}
              >
                <IconComponent size={22} className="stroke-[1.5]" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
