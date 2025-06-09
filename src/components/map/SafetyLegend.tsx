
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
    <div className="absolute bottom-20 left-4 z-20 bg-white rounded-lg shadow-lg p-4 max-w-xs">
      <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
        📊 Índice de Segurança
      </h3>
      
      <div className="space-y-2">
        {safetyLevels.map((level, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div 
              className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
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
      
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Baseado em dados do Fogo Cruzado dos últimos 6 meses
        </p>
      </div>
    </div>
  );
};
