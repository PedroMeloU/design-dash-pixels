
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, AlertTriangle, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const navItems = [
    { icon: Home, label: 'Início', path: '/dashboard' },
    { icon: Search, label: 'Buscar', path: '/search' },
    { icon: AlertTriangle, label: 'Reportes', path: '/crime-reports' },
    { icon: User, label: 'Perfil', path: '/profile' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="flex justify-around items-center py-2 px-4">
        {navItems.map(({ icon: Icon, label, path }) => (
          <button
            key={path}
            onClick={() => handleNavigation(path)}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              isActive(path)
                ? 'text-[#1F3C88] bg-blue-50'
                : 'text-gray-500 hover:text-[#1F3C88]'
            }`}
          >
            <Icon size={20} />
            <span className="text-xs mt-1 font-medium">{label}</span>
          </button>
        ))}
        
        <button
          onClick={handleLogout}
          className="flex flex-col items-center py-2 px-3 rounded-lg transition-colors text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-xs mt-1 font-medium">Sair</span>
        </button>
      </div>
    </nav>
  );
};
