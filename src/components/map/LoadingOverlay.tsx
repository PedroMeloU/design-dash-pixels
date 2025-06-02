
import React from 'react';

interface LoadingOverlayProps {
  isVisible: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1F3C88] border-t-transparent"></div>
        <p className="text-gray-600 font-medium">Carregando mapa...</p>
      </div>
    </div>
  );
};
