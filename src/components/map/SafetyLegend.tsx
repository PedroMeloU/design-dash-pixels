
import React, { useState } from 'react';
import { Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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
  const [isOpen, setIsOpen] = useState(false);

  if (!isVisible) return null;

  return (
    <div className="absolute bottom-32 right-4 z-20">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            className="h-12 w-12 rounded-full bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 shadow-lg"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Info className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent 
          side="left" 
          className="w-72 p-0 border border-gray-200 shadow-xl"
          onInteractOutside={() => setIsOpen(false)}
        >
          <div className="bg-white rounded-lg">
            <div className="flex items-center justify-between p-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center">
                📊 Índice de Segurança
              </h3>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 rounded-full hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-3 space-y-2">
              {safetyLevels.map((level, index) => (
                <div key={index} className="flex items-center space-x-3">
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
            
            <div className="p-3 pt-0 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Baseado em dados do Fogo Cruzado dos últimos 6 meses
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
