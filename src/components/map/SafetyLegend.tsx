
import React from 'react';

const safetyLevels = [
  { 
    min: 80, 
    max: 100, 
    label: 'Muito Seguro', 
    color: '#10B981', 
    icon: '🛡️' 
  },
  { 
    min: 60, 
    max: 79, 
    label: 'Moderadamente Seguro', 
    color: '#F59E0B', 
    icon: '⚠️' 
  },
  { 
    min: 40, 
    max: 59, 
    label: 'Pouco Seguro', 
    color: '#EF4444', 
    icon: '⚡' 
  },
  { 
    min: 0, 
    max: 39, 
    label: 'Perigoso', 
    color: '#7F1D1D', 
    icon: '🚨' 
  }
];

interface SafetyLegendProps {
  isVisible?: boolean;
}

export const SafetyLegend: React.FC<SafetyLegendProps> = ({ isVisible = true }) => {
  if (!isVisible) return null;

  return (
    <div className="absolute bottom-24 right-4 z-10 bg-white rounded-lg shadow-lg p-3 max-w-xs border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
        📊 Índice de Segurança
      </h3>
      
      <div className="space-y-1">
        {safetyLevels.map((level, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full border border-white shadow-sm"
              style={{ backgroundColor: level.color }}
            />
            <span className="text-xs">{level.icon}</span>
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-700">
                {level.label}
              </div>
              <div className="text-xs text-gray-500">
                {level.min}% - {level.max}%
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-2 pt-2 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Baseado em dados do Fogo Cruzado dos últimos 6 meses
        </p>
      </div>
    </div>
  );
};
