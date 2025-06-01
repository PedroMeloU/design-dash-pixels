
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
    <div className="fixed bottom-6 left-6 right-6 z-[100]">
      <div className="bg-white rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-gray-100/50 backdrop-blur-sm">
        <div className="flex items-center justify-around px-4 py-3">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center space-y-1 px-6 py-3 rounded-[16px] transition-all duration-200 min-w-[64px] ${
                  item.isActive 
                    ? 'bg-[#007AFF] text-white' 
                    : 'text-[#8E8E93] hover:text-[#007AFF] hover:bg-[#F2F2F7]'
                }`}
              >
                <IconComponent size={20} strokeWidth={2} />
                <span className="text-[10px] font-medium leading-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
