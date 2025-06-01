
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
    if (location.pathname === '/dashboard' && onSearchClick) {
      onSearchClick();
    } else {
      navigate('/search');
    }
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
      path: '/search',
      isActive: location.pathname === '/search',
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
      <div className="bg-white/90 backdrop-blur-lg rounded-full shadow-2xl border border-white/20">
        <div className="flex items-center justify-around px-4 py-2">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`flex flex-col items-center justify-center space-y-0.5 px-3 py-2 rounded-full transition-all duration-300 min-w-[50px] ${
                  item.isActive 
                    ? 'bg-[#1F3C88] text-white shadow-lg scale-105' 
                    : 'text-gray-600 hover:text-[#1F3C88] hover:bg-gray-50/50'
                }`}
              >
                <IconComponent size={18} className="stroke-[1.5]" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
