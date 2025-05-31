
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Heart, User } from 'lucide-react';

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
      id: 'favorites',
      icon: Heart,
      label: 'Favoritos',
      path: '/favorites',
      isActive: location.pathname === '/favorites'
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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1F3C88] border-t border-[#1F3C88]/20">
      <div className="flex items-center justify-around h-16 px-4">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                item.isActive 
                  ? 'text-white' 
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              <IconComponent size={20} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
